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

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const requestId = event.queryStringParameters && event.queryStringParameters.hire_request_id;
    const personnelId = event.queryStringParameters && event.queryStringParameters.personnel_id;

    let list = [];
    if (requestId) {
      // Querying for a customer viewing matched candidates
      const rawMatches = await db.getMatches(requestId);
      list = rawMatches.map(m => {
        const isAccepted = m.status === 'accepted';
        return {
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
          bio: m.bio,
          // Reveal contact details only if match is accepted!
          email: isAccepted ? m.email : undefined,
          phone: isAccepted ? m.phone : undefined
        };
      });
    } else if (personnelId) {
      // Querying for a guard viewing invitations (no customer contact info returned)
      const rawMatches = await db.getMatches(null, personnelId);
      list = rawMatches.map(m => ({
        id: m.id,
        hire_request_id: m.hire_request_id,
        personnel_id: m.personnel_id,
        match_score: m.match_score,
        status: m.status,
        title: m.title,
        location: m.location,
        start_date: m.start_date,
        end_date: m.end_date,
        budget_max: m.budget_max,
        budget_min: m.budget_min,
        description: m.description
      }));
    } else {
      list = await db.getMatches();
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify(list)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
