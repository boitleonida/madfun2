export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, amount, reference } = req.body;

    // Validate required fields
    if (!phone || !amount) {
        return res.status(400).json({ error: 'Phone number and amount are required' });
    }

    // Format phone number: ensure it starts with 254
    let msisdn = phone.replace(/\s+/g, '').replace(/^0/, '254').replace(/^\+/, '');
    if (!msisdn.startsWith('254')) {
        msisdn = '254' + msisdn;
    }

    // Get API credentials from environment variables (set in Vercel dashboard)
    const apiKey = process.env.MEGAPAY_API_KEY;
    const email = process.env.MEGAPAY_EMAIL;

    if (!apiKey || !email) {
        return res.status(500).json({ error: 'Payment service not configured. Contact support.' });
    }

    try {
        const response = await fetch('https://megapay.co.ke/backend/v1/initiatestk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                email: email,
                amount: String(amount),
                msisdn: msisdn,
                reference: reference || `MADFUN-${Date.now()}`
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('MegaPay API error:', error);
        return res.status(500).json({ error: 'Payment request failed. Please try again.' });
    }
}
