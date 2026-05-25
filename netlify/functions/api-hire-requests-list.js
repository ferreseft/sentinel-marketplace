const db = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const customerId = (event.queryStringParameters && event.queryStringParameters.customer_id) || '1';
    const list = db.getHireRequests()
      .filter(r => r.customer_id === parseInt(customerId))
      .sort((a, b) => b.id - a.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(list)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
