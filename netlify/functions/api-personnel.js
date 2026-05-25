const { getDB } = require('./db-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const db = getDB();
    const serviceType = event.queryStringParameters && event.queryStringParameters.service_type;
    const location = event.queryStringParameters && event.queryStringParameters.location;
    const availability = event.queryStringParameters && event.queryStringParameters.availability;
    
    let query = "SELECT * FROM security_personnel WHERE profile_status = 'active'";
    const params = [];
    
    if (serviceType) {
      query += " AND service_types LIKE ?";
      params.push('%' + serviceType + '%');
    }
    if (location) {
      query += " AND service_area LIKE ?";
      params.push('%' + location + '%');
    }
    if (availability) {
      query += " AND availability_status = ?";
      params.push(availability);
    }
    
    const rows = db.prepare(query).all(params);
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
