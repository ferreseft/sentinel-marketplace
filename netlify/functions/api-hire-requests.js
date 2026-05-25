const db = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    // Creates request AND triggers the async match engine internally
    const newRequest = await db.addHireRequest(data);
    
    // Fetch matched candidates for this request
    const matches = await db.getMatches(newRequest.id);
    
    // Customers see public profiles only (no email/phone)
    const securedMatches = matches.map(m => ({
      id: m.id,
      hire_request_id: m.hire_request_id,
      personnel_id: m.personnel_id,
      match_score: m.match_score,
      status: m.status,
      first_name: m.first_name,
      last_name: m.last_name,
      photo_url: m.photo_url,
      rating: m.rating,
      hourly_rate: m.hourly_rate,
      years_experience: m.years_experience,
      certifications: m.certifications,
      bio: m.bio
    }));

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        id: newRequest.id,
        status: newRequest.status,
        request: newRequest,
        matches: securedMatches
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
