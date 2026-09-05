export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;
        console.log('MegaPay Webhook Callback received:', JSON.stringify(payload));

        // MegaPay callback response format:
        // Returns 200 OK acknowledging receipt of payment notification
        return res.status(200).json({ success: true, message: 'Callback received' });
    } catch (error) {
        console.error('Error handling MegaPay callback:', error);
        return res.status(500).json({ error: 'Callback handling failed' });
    }
}
