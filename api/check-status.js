export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { transaction_request_id } = req.body;

    // Validate required parameter
    if (!transaction_request_id) {
        return res.status(400).json({ error: 'transaction_request_id is required' });
    }

    // Get API credentials from environment variables
    const apiKey = process.env.MEGAPAY_API_KEY;
    const email = process.env.MEGAPAY_EMAIL;

    if (!apiKey || !email) {
        return res.status(500).json({ error: 'Payment service not configured. Contact support.' });
    }

    try {
        const response = await fetch('https://megapay.co.ke/backend/v1/transactionstatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                email: email,
                transaction_request_id: transaction_request_id
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('MegaPay transaction status error:', error);
        return res.status(500).json({ error: 'Status check request failed. Please try again.' });
    }
}
