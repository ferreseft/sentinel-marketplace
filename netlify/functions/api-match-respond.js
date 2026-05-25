const { getDB } = require('./db-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const db = getDB();
    const data = JSON.parse(event.body);
    const { match_id, status, notes } = data; // status is 'accepted' or 'rejected'

    const stmt = db.prepare(`
      UPDATE matches 
      SET status = ?, responded_at = CURRENT_TIMESTAMP, notes = ? 
      WHERE id = ?
    `);
    stmt.run(status, notes || '', match_id);

    // Fetch match details to send alert notification to the customer
    const match = db.prepare(`
      SELECT m.*, r.customer_id, r.title, p.first_name, p.last_name 
      FROM matches m
      JOIN hire_requests r ON m.hire_request_id = r.id
      JOIN security_personnel p ON m.personnel_id = p.id
      WHERE m.id = ?
    `).get(match_id);

    if (match) {
      const subject = \`Match Response: \${match.first_name} \${match.last_name} \${status}\`;
      const body = \`Security guard \${match.first_name} \${match.last_name} has \${status} your match proposal for "\${match.title}". Notes: \${notes || 'None'}\`;
      db.prepare('INSERT INTO notifications (recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES ("customer", ?, "match_accepted", ?, ?, 0, 1)')
        .run(match.customer_id, subject, body);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: \`Match status updated to \${status}.\` })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
