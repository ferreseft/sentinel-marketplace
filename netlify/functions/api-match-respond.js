const db = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { match_id, status, notes } = data; // status is 'accepted' or 'rejected'

    const success = db.updateMatchStatus(match_id, status, notes);

    if (success) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, message: `Match status updated to ${status}.` })
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Match ID not found" })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
