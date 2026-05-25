const db = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const recipientType = event.queryStringParameters && event.queryStringParameters.recipient_type;
    const recipientId = event.queryStringParameters && event.queryStringParameters.recipient_id;

    let list = db.getNotifications();

    if (recipientType && recipientId) {
      list = list.filter(n => n.recipient_type === recipientType && n.recipient_id === parseInt(recipientId))
        .sort((a, b) => b.id - a.id);
    }

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
