const { getDB } = require('./db-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const db = getDB();
    const data = JSON.parse(event.body);
    const { first_name, last_name, email, phone, certifications, years_experience, service_types, availability_status, availability_notes, service_area, hourly_rate, daily_rate, photo_url, resume_url, bio } = data;

    const stmt = db.prepare(`
      INSERT INTO security_personnel (
        first_name, last_name, email, phone, certifications, years_experience,
        service_types, availability_status, availability_notes, service_area,
        hourly_rate, daily_rate, photo_url, resume_url, bio, profile_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);

    const result = stmt.run(
      first_name, last_name, email, phone, certifications, years_experience || 0,
      service_types, availability_status || 'available', availability_notes, service_area,
      hourly_rate || 0, daily_rate || 0, photo_url, resume_url, bio
    );

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ id: result.lastInsertRowid, message: 'Personnel profile registered successfully.' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
