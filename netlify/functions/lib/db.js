// NOTE: In-memory store for testing. Data resets on cold start. For production, migrate to Turso (libsql), Supabase, or PlanetScale.

let personnel = [
  {
    id: 1, first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@example.com', phone: '+13055550199', 
    certifications: 'Armed Guard License, CPR/First Aid, Executive Protection, CCW Permit, Tactical Firearms', 
    years_experience: 12, service_types: 'armed,event,executive,corporate', availability_status: 'available', availability_notes: 'Full-time availability', 
    service_area: 'Miami-Dade County, FL', hourly_rate: 45.00, daily_rate: 350.00, 
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 
    resume_url: 'https://example.com/resumes/marcus_vance.pdf', 
    bio: 'Former military police officer with over a decade of private executive protection experience in South Florida. Expert in threat assessment and high-profile security.', 
    rating: 4.9, total_jobs_completed: 124, profile_status: 'active'
  },
  {
    id: 2, first_name: 'Sarah', last_name: 'Jenkins', email: 'sarah.jenkins@example.com', phone: '+13055550122', 
    certifications: 'CPR/First Aid, Unarmed Guard License, De-escalation Training, Event Security', 
    years_experience: 5, service_types: 'unarmed,event,residential,corporate', availability_status: 'available', availability_notes: 'Prefers weekends and evening shifts', 
    service_area: 'Miami-Dade County, FL', hourly_rate: 25.00, daily_rate: 200.00, 
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 
    resume_url: 'https://example.com/resumes/sarah_jenkins.pdf', 
    bio: 'Professional and courteous unarmed guard specializing in retail asset protection and large event security. Strong communicator with extensive de-escalation training.', 
    rating: 4.8, total_jobs_completed: 82, profile_status: 'active'
  },
  {
    id: 3, first_name: 'Elena', last_name: 'Rostova', email: 'elena.rostova@example.com', phone: '+13055550143', 
    certifications: 'Executive Protection, Armed Guard License, Advanced Defensive Driving, EMT Certification', 
    years_experience: 8, service_types: 'armed,unarmed,executive,personal,corporate', availability_status: 'partially_available', availability_notes: 'Available weekdays, nights only', 
    service_area: 'Miami-Dade County, FL', hourly_rate: 55.00, daily_rate: 450.00, 
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 
    resume_url: 'https://example.com/resumes/elena_rostova.pdf', 
    bio: 'Specialized in personal protection for corporate executives, celebrities, and VIPs. Dual certified as an EMT and defensively trained driver.', 
    rating: 5.0, total_jobs_completed: 45, profile_status: 'active'
  },
  {
    id: 4, first_name: 'David', last_name: 'Chen', email: 'david.chen@example.com', phone: '+19545550188', 
    certifications: 'Unarmed Guard License, CPR/First Aid', 
    years_experience: 2, service_types: 'unarmed,residential,corporate,event', availability_status: 'available', availability_notes: 'Flexible hours', 
    service_area: 'Miami-Dade County, FL', hourly_rate: 18.00, daily_rate: 140.00, 
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 
    resume_url: 'https://example.com/resumes/david_chen.pdf', 
    bio: 'Reliable and vigilant guard with 2 years of corporate security desk experience. Committed to maintaining a safe and welcoming environment.', 
    rating: 4.5, total_jobs_completed: 12, profile_status: 'active'
  }
];

let customers = [
  { id: 1, first_name: 'James', last_name: 'Sterling', email: 'james.sterling@example.com', phone: '+13055550201', company_name: 'Sterling Enterprises' }
];

let hireRequests = [
  {
    id: 1, customer_id: 1, title: 'Corporate Event Security - Annual Gala', 
    description: 'Need high-level security for our corporate gala. Expecting 200 guests. Armed or executive protection-trained personnel preferred.', 
    service_type_needed: 'executive', location: 'Grand Ballroom, Miami Beach, FL', start_date: '2026-06-15 18:00:00', end_date: '2026-06-15 23:00:00', 
    budget_min: 40.00, budget_max: 60.00, personnel_count: 2, urgency: 'standard', status: 'matched'
  }
];

let matches = [
  { id: 1, hire_request_id: 1, personnel_id: 1, match_score: 97.0, status: 'proposed' },
  { id: 2, hire_request_id: 1, personnel_id: 3, match_score: 88.0, status: 'proposed' }
];

let notifications = [
  { id: 1, recipient_type: 'personnel', recipient_id: 1, notification_type: 'new_request', subject: 'New Opportunity: Gala', body: 'Matched to Corporate Event Security - Annual Gala', is_read: 0, email_sent: 1 },
  { id: 2, recipient_type: 'personnel', recipient_id: 3, notification_type: 'new_request', subject: 'New Opportunity: Gala', body: 'Matched to Corporate Event Security - Annual Gala', is_read: 0, email_sent: 1 },
  { id: 3, recipient_type: 'customer', recipient_id: 1, notification_type: 'new_match', subject: 'Matches Found: Gala', body: 'We found 2 qualified matches for your Gala request.', is_read: 0, email_sent: 1 }
];

function getPersonnel() {
  return personnel;
}

function addPersonnel(data) {
  const newGuard = {
    id: personnel.length + 1,
    rating: 0,
    total_jobs_completed: 0,
    profile_status: 'active',
    ...data
  };
  personnel.push(newGuard);
  return newGuard;
}

function getHireRequests() {
  return hireRequests;
}

function addHireRequest(data) {
  const newReq = {
    id: hireRequests.length + 1,
    status: 'open',
    ...data
  };
  hireRequests.push(newReq);
  
  // TRIGGER MATCHING ENGINE FOR THIS NEW REQUEST
  runMatchEngine(newReq);
  
  return newReq;
}

function getMatches() {
  return matches;
}

function addMatch(data) {
  const m = {
    id: matches.length + 1,
    status: 'proposed',
    ...data
  };
  matches.push(m);
  return m;
}

function updateMatchStatus(matchId, status, notes) {
  const match = matches.find(m => m.id === parseInt(matchId));
  if (match) {
    match.status = status;
    match.responded_at = new Date().toISOString();
    match.notes = notes || '';
    
    // Add Alert Notification to Customer
    const req = hireRequests.find(r => r.id === match.hire_request_id);
    const p = personnel.find(g => g.id === match.personnel_id);
    if (req && p) {
      addNotification({
        recipient_type: 'customer',
        recipient_id: req.customer_id,
        notification_type: 'match_accepted',
        subject: `Match Response: ${p.first_name} ${p.last_name} ${status}`,
        body: `Security guard ${p.first_name} ${p.last_name} has ${status} your match proposal for "${req.title}". Notes: ${notes || 'None'}`
      });
    }
    return true;
  }
  return false;
}

function getNotifications() {
  return notifications;
}

function addNotification(data) {
  const n = {
    id: notifications.length + 1,
    is_read: 0,
    email_sent: 1,
    created_at: new Date().toISOString(),
    ...data
  };
  notifications.push(n);
  return n;
}

// Same Matching Engine Algorithm
function runMatchEngine(req) {
  const activePersonnel = personnel.filter(p => p.profile_status === 'active' && p.availability_status !== 'unavailable');
  const scored = [];
  const reqServiceType = req.service_type_needed.toLowerCase();

  for (const p of activePersonnel) {
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
    addMatch({
      hire_request_id: req.id,
      personnel_id: p.id,
      match_score: item.score
    });

    addNotification({
      recipient_type: 'personnel',
      recipient_id: p.id,
      notification_type: 'new_request',
      subject: `New Opportunity: ${req.title}`,
      body: `Hello ${p.first_name}, you score ${item.score}/100 match for "${req.title}" located at ${req.location}.`
    });
  }

  if (top5.length > 0) {
    req.status = 'matched';
    addNotification({
      recipient_type: 'customer',
      recipient_id: req.customer_id,
      notification_type: 'new_match',
      subject: `Security Personnel Matches Found: ${req.title}`,
      body: `We found ${top5.length} qualified security personnel matches for your request!`
    });
  }
}

module.exports = {
  getPersonnel, addPersonnel,
  getHireRequests, addHireRequest,
  getMatches, addMatch, updateMatchStatus,
  getNotifications, addNotification
};
