const db = require('./lib/db');

exports.handler = async (event, context) => {
  // CORS Preflight
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
    const list = await db.getPersonnel();
    // Filter to active and strip out sensitive fields (email, phone, resume_url)
    const publicList = list
      .filter(p => p.profile_status === 'active')
      .map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        certifications: p.certifications,
        years_experience: p.years_experience,
        service_types: p.service_types,
        availability_status: p.availability_status,
        availability_notes: p.availability_notes,
        service_area: p.service_area,
        hourly_rate: p.hourly_rate,
        daily_rate: p.daily_rate,
        photo_url: p.photo_url,
        bio: p.bio,
        rating: p.rating,
        total_jobs_completed: p.total_jobs_completed
      }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify(publicList)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
