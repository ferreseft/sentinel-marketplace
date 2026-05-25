const db = require('./lib/db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const requestId = event.queryStringParameters && event.queryStringParameters.hire_request_id;
    const personnelId = event.queryStringParameters && event.queryStringParameters.personnel_id;

    let list = db.getMatches();

    if (requestId) {
      list = list.filter(m => m.hire_request_id === parseInt(requestId))
        .map(m => {
          const p = db.getPersonnel().find(g => g.id === m.personnel_id);
          return {
            ...m,
            first_name: p ? p.first_name : '',
            last_name: p ? p.last_name : '',
            photo_url: p ? p.photo_url : '',
            rating: p ? p.rating : 0,
            hourly_rate: p ? p.hourly_rate : 0,
            years_experience: p ? p.years_experience : 0,
            certifications: p ? p.certifications : '',
            bio: p ? p.bio : ''
          };
        })
        .sort((a, b) => b.match_score - a.match_score);
    } else if (personnelId) {
      list = list.filter(m => m.personnel_id === parseInt(personnelId))
        .map(m => {
          const r = db.getHireRequests().find(req => req.id === m.hire_request_id);
          return {
            ...m,
            title: r ? r.title : '',
            location: r ? r.location : '',
            start_date: r ? r.start_date : '',
            end_date: r ? r.end_date : '',
            budget_max: r ? r.budget_max : 0,
            budget_min: r ? r.budget_min : 0,
            description: r ? r.description : ''
          };
        })
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
