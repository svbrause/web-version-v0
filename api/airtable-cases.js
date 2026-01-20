/**
 * Vercel Serverless Function - Airtable Cases/Photos Proxy
 * 
 * This API route securely fetches case/photo data from Airtable.
 * The API key is kept server-side and never exposed to the client.
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const { offset, pageSize = '100' } = req.query;
    
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Photos`;
    
    // Build URL with query parameters
    const params = new URLSearchParams();
    params.append('pageSize', pageSize);
    if (offset) {
      params.append('offset', offset);
    }
    const url = `${AIRTABLE_API_URL}?${params.toString()}`;

    // Forward the request to Airtable
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Airtable API Error:', error);
      return res.status(response.status).json({
        error: 'Airtable API error',
        details: error
      });
    }

    const result = await response.json();

    // Return the Airtable response
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error in airtable-cases API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
