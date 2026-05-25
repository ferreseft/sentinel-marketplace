const { getDB } = require('./db-helper');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const db = getDB();
    const data = JSON.parse(event.body);
    const { customer_id, title, description, service_type_needed, location, start_date, end_date, budget_min, budget_max, personnel_count, urgency } = data;

    // 1. Insert hire request
    const stmtRequest = db.prepare(`
      INSERT INTO hire_requests (customer_id, title, description, service_type_needed, location, start_date, end_date, budget_min, budget_max, personnel_count, urgency, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `);
    
    const resRequest = stmtRequest.run(
      customer_id || 1, title, description, service_type_needed, location, start_date, end_date,
      budget_min || 0, budget_max || 0, personnel_count || 1, urgency || 'standard'
    );
    const requestId = resRequest.lastInsertRowid;

    // 2. RUN MATCH ENGINE FOR THIS REQUEST IMMEDIATELY
    const personnel = db.prepare("SELECT * FROM security_personnel WHERE profile_status = 'active' AND availability_status != 'unavailable'").all();
    const scored = [];
    const reqServiceType = service_type_needed.toLowerCase();

    for (const p of personnel) {
      const pTypes = (p.service_types || "").split(',').map(s => s.trim().toLowerCase());
      if (!pTypes.includes(reqServiceType)) continue;

      let score = 30; // exact service type fit

      // Location overlap (+25)
      if (p.service_area && location) {
        const pArea = p.service_area.toLowerCase();
        const rLoc = location.toLowerCase();
        if (pArea.includes(rLoc) || rLoc.includes(pArea) || (pArea.includes('miami') && rLoc.includes('miami'))) {
          score += 25;
        }
      }

      // Rate within budget (+20)
      if (p.hourly_rate >= budget_min && p.hourly_rate <= budget_max) {
        score += 20;
      }

      // Experience (+15 scaled)
      score += Math.min(15, (p.years_experience / 15) * 15);

      // Availability (+10)
      if (p.availability_status === 'available') score += 10;
      else if (p.availability_status === 'partially_available') score += 5;

      scored.push({ personnel: p, score: Math.round(score * 10) / 10 });
    }

    scored.sort((a, b) => b.score - a.score);
    const top5 = scored.slice(0, 5);

    // 3. Persist matches & queue notifications
    for (const item of top5) {
      const p = item.personnel;
      db.prepare('INSERT INTO matches (hire_request_id, personnel_id, match_score, status) VALUES (?, ?, ?, "proposed")')
        .run(requestId, p.id, item.score);
      
      const personnelSubject = `New Opportunity: ${title}`;
      const personnelBody = `Hello ${p.first_name}, you score ${item.score}/100 match for "${title}" located at ${location}.`;
      db.prepare('INSERT INTO notifications (recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES ("personnel", ?, "new_request", ?, ?, 0, 1)')
        .run(p.id, personnelSubject, personnelBody);
    }

    if (top5.length > 0) {
      db.prepare('UPDATE hire_requests SET status = "matched" WHERE id = ?').run(requestId);
      
      const customerSubject = `Security Personnel Matches Found: ${title}`;
      const customerBody = `We found ${top5.length} qualified security personnel matches for your request!`;
      db.prepare('INSERT INTO notifications (recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES ("customer", ?, "new_match", ?, ?, 0, 1)')
        .run(customer_id || 1, customerSubject, customerBody);
    }

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ id: requestId, status: top5.length > 0 ? 'matched' : 'open', matches: top5 })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
