const db = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const result = db.addHireRequest(data);

    // Fetch matches made during match engine execution in db.addHireRequest
    const reqMatches = db.getMatches().filter(m => m.hire_request_id === result.id);
    const enrichedMatches = reqMatches.map(m => {
      const p = db.getPersonnel().find(g => g.id === m.personnel_id);
      return {
        ...m,
        personnel: p
      };
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        id: result.id, 
        status: result.status, 
        matches: enrichedMatches 
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
