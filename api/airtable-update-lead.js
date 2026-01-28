/**
 * Vercel Serverless Function - Airtable Update Lead Proxy
 * 
 * This API route securely handles updates to existing Airtable lead records.
 */

export default async function handler(req, res) {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appXblSpAMBQskgzB';

  if (!AIRTABLE_API_KEY) {
    console.error('❌ AIRTABLE_API_KEY not configured');
    console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('AIRTABLE')));
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Airtable API key not configured. Please set AIRTABLE_API_KEY in Vercel and redeploy.'
    });
  }

  try {
    const { recordId, fields } = req.body;

    if (!recordId || !fields) {
      return res.status(400).json({ error: 'Missing recordId or fields in request body' });
    }

    const UPDATE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Web Popup Leads/${recordId}`;

    const response = await fetch(UPDATE_API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Airtable API Error:', result);
      return res.status(response.status).json({
        error: 'Airtable API error',
        details: result
      });
    }

    return res.status(200).json({
      success: true,
      record: result
    });

  } catch (error) {
    console.error('❌ Error in airtable-update-lead API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
