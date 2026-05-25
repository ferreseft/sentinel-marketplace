const { getDB } = require('./db-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const db = getDB();
    const customerId = (event.queryStringParameters && event.queryStringParameters.customer_id) || '1';
    const rows = db.prepare('SELECT * FROM hire_requests WHERE customer_id = ? ORDER BY id DESC').all(customerId);

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
