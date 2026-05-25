const { getDB } = require('./db-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const db = getDB();
    const recipientType = event.queryStringParameters && event.queryStringParameters.recipient_type;
    const recipientId = event.queryStringParameters && event.queryStringParameters.recipient_id;

    let rows;
    if (recipientType && recipientId) {
      rows = db.prepare('SELECT * FROM notifications WHERE recipient_type = ? AND recipient_id = ? ORDER BY id DESC').all(recipientType, recipientId);
    } else {
      rows = db.prepare('SELECT * FROM notifications ORDER BY id DESC').all();
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
