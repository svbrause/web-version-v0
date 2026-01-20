/**
 * Vercel Serverless Function - Airtable Leads Proxy
 * 
 * This API route securely handles Airtable lead submissions.
 * The API key is kept server-side and never exposed to the client.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment (server-side only)
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appXblSpAMBQskgzB';

  if (!AIRTABLE_API_KEY) {
    console.error('❌ AIRTABLE_API_KEY not configured in Vercel environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Airtable API key not configured'
    });
  }

  try {
    const { fields } = req.body;

    if (!fields) {
      return res.status(400).json({ error: 'Missing fields in request body' });
    }

    const LEADS_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Web Popup Leads`;

    // Forward the request to Airtable
    const response = await fetch(LEADS_API_URL, {
      method: 'POST',
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

    // Return success response
    return res.status(200).json({
      success: true,
      record: result
    });

  } catch (error) {
    console.error('❌ Error in airtable-leads API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
