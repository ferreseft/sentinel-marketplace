const { getDB } = require('./db-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const db = getDB();
    const requestId = event.queryStringParameters && event.queryStringParameters.hire_request_id;
    const personnelId = event.queryStringParameters && event.queryStringParameters.personnel_id;

    let rows;
    if (requestId) {
      rows = db.prepare(`
        SELECT m.*, p.first_name, p.last_name, p.photo_url, p.rating, p.hourly_rate, p.years_experience, p.certifications, p.bio
        FROM matches m
        JOIN security_personnel p ON m.personnel_id = p.id
        WHERE m.hire_request_id = ?
        ORDER BY m.match_score DESC
      `).all(requestId);
    } else if (personnelId) {
      rows = db.prepare(`
        SELECT m.*, r.title, r.location, r.start_date, r.end_date, r.budget_max, r.budget_min, r.description
        FROM matches m
        JOIN hire_requests r ON m.hire_request_id = r.id
        WHERE m.personnel_id = ?
        ORDER BY m.id DESC
      `).all(personnelId);
    } else {
      rows = db.prepare('SELECT * FROM matches ORDER BY id DESC').all();
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(rows)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
