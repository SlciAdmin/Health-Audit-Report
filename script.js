// ============================================================
// LABOURSHIELD — script.js FINAL VERSION
// Leave Gap Card REMOVED from user form - Only shows in Admin Dashboard
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbyr8xDGZJP2EjNkCwmxFr1RnzOe0dlhwZ1Z3Ifp3QpVxObTCqXOuGFbPm9AV7OOXMdRRw/exec";

// ===== STATE LEAVE DATABASE =====
const STATE_LEAVE_DATA = {
  "Andaman and Nicobar":    { EL: 15, CL: 12, SL: 12, ELNote: "After 240 days continuous service in preceding 12 months", law: "Andaman & Nicobar Shops & Establishment Act" },
  "Andhra Pradesh":         { EL: 15, CL: 12, SL: 12, ELNote: "After 240 days continuous service in preceding 12 months", law: "AP Shops & Establishments Act" },
  "Assam":                  { EL: 16, CL: 12, SL: 12, ELNote: "After 12 months of continuous service", law: "Assam Shops & Establishments Act" },
  "Bihar":                  { EL: 18, CL: 12, SL: 12, ELNote: "1 day EL per 20 days worked in previous calendar year (approx 18 days)", law: "Bihar Shops & Establishments Act" },
  "Chandigarh":             { EL: 18, CL: 7,  SL: 7,  ELNote: "1 EL per 20 days for adults (approx 18 days)", law: "Punjab Shops & Commercial Establishments Act (Chandigarh)" },
  "Chhattisgarh":           { EL: 18, CL: 8,  SL: 0,  ELNote: "1 EL per 20 days if worked 240+ days in previous year", law: "Chhattisgarh Shops & Establishment Act" },
  "Dadra and Nagar Haveli": { EL: 15, CL: 6,  SL: 9,  ELNote: "After 240 days of continuous service in 12 months", law: "Dadra & Nagar Haveli Shops & Establishments Act" },
  "Daman and Diu":          { EL: 15, CL: 6,  SL: 9,  ELNote: "After 240 days of continuous service in 12 months", law: "Daman & Diu Shops & Establishments Act" },
  "Delhi":                  { EL: 15, CL: 12, SL: 0,  ELNote: "After 12 months of continuous employment (5 days per 4 months)", law: "Delhi Shops & Establishments Act" },
  "Goa":                    { EL: 15, CL: 6,  SL: 9,  ELNote: "After 240 days of continuous service in 12 months", law: "Goa Shops & Establishments Act" },
  "Gujarat":                { EL: 18, CL: 7,  SL: 7,  ELNote: "1 EL per 20 days if worked 240+ days (approx 18 days); credited beginning of year", law: "Gujarat Shops & Establishments Act" },
  "Haryana":                { EL: 18, CL: 7,  SL: 7,  ELNote: "1 EL per 20 days for adults", law: "Haryana Shops & Commercial Establishments Act" },
  "Himachal Pradesh":       { EL: 18, CL: 7,  SL: 7,  ELNote: "1 EL per 20 days for adults", law: "Himachal Pradesh Shops & Commercial Establishments Act" },
  "Jammu and Kashmir":      { EL: 30, CL: 14, SL: 0,  ELNote: "After every 12 months of continuous service", law: "J&K Shops & Establishments Act" },
  "Jharkhand":              { EL: 18, CL: 12, SL: 12, ELNote: "1 day EL per 20 days worked in previous calendar year", law: "Jharkhand Shops & Establishments Act" },
  "Karnataka":              { EL: 18, CL: 0,  SL: 12, ELNote: "1 EL per 20 days for adults", law: "Karnataka Shops & Commercial Establishments Act" },
  "Kerala":                 { EL: 12, CL: 12, SL: 12, ELNote: "After 12 months of continuous service", law: "Kerala Shops & Commercial Establishments Act" },
  "Madhya Pradesh":         { EL: 30, CL: 14, SL: 0,  ELNote: "After 12 months of continuous service", law: "MP Shops & Establishments Act" },
  "Maharashtra":            { EL: 18, CL: 8,  SL: 0,  ELNote: "1 EL per 20 days if worked 240+ days in previous year", law: "Maharashtra Shops & Establishments Act" },
  "Manipur":                { EL: 30, CL: 12, SL: 30, ELNote: "After every 12 months of continuous service (full pay)", law: "Manipur Shops & Establishments Act" },
  "Meghalaya":              { EL: 16, CL: 12, SL: 12, ELNote: "After 12 months of continuous service", law: "Meghalaya Shops & Establishments Act" },
  "Nagaland":               { EL: 16, CL: 12, SL: 12, ELNote: "After 12 months of continuous service", law: "Nagaland Shops & Establishments Act" },
  "Odisha":                 { EL: 18, CL: 0,  SL: 15, ELNote: "1 EL per 20 days for adults", law: "Odisha Shops & Commercial Establishments Act" },
  "Pondicherry":            { EL: 12, CL: 12, SL: 12, ELNote: "After 12 months of continuous service", law: "Pondicherry Shops & Establishments Act" },
  "Punjab":                 { EL: 18, CL: 7,  SL: 7,  ELNote: "1 EL per 20 days for adults", law: "Punjab Shops & Commercial Establishments Act" },
  "Rajasthan":              { EL: 26, CL: 0,  SL: 0,  ELNote: "1 EL per 12 days completed in previous year for adults", law: "Rajasthan Shops & Commercial Establishments Act" },
  "Sikkim":                 { EL: 20, CL: 12, SL: 12, ELNote: "After twelve months continuous service", law: "Sikkim Shops & Establishments Act" },
  "Tamil Nadu":             { EL: 12, CL: 12, SL: 12, ELNote: "After twelve months continuous service", law: "Tamil Nadu Shops & Establishments Act" },
  "Telangana":              { EL: 15, CL: 12, SL: 12, ELNote: "After 240 days of continuous service in 12 months", law: "Telangana Shops & Establishments Act" },
  "Tripura":                { EL: 15, CL: 14, SL: 12, ELNote: "After completing 12 months of continuous service", law: "Tripura Shops & Establishments Act" },
  "Uttar Pradesh":          { EL: 15, CL: 10, SL: 15, ELNote: "After 12 months of continuous service", law: "UP Shops & Commercial Establishments Act" },
  "Uttarakhand":            { EL: 18, CL: 8,  SL: 0,  ELNote: "1 EL per 20 days if worked 240+ days in previous year", law: "Uttarakhand Shops & Establishments Act" },
  "West Bengal":            { EL: 14, CL: 10, SL: 14, ELNote: "After 12 months of continuous service", law: "West Bengal Shops & Establishments Act" },
};

// ===== APP STATE =====
let submissions           = [];
let localSubmissions      = [];
let isAdmin               = false;
let charts                = {};
let uCharts               = {};
let activeDetailId        = null;
let currentUserSubmission = null;

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'labourshield@2024';
const LS_KEY     = 'ls_submissions_v4';
const LS_LAST    = 'ls_last_submission_id_v4';
const LS_ADMIN   = 'ls_admin_session';
const LS_THEME   = 'ls_theme';

// ===== THEME =====
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(LS_THEME, theme);
  destroyAllCharts();
  if (currentUserSubmission && document.getElementById('udashReport')?.style.display !== 'none') {
    setTimeout(() => renderUserCharts(currentUserSubmission), 50);
  }
  if (isAdmin && document.getElementById('view-admin-dashboard')?.classList.contains('active')) {
    const stateF = document.getElementById('adminStateFilter')?.value || '';
    const indF   = document.getElementById('adminIndustryFilter')?.value || '';
    const filtered = submissions.filter(s => (!stateF || s.state === stateF) && (!indF || s.field === indF));
    setTimeout(() => renderAdminCharts(filtered), 50);
  }
}

function destroyAllCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  Object.values(uCharts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {}; uCharts = {};
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'light' ? 'dark' : 'light');
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const navCenter = document.getElementById('navCenter');
  const hamburger = document.getElementById('hamburgerBtn');
  const overlay   = document.getElementById('mobileNavOverlay');
  const isOpen    = navCenter.classList.contains('mobile-open');
  if (isOpen) {
    navCenter.classList.remove('mobile-open');
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
  } else {
    navCenter.classList.add('mobile-open');
    hamburger.classList.add('open');
    overlay.classList.add('open');
  }
}
function closeMobileMenu() {
  document.getElementById('navCenter')?.classList.remove('mobile-open');
  document.getElementById('hamburgerBtn')?.classList.remove('open');
  document.getElementById('mobileNavOverlay')?.classList.remove('open');
}

// ===== NEW: Toggle Salary Date Field (B5) =====
function toggleSalaryDateField(show) {
  const container = document.getElementById('sb5DateContainer');
  if (container) {
    container.style.display = show ? 'block' : 'none';
  }
  if (!show) {
    const dateInput = document.getElementById('sb5Date');
    if (dateInput) dateInput.value = '';
  }
}

// ===== UPDATED: Toggle POSH Questions (C Section) - C3-C5 visible ONLY if C1="Yes" AND C2="Yes" =====
function togglePOSHQuestions() {
  const c1Val = getRadio('sc1');
  const c2Val = getRadio('sc2');
  const c3c4c5Wrapper = document.getElementById('poshAdvancedQuestions');
  const c2Block = document.querySelector('[data-qname="sc2"]')?.closest('.qblock');
  
  if (c1Val === 'Yes') {
    if (c2Block) c2Block.style.display = 'block';
    if (c2Val === 'Yes' && c3c4c5Wrapper) {
      c3c4c5Wrapper.style.display = 'block';
    } else if (c3c4c5Wrapper) {
      c3c4c5Wrapper.style.display = 'none';
      ['sc3','sc4','sc5'].forEach(name => {
        const radio = document.querySelector(`input[name="${name}"][value="No"]`);
        if (radio) radio.checked = true;
      });
    }
  } else {
    if (c2Block) c2Block.style.display = 'none';
    if (c3c4c5Wrapper) c3c4c5Wrapper.style.display = 'none';
    ['sc2','sc3','sc4','sc5'].forEach(name => {
      const radio = document.querySelector(`input[name="${name}"][value="No"]`);
      if (radio) radio.checked = true;
    });
  }
}

// ===== Toggle PF Questions (D Section) =====
function togglePFQuestions(show) {
  const container = document.getElementById('pfQuestions');
  if (container) {
    container.style.display = show ? 'block' : 'none';
  }
  if (!show) {
    ['sd2','sd3'].forEach(name => {
      const radio = document.querySelector(`input[name="${name}"][value="No"]`);
      if (radio) radio.checked = true;
    });
  }
}

// ===== UPDATED: Update State Leave Badge & Hint =====
function updateStateLeaveBadge() {
  const state = document.getElementById('state')?.value;
  const badge = document.getElementById('stateLeaveBadge');
  const hint = document.getElementById('stateLeaveHint');
  const hintName = document.getElementById('stateHintName');
  const hintTotal = document.getElementById('stateHintTotal');
  
  if (!state || !STATE_LEAVE_DATA[state]) {
    if (badge) badge.style.display = 'none';
    if (hint) hint.style.display = 'none';
    return;
  }
  
  const ld = STATE_LEAVE_DATA[state];
  const mandatoryTotal = ld.EL + ld.CL + ld.SL;
  
  // Update hint for total leaves input
  if (hint && hintName && hintTotal) {
    hintName.textContent = state;
    hintTotal.textContent = mandatoryTotal;
    hint.style.display = 'inline';
  }
  
  // REMOVED: updateLeaveGapCard() call from form
}

// ===== LEAVE COMPLIANCE CHECK (For Admin Dashboard Only) =====
function getLeaveComplianceStatus(d) {
  const state = d.state;
  if (!state || !STATE_LEAVE_DATA[state]) return null;
  const ld = STATE_LEAVE_DATA[state];
  const totalGiven = parseInt(d.se2total) || 0;
  const mandatoryTotal = ld.EL + ld.CL + ld.SL;
  
  return {
    state, ld,
    totalGiven,
    mandatoryTotal,
    diff: totalGiven - mandatoryTotal,
    hasGap: totalGiven < mandatoryTotal,
  };
}

// ===== SCORE CALCULATION =====
function calcScore(d) {
  const lc = getLeaveComplianceStatus(d);
  const leaveOk = lc ? !lc.hasGap : d.se1 === 'Yes';
  const checks = [
    d.sa1 !== '',
    d.sa2 === 'Yes',
    d.sb1 === 'Yes',
    d.sb2 === 'Yes',
    d.sb4 === 'Yes',
    d.sb5 === 'Yes',
    d.sc1 === 'No' ? true : (d.sc2 === 'No' ? true : (d.sc3 === 'Yes')),
    d.sc1 === 'No' ? true : (d.sc2 === 'No' ? true : (d.sc4 === 'Yes')),
    d.sc1 === 'No' ? true : (d.sc2 === 'No' ? true : (d.sc5 === 'Yes')),
    d.sc1 === 'Yes' && d.sc2 === 'Yes' ? (d.sc2 === 'Yes') : true,
    d.sd1 === 'No' ? true : (d.sd3 === 'Yes'),
    d.sd1 === 'No' ? true : (d.sd2 === 'No'),
    d.se1 === 'Yes',
    leaveOk,
    d.se3 === 'Yes',
    d.sf1 === 'Yes',
    d.sf3 === 'Yes',
    d.sg1 === 'Yes' || d.sg1 === 'Partial',
    d.sh1 === 'No',
    d.sh2 === 'No',
    d.sh3 === 'No',
    d.sh4 === 'Yes' && d.sh5 === 'No',
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ===== SECTION SCORES =====
function getSectionScores(s) {
  const lc = getLeaveComplianceStatus(s);
  const leaveOk = lc ? !lc.hasGap : s.se1 === 'Yes';
  
  let cScore = 0;
  if (s.sc1 === 'No') {
    cScore = 100;
  } else if (s.sc2 === 'No') {
    cScore = 25;
  } else {
    cScore = (s.sc2 === 'Yes' ? 25 : 0) + 
             (s.sc3 === 'Yes' ? 25 : 0) + 
             (s.sc4 === 'Yes' ? 25 : 0) + 
             (s.sc5 === 'Yes' ? 25 : 0);
  }
  
  const dScore = s.sd1 === 'No' ? 100 : (
    (s.sd2 === 'No' ? 33 : 0) + (s.sd3 === 'Yes' ? 33 : 0) + (s.sd1 === 'Yes' ? 34 : 0)
  );
  
  return {
    A: ((s.sa1 ? 50 : 0) + (s.sa2 === 'Yes' ? 50 : 0)),
    B: ((s.sb1 === 'Yes' ? 25 : 0) + (s.sb2 === 'Yes' ? 25 : 0) + (s.sb4 === 'Yes' ? 25 : 0) + (s.sb5 === 'Yes' ? 25 : 0)),
    C: cScore,
    D: dScore,
    E: ((s.se1 === 'Yes' ? 34 : 0) + (leaveOk ? 33 : 0) + (s.se3 === 'Yes' ? 33 : 0)),
    F: ((s.sf1 === 'Yes' ? 50 : 0) + (s.sf3 === 'Yes' ? 50 : 0)),
    G: (s.sg1 === 'Yes' ? 100 : s.sg1 === 'Partial' ? 60 : 0),
    H: ((s.sh1 === 'No' ? 25 : 0) + (s.sh2 === 'No' ? 25 : 0) + (s.sh3 === 'No' ? 25 : 0) + (s.sh5 === 'No' ? 25 : 0)),
  };
}

// ===== GAPS =====
function getGaps(d) {
  const gaps = [];
  if (d.sa2 !== 'Yes') gaps.push('License is not in the name of the owner — this may create legal complications');
  if (d.sb1 !== 'Yes') gaps.push('Diwali / festive bonus not being paid to all employees');
  if (d.sb2 !== 'Yes') gaps.push('Unaware that statutory bonus applies only to employees with wages up to ₹21,000');
  if (d.sb4 !== 'Yes') gaps.push('No structured salary format (Basic + HRA + Allowances) in place');
  if (d.sb5 !== 'Yes') gaps.push('Salaries not paid on time — must be disbursed consistently as per employment agreements and state regulations');
  
  if (d.sc1 === 'Yes' && d.sc2 === 'Yes') {
    if (d.sc3 !== 'Yes') gaps.push('Periodic POSH awareness sessions not being conducted');
    if (d.sc4 !== 'Yes') gaps.push('Internal Committee (IC) under POSH Act 2013 not yet constituted');
    if (d.sc5 !== 'Yes') gaps.push('Annual return under POSH Act 2013 not filed');
  } else if (d.sc1 === 'Yes' && d.sc2 !== 'Yes') {
    gaps.push('Employ female staff but unaware of POSH Act 2013 applicability — mandatory compliance risk');
  }
  
  if (d.sd1 === 'Yes') {
    if (d.sd3 !== 'Yes') gaps.push('PF contribution not capped at ₹15,000 wage ceiling — may result in excess liability');
    if (d.sd2 === 'Yes') gaps.push('Paying PF for employees with salary above ₹50,000/₹75,000 — review necessity');
  }
  
  if (d.se1 !== 'Yes') gaps.push('Employees not receiving any statutory leaves as mandated');
  const lc = getLeaveComplianceStatus(d);
  if (lc && lc.hasGap) {
    gaps.push(`Leave deficit: You provide ${lc.totalGiven} total leaves but ${lc.state} law mandates minimum ${lc.mandatoryTotal} days (EL:${lc.ld.EL}+CL:${lc.ld.CL}+SL:${lc.ld.SL}) under ${lc.ld.law}`);
  }
  if (d.se3 !== 'Yes') gaps.push('Unaware that ESIC-covered employees get medical benefits — no separate sick leave needed');
  
  if (d.sf1 !== 'Yes') gaps.push('Unaware that employees earning up to ₹42,000 gross are covered under ESI');
  if (d.sf3 !== 'Yes') gaps.push('Salary structure not restructured as per the four new Labour Codes');
  if (d.sg1 === 'No') gaps.push('HR Policy / Leave Policy / Appointment Letter not updated as per new Labour Codes');
  if (d.sh1 === 'Yes') gaps.push('Faced challenges with Labour Inspector — compliance documentation must be strengthened');
  if (d.sh2 === 'Yes') gaps.push('Pending Notices / Inspections / Cases require immediate legal attention');
  if (d.sh3 === 'Yes') gaps.push('Employees leaving without notice period — employment agreements need enforcement clauses');
  if (d.sh5 === 'Yes') gaps.push('Employees have damaged or left with assets — an Asset Agreement Policy is required');
  
  return gaps;
}

// ===== RECOMMENDATIONS =====
function getRecs(gaps) {
  const map = {
    'License is not in the name':          'Transfer or obtain the business license in the owner\'s name to avoid legal disputes',
    'Diwali / festive bonus':              'Ensure Diwali bonus payment to all eligible employees as per Payment of Bonus Act 1965',
    'statutory bonus applies only':        'Verify bonus eligibility — only employees with wages up to ₹21,000/month qualify under the Act',
    'structured salary format':            'Restructure salary into Basic (≥50%) + HRA + Other Allowances for correct PF & ESI computation',
    'Salaries not paid on time':           'Implement a fixed payroll cycle — disburse salaries on a consistent date every month (ideally before 7th) to avoid statutory penalties and employee dissatisfaction',
    'Unaware of POSH Act':                 'Immediately study and implement POSH Act 2013 — mandatory for all organisations employing women',
    'POSH awareness sessions':             'Conduct POSH awareness workshop at least once annually for all staff',
    'Internal Committee':                  'Constitute Internal Committee (IC) under POSH Act with at least 50% women members',
    'Annual return under POSH':            'File Annual Return under POSH Act 2013 with the District Officer before 31st January each year',
    'Employ female staff but unaware':     'Since you employ female staff, immediately become aware of POSH Act 2013 requirements to avoid legal penalties',
    'PF contribution not being made':      'Register under EPFO and contribute monthly — mandatory for establishments with 20+ employees',
    'PF contribution not capped':          'Cap PF contribution at ₹15,000 basic wage ceiling to control employer liability',
    'Paying PF for employees with salary': 'Review PF applicability — above ₹15,000 basic, PF may not be mandatory for new joiners',
    'Employees not receiving any':         'Implement statutory leave policy as per your State Shops & Establishment Act immediately',
    'Leave deficit':                       'Revise your leave policy to grant the minimum mandatory total leaves as per your state law — non-compliance leads to penalties',
    'ESIC-covered employees':              'Educate HR team — ESIC provides medical benefits to covered employees; separate sick leave is not required',
    'employees earning up to ₹42,000':     'Register under ESIC — all employees earning up to ₹42,000 gross monthly are mandatorily covered',
    'Salary structure not restructured':   'Restructure salary components per the four new Labour Codes: Wages, Social Security, OSH & IR Codes',
    'HR Policy / Leave Policy':            'Update all HR documents (Policy, Appointment Letters, Standing Orders) per the four Labour Codes',
    'Faced challenges with Labour':        'Maintain compliance files — registers, returns, licences — ready for inspection at all times',
    'Pending Notices / Inspections':       'Immediately engage a labour law consultant to address all pending notices, inspections, and legal cases',
    'Employees leaving without notice':    'Include enforceable notice period clauses with salary recovery provisions in all appointment letters',
    'Employees have damaged or left':      'Implement an Asset Policy — obtain employee sign-off on all company assets issued; include in onboarding',
  };
  const recs = [];
  gaps.forEach(g => {
    for (const [k, v] of Object.entries(map)) {
      if (g.toLowerCase().includes(k.toLowerCase())) {
        if (!recs.includes(v)) recs.push(v);
        break;
      }
    }
  });
  return recs.length ? recs : ['Maintain all compliance documentation and conduct annual internal audits to stay fully compliant'];
}

// ===== GOOGLE SHEETS =====
async function sendToSheets(data) {
  try {
    await fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { success: true };
  } catch(err) {
    console.error('sendToSheets error:', err);
    return { success: false };
  }
}

// ===== LOAD FROM SHEETS (OPTIMIZED) =====
async function loadFromSheets(showLoader = false) {
  const loader = document.getElementById('adminLoadingBar');
  if (showLoader && loader) loader.style.display = 'block';
  try {
    const res = await fetch(API_URL + '?t=' + Date.now(), { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error('Invalid data format');
    
    const cloudIds = new Set(raw.map(s => String(s.id)));
    // Keep local-only items that aren't in cloud yet
    const localOnly = localSubmissions.filter(s => !cloudIds.has(String(s.id)));
    submissions = [...raw, ...localOnly];
    submissions.sort((a,b) => new Date(b.submittedAt||0) - new Date(a.submittedAt||0));
    localSubmissions = [...submissions];
    localStorage.setItem(LS_KEY, JSON.stringify(localSubmissions));
    
    if (isAdmin && document.getElementById('view-admin-dashboard')?.classList.contains('active')) {
      renderAdminDashboard();
    }
    return { success: true };
  } catch(err) {
    console.warn('Sync fallback:', err);
    if (showLoader) showToast('⚠️ Using cached data (Offline)', 'gold');
    return { success: false };
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

function normaliseItem(item) {
  const out = { ...item };
  if (typeof out.gaps === 'string') out.gaps = out.gaps ? out.gaps.split('|').map(s=>s.trim()).filter(Boolean) : [];
  else if (!Array.isArray(out.gaps)) out.gaps = [];
  if (typeof out.recs === 'string') out.recs = out.recs ? out.recs.split('|').map(s=>s.trim()).filter(Boolean) : [];
  else if (!Array.isArray(out.recs)) out.recs = [];
  if (typeof out.score === 'string') out.score = parseInt(out.score) || 0;
  return out;
}

// ===== FORM SUBMISSION =====
async function submitAudit() {
  // 🔍 Validation: Check required radio questions
  const requiredRadios = ['sa1','sa2','sb1','sb2','sb4','sb5','sc1','sc2','sd1','se1','se3','sf1','sf3','sg1','sh1','sh2','sh3','sh4','sh5'];
  let missingQ = null;
  for (const n of requiredRadios) {
    if (!getRadio(n)) { missingQ = n; break; }
  }
  if (missingQ) {
    showToast(`Please answer question ${missingQ.toUpperCase()}`, 'red');
    const el = document.querySelector(`input[name="${missingQ}"]`);
    if (el) el.closest('.qblock')?.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }

  // 📥 Collect form data
  const state = document.getElementById('state')?.value || '';
  const totalLeaves = parseInt(document.getElementById('se2total')?.value) || 0;
  const sb5Date = (getRadio('sb5') === 'Yes') ? (document.getElementById('sb5Date')?.value.trim() || '') : '';

  const d = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    name: document.getElementById('name')?.value.trim() || '',
    contact: document.getElementById('contact')?.value.trim() || '',
    state,
    location: document.getElementById('location')?.value.trim() || '',
    employees: document.getElementById('employees')?.value || '',
    companyName: document.getElementById('companyName')?.value.trim() || '',
    field: document.getElementById('field')?.value || '',
    sa1: getRadio('sa1'), sa2: getRadio('sa2'),
    sb1: getRadio('sb1'), sb2: getRadio('sb2'),
    sb3: document.getElementById('sb3')?.value || '',
    sb4: getRadio('sb4'), sb5: getRadio('sb5'),
    sb5Date: sb5Date,
    sc1: getRadio('sc1'), 
    sc2: getRadio('sc2'),
    sc3: (getRadio('sc1') === 'Yes' && getRadio('sc2') === 'Yes') ? getRadio('sc3') : 'No',
    sc4: (getRadio('sc1') === 'Yes' && getRadio('sc2') === 'Yes') ? getRadio('sc4') : 'No',
    sc5: (getRadio('sc1') === 'Yes' && getRadio('sc2') === 'Yes') ? getRadio('sc5') : 'No',
    sd1: getRadio('sd1'), sd2: getRadio('sd2'), sd3: getRadio('sd3'),
    se1: getRadio('se1'),
    se2total: totalLeaves,
    se2: `Total: ${totalLeaves} days`,
    se3: getRadio('se3'),
    sf1: getRadio('sf1'), sf2: '', sf3: getRadio('sf3'),
    sg1: getRadio('sg1'), sg2: '', sg3: '', sg4: '',
    sh1: getRadio('sh1'), sh2: getRadio('sh2'), sh3: getRadio('sh3'),
    sh4: getRadio('sh4'), sh5: getRadio('sh5'),
  };

  // 🧮 Calculate score and generate gaps/recommendations
  d.score = calcScore(d);
  d.gaps  = getGaps(d);
  d.recs  = getRecs(d.gaps);

  // 🔘 Disable submit button during processing
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '⏳ Saving...'; }

  try {
    // 💾 Save to local storage and update state
    localSubmissions.unshift(d);
    localStorage.setItem(LS_KEY, JSON.stringify(localSubmissions));
    localStorage.setItem(LS_LAST, String(d.id));
    submissions.unshift(d);
    currentUserSubmission = d;

    // ☁️ Async sync to Google Sheets
    sendToSheets(d).then(result => {
      if (result.success) showToast('✅ Synced to cloud!', 'green');
      else showToast('⚠️ Saved locally. Will sync when online.', 'gold');
    });

    // 🎯 Show success page with NON-COMPLIANCE focused display 🔥
    document.getElementById('pg2').style.display = 'none';
    
    // 🔥 NON-COMPLIANCE METRICS (replaces original compliance display)
    const complianceScore = d.score || 0;
    const nonComplianceScore = 100 - complianceScore;
    const ncCls = 'low';  // Always red for non-compliance focus
    const ncLbl = nonComplianceScore === 0 ? '✅ Fully Compliant' : 
                  nonComplianceScore <= 30 ? '⚠️ Low Risk' : 
                  nonComplianceScore <= 60 ? '🔶 Medium Risk' : '🚨 High Risk';

    const box = document.getElementById('successScoreBox');
    if (box) {
      box.innerHTML = `
        <div class="score-pill ${ncCls}" style="background:var(--red, #ef4444);color:#fff;font-weight:700">${nonComplianceScore}%</div>
        <div style="font-size:0.82rem;color:var(--text2);margin-bottom:0.5rem;">${ncLbl}</div>
        <div style="font-size:0.8rem;color:var(--text2);">${d.gaps.length} gap${d.gaps.length!==1?'s':''} causing non-compliance</div>
      `;
    }
    
    document.getElementById('pgSuccess').style.display = 'block';
    
  } catch(err) { 
    console.error('Submit error:', err);
    showToast('Error saving. Please try again.', 'red');
  } finally {
    // 🔘 Re-enable submit button
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Submit Audit ✦'; }
  }
}

function resetForm() {
  document.getElementById('pgSuccess').style.display = 'none';
  document.getElementById('pg1').style.display = 'block';
  document.getElementById('pg2').style.display = 'none';
  document.querySelectorAll('#view-form input, #view-form select').forEach(el => {
    if (el.id && ['adminUser','adminPass'].includes(el.id)) return;
    if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
    else el.value = '';
    el.classList?.remove('error');
  });
  toggleSalaryDateField(false);
  togglePOSHQuestions();
  togglePFQuestions(false);
  
  const sd1 = document.getElementById('sd1');
  if (sd1) { sd1.className='step-dot active'; sd1.innerHTML='<span>1</span>'; }
  const sr1 = document.getElementById('sr1'); if (sr1) sr1.classList.remove('done');
  const sd2 = document.getElementById('sd2'); if (sd2) sd2.classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== USER DASHBOARD =====
// ===== USER DASHBOARD - CLEAN VERSION =====
function renderUserDashboard() {
  const lastId = localStorage.getItem(LS_LAST);
  if (lastId && !currentUserSubmission) {
    currentUserSubmission = localSubmissions.find(s => String(s.id) === lastId) || null;
  }
  const empty  = document.getElementById('udashEmpty');
  const report = document.getElementById('udashReport');

  if (!currentUserSubmission) {
    if (empty)  empty.style.display  = 'block';
    if (report) report.style.display = 'none';
    return;
  }

  if (empty)  empty.style.display  = 'none';
  if (report) report.style.display = 'block';

  const s  = currentUserSubmission;
  const complianceScore = s.score || 0;
  const nonComplianceScore = 100 - complianceScore;  // 🔥 NON-COMPLIANCE %
  
  // 🔥 Always use red styling for non-compliance focus
  const cls = 'low';

  // Set header info
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('udashTitle', s.companyName || 'Your Report');
  set('udashSub', `${s.field||'—'} · ${s.state||'—'} · Submitted on ${fmtDate(s.submittedAt)}`);

  // 🔥 Set score display to show NON-COMPLIANCE percentage in RED
  const numEl = document.getElementById('udashScoreNum');
  if (numEl) { 
    numEl.textContent = nonComplianceScore + '%'; 
    numEl.className = 'udash-score-num low';  // Force red color class
  }
  
  // 🔥 Updated verdict focused on non-compliance percentage
  set('udashVerdict', `📉 Your Non-Compliance: ${nonComplianceScore}%`);
  
  // 🔥 Progress bar shows NON-COMPLIANCE (red fill with gradient)
  const barEl = document.getElementById('udashScoreBar');
  if (barEl) { 
    barEl.style.width = '0'; 
    barEl.style.background = `linear-gradient(90deg, var(--red, #ef4444), #ff6b6b)`;  // Red gradient fallback
    setTimeout(() => barEl.style.width = nonComplianceScore + '%', 300); 
  }
  
  // 🔥 Updated meta text emphasizing action to reduce non-compliance
  set('udashScoreMeta', `${(s.gaps||[]).length} compliance gap${(s.gaps||[]).length!==1?'s':''} identified — Fix these to reduce non-compliance`);

  // ✅ STEP 1: Render Charts FIRST
  renderUserCharts(s);

  // ✅ STEP 2: Gaps Section Only (No Recommendations)
  const gapsSection = document.getElementById('udashGapsSection');
  const gapsEl      = document.getElementById('udashGaps');
  
  if ((s.gaps||[]).length) {
    if (gapsSection) gapsSection.style.display = 'block';
    if (gapsEl) {
      let gapsHTML = `<div style="font-weight:700;color:var(--text);margin-bottom:1rem;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.05em;">⚠️ Compliance Gaps Identified</div>`;
      gapsHTML += s.gaps.map(g => `
        <div class="m-gap-item" style="padding:0.875rem;margin-bottom:0.75rem;background:var(--card-bg);border-left:3px solid #ef4444;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <span class="m-gap-icon" style="margin-right:0.75rem;color:#ef4444;">⚠</span>
          <span style="color:var(--text);line-height:1.5;">${g}</span>
        </div>`).join('');
      gapsEl.innerHTML = gapsHTML;
    }
  } else {
    if (gapsSection) gapsSection.style.display = 'none';
    if (gapsEl) gapsEl.innerHTML = `<div style="color:var(--green);font-weight:600;">✅ No compliance gaps found! Great job.</div>`;
  }

  // ✅ STEP 3: PDF Button at Bottom
  const pdfBtn = document.getElementById('udashPDFBtn');
  if (pdfBtn) pdfBtn.onclick = () => downloadPDF(s.id);
}

function ynHtml(v) {
  if (v === 'Yes')         return '<div class="m-item-val yes">✅ Yes</div>';
  if (v === 'No')          return '<div class="m-item-val no">❌ No</div>';
  if (v === 'Partial')     return '<div class="m-item-val partial">⚖ Partial</div>';
  if (v === 'Partially')   return '<div class="m-item-val partial">📄 Partially</div>';
  if (v === 'In Progress') return '<div class="m-item-val partial">🔄 In Progress</div>';
  if (v === 'Not Sure')    return '<div class="m-item-val partial">🤷 Not Sure</div>';
  if (v === 'N/A')         return '<div class="m-item-val partial">⚪ N/A</div>';
  if (v && (String(v).includes('days') || String(v).includes('Required') || String(v).includes('NIL') || /^\d/.test(v) || v.includes('th') || v.includes('st') || v.includes('nd') || v.includes('rd'))) {
    return `<div class="m-item-val">${v||'—'}</div>`;
  }
  return `<div class="m-item-val">${v||'—'}</div>`;
}

// ===== USER CHARTS =====
// ===== USER CHARTS - CLEAN VERSION =====
function renderUserCharts(s) {
  const tick = getTickColor();
  const grid = getGridColor();
  const ff   = 'Syne';
  const C    = getColors();

  // Destroy existing charts
  Object.values(uCharts).forEach(c => { try { c.destroy(); } catch(e){} });
  uCharts = {};
  const scores = getSectionScores(s);

  // 🥧 CHART 1: Pie Chart - % Compliant vs Non-Compliant (GREEN/RED)
  const pc = document.getElementById('uChartDough');
  if (pc) {
    // Calculate compliant checks out of total 22
    const lc = getLeaveComplianceStatus(s);
    const leaveOk = lc ? !lc.hasGap : s.se1 === 'Yes';
    const checks = [
      s.sa1 !== '', s.sa2 === 'Yes', s.sb1 === 'Yes', s.sb2 === 'Yes',
      s.sb4 === 'Yes', s.sb5 === 'Yes',
      s.sc1 === 'No' ? true : (s.sc2 === 'No' ? true : (s.sc3 === 'Yes')),
      s.sc1 === 'No' ? true : (s.sc2 === 'No' ? true : (s.sc4 === 'Yes')),
      s.sc1 === 'No' ? true : (s.sc2 === 'No' ? true : (s.sc5 === 'Yes')),
      s.sc1 === 'Yes' && s.sc2 === 'Yes' ? (s.sc2 === 'Yes') : true,
      s.sd1 === 'No' ? true : (s.sd3 === 'Yes'),
      s.sd1 === 'No' ? true : (s.sd2 === 'No'),
      s.se1 === 'Yes', leaveOk, s.se3 === 'Yes',
      s.sf1 === 'Yes', s.sf3 === 'Yes',
      s.sg1 === 'Yes' || s.sg1 === 'Partial',
      s.sh1 === 'No', s.sh2 === 'No', s.sh3 === 'No',
      s.sh4 === 'Yes' && s.sh5 === 'No',
    ];
    const compliant = checks.filter(Boolean).length;
    const nonCompliant = checks.length - compliant;
    
    uCharts.pie = new Chart(pc, {
      type: 'pie',
      data: {
        labels: ['Compliant ✓', 'Non-Compliant ✗'],
        datasets: [{
          data: [compliant, nonCompliant],
          backgroundColor: [C.green, C.red],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: tick, font: { family: ff, size: 11, weight: '600' }, padding: 15 }
          },
          tooltip: {
            backgroundColor: 'rgba(14,16,24,0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.gold,
            borderWidth: 2,
            padding: 12,
            callbacks: {
              label: function(ctx) {
                const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                const pct = total ? Math.round((ctx.parsed * 100) / total) : 0;
                return ` ${ctx.label}: ${ctx.parsed} checks (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // 📈 CHART 2: Line Graph - Section-wise NON-Compliance (🔥 RED THEME)
  const lc = document.getElementById('uChartRadar');
  if (lc) {
    uCharts.line = new Chart(lc, {
      type: 'line',
      data: {
        labels: ['A: License', 'B: Bonus', 'C: POSH', 'D: PF', 'E: Leaves', 'F: ESI', 'G: HR', 'H: Inspection'],
        datasets: [{
          label: 'Non-Compliance Score',  // 🔥 Changed label
          data: [
            100 - scores.A, 
            100 - scores.B, 
            100 - scores.C, 
            100 - scores.D, 
            100 - scores.E, 
            100 - scores.F, 
            100 - scores.G, 
            100 - scores.H
          ],  // 🔥 Inverted scores: higher = more non-compliance
          borderColor: C.red,              // 🔥 Red line for non-compliance
          backgroundColor: C.red + '25',   // 🔥 Red translucent fill
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: C.red,         // 🔥 Red point border
          pointBorderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: grid, drawBorder: false },
            ticks: { color: tick, font: { family: ff, size: 9, weight: '600' }, padding: 10 }
          },
          y: {
            min: 0, max: 100,
            grid: { color: grid, drawBorder: false },
            ticks: { 
              color: tick, 
              font: { family: ff, size: 10 },
              callback: v => v + '%',
              padding: 10
            },
            title: {
              display: true,
              text: 'Non-Compliance %',  // 🔥 Updated axis label
              color: tick,
              font: { family: ff, size: 11, weight: '700' },
              padding: { top: 10 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14,16,24,0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.red,           // 🔥 Red tooltip border
            borderWidth: 2,
            padding: 12,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}% non-compliant`  // 🔥 Updated tooltip text
            }
          }
        }
      }
    });
  }
}

// ===== ADMIN DASHBOARD =====
function renderAdminDashboard() {
  if (!isAdmin) return;
  populateAdminFilters();
  const stateF   = document.getElementById('adminStateFilter')?.value || '';
  const indF     = document.getElementById('adminIndustryFilter')?.value || '';
  const filtered = submissions.filter(s => (!stateF || s.state === stateF) && (!indF || s.field === indF));
  updateAdminStats(filtered);
  renderAdminSidebar();
  renderAdminCharts(filtered);
  renderAdminTable();
}

function populateAdminFilters() {
  const fillSelect = (id, values, currentVal) => {
    const el = document.getElementById(id); if (!el) return;
    const opts = values.sort().map(v => `<option value="${v}" ${v===currentVal?'selected':''}>${v}</option>`).join('');
    el.innerHTML = `<option value="">All</option>` + opts;
  };
  const stateF = document.getElementById('adminStateFilter')?.value || '';
  const indF   = document.getElementById('adminIndustryFilter')?.value || '';
  fillSelect('adminStateFilter',    [...new Set(submissions.map(s=>s.state).filter(Boolean))], stateF);
  fillSelect('adminIndustryFilter', [...new Set(submissions.map(s=>s.field).filter(Boolean))], indF);
}

function updateAdminStats(data) {
  const set = (id, v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  set('ast0', data.length);
  const avg = data.length ? Math.round(data.reduce((a,b)=>a+(b.score||0),0)/data.length) : 0;
  set('ast1', data.length ? avg+'%' : '—');
  set('ast2', data.length ? Math.round(data.filter(s=>s.sd1==='Yes').length/data.length*100)+'%' : '—');
  set('ast3', data.length ? Math.round(data.filter(s=>s.sf1==='Yes').length/data.length*100)+'%' : '—');
  set('ast4', data.length ? Math.round(data.filter(s=>s.sc1==='Yes' && s.sc2==='Yes' && s.sc4==='Yes').length / data.filter(s=>s.sc1==='Yes' && s.sc2==='Yes').length * 100 || 0)+'%' : '—');
  set('ast5', data.length ? data.filter(s=>(s.score||0)>=70).length : '—');
  set('ast6', data.length ? data.filter(s=>(s.score||0)>=40&&(s.score||0)<70).length : '—');
  set('ast7', data.length ? data.filter(s=>(s.score||0)<40).length : '—');
}

function renderAdminSidebar() {
  const q       = (document.getElementById('adminSideSearch')?.value||'').toLowerCase();
  const list    = document.getElementById('adminSidebarList');
  const countEl = document.getElementById('adminSidebarCount');
  if (countEl) countEl.textContent = submissions.length;
  if (!list) return;
  const filtered = submissions.filter(s =>
    (s.companyName||'').toLowerCase().includes(q) ||
    (s.name||'').toLowerCase().includes(q) ||
    (s.state||'').toLowerCase().includes(q)
  );
  if (!filtered.length) { list.innerHTML = '<div class="sidebar-empty">No results found.</div>'; return; }
  list.innerHTML = filtered.map(s => {
    const sc = s.score || 0;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    return `<div class="sidebar-card ${activeDetailId===s.id?'active':''}" onclick="showDetail(${s.id})">
      <div class="sc-name">${s.companyName||'Unknown'}</div>
      <div class="sc-meta"><span>${s.state||'—'} · ${fmtDate(s.submittedAt,true)}</span><span class="sc-score ${cls}">${sc}%</span></div>
    </div>`;
  }).join('');
}

// ===== ADMIN CHARTS =====
// ===== ADMIN CHARTS =====
function renderAdminCharts(data) {
  const tick = getTickColor();
  const grid = getGridColor();
  const ff   = 'Syne';
  const C    = getColors();

  // Destroy existing charts
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {};
  if (!data.length) return;

  const pct = (fn) => data.length ? Math.round(fn(data) / data.length * 100) : 0;

  // 📈 CHART 1: Overall Statutory Compliance % (LINE CHART - FIXED & PROFESSIONAL)
  const bc = document.getElementById('adminChartBar');
  if (bc) {
    const labels = ['Owner License', 'Diwali Bonus', 'POSH Aware', 'POSH IC', 'POSH Sessions', 'PF Monthly', 'PF Capped', 'Leaves OK', 'ESI Aware', 'HR Updated', 'Salary Restr'];
    const lineVals = [
      pct(d => d.filter(s => s.sa2 === 'Yes').length),
      pct(d => d.filter(s => s.sb1 === 'Yes').length),
      pct(d => d.filter(s => s.sc1 === 'Yes' && s.sc2 === 'Yes').length),
      pct(d => d.filter(s => s.sc1 === 'Yes' && s.sc2 === 'Yes' && s.sc4 === 'Yes').length),
      pct(d => d.filter(s => s.sc1 === 'Yes' && s.sc2 === 'Yes' && s.sc3 === 'Yes').length),
      pct(d => d.filter(s => s.sd1 === 'Yes').length),
      pct(d => d.filter(s => s.sd1 === 'Yes' && s.sd3 === 'Yes').length),
      pct(d => d.filter(s => { const lc = getLeaveComplianceStatus(s); return lc ? !lc.hasGap : s.se1 === 'Yes'; }).length),
      pct(d => d.filter(s => s.sf1 === 'Yes').length),
      pct(d => d.filter(s => s.sg1 === 'Yes' || s.sg1 === 'Partial').length),
      pct(d => d.filter(s => s.sf3 === 'Yes').length),
    ];
    
    charts.bar = new Chart(bc, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{ 
          label: '% Compliant', 
          data: lineVals, 
          borderColor: C.gold,
          backgroundColor: C.gold + '25',
          borderWidth: 3.5,
          pointBackgroundColor: '#fff',
          pointBorderColor: C.gold,
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: C.gold,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
          fill: true,
          tension: 0.4,
          cubicInterpolationMode: 'monotone'
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        layout: {
          padding: {
            top: 20,      // ✅ Increased from 10
            bottom: 20,   // ✅ Increased from 10
            left: 10,
            right: 10
          }
        },
        scales: {
          x: { 
            grid: { 
              color: grid,
              drawBorder: false,
              offset: true
            },
            ticks: { 
              color: tick, 
              font: { family: ff, size: 10, weight: '600' }, // ✅ Increased from 9
              padding: 12,  // ✅ Increased from 10
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 11
            },
            border: { color: grid }
          },
          y: { 
            min: 0, 
            max: 100,
            grid: { 
              color: grid,
              drawBorder: false,
              tickLength: 0
            },
            ticks: { 
              color: tick, 
              font: { family: ff, size: 11 }, // ✅ Increased from 10
              callback: function(value) { return value + '%'; },
              padding: 12,  // ✅ Increased from 10
              stepSize: 20,
              autoSkip: true,
              maxTicksLimit: 6
            }, 
            border: { color: grid },
            title: {
              display: true,
              text: 'Compliance %',
              color: tick,
              font: { family: ff, size: 12, weight: '700' }, // ✅ Increased from 11
              padding: { top: 15 } // ✅ Increased from 10
            }
          }
        },
        plugins: {
          legend: { 
            display: true, 
            position: 'bottom', 
            labels: { 
              color: tick, 
              font: { family: ff, size: 10.5, weight: '600' },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 12,
              boxHeight: 12
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(14, 16, 24, 0.95)',
            titleColor: '#fff',
            titleFont: { family: ff, size: 13, weight: '700' },
            bodyColor: '#fff',
            bodyFont: { family: ff, size: 11.5 },
            borderColor: C.gold,
            borderWidth: 2,
            padding: 14,
            displayColors: true,
            cornerRadius: 8,
            titleSpacing: 0,
            titleMarginBottom: 10,
            callbacks: {
              label: function(context) {
                return ` Compliance: ${context.parsed.y}%`;
              },
              title: function(context) {
                return context[0].label;
              }
            }
          }
        },
        elements: {
          line: {
            borderCapStyle: 'round',
            borderJoinStyle: 'round'
          },
          point: {
            hitRadius: 12
          }
        }
      }
    });
  }

  // 🍩 CHART 2: Establishment Type Distribution (Doughnut - Enhanced)
  const dc = document.getElementById('adminChartDough');
  if (dc) {
    const cnt = {}; 
    data.forEach(s => { if (s.sa1) cnt[s.sa1] = (cnt[s.sa1] || 0) + 1; });
    const lbls = Object.keys(cnt).length ? Object.keys(cnt) : ['No Data'];
    const vals = Object.keys(cnt).length ? Object.values(cnt) : [1];
    const doughColors = [C.gold, C.green, C.blue, C.purple, C.red];
    
    charts.dough = new Chart(dc, {
      type: 'doughnut',
      data: { 
        labels: lbls, 
        datasets: [{ 
          data: vals, 
          backgroundColor: doughColors, 
          borderWidth: 0, 
          hoverOffset: 12,
          hoverBorderColor: '#fff',
          hoverBorderWidth: 3
        }] 
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        cutout: '60%',  // ✅ Changed from 68% to 60% for better visibility
        plugins: { 
          legend: { 
            position: 'bottom', 
            labels: { 
              color: tick, 
              font: { family: ff, size: 11, weight: '500' }, 
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle'
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(14, 16, 24, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.gold,
            borderWidth: 2,
            padding: 12,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((context.parsed * 100) / total) : 0;
                return ` ${context.label}: ${context.parsed} (${pct}%)`;
              }
            }
          }
        } 
      }
    });
  }

  // 📊 CHART 3: Company Size Breakdown (Bar - Enhanced)
  const ec = document.getElementById('adminChartEmp');
  if (ec) {
    const sizes = ['1–10','11–20','21–50','51–100','101–150','151–200','201–300','301–400','401–500','500+'];
    const cnt = {}; 
    sizes.forEach(s => cnt[s] = 0); 
    data.forEach(s => { if (s.employees) cnt[s.employees] = (cnt[s.employees] || 0) + 1; });
    
    charts.emp = new Chart(ec, {
      type: 'bar',
      data: { 
        labels: sizes, 
        datasets: [{ 
          label: 'Companies', 
          data: sizes.map(s => cnt[s]), 
          backgroundColor: C.blue + 'cc', 
          borderColor: C.blue + '99',
          borderWidth: 1,
          borderRadius: 8, 
          borderSkipped: false,
          hoverBorderColor: '#fff',
          hoverBorderWidth: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        }] 
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14, 16, 24, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.gold,
            borderWidth: 2,
            padding: 12,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.parsed.y} companies`;
              }
            }
          }
        },
        scales: {
          x: { 
            ticks: { 
              color: tick, 
              font: { family: ff, size: 9, weight: '500' }, // ✅ Slightly increased
              padding: 10
            }, 
            grid: { color: grid, drawBorder: false },
            border: { color: grid }
          },
          y: { 
            ticks: { 
              color: tick, 
              font: { family: ff, size: 10 }, // ✅ Increased
              padding: 10
            }, 
            grid: { color: grid, drawBorder: false }, 
            border: { color: grid },
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Companies',
              color: tick,
              font: { family: ff, size: 11, weight: '600' }, // ✅ Increased
              padding: { top: 12 }
            }
          }
        }
      }
    });
  }

  // 🥧 CHART 4: POSH Policy Coverage (Pie - Enhanced)
  const pieC = document.getElementById('adminChartPie');
  if (pieC) {
    const pieData = [
      pct(d => d.filter(s => s.sg1 === 'Yes').length),
      pct(d => d.filter(s => s.sc1 === 'Yes' && s.sc2 === 'Yes' && s.sc4 === 'Yes').length),
      pct(d => d.filter(s => s.sc1 === 'Yes' && s.sc2 === 'Yes' && s.sc3 === 'Yes').length),
      pct(d => d.filter(s => s.sc1 === 'Yes' && s.sc2 === 'Yes' && s.sc5 === 'Yes').length),
    ];
    const pieLabels = ['HR Policy Updated', 'POSH IC Formed', 'POSH Sessions Done', 'POSH Return Filed'];
    const pieColors = [C.green, C.blue, C.gold, C.purple];
    
    charts.pie = new Chart(pieC, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieData,
          backgroundColor: pieColors, 
          borderWidth: 0, 
          hoverOffset: 10,
          hoverBorderColor: '#fff',
          hoverBorderWidth: 3
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { 
            position: 'bottom', 
            labels: { 
              color: tick, 
              font: { family: ff, size: 10, weight: '500' }, 
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle'
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(14, 16, 24, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.gold,
            borderWidth: 2,
            padding: 12,
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.parsed}%`;
              }
            }
          }
        } 
      }
    });
  }

  // 📊 CHART 5: Compliance Score Distribution (Bar - Enhanced)
  const sc = document.getElementById('adminChartScore');
  if (sc) {
    const ranges = { '0–20%': 0, '21–40%': 0, '41–60%': 0, '61–80%': 0, '81–100%': 0 };
    data.forEach(s => {
      const v = s.score || 0;
      if (v <= 20) ranges['0–20%']++;
      else if (v <= 40) ranges['21–40%']++;
      else if (v <= 60) ranges['41–60%']++;
      else if (v <= 80) ranges['61–80%']++;
      else ranges['81–100%']++;
    });
    const rangeColors = [C.red, C.red+'cc', C.gold, C.green+'cc', C.green];
    
    charts.score = new Chart(sc, {
      type: 'bar',
      data: { 
        labels: Object.keys(ranges), 
        datasets: [{ 
          label: 'Companies', 
          data: Object.values(ranges), 
          backgroundColor: rangeColors, 
          borderColor: rangeColors.map(c => c + '99'),
          borderWidth: 1,
          borderRadius: 8, 
          borderSkipped: false,
          hoverBorderColor: '#fff',
          hoverBorderWidth: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        }] 
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14, 16, 24, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.gold,
            borderWidth: 2,
            padding: 12,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.parsed.y} companies`;
              }
            }
          }
        },
        scales: {
          x: { 
            ticks: { 
              color: tick, 
              font: { family: ff, size: 10, weight: '500' },
              padding: 10
            }, 
            grid: { color: grid, drawBorder: false },
            border: { color: grid }
          },
          y: { 
            ticks: { 
              color: tick, 
              font: { family: ff, size: 10 },
              padding: 10
            }, 
            grid: { color: grid, drawBorder: false }, 
            border: { color: grid },
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Companies',
              color: tick,
              font: { family: ff, size: 11, weight: '600' },
              padding: { top: 12 }
            }
          }
        }
      }
    });
  }

  // 📊 CHART 6: Industry-wise Submissions (Horizontal Bar - Enhanced)
  const ic = document.getElementById('adminChartIndustry');
  if (ic) {
    const cnt = {}; 
    data.forEach(s => { if (s.field) cnt[s.field] = (cnt[s.field] || 0) + 1; });
    const lbls = Object.keys(cnt).length ? Object.keys(cnt) : ['No Data'];
    const vals = Object.keys(cnt).length ? Object.values(cnt) : [0];
    
    charts.ind = new Chart(ic, {
      type: 'bar',
      data: { 
        labels: lbls, 
        datasets: [{ 
          label: 'Submissions', 
          data: vals, 
          backgroundColor: C.purple + 'cc', 
          borderColor: C.purple + '99',
          borderWidth: 1,
          borderRadius: 8, 
          borderSkipped: false,
          hoverBorderColor: '#fff',
          hoverBorderWidth: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        }] 
      },
      options: {
        indexAxis: 'y', 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14, 16, 24, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.gold,
            borderWidth: 2,
            padding: 12,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.parsed.x} submissions`;
              }
            }
          }
        },
        scales: {
          x: { 
            ticks: { 
              color: tick, 
              font: { family: ff, size: 9 },
              padding: 10
            }, 
            grid: { color: grid, drawBorder: false }, 
            border: { color: grid },
            beginAtZero: true,
            title: {
              display: true,
              text: 'Submissions',
              color: tick,
              font: { family: ff, size: 10, weight: '600' },
              padding: { top: 12 }
            }
          },
          y: { 
            ticks: { 
              color: tick, 
              font: { family: ff, size: 9, weight: '500' },
              padding: 6
            }, 
            grid: { color: grid, drawBorder: false },
            border: { color: grid }
          }
        }
      }
    });
  }

  // 📊 CHART 7: State-wise Leave Compliance (Bar - Enhanced)
  const lc = document.getElementById('adminChartLeave');
  if (lc) {
    const stateData = {};
    data.forEach(s => {
      if (!s.state || !STATE_LEAVE_DATA[s.state]) return;
      if (!stateData[s.state]) stateData[s.state] = { given: [], required: STATE_LEAVE_DATA[s.state].EL + STATE_LEAVE_DATA[s.state].CL + STATE_LEAVE_DATA[s.state].SL };
      const totalGiven = parseInt(s.se2total) || 0;
      stateData[s.state].given.push(totalGiven);
    });
    const stateLabels = Object.keys(stateData);
    const givenVals   = stateLabels.map(st => {
      const arr = stateData[st].given;
      return arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
    });
    const reqVals = stateLabels.map(st => stateData[st].required);

    if (stateLabels.length) {
      charts.leave = new Chart(lc, {
        type: 'bar',
        data: {
          labels: stateLabels,
          datasets: [
            { 
              label: 'Avg Total Leaves Given', 
              data: givenVals, 
              backgroundColor: C.blue + 'bb', 
              borderColor: C.blue + '99',
              borderWidth: 1,
              borderRadius: 6, 
              borderSkipped: false,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            },
            { 
              label: 'Total Required (Law)', 
              data: reqVals, 
              backgroundColor: C.gold + 'bb', 
              borderColor: C.gold + '99',
              borderWidth: 1,
              borderRadius: 6, 
              borderSkipped: false,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            },
          ]
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: 'top', 
              labels: { 
                color: tick, 
                font: { family: ff, size: 10, weight: '600' },
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              } 
            },
            tooltip: {
              backgroundColor: 'rgba(14, 16, 24, 0.95)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: C.gold,
              borderWidth: 2,
              padding: 12,
              callbacks: {
                label: function(context) {
                  return ` ${context.dataset.label}: ${context.parsed.y} days`;
                }
              }
            }
          },
          scales: {
            x: { 
              ticks: { 
                color: tick, 
                font: { family: ff, size: 9, weight: '500' },
                padding: 10
              }, 
              grid: { color: grid, drawBorder: false },
              border: { color: grid }
            },
            y: { 
              ticks: { 
                color: tick, 
                font: { family: ff, size: 10 },
                padding: 10
              }, 
              grid: { color: grid, drawBorder: false }, 
              border: { color: grid },
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Days',
                color: tick,
                font: { family: ff, size: 11, weight: '600' },
                padding: { top: 12 }
              }
            }
          }
        }
      });
    }
  }
}

// ===== ADMIN TABLE =====
function renderAdminTable() {
  const tbody  = document.getElementById('adminTblBody');
  if (!tbody) return;
  const stateF = document.getElementById('adminStateFilter')?.value || '';
  const indF   = document.getElementById('adminIndustryFilter')?.value || '';
  const q      = (document.getElementById('adminTblSearch')?.value || '').toLowerCase();
  const filtered = submissions
    .filter(s => !stateF || s.state === stateF)
    .filter(s => !indF   || s.field === indF)
    .filter(s => (s.companyName||'').toLowerCase().includes(q) || (s.name||'').toLowerCase().includes(q));

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="12" class="empty-td">No submissions found.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((s, i) => {
    const sc  = s.score || 0;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    const gl  = (s.gaps || []).length;
    const gc  = gl > 5 ? 'low' : gl > 2 ? 'mid' : 'good';
    const ld  = STATE_LEAVE_DATA[s.state];
    const totalGiven = parseInt(s.se2total) || 0;
    const totalReq   = ld ? ld.EL + ld.CL + ld.SL : '—';
    const leaveCls   = ld ? (totalGiven >= totalReq ? 'good' : 'low') : 'info';
    const leaveText  = ld ? `${totalGiven} days` : '—';
    const leaveReqText = ld ? `${totalReq} req.` : '—';
    const salaryDate = s.sb5 === 'Yes' && s.sb5Date ? `<div style="font-size:0.7rem;color:var(--text2)">📅 ${s.sb5Date}</div>` : '';
    return `<tr>
      <td style="color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:0.75rem">${String(i+1).padStart(2,'0')}</td>
      <td>
        <div style="font-weight:700;color:var(--white);font-size:0.85rem">${s.companyName||'Unknown'}</div>
        <div style="font-size:0.72rem;color:var(--text2)">${s.field||'—'} · ${fmtDate(s.submittedAt,true)}</div>
      </td>
      <td>
        <div style="font-size:0.82rem;font-weight:600">${s.name||'—'}</div>
        <div style="font-size:0.7rem;color:var(--text2)">${s.contact||'—'}</div>
      </td>
      <td style="white-space:nowrap;font-size:0.82rem">${s.state||'—'}</td>
      <td style="font-size:0.8rem;white-space:nowrap">${s.field||'—'}</td>
      <td><span class="badge info">${s.employees||'—'}</span></td>
      <td style="font-size:0.8rem;white-space:nowrap">${s.sa1||'—'}</td>
      <td><span class="badge ${leaveCls}">${leaveText}</span></td>
      <td><span class="badge info">${leaveReqText}</span></td>
      <td><span class="badge ${cls}">${sc}%</span></td>
      <td><span class="badge ${gc}">${gl} gaps</span></td>
      <td>
        <div style="display:flex;gap:0.4rem;flex-wrap:nowrap">
          <button class="btn btn-ghost btn-sm" onclick="showDetail(${s.id})">👁 View</button>
          <button class="btn btn-red btn-sm" onclick="deleteSubmission(${s.id})">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ===== DELETE =====
// ===== DELETE (CLOUD + LOCAL) =====
async function deleteSubmission(id) {
  if (!isAdmin) { showToast('Admin access required.','red'); return; }
  if (!confirm('⚠️ This will PERMANENTLY delete the record from Google Sheets. Continue?')) return;
  
  // Optimistic UI Update
  const prevSubs = [...submissions];
  submissions = submissions.filter(s => s.id !== id);
  localSubmissions = submissions;
  localStorage.setItem(LS_KEY, JSON.stringify(localSubmissions));
  renderAdminDashboard();
  
  try {
    await fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id: String(id) })
    });
    showToast('✅ Deleted from Cloud & Local Dashboard', 'green');
  } catch(err) {
    showToast('⚠️ Cloud delete failed (Offline/Sync issue)', 'red');
    // Rollback UI
    submissions = prevSubs; localSubmissions = prevSubs;
    localStorage.setItem(LS_KEY, JSON.stringify(prevSubs));
    renderAdminDashboard();
  }
}

// ===== DETAIL MODAL (ADMIN) =====
// ===== DETAIL MODAL (ADMIN) - NON-COMPLIANCE FOCUSED =====
// ===== DETAIL MODAL (ADMIN) - MATCHES USER DASHBOARD EXACTLY =====
function showDetail(id) {
  const s = submissions.find(x => x.id == id);
  if (!s) return;
  activeDetailId = id;
  renderAdminSidebar();

  // 🔥 NON-COMPLIANCE SCORE (Same calculation as User Dashboard)
  const complianceScore = s.score || 0;
  const nonComplianceScore = 100 - complianceScore;
  const scoreColor = nonComplianceScore === 0 ? 'var(--green)' :
                     nonComplianceScore <= 30 ? 'var(--blue)' :
                     nonComplianceScore <= 60 ? 'var(--gold)' : 'var(--red)';
  const verdict = nonComplianceScore === 0 ? '✅ Fully Compliant — Maintain excellence' :
                  nonComplianceScore <= 30 ? '⚠️ Low Risk — Minor gaps to address' :
                  nonComplianceScore <= 60 ? '🔶 Medium Risk — Action recommended' :
                  '🚨 High Risk — Immediate corrective action required';

  const gaps = Array.isArray(s.gaps) && s.gaps.length ? s.gaps : getGaps(s);
  const gapsHTML = gaps.length ?
    `<div class="m-section" style="margin-top:1.5rem">⚠️ Compliance Gaps Identified (${gaps.length})</div>
     <div class="m-gaps">${gaps.map(g => `
       <div class="m-gap-item" style="padding:0.75rem;margin-bottom:0.5rem;background:var(--card-bg);border-left:3px solid var(--red);border-radius:6px;">
         <span style="color:var(--red);margin-right:0.5rem">⚠</span>
         <span style="color:var(--text);font-size:0.85rem;line-height:1.5;">${g}</span>
       </div>`).join('')}</div>` :
    `<div class="m-section" style="margin-top:1.5rem">✅ No compliance gaps found! Great job.</div>`;

  const chartsHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin:1.5rem 0;">
      <div style="background:var(--card-bg);border-radius:12px;padding:1rem;">
        <div style="font-size:0.8rem;font-weight:700;color:var(--text);margin-bottom:0.75rem;text-align:center;">📊 Compliance Status</div>
        <div style="height:200px;"><canvas id="detailChartPie"></canvas></div>
        <div style="text-align:center;margin-top:0.5rem;font-size:0.75rem;color:var(--text2);">
          <span style="color:var(--green);font-weight:600;">● Compliant</span> &nbsp;|&nbsp;
          <span style="color:var(--red);font-weight:600;">● Non-Compliant</span>
        </div>
      </div>
      <div style="background:var(--card-bg);border-radius:12px;padding:1rem;">
        <div style="font-size:0.8rem;font-weight:700;color:var(--text);margin-bottom:0.75rem;text-align:center;">📈 Section-wise Non-Compliance</div>
        <div style="height:200px;"><canvas id="detailChartLine"></canvas></div>
      </div>
    </div>`;

  document.getElementById('modalContent').innerHTML = `
    <div class="m-title">🏢 ${s.companyName||'Unknown Company'}</div>
    <div class="m-sub">${s.field||'—'} · ${s.state||'—'} · ${s.employees||'—'} employees · ${fmtDate(s.submittedAt)}</div>
    
    <!-- 🔥 NON-COMPLIANCE SCORE -->
    <div class="m-score-bar" style="margin:1.5rem 0;padding:1.25rem;background:var(--card-bg);border-radius:12px;text-align:center;">
      <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text2);margin-bottom:0.5rem;">Non-Compliance Score</div>
      <div class="m-score-num" style="font-size:3rem;font-weight:800;color:${scoreColor};line-height:1;">${nonComplianceScore}%</div>
      <div style="font-size:0.95rem;font-weight:700;color:var(--text);margin:0.75rem 0;">${verdict}</div>
      <div style="background:var(--bg2);border-radius:10px;height:10px;overflow:hidden;margin:1rem auto;max-width:300px;">
        <div id="detailProgressBar" style="height:100%;background:linear-gradient(90deg,var(--red),#ff6b6b);width:0;transition:width 0.6s ease;"></div>
      </div>
      <div style="font-size:0.8rem;color:var(--text2);">${gaps.length} gap${gaps.length!==1?'s':''} causing non-compliance</div>
    </div>
    
    ${chartsHTML}
    
    <!-- ✅ FIXED: Gaps ab yahan charts ke baad show honge -->
    ${gapsHTML}
    
    <div class="m-actions" style="margin-top:1.5rem;">
      <button class="btn btn-gold" onclick="downloadPDF(${s.id})">⬇ Download PDF</button>
      <button class="btn btn-ghost" onclick="closeModal(true)">Close</button>
    </div>`;

  document.getElementById('modal')?.classList.add('open');

  // 🔥 RENDER CHARTS
  setTimeout(() => {
    renderDetailCharts(s);
    // Animate progress bar
    setTimeout(() => {
      const progressBar = document.getElementById('detailProgressBar');
      if (progressBar) progressBar.style.width = nonComplianceScore + '%';
    }, 100);
  }, 150);
}

// ===== DETAIL MODAL CHARTS (Same as User Dashboard) =====
// ===== DETAIL MODAL CHARTS (Exact Same as User Dashboard) =====
function renderDetailCharts(s) {
  const tick = getTickColor();
  const grid = getGridColor();
  const ff = 'Syne';
  const C = getColors();
  
  // Destroy existing charts
  ['detailPie', 'detailLine'].forEach(id => {
    const canvas = document.getElementById(`detailChart${id === 'detailPie' ? 'Pie' : 'Line'}`);
    if (canvas?.chartInstance) {
      try { canvas.chartInstance.destroy(); } catch(e) {}
      canvas.chartInstance = null;
    }
  });

  const scores = getSectionScores(s);

  // 🥧 PIE CHART: Compliant vs Non-Compliant (Same calculation)
  const pieCanvas = document.getElementById('detailChartPie');
  if (pieCanvas) {
    const lc = getLeaveComplianceStatus(s);
    const leaveOk = lc ? !lc.hasGap : s.se1 === 'Yes';
    
    // Same 22 checks as User Dashboard
    const checks = [
      s.sa1 !== '', s.sa2 === 'Yes', s.sb1 === 'Yes', s.sb2 === 'Yes',
      s.sb4 === 'Yes', s.sb5 === 'Yes',
      s.sc1 === 'No' ? true : (s.sc2 === 'No' ? true : (s.sc3 === 'Yes')),
      s.sc1 === 'No' ? true : (s.sc2 === 'No' ? true : (s.sc4 === 'Yes')),
      s.sc1 === 'No' ? true : (s.sc2 === 'No' ? true : (s.sc5 === 'Yes')),
      s.sc1 === 'Yes' && s.sc2 === 'Yes' ? (s.sc2 === 'Yes') : true,
      s.sd1 === 'No' ? true : (s.sd3 === 'Yes'),
      s.sd1 === 'No' ? true : (s.sd2 === 'No'),
      s.se1 === 'Yes', leaveOk, s.se3 === 'Yes',
      s.sf1 === 'Yes', s.sf3 === 'Yes',
      s.sg1 === 'Yes' || s.sg1 === 'Partial',
      s.sh1 === 'No', s.sh2 === 'No', s.sh3 === 'No',
      s.sh4 === 'Yes' && s.sh5 === 'No',
    ];
    
    const compliant = checks.filter(Boolean).length;
    const nonCompliant = checks.length - compliant;
    
    pieCanvas.chartInstance = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: ['Compliant ✓', 'Non-Compliant ✗'],
        datasets: [{
          data: [compliant, nonCompliant],
          backgroundColor: [C.green, C.red],
          borderWidth: 0,
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: tick, font: { family: ff, size: 10, weight: '600' }, padding: 12 }
          },
          tooltip: {
            backgroundColor: 'rgba(14,16,24,0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.gold,
            borderWidth: 2,
            padding: 10,
            callbacks: {
              label: function(ctx) {
                const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                const pct = total ? Math.round((ctx.parsed * 100) / total) : 0;
                return ` ${ctx.label}: ${ctx.parsed} checks (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // 📈 LINE CHART: Section-wise Non-Compliance (RED - Same as User Dashboard)
  const lineCanvas = document.getElementById('detailChartLine');
  if (lineCanvas) {
    lineCanvas.chartInstance = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels: ['A: License', 'B: Bonus', 'C: POSH', 'D: PF', 'E: Leaves', 'F: ESI', 'G: HR', 'H: Inspection'],
        datasets: [{
          label: 'Non-Compliance Score',
          data: [
            100 - scores.A, 100 - scores.B, 100 - scores.C, 100 - scores.D,
            100 - scores.E, 100 - scores.F, 100 - scores.G, 100 - scores.H
          ],
          borderColor: C.red,
          backgroundColor: C.red + '25',
          borderWidth: 2.5,
          pointBackgroundColor: '#fff',
          pointBorderColor: C.red,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: grid, drawBorder: false },
            ticks: { color: tick, font: { family: ff, size: 8, weight: '600' }, padding: 8, maxRotation: 45, minRotation: 45 }
          },
          y: {
            min: 0, max: 100,
            grid: { color: grid, drawBorder: false },
            ticks: { 
              color: tick, 
              font: { family: ff, size: 9 },
              callback: v => v + '%',
              padding: 8
            },
            title: {
              display: true,
              text: 'Non-Compliance %',
              color: tick,
              font: { family: ff, size: 10, weight: '700' },
              padding: { top: 8 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(14,16,24,0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: C.red,
            borderWidth: 2,
            padding: 10,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}% non-compliant`
            }
          }
        }
      }
    });
  }
}

function mi(label, val) {
  return `<div class="m-item"><div class="m-item-label">${label}</div><div class="m-item-val">${val||'—'}</div></div>`;
}

function closeModal(force) {
  const m = document.getElementById('modal');
  if (!m) return;
  if (force === true || (force && force.target === m)) { m.classList.remove('open'); activeDetailId = null; }
}

// ===== CSV EXPORT =====
function exportToCSV() {
  if (!submissions.length) { showToast('No data to export.', 'red'); return; }
  const headers = [
    'ID', 'Submitted At', 'Company', 'Contact', 'Phone', 'State', 'Location', 'Employees', 'Industry',
    'Est Type (A1)', 'License Owner (A2)',
    'Diwali Bonus (B1)', 'Aware Bonus Rule (B2)', 'Starting Salary (B3)', 'Salary Structure (B4)', 'On-Time Salary (B5)', 'Salary Payment Date',
    'Female Employees (C1)', 'POSH Aware (C2)', 'POSH Sessions (C3)', 'IC Formed (C4)', 'POSH Return (C5)',
    'PF Monthly (D1)', 'PF >50k (D2)', 'PF Capped (D3)',
    'Leaves Given (E1)', 'Total Annual Leaves (E2)', 'State EL Required', 'State CL Required', 'State SL Required', 'Total Mandatory', 'Leave Gap',
    'ESIC Sick Leave (E3)',
    'ESI Aware (F1)', 'Salary Restructd (F3)',
    'HR Updated (G1)',
    'Labour Inspector (H1)', 'Pending Cases (H2)', 'Notice Period (H3)', 'Issues Assets (H4)', 'Asset Damage (H5)',
    'Score', 'Gaps Count', 'Gaps', 'Recommendations'
  ];
  const rows = submissions.map(s => {
    const ld = STATE_LEAVE_DATA[s.state];
    const totalGiven = parseInt(s.se2total) || 0;
    const totalMandatory = ld ? ld.EL + ld.CL + ld.SL : 0;
    const gap = ld ? (totalGiven - totalMandatory) : 0;
    return [
      s.id, s.submittedAt, s.companyName, s.name, s.contact, s.state, s.location, s.employees, s.field,
      s.sa1, s.sa2, s.sb1, s.sb2, s.sb3, s.sb4, s.sb5, s.sb5Date || '',
      s.sc1, s.sc2, s.sc3, s.sc4, s.sc5,
      s.sd1, s.sd2, s.sd3,
      s.se1, totalGiven,
      ld ? ld.EL : '', ld ? ld.CL : '', ld ? ld.SL : '', totalMandatory, gap,
      s.se3, s.sf1, s.sf3, s.sg1,
      s.sh1, s.sh2, s.sh3, s.sh4, s.sh5,
      s.score, (s.gaps||[]).length, (s.gaps||[]).join(' | '), (s.recs||[]).join(' | ')
    ].map(v => `"${String(v||'').replace(/"/g,'""')}"`);
  });

  const csv = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `LabourShield_Audit_Data_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('✅ CSV exported successfully!', 'green');
}

// ===== PDF DOWNLOAD =====
// ===== PROFESSIONAL PDF DOWNLOAD (Complete with Footer Info) =====
async function downloadPDF(id) {
  const s = id ? submissions.find(x => x.id == id) : currentUserSubmission;
  if (!s) { showToast('Submission not found', 'red'); return; }

  showToast('⏳ Generating Professional PDF…', 'blue');

  // Load jsPDF
  if (!window.jspdf?.jsPDF) {
    await new Promise((res, rej) => {
      const el = document.createElement('script');
      el.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      el.onload = res; el.onerror = rej;
      document.head.appendChild(el);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = 210, pageHeight = 297;
  const margin = 15;
  let y = margin;

  // ===== COLORS =====
  const GOLD = [184, 134, 11];
  const RED = [224, 85, 85];
  const GREEN = [46, 204, 138];
  const DARK = [25, 28, 35];
  const MUTED = [122, 130, 153];
  const NAVY = [14, 16, 24];
  const LIGHT_GRAY = [248, 249, 251];

  // ===== HEADER =====
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, pageWidth, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text((s.companyName || 'COMPLIANCE REPORT').toUpperCase(), margin, 15);
  
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`${s.field || '—'} · ${s.state || '—'} · ${s.employees || '—'} employees`, margin, 22);
  doc.text(`Submitted: ${fmtDate(s.submittedAt)}`, margin, 27);

  y = 45;

  // ===== SECTIONS HELPERS =====
  const addSection = (title, emoji) => {
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(margin, y, pageWidth - 2*margin, 8, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(margin, y, 4, 8, 'F');
    doc.setTextColor(...GOLD);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${emoji} ${title}`, margin + 8, y + 5.5);
    y += 12;
  };

  const addRow = (label, value, isBold = false, color = DARK) => {
    if (y > 260) { doc.addPage(); y = margin; }
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 3, y);
    
    doc.setTextColor(...color);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(9);
    const wrap = doc.splitTextToSize(String(value || '—'), pageWidth - 2*margin - 80);
    doc.text(wrap, margin + 80, y);
    y += wrap.length * 5 + 2;
  };

  // ===== BUSINESS PROFILE =====
  addSection('BUSINESS PROFILE & REGISTRATION', '📋');
  addRow('Company Name', s.companyName, true);
  addRow('Contact Person', s.name || '—');
  addRow('Phone', s.contact || '—');
  addRow('Location', `${s.location || ''}${s.state ? ', ' + s.state : ''}`.trim() || '—');
  addRow('Industry', s.field || '—');
  addRow('Employees', s.employees || '—');
  addRow('Establishment Type', s.sa1 || '—');
  y += 3;

  // ===== SCORE CARD =====
  const complianceScore = s.score || 0;
  const nonComplianceScore = 100 - complianceScore;
  const scoreColor = nonComplianceScore === 0 ? GREEN : nonComplianceScore <= 30 ? [78, 140, 255] : nonComplianceScore <= 60 ? GOLD : RED;
  
  doc.setFillColor(...scoreColor);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`NON-COMPLIANCE SCORE: ${nonComplianceScore}%`, pageWidth/2, y + 8, { align: 'center' });
  
  const verdict = nonComplianceScore === 0 ? '✅ Fully Compliant' : 
                  nonComplianceScore <= 30 ? '⚠️ Low Risk' : 
                  nonComplianceScore <= 60 ? '🔶 Medium Risk' : '🚨 High Risk';
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(verdict, pageWidth/2, y + 14, { align: 'center' });
  y += 22;

  // ===== CHARTS PLACEHOLDER =====
  addSection('COMPLIANCE VISUALIZATION', '📊');
  
  const chartPlaceholder = (title, color) => {
    if (y > 240) { doc.addPage(); y = margin; }
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(margin, y, (pageWidth - 2*margin - 5)/2, 100, 'F');
    doc.setFillColor(...color);
    doc.rect(margin + 5, y + 10, (pageWidth - 2*margin - 5)/2 - 10, 70, 'F');
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(title, margin + 10, y + 50, { align: 'center' });
    doc.text('[Chart Rendered]', margin + 10, y + 55, { align: 'center' });
  };
  
  chartPlaceholder('Compliance Status Pie', GREEN);
  chartPlaceholder('Section-wise Non-Compliance', RED);
  y += 105;

  // ===== COMPLIANCE GAPS =====
  const gaps = Array.isArray(s.gaps) && s.gaps.length ? s.gaps : getGaps(s);
  if (gaps.length) {
    addSection(`COMPLIANCE GAPS IDENTIFIED (${gaps.length})`, '⚠️');
    gaps.forEach((gap, idx) => {
      if (y > 260) { doc.addPage(); y = margin; }
      doc.setFillColor(254, 242, 242);
      doc.rect(margin, y, pageWidth - 2*margin, 1, 'F');
      doc.setTextColor(...RED);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`⚠ ${idx + 1}.`, margin + 3, y + 5);
      
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'normal');
      const wrap = doc.splitTextToSize(gap, pageWidth - 2*margin - 15);
      doc.text(wrap, margin + 15, y + 5);
      y += wrap.length * 5 + 4;
    });
    y += 2;
  } else {
    addSection('STATUS', '✅');
    doc.setTextColor(...GREEN);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('✅ No compliance gaps found! Great job.', margin + 3, y + 5);
    y += 12;
  }

  // ===== PROFESSIONAL FOOTER WITH COMPLETE CONTACT INFO =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer background
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, pageHeight - 28, pageWidth, 28, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(0, pageHeight - 28, pageWidth, 2, 'F');
    
    // Company Name
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SHAKTI LEGAL COMPLIANCES INDIA LLP', pageWidth/2, pageHeight - 22, { align: 'center' });
    
    // Address with icon
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('📍 83, DSIDC COMPLEX, Okhla I Rd, Pocket C, Okhla Phase I, New Delhi', pageWidth/2, pageHeight - 17, { align: 'center' });
    
    // Contact details in one line
    doc.setFontSize(7);
    const contactLine = '✉ contact@slci.in  |  📞 83739 17131  |  🌐 www.slci.in';
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text(contactLine, pageWidth/2, pageHeight - 12, { align: 'center' });
    
    // Divider line
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);
    
    // Page number and tagline
    doc.setTextColor(...MUTED);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.text('LabourShield Professional Audit Report', margin, pageHeight - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // ===== SAVE PDF =====
  const safeName = (s.companyName || 'Report').replace(/[^a-z0-9]/gi, '_').substring(0, 25);
  doc.save(`LabourShield_${safeName}_Professional_Report.pdf`);
  showToast('✅ Professional PDF downloaded!', 'green');
}

// ===== HELPERS =====
function fmtDate(iso, short = false) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (short) return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch(e) { return iso; }
}

function toggleSidebar() {
  document.getElementById('adminSidebar')?.classList.toggle('open');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = localStorage.getItem(LS_THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  try { localSubmissions = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e) { localSubmissions = []; }
  submissions = [...localSubmissions];

  if (localStorage.getItem(LS_ADMIN) === 'true') {
    isAdmin = true;
    showAdminUI();
  }

  const lastId = localStorage.getItem(LS_LAST);
  if (lastId) {
    currentUserSubmission = localSubmissions.find(s => String(s.id) === lastId) || null;
  }

  await loadFromSheets(false);

  if (window.location.hash === '#dashboard' && currentUserSubmission) {
    showView('user-dashboard');
  }
  
  const sb5Yes = document.querySelector('input[name="sb5"][value="Yes"]');
  if (sb5Yes?.checked) toggleSalaryDateField(true);
  
  const c1Val = getRadio('sc1');
  const c2Val = getRadio('sc2');
  if (c1Val || c2Val) togglePOSHQuestions();
  
  const d1Yes = document.querySelector('input[name="sd1"][value="Yes"]');
  if (d1Yes?.checked) togglePFQuestions(true);
  
  document.querySelectorAll('input[name="sc1"], input[name="sc2"]').forEach(radio => {
    radio.addEventListener('change', togglePOSHQuestions);
  });
  
  document.getElementById('state')?.addEventListener('change', updateStateLeaveBadge);
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isAdmin) loadFromSheets(true);
});

// ===== UTILITIES =====
function showToast(msg, color = 'gold') {
  const existing = document.getElementById('ls-toast');
  if (existing) existing.remove();
  const colors    = { green:'#1a8a5a', red:'#c0392b', gold:'#b8860b', blue:'#2563eb' };
  const darkColors= { green:'#2ecc8a', red:'#e05555', gold:'#d4a843', blue:'#4e8cff' };
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const col = isDark ? (darkColors[color]||darkColors.gold) : (colors[color]||colors.gold);
  const t = document.createElement('div');
  t.id = 'ls-toast';
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:2rem;right:1rem;z-index:9999;background:${col};color:#fff;padding:0.75rem 1.25rem;border-radius:12px;font-family:'Syne',sans-serif;font-weight:700;font-size:0.82rem;box-shadow:0 8px 30px rgba(0,0,0,0.25);animation:toastIn 0.3s ease;max-width:calc(100vw - 2rem);word-break:break-word;`;
  const style = document.createElement('style');
  style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 3500);
}

function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function getTickColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? '#7a8299' : '#6b7280';
}
function getGridColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
}
function getColors() {
  return {
    gold:   getCSSVar('--gold')   || '#d4a843',
    green:  getCSSVar('--green')  || '#2ecc8a',
    red:    getCSSVar('--red')    || '#e05555',
    blue:   getCSSVar('--blue')   || '#4e8cff',
    purple: getCSSVar('--purple') || '#a78bfa',
  };
}

// ===== VIEW SWITCHING =====
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
  const pillMap = { 'form':'navForm', 'user-dashboard':'navUserDash', 'admin-dashboard':'navAdminDash' };
  const pill = document.getElementById(pillMap[name]);
  if (pill) pill.classList.add('active');

  if (name === 'user-dashboard') renderUserDashboard();
  if (name === 'admin-dashboard') {
    if (!isAdmin) { showView('form'); showToast('Admin access required.','red'); return; }
    renderAdminDashboard();
    loadFromSheets(true);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// 🔁 ADMIN AUTO-SYNC (Every 15s when dashboard is visible)
// ============================================================
let adminSyncInterval = null;

function startAdminSync() {
  if (adminSyncInterval) clearInterval(adminSyncInterval);
  adminSyncInterval = setInterval(() => {
    if (isAdmin && document.getElementById('view-admin-dashboard')?.classList.contains('active')) {
      loadFromSheets(false); // Silent background refresh
    }
  }, 15000); // 15 seconds
}

function stopAdminSync() {
  if (adminSyncInterval) { 
    clearInterval(adminSyncInterval); 
    adminSyncInterval = null; 
  }
}

// Hook into existing showView function
const _origShowView = showView;
showView = function(name) {
  _origShowView(name); // Call original function first
  if (name === 'admin-dashboard') {
    startAdminSync();  // Start auto-sync when admin view opens
  } else {
    stopAdminSync();   // Stop when leaving admin view
  }
};

// ===== ADMIN AUTH =====
function toggleAdminLogin() {
  if (isAdmin) { logoutAdmin(); return; }
  const m = document.getElementById('adminLoginModal');
  if (m) {
    m.classList.add('open');
    document.getElementById('adminLoginError').style.display = 'none';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    setTimeout(() => document.getElementById('adminUser')?.focus(), 150);
  }
}

function doAdminLogin() {
  const user = document.getElementById('adminUser')?.value.trim();
  const pass = document.getElementById('adminPass')?.value.trim();
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    localStorage.setItem(LS_ADMIN, 'true');
    document.getElementById('adminLoginModal')?.classList.remove('open');
    showAdminUI();
    showToast('✅ Admin login successful!', 'green');
    showView('admin-dashboard');
  } else {
    const err = document.getElementById('adminLoginError');
    if (err) err.style.display = 'block';
  }
}

function showAdminUI() {
  const pill = document.getElementById('navAdminDash');
  if (pill) { pill.style.display = 'flex'; pill.classList.add('admin-pill'); }
  const btn  = document.getElementById('adminToggleBtn');
  if (btn)  { btn.textContent = '🔓 Logout'; btn.classList.add('active-admin'); }
}

function logoutAdmin() {
  isAdmin = false;
  localStorage.removeItem(LS_ADMIN);
  const pill = document.getElementById('navAdminDash');
  if (pill) { pill.style.display = 'none'; pill.classList.remove('admin-pill'); }
  const btn = document.getElementById('adminToggleBtn');
  if (btn) { btn.textContent = 'Admin Login'; btn.classList.remove('active-admin'); }
  showToast('Logged out from admin.', 'gold');
  showView('form');
}

function closeAdminModal(force) {
  const m = document.getElementById('adminLoginModal');
  if (!m) return;
  if (force === true || (force && force.target === m)) m.classList.remove('open');
}

// ===== PAGE NAV =====
function goPage2() {
  const fields = ['name','contact','state','location','companyName','employees','field'];
  let ok = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    else if (el) el.classList.remove('error');
  });
  if (!ok) { showToast('Please fill all required fields.','red'); return; }
  
  const requiredRadios = ['sa1','sa2','sb1','sb2','sb4','sb5','sc1','sc2','sd1','se1','se3','sf1','sf3','sg1','sh1','sh2','sh3','sh4','sh5'];
  let missingQ = null;
  for (const n of requiredRadios) {
    if (!getRadio(n)) { missingQ = n; break; }
  }
  if (missingQ && missingQ.startsWith('sc')) {
    document.querySelector('.sec-label:has([class*="sec-num"]):nth-child(3)')?.scrollIntoView({ behavior:'smooth', block:'center' });
    showToast(`Please answer POSH question ${missingQ.toUpperCase()}`, 'red');
    return;
  }
  
  document.getElementById('pg1').style.display = 'none';
  document.getElementById('pg2').style.display = 'block';
  const sd1 = document.getElementById('sd1');
  if (sd1) { sd1.classList.remove('active'); sd1.classList.add('done'); sd1.innerHTML = '<span>✓</span>'; }
  const sr1 = document.getElementById('sr1'); if (sr1) sr1.classList.add('done');
  const sd2 = document.getElementById('sd2'); if (sd2) sd2.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goPage1() {
  document.getElementById('pg1').style.display = 'block';
  document.getElementById('pg2').style.display = 'none';
  const sd1 = document.getElementById('sd1');
  if (sd1) { sd1.className = 'step-dot active'; sd1.innerHTML = '<span>1</span>'; }
  const sr1 = document.getElementById('sr1'); if (sr1) sr1.classList.remove('done');
  const sd2 = document.getElementById('sd2'); if (sd2) sd2.classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}