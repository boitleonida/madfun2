export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, amount, reference } = req.body;

    // 1. Validate required fields
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Valid payment amount is required (minimum KES 1)' });
    }

    // 2. Format & validate phone number: must be valid Kenyan mobile (2547XX or 2541XX)
    let msisdn = phone.toString().replace(/[\s+-]/g, '').replace(/^0/, '254');
    if (!msisdn.startsWith('254')) {
        msisdn = '254' + msisdn;
    }

    if (msisdn.length !== 12 || (!msisdn.startsWith('2547') && !msisdn.startsWith('2541'))) {
        return res.status(400).json({ 
            error: 'Invalid Safaricom phone number. Must be a valid Kenyan mobile number (e.g. 07XXXXXXXX or 01XXXXXXXX)' 
        });
    }

    // 3. Get API credentials from environment variables
    const apiKey = process.env.MEGAPAY_API_KEY;
    const email = process.env.MEGAPAY_EMAIL;

    if (!apiKey || !email) {
        return res.status(500).json({ 
            error: 'Payment service not configured: MEGAPAY_API_KEY or MEGAPAY_EMAIL missing in environment variables' 
        });
    }

    try {
        const response = await fetch('https://megapay.co.ke/backend/v1/initiatestk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                email: email,
                amount: String(numericAmount),
                msisdn: msisdn,
                reference: reference || `MADFUN-${Date.now()}`
            })
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            return res.status(502).json({ error: 'Invalid response received from MegaPay gateway' });
        }

        // Check if MegaPay indicated an error
        if (!response.ok || data.error || (data.status && data.status.toLowerCase() === 'failed') || data.ResponseCode === '1') {
            const errorMsg = data.error || data.message || data.ResultDesc || 'MegaPay rejected the STK Push request';
            return res.status(response.status >= 400 ? response.status : 400).json({ 
                error: errorMsg,
                details: data 
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('MegaPay API connection error:', error);
        return res.status(502).json({ 
            error: error.message || 'Payment gateway connection error. Please try again.' 
        });
    }
}

