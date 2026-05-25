const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join('/tmp', 'sentinel_marketplace.db');

function getDB() {
  const isNew = !fs.existsSync(dbPath);
  const db = new Database(dbPath);

  if (isNew) {
    console.log('Database file not found in /tmp. Creating tables and seeding initial test data...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS security_personnel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT, last_name TEXT, email TEXT UNIQUE, phone TEXT,
        certifications TEXT, years_experience INTEGER, service_types TEXT,
        availability_status TEXT DEFAULT 'available', availability_notes TEXT,
        service_area TEXT, hourly_rate REAL, daily_rate REAL, photo_url TEXT,
        resume_url TEXT, bio TEXT, rating REAL DEFAULT 0, total_jobs_completed INTEGER DEFAULT 0,
        profile_status TEXT DEFAULT 'pending_review', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT, last_name TEXT, email TEXT UNIQUE, phone TEXT,
        company_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hire_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, title TEXT, description TEXT,
        service_type_needed TEXT, location TEXT, start_date TEXT, end_date TEXT,
        budget_min REAL, budget_max REAL, personnel_count INTEGER DEFAULT 1,
        urgency TEXT DEFAULT 'standard', status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT, hire_request_id INTEGER, personnel_id INTEGER,
        match_score REAL, status TEXT DEFAULT 'proposed', proposed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        responded_at TEXT, notes TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT, recipient_type TEXT, recipient_id INTEGER,
        notification_type TEXT, subject TEXT, body TEXT, is_read INTEGER DEFAULT 0,
        email_sent INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Personnel
    const stmtPersonnel = db.prepare(\`INSERT OR IGNORE INTO security_personnel 
      (id, first_name, last_name, email, phone, certifications, years_experience, service_types, availability_status, availability_notes, service_area, hourly_rate, daily_rate, photo_url, resume_url, bio, rating, total_jobs_completed, profile_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`);

    stmtPersonnel.run(
      1, 'Marcus', 'Vance', 'marcus.vance@example.com', '+13055550199', 
      'Armed Guard License, CPR/First Aid, Executive Protection, CCW Permit, Tactical Firearms', 
      12, 'armed,event,executive,corporate', 'available', 'Full-time availability', 
      'Miami-Dade County, FL', 45.00, 350.00, 
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 
      'https://example.com/resumes/marcus_vance.pdf', 
      'Former military police officer with over a decade of private executive protection experience in South Florida. Expert in threat assessment and high-profile security.', 
      4.9, 124, 'active'
    );

    stmtPersonnel.run(
      2, 'Sarah', 'Jenkins', 'sarah.jenkins@example.com', '+13055550122', 
      'CPR/First Aid, Unarmed Guard License, De-escalation Training, Event Security', 
      5, 'unarmed,event,residential,corporate', 'available', 'Prefers weekends and evening shifts', 
      'Miami-Dade County, FL', 25.00, 200.00, 
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 
      'https://example.com/resumes/sarah_jenkins.pdf', 
      'Professional and courteous unarmed guard specializing in retail asset protection and large event security. Strong communicator with extensive de-escalation training.', 
      4.8, 82, 'active'
    );

    stmtPersonnel.run(
      3, 'Elena', 'Rostova', 'elena.rostova@example.com', '+13055550143', 
      'Executive Protection, Armed Guard License, Advanced Defensive Driving, EMT Certification', 
      8, 'armed,unarmed,executive,personal,corporate', 'partially_available', 'Available weekdays, nights only', 
      'Miami-Dade County, FL', 55.00, 450.00, 
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 
      'https://example.com/resumes/elena_rostova.pdf', 
      'Specialized in personal protection for corporate executives, celebrities, and VIPs. Dual certified as an EMT and defensively trained driver.', 
      5.0, 45, 'active'
    );

    stmtPersonnel.run(
      4, 'David', 'Chen', 'david.chen@example.com', '+19545550188', 
      'Unarmed Guard License, CPR/First Aid', 
      2, 'unarmed,residential,corporate,event', 'available', 'Flexible hours', 
      'Miami-Dade County, FL', 18.00, 140.00, 
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 
      'https://example.com/resumes/david_chen.pdf', 
      'Reliable and vigilant guard with 2 years of corporate security desk experience. Committed to maintaining a safe and welcoming environment.', 
      4.5, 12, 'active'
    );

    // Seed Customer
    const stmtCustomer = db.prepare(\`INSERT OR IGNORE INTO customers (id, first_name, last_name, email, phone, company_name) VALUES (?, ?, ?, ?, ?, ?)\`);
    stmtCustomer.run(1, 'James', 'Sterling', 'james.sterling@example.com', '+13055550201', 'Sterling Enterprises');

    // Seed Hire Request
    const stmtRequest = db.prepare(\`INSERT OR IGNORE INTO hire_requests 
      (id, customer_id, title, description, service_type_needed, location, start_date, end_date, budget_min, budget_max, personnel_count, urgency, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`);
    stmtRequest.run(
      1, 1, 'Corporate Event Security - Annual Gala', 
      'Need high-level security for our corporate gala. Expecting 200 guests. Armed or executive protection-trained personnel preferred.', 
      'executive', 'Grand Ballroom, Miami Beach, FL', '2026-06-15 18:00:00', '2026-06-15 23:00:00', 
      40.00, 60.00, 2, 'standard', 'matched'
    );

    // Seed Matches
    const stmtMatches = db.prepare(\`INSERT OR IGNORE INTO matches (id, hire_request_id, personnel_id, match_score, status) VALUES (?, ?, ?, ?, ?)\`);
    stmtMatches.run(1, 1, 1, 97.0, 'proposed');
    stmtMatches.run(2, 1, 3, 88.0, 'proposed');

    // Seed Notifications
    const stmtNotifications = db.prepare(\`INSERT OR IGNORE INTO notifications (id, recipient_type, recipient_id, notification_type, subject, body, is_read, email_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`);
    stmtNotifications.run(1, 'personnel', 1, 'new_request', 'New Opportunity: Gala', 'Matched to Corporate Event Security - Annual Gala', 0, 1);
    stmtNotifications.run(2, 'personnel', 3, 'new_request', 'New Opportunity: Gala', 'Matched to Corporate Event Security - Annual Gala', 0, 1);
    stmtNotifications.run(3, 'customer', 1, 'new_match', 'Matches Found: Gala', 'We found 2 qualified matches for your Gala request.', 0, 1);
  }

  return db;
}

module.exports = { getDB };
