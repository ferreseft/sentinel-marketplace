// NOTE: In-memory store for testing. Data resets on cold start. For production, migrate to Turso (libsql), Supabase, or PlanetScale.
const { createClient } = require('@libsql/client/web');

// Initialize Turso Client (Using pure HTTP transport web client for serverless compatibility)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

let initPromise = null;

async function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      console.log('Initializing database tables sequentially...');
      
      // 5 SEPARATE CREATE TABLE CALLS
      await client.execute({
        sql: `CREATE TABLE IF NOT EXISTS security_personnel (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT, last_name TEXT, email TEXT UNIQUE, phone TEXT,
          certifications TEXT, years_experience INTEGER, service_types TEXT,
          availability_status TEXT DEFAULT 'available', availability_notes TEXT,
          service_area TEXT, hourly_rate REAL, daily_rate REAL, photo_url TEXT,
          resume_url TEXT, bio TEXT, rating REAL DEFAULT 0, total_jobs_completed INTEGER DEFAULT 0,
          profile_status TEXT DEFAULT 'pending_review', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        args: []
      });

      await client.execute({
        sql: `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT, last_name TEXT, email TEXT UNIQUE, phone TEXT,
          company_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        args: []
      });

      await client.execute({
        sql: `CREATE TABLE IF NOT EXISTS hire_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, title TEXT, description TEXT,
          service_type_needed TEXT, location TEXT, start_date TEXT, end_date TEXT,
          budget_min REAL, budget_max REAL, personnel_count INTEGER DEFAULT 1,
          urgency TEXT DEFAULT 'standard', status TEXT DEFAULT 'open',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        args: []
      });

      await client.execute({
        sql: `CREATE TABLE IF NOT EXISTS matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT, hire_request_id INTEGER, personnel_id INTEGER,
          match_score REAL, status TEXT DEFAULT 'proposed', proposed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          responded_at TEXT, notes TEXT
        );`,
        args: []
      });

      await client.execute({
        sql: `CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT, recipient_type TEXT, recipient_id INTEGER,
          notification_type TEXT, subject TEXT, body TEXT, is_read INTEGER DEFAULT 0,
          email_sent INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        args: []
      });

      // Check if seeding is needed
      const countResult = await client.execute("SELECT COUNT(*) as cnt FROM security_personnel");
      const count = countResult.rows[0].cnt;
      
      if (count === 0) {
        console.log('Database is empty. Seeding initial test data...');
        
        // Seed Personnel 1 - Marcus Vance
        await client.execute({
          sql: `INSERT OR IGNORE INTO security_personnel 
            (id, first_name, last_name, email, phone, certifications, years_experience, service_types, availability_status, availability_notes, service_area, hourly_rate, daily_rate, photo_url, resume_url, bio, rating, total_jobs_completed, profile_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            1, 'Marcus', 'Vance', 'marcus.vance@example.com', '+13055550199', 
            'Armed Guard License, CPR/First Aid, Executive Protection, CCW Permit, Tactical Firearms', 
            12, 'armed,event,executive,corporate', 'available', 'Full-time availability', 
            'Miami-Dade County, FL', 45.00, 350.00, 
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 
            'https://example.com/resumes/marcus_vance.pdf', 
            'Former military police officer with over a decade of private executive protection experience in South Florida. Expert in threat assessment and high-profile security.', 
            4.9, 124, 'active'
          ]
        });

        // Seed Personnel 2 - Sarah Jenkins
        await client.execute({
          sql: `INSERT OR IGNORE INTO security_personnel 
            (id, first_name, last_name, email, phone, certifications, years_experience, service_types, availability_status, availability_notes, service_area, hourly_rate, daily_rate, photo_url, resume_url, bio, rating, total_jobs_completed, profile_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            2, 'Sarah', 'Jenkins', 'sarah.jenkins@example.com', '+13055550122', 
            'CPR/First Aid, Unarmed Guard License, De-escalation Training, Event Security', 
            5, 'unarmed,event,residential,corporate', 'available', 'Prefers weekends and evening shifts', 
            'Miami-Dade County, FL', 25.00, 200.00, 
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 
            'https://example.com/resumes/sarah_jenkins.pdf', 
            'Professional and courteous unarmed guard specializing in retail asset protection and large event security. Strong communicator with extensive de-escalation training.', 
            4.8, 82, 'active'
          ]
        });

        // Seed Personnel 3 - Elena Rostova
        await client.execute({
          sql: `INSERT OR IGNORE INTO security_personnel 
            (id, first_name, last_name, email, phone, certifications, years_experience, service_types, availability_status, availability_notes, service_area, hourly_rate, daily_rate, photo_url, resume_url, bio, rating, total_jobs_completed, profile_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            3, 'Elena', 'Rostova', 'elena.rostova@example.com', '+13055550143', 
            'Executive Protection, Armed Guard License, Advanced Defensive Driving, EMT Certification', 
            8, 'armed,unarmed,executive,personal,corporate', 'partially_available', 'Available weekdays, nights only', 
            'Miami-Dade County, FL', 55.00, 450.00, 
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 
            'https://example.com/resumes/elena_rostova.pdf', 
            'Specialized in personal protection for corporate executives, celebrities, and VIPs. Dual certified as an EMT and defensively trained driver.', 
            5.0, 45, 'active'
          ]
        });

        // Seed Personnel 4 - David Kim
        await client.execute({
          sql: `INSERT OR IGNORE INTO security_personnel 
            (id, first_name, last_name, email, phone, certifications, years_experience, service_types, availability_status, availability_notes, service_area, hourly_rate, daily_rate, photo_url, resume_url, bio, rating, total_jobs_completed, profile_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            4, 'David', 'Kim', 'david.kim@example.com', '+19545550188', 
            'Unarmed Guard License, CPR/First Aid', 
            2, 'unarmed,residential,corporate,event', 'available', 'Flexible hours', 
            'Miami-Dade County, FL', 18.00, 140.00, 
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 
            'https://example.com/resumes/david_chen.pdf', 
            'Reliable and vigilant guard with 2 years of corporate security desk experience. Committed to maintaining a safe and welcoming environment.', 
            4.5, 12, 'active'
          ]
        });

        // Seed Customer
        await client.execute({
          sql: "INSERT OR IGNORE INTO customers (id, first_name, last_name, email, phone, company_name) VALUES (?, ?, ?, ?, ?, ?)",
          args: [1, 'James', 'Sterling', 'james.sterling@example.com', '+13055550201', 'Sterling Enterprises']
        });

        // Seed Hire Request
        await client.execute({
          sql: `INSERT OR IGNORE INTO hire_requests 
            (id, customer_id, title, description, service_type_needed, location, start_date, end_date, budget_min, budget_max, personnel_count, urgency, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            1, 1, 'Corporate Event Security - Annual Gala', 
            'Need high-level security for our corporate gala. Expecting 200 guests. Armed or executive protection-trained personnel preferred.', 
            'executive', 'Grand Ballroom, Miami Beach, FL', '2026-06-15 18:00:00', '2026-06-15 23:00:00', 
            40.00, 60.00, 2, 'standard', 'matched'
          ]
        });

        // Seed Matches
        await client.execute({
          sql: "INSERT OR IGNORE INTO matches (id, hire_request_id, personnel_id, match_score, status) VALUES (?, ?, ?, ?, ?)",
          args: [1, 1, 1, 97.0, 'proposed']
        });
        await client.execute({
          sql: "INSERT OR IGNORE INTO matches (id, hire_request_id, personnel_id, match_score, status) VALUES (?, ?, ?, ?, ?)",
          args: [2, 1, 3, 88.0, 'proposed']
        });

        // Seed Notifications
        await client.execute({
          sql: "INSERT OR IGNORE INTO notifications (id, recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [1, 'personnel', 1, 'new_request', 'New Opportunity: Gala', 'Matched to Corporate Event Security - Annual Gala', 0, 1]
        });
        await client.execute({
          sql: "INSERT OR IGNORE INTO notifications (id, recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [2, 'personnel', 3, 'new_request', 'New Opportunity: Gala', 'Matched to Corporate Event Security - Annual Gala', 0, 1]
        });
        await client.execute({
          sql: "INSERT OR IGNORE INTO notifications (id, recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [3, 'customer', 1, 'new_match', 'Matches Found: Gala', 'We found 2 qualified matches for your Gala request.', 0, 1]
        });
      }
    })();
  }
  return initPromise;
}

// Helper: map libsql row array to object
function mapRow(columns, row) {
  const obj = {};
  columns.forEach((col, idx) => {
    obj[col] = row[idx];
  });
  return obj;
}

function mapRows(res) {
  return res.rows.map(row => mapRow(res.columns, row));
}

// ---------------- EXPORTED FUNCTIONS ----------------

async function getPersonnel() {
  await ensureInit();
  const res = await client.execute({ sql: "SELECT * FROM security_personnel", args: [] });
  return mapRows(res);
}

async function getPersonnelById(id) {
  await ensureInit();
  const res = await client.execute({
    sql: "SELECT * FROM security_personnel WHERE id = ?",
    args: [id]
  });
  const list = mapRows(res);
  return list.length > 0 ? list[0] : null;
}

async function addPersonnel(data) {
  await ensureInit();
  const res = await client.execute({
    sql: `INSERT INTO security_personnel (
      first_name, last_name, email, phone, certifications, years_experience,
      service_types, availability_status, availability_notes, service_area,
      hourly_rate, daily_rate, photo_url, resume_url, bio, profile_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review')`,
    args: [
      data.first_name, data.last_name, data.email, data.phone, data.certifications, 
      data.years_experience || 0, data.service_types, data.availability_status || 'available', 
      data.availability_notes, data.service_area, data.hourly_rate || 0, data.daily_rate || 0, 
      data.photo_url, data.resume_url, data.bio
    ]
  });
  return { id: res.lastInsertRowid };
}

async function getHireRequests(customerId) {
  await ensureInit();
  let res;
  if (customerId) {
    res = await client.execute({
      sql: "SELECT * FROM hire_requests WHERE customer_id = ? ORDER BY id DESC",
      args: [customerId]
    });
  } else {
    res = await client.execute({ sql: "SELECT * FROM hire_requests ORDER BY id DESC", args: [] });
  }
  return mapRows(res);
}

async function addHireRequest(data) {
  await ensureInit();
  const res = await client.execute({
    sql: `INSERT INTO hire_requests (
      customer_id, title, description, service_type_needed, location, start_date, end_date,
      budget_min, budget_max, personnel_count, urgency, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
    args: [
      data.customer_id || 1, data.title, data.description, data.service_type_needed, data.location,
      data.start_date, data.end_date, data.budget_min || 0, data.budget_max || 0, 
      data.personnel_count || 1, data.urgency || 'standard'
    ]
  });
  
  const requestId = res.lastInsertRowid;
  
  // Trigger matching engine
  await runMatchEngine(requestId);
  
  // Return the newly created request
  const reqRes = await client.execute({
    sql: "SELECT * FROM hire_requests WHERE id = ?",
    args: [requestId]
  });
  return mapRows(reqRes)[0];
}

async function getMatches(requestId, personnelId) {
  await ensureInit();
  let res;
  if (requestId) {
    res = await client.execute({
      sql: `SELECT m.*, p.first_name, p.last_name, p.photo_url, p.rating, p.hourly_rate, p.years_experience, p.certifications, p.bio, p.email, p.phone
            FROM matches m
            JOIN security_personnel p ON m.personnel_id = p.id
            WHERE m.hire_request_id = ?
            ORDER BY m.match_score DESC`,
      args: [requestId]
    });
  } else if (personnelId) {
    res = await client.execute({
      sql: `SELECT m.*, r.title, r.location, r.start_date, r.end_date, r.budget_max, r.budget_min, r.description, r.customer_id
            FROM matches m
            JOIN hire_requests r ON m.hire_request_id = r.id
            WHERE m.personnel_id = ?
            ORDER BY m.id DESC`,
      args: [personnelId]
    });
  } else {
    res = await client.execute({ sql: "SELECT * FROM matches ORDER BY id DESC", args: [] });
  }
  return mapRows(res);
}

async function addMatch(data) {
  await ensureInit();
  const res = await client.execute({
    sql: "INSERT INTO matches (hire_request_id, personnel_id, match_score, status) VALUES (?, ?, ?, 'proposed')",
    args: [data.hire_request_id, data.personnel_id, data.match_score]
  });
  return { id: res.lastInsertRowid };
}

async function updateMatchStatus(matchId, status) {
  await ensureInit();
  await client.execute({
    sql: "UPDATE matches SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [status, matchId]
  });

  // Fetch match details to send alert notification to the customer
  const matchRes = await client.execute({
    sql: `SELECT m.*, r.customer_id, r.title, p.first_name, p.last_name, p.email as p_email, p.phone as p_phone
          FROM matches m
          JOIN hire_requests r ON m.hire_request_id = r.id
          JOIN security_personnel p ON m.personnel_id = p.id
          WHERE m.id = ?`,
    args: [matchId]
  });
  const match = mapRows(matchRes)[0];

  if (match) {
    const subject = `Match Response: ${match.first_name} ${match.last_name} ${status}`;
    let body = `Security guard ${match.first_name} ${match.last_name} has ${status} your match proposal for "${match.title}".`;
    
    if (status === 'accepted') {
      body += ` You can now contact them directly via email: ${match.p_email} or phone: ${match.p_phone}.`;
    }
    
    await addNotification({
      recipient_type: 'customer',
      recipient_id: match.customer_id,
      notification_type: 'match_accepted',
      subject: subject,
      body: body
    });
    
    // Also notify the personnel
    await addNotification({
      recipient_type: 'personnel',
      recipient_id: match.personnel_id,
      notification_type: 'match_accepted',
      subject: `Match Confirmed: ${match.title}`,
      body: `You have successfully accepted the job match for "${match.title}".`
    });
    return true;
  }
  return false;
}

async function getNotifications(recipientType, recipientId) {
  await ensureInit();
  let res;
  if (recipientType && recipientId) {
    res = await client.execute({
      sql: "SELECT * FROM notifications WHERE recipient_type = ? AND recipient_id = ? ORDER BY id DESC",
      args: [recipientType, recipientId]
    });
  } else {
    res = await client.execute({ sql: "SELECT * FROM notifications ORDER BY id DESC", args: [] });
  }
  return mapRows(res);
}

async function addNotification(data) {
  await ensureInit();
  const res = await client.execute({
    sql: "INSERT INTO notifications (recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES (?, ?, ?, ?, ?, 0, 1)",
    args: [data.recipient_type, data.recipient_id, data.notification_type, data.subject, data.body]
  });
  return { id: res.lastInsertRowid };
}

async function getCustomers() {
  await ensureInit();
  const res = await client.execute({ sql: "SELECT * FROM customers ORDER BY id DESC", args: [] });
  return mapRows(res);
}

async function addCustomer(data) {
  await ensureInit();
  const res = await client.execute({
    sql: "INSERT INTO customers (first_name, last_name, email, phone, company_name) VALUES (?, ?, ?, ?, ?)",
    args: [data.first_name, data.last_name, data.email, data.phone, data.company_name]
  });
  return { id: res.lastInsertRowid };
}

async function getStats() {
  await ensureInit();
  const personnelRes = await client.execute({ sql: "SELECT COUNT(*) as count FROM security_personnel WHERE profile_status = 'active'", args: [] });
  const requestsRes = await client.execute({ sql: "SELECT COUNT(*) as count FROM hire_requests WHERE status = 'open'", args: [] });
  const matchesRes = await client.execute({ sql: "SELECT COUNT(*) as count FROM matches", args: [] });
  
  return {
    personnel_count: personnelRes.rows[0].count,
    open_requests_count: requestsRes.rows[0].count,
    total_matches_count: matchesRes.rows[0].count
  };
}

// Async Matching Engine Engine
async function runMatchEngine(requestId) {
  const reqRes = await client.execute({
    sql: "SELECT * FROM hire_requests WHERE id = ?",
    args: [requestId]
  });
  const req = mapRows(reqRes)[0];
  if (!req) return;

  const personnelRes = await client.execute({ sql: "SELECT * FROM security_personnel WHERE profile_status = 'active' AND availability_status != 'unavailable'", args: [] });
  const personnel = mapRows(personnelRes);
  const scored = [];
  const reqServiceType = req.service_type_needed.toLowerCase();

  for (const p of personnel) {
    const pTypes = (p.service_types || "").split(',').map(s => s.trim().toLowerCase());
    if (!pTypes.includes(reqServiceType)) continue;

    let score = 30; // exact service type fit

    // Location overlap (+25)
    if (p.service_area && req.location) {
      const pArea = p.service_area.toLowerCase();
      const rLoc = req.location.toLowerCase();
      if (pArea.includes(rLoc) || rLoc.includes(pArea) || (pArea.includes('miami') && rLoc.includes('miami'))) {
        score += 25;
      }
    }

    // Rate within budget (+20)
    if (p.hourly_rate >= req.budget_min && p.hourly_rate <= req.budget_max) {
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

  // Persist matches & queue notifications
  for (const item of top5) {
    const p = item.personnel;
    await client.execute({
      sql: "INSERT INTO matches (hire_request_id, personnel_id, match_score, status) VALUES (?, ?, ?, 'proposed')",
      args: [requestId, p.id, item.score]
    });
    
    await addNotification({
      recipient_type: 'personnel',
      recipient_id: p.id,
      notification_type: 'new_request',
      subject: `New Opportunity: ${req.title}`,
      body: `Hello ${p.first_name}, you score ${item.score}/100 match for "${req.title}" located at ${req.location}.`
    });
  }

  if (top5.length > 0) {
    await client.execute({
      sql: "UPDATE hire_requests SET status = 'matched' WHERE id = ?",
      args: [requestId]
    });
    
    await addNotification({
      recipient_type: 'customer',
      recipient_id: req.customer_id,
      notification_type: 'new_match',
      subject: `Security Personnel Matches Found: ${req.title}`,
      body: `We found ${top5.length} qualified security personnel matches for your request!`
    });
  }
}

module.exports = {
  getPersonnel, addPersonnel, getPersonnelById,
  getHireRequests, addHireRequest,
  getMatches, addMatch, updateMatchStatus,
  getNotifications, addNotification,
  getCustomers, addCustomer, getStats
};
