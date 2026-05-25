const db = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const serviceType = event.queryStringParameters && event.queryStringParameters.service_type;
    const location = event.queryStringParameters && event.queryStringParameters.location;
    const availability = event.queryStringParameters && event.queryStringParameters.availability;
    
    let list = db.getPersonnel().filter(p => p.profile_status === 'active');
    
    if (serviceType) {
      const sType = serviceType.toLowerCase();
      list = list.filter(p => (p.service_types || "").toLowerCase().includes(sType));
    }
    if (location) {
      const loc = location.toLowerCase();
      list = list.filter(p => (p.service_area || "").toLowerCase().includes(loc));
    }
    if (availability) {
      list = list.filter(p => p.availability_status === availability);
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
