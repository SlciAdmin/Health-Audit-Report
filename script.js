// ============================================================
// LABOURSHIELD — script.js  FINAL VERSION
// Simplified Leave Input - Single Total Leaves Field
// Detailed Leave Compliance shown ONLY in Dashboard/Report
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycby7nP6aTh4rpqbTB0pZ34T4-R5kX0S4azsZqoLMI0qDcHSdPVmmIoGwM-NOmJ6HlGfpLw/exec";

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

// ===== LEAVE COMPLIANCE CHECK =====
function getLeaveComplianceStatus(d) {
  const state = d.state;
  if (!state || !STATE_LEAVE_DATA[state]) return null;
  const ld = STATE_LEAVE_DATA[state];
  const totalGiven = parseInt(d.se2total) || 0;
  const required = ld.EL + ld.CL + ld.SL;
  return {
    state, ld,
    totalGiven,
    required,
    diff: totalGiven - required,
    hasGap: totalGiven < required,
  };
}

// ===== SCORE CALCULATION =====
function calcScore(d) {
  const lc = getLeaveComplianceStatus(d);
  const leaveOk = lc ? !lc.hasGap : d.se1 === 'Yes';
  const checks = [
    // A (2)
    d.sa1 !== '',
    d.sa2 === 'Yes',
    // B (4)
    d.sb1 === 'Yes',
    d.sb2 === 'Yes',
    d.sb4 === 'Yes',
    d.sb5 === 'Yes',
    // C (4)
    d.sc2 === 'Yes',
    d.sc3 === 'Yes',
    d.sc4 === 'Yes',
    d.sc5 === 'Yes',
    // D (3)
    d.sd1 === 'Yes',
    d.sd3 === 'Yes',
    d.sd2 === 'No',
    // E (3) — now includes leave compliance
    d.se1 === 'Yes',
    leaveOk,
    d.se3 === 'Yes',
    // F (2)
    d.sf1 === 'Yes',
    d.sf3 === 'Yes',
    // G (1)
    d.sg1 === 'Yes' || d.sg1 === 'Partial',
    // H (4)
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
  return {
    A: ((s.sa1 ? 50 : 0) + (s.sa2 === 'Yes' ? 50 : 0)),
    B: ((s.sb1 === 'Yes' ? 25 : 0) + (s.sb2 === 'Yes' ? 25 : 0) + (s.sb4 === 'Yes' ? 25 : 0) + (s.sb5 === 'Yes' ? 25 : 0)),
    C: ((s.sc2 === 'Yes' ? 25 : 0) + (s.sc3 === 'Yes' ? 25 : 0) + (s.sc4 === 'Yes' ? 25 : 0) + (s.sc5 === 'Yes' ? 25 : 0)),
    D: ((s.sd1 === 'Yes' ? 34 : 0) + (s.sd3 === 'Yes' ? 33 : 0) + (s.sd2 === 'No' ? 33 : 0)),
    E: ((s.se1 === 'Yes' ? 34 : 0) + (leaveOk ? 33 : 0) + (s.se3 === 'Yes' ? 33 : 0)),
    F: ((s.sf1 === 'Yes' ? 50 : 0) + (s.sf3 === 'Yes' ? 50 : 0)),
    G: (s.sg1 === 'Yes' ? 100 : s.sg1 === 'Partial' ? 60 : 0),
    H: ((s.sh1 === 'No' ? 25 : 0) + (s.sh2 === 'No' ? 25 : 0) + (s.sh3 === 'No' ? 25 : 0) + (s.sh5 === 'No' ? 25 : 0)),
  };
}

// ===== GAPS =====
function getGaps(d) {
  const gaps = [];
  // A
  if (d.sa2 !== 'Yes') gaps.push('License is not in the name of the owner — this may create legal complications');
  // B
  if (d.sb1 !== 'Yes') gaps.push('Diwali / festive bonus not being paid to all employees');
  if (d.sb2 !== 'Yes') gaps.push('Unaware that statutory bonus applies only to employees with wages up to ₹21,000');
  if (d.sb4 !== 'Yes') gaps.push('No structured salary format (Basic + HRA + Allowances) in place');
  if (d.sb5 !== 'Yes') gaps.push('Salaries not paid on time — must be disbursed on or before 7th of each month');
  // C
  if (d.sc2 !== 'Yes') gaps.push('Unaware of POSH Act 2013 — mandatory if female employees are employed');
  if (d.sc3 !== 'Yes') gaps.push('Periodic POSH awareness sessions not being conducted');
  if (d.sc4 !== 'Yes') gaps.push('Internal Committee (IC) under POSH Act 2013 not yet constituted');
  if (d.sc5 !== 'Yes') gaps.push('Annual return under POSH Act 2013 not filed');
  // D
  if (d.sd1 !== 'Yes') gaps.push('PF contribution not being made on a monthly basis');
  if (d.sd3 !== 'Yes') gaps.push('PF contribution not capped at ₹15,000 wage ceiling — may result in excess liability');
  if (d.sd2 === 'Yes') gaps.push('Paying PF for employees with salary above ₹50,000/₹75,000 — review necessity');
  // E — Leave-specific with state law reference
  if (d.se1 !== 'Yes') gaps.push('Employees not receiving any statutory leaves as mandated');
  const lc = getLeaveComplianceStatus(d);
  if (lc && lc.hasGap) {
    gaps.push(`Leave deficit: You give ${lc.totalGiven} total days but ${lc.state} law mandates minimum ${lc.required} days (EL:${lc.ld.EL} + CL:${lc.ld.CL} + SL:${lc.ld.SL}) annually under ${lc.ld.law}`);
  }
  if (d.se3 !== 'Yes') gaps.push('Unaware that ESIC-covered employees get medical benefits — no separate sick leave needed');
  // F
  if (d.sf1 !== 'Yes') gaps.push('Unaware that employees earning up to ₹42,000 gross are covered under ESI');
  if (d.sf3 !== 'Yes') gaps.push('Salary structure not restructured as per the four new Labour Codes');
  // G
  if (d.sg1 === 'No') gaps.push('HR Policy / Leave Policy / Appointment Letter not updated as per new Labour Codes');
  // H
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
    'Salaries not paid on time':           'Implement payroll cycle — disburse salaries before 7th of every month to avoid statutory penalties',
    'Unaware of POSH Act':                 'Immediately study and implement POSH Act 2013 — mandatory for all organisations employing women',
    'POSH awareness sessions':             'Conduct POSH awareness workshop at least once annually for all staff',
    'Internal Committee':                  'Constitute Internal Committee (IC) under POSH Act with at least 50% women members',
    'Annual return under POSH':            'File Annual Return under POSH Act 2013 with the District Officer before 31st January each year',
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

async function loadFromSheets(showLoader = false) {
  const loader = document.getElementById('adminLoadingBar');
  if (showLoader && loader) loader.style.display = 'block';
  try {
    const res = await fetch(API_URL + '?t=' + Date.now(), { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error('Invalid data format');
    const normalised = raw.map(normaliseItem);
    const cloudIds   = new Set(normalised.map(s => String(s.id)));
    const localOnly  = localSubmissions.filter(s => !cloudIds.has(String(s.id)));
    submissions      = [...normalised, ...localOnly];
    submissions.sort((a,b) => new Date(b.submittedAt||0) - new Date(a.submittedAt||0));
    localSubmissions = submissions;
    localStorage.setItem(LS_KEY, JSON.stringify(localSubmissions));
    if (isAdmin && document.getElementById('view-admin-dashboard')?.classList.contains('active')) {
      renderAdminDashboard();
    }
    return { success: true };
  } catch(err) {
    submissions = [...localSubmissions];
    submissions.sort((a,b) => new Date(b.submittedAt||0) - new Date(a.submittedAt||0));
    if (showLoader) showToast('Using cached data (offline mode)', 'blue');
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
  const requiredRadios = [
    'sa1','sa2','sb1','sb2','sb4','sb5',
    'sc1','sc2','sc3','sc4','sc5',
    'sd1','sd2','sd3','se1','se3',
    'sf1','sf3','sg1',
    'sh1','sh2','sh3','sh4','sh5'
  ];
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

  const state = document.getElementById('state')?.value || '';
  const totalLeaves = parseInt(document.getElementById('se2total')?.value) || 0;

  const d = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    name:        document.getElementById('name')?.value.trim() || '',
    contact:     document.getElementById('contact')?.value.trim() || '',
    state,
    location:    document.getElementById('location')?.value.trim() || '',
    employees:   document.getElementById('employees')?.value || '',
    companyName: document.getElementById('companyName')?.value.trim() || '',
    field:       document.getElementById('field')?.value || '',
    // A
    sa1: getRadio('sa1'), sa2: getRadio('sa2'),
    // B
    sb1: getRadio('sb1'), sb2: getRadio('sb2'),
    sb3: document.getElementById('sb3')?.value || '',
    sb4: getRadio('sb4'), sb5: getRadio('sb5'),
    // C
    sc1: getRadio('sc1'), sc2: getRadio('sc2'), sc3: getRadio('sc3'),
    sc4: getRadio('sc4'), sc5: getRadio('sc5'),
    // D
    sd1: getRadio('sd1'), sd2: getRadio('sd2'), sd3: getRadio('sd3'),
    // E — Single total leaves field
    se1: getRadio('se1'),
    se2total: totalLeaves,
    se2: `Total: ${totalLeaves} days`,
    se3: getRadio('se3'),
    // F
    sf1: getRadio('sf1'), sf2: '', sf3: getRadio('sf3'),
    // G
    sg1: getRadio('sg1'), sg2: '', sg3: '', sg4: '',
    // H
    sh1: getRadio('sh1'), sh2: getRadio('sh2'), sh3: getRadio('sh3'),
    sh4: getRadio('sh4'), sh5: getRadio('sh5'),
  };

  d.score = calcScore(d);
  d.gaps  = getGaps(d);
  d.recs  = getRecs(d.gaps);

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '⏳ Saving...'; }

  try {
    localSubmissions.unshift(d);
    localStorage.setItem(LS_KEY, JSON.stringify(localSubmissions));
    localStorage.setItem(LS_LAST, String(d.id));
    submissions.unshift(d);
    currentUserSubmission = d;

    sendToSheets(d).then(result => {
      if (result.success) showToast('✅ Synced to cloud!', 'green');
      else showToast('⚠️ Saved locally. Will sync when online.', 'gold');
    });

    document.getElementById('pg2').style.display = 'none';
    const sc  = d.score;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    const lbl = sc >= 70 ? 'Good Standing ✦' : sc >= 40 ? 'Needs Improvement' : 'Critical Attention Required';
    const box = document.getElementById('successScoreBox');
    if (box) {
      box.innerHTML = `
        <div class="score-pill ${cls}">${sc}%</div>
        <div style="font-size:0.82rem;color:var(--text2);margin-bottom:0.5rem;">${lbl}</div>
        <div style="font-size:0.8rem;color:var(--text2);">${d.gaps.length} gap${d.gaps.length!==1?'s':''} identified</div>`;
    }
    document.getElementById('pgSuccess').style.display = 'block';
  } catch(err) {
    showToast('Error saving. Please try again.', 'red');
  } finally {
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
  const sd1 = document.getElementById('sd1');
  if (sd1) { sd1.className='step-dot active'; sd1.innerHTML='<span>1</span>'; }
  const sr1 = document.getElementById('sr1'); if (sr1) sr1.classList.remove('done');
  const sd2 = document.getElementById('sd2'); if (sd2) sd2.classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== USER DASHBOARD =====
// ===== USER DASHBOARD =====
// ===== USER DASHBOARD =====
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
  const sc = s.score || 0;
  const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
  const verdict = sc >= 70 ? 'Strong Compliance Posture ✦' : sc >= 40 ? 'Moderate — Action Required' : 'Critical Gaps — Immediate Action!';

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('udashTitle', s.companyName || 'Your Report');
  set('udashSub', `${s.field||'—'} · ${s.state||'—'} · ${s.location||'—'} · Submitted on ${fmtDate(s.submittedAt)}`);

  const numEl = document.getElementById('udashScoreNum');
  if (numEl) { numEl.textContent = sc + '%'; numEl.className = 'udash-score-num ' + cls; }
  set('udashVerdict', verdict);
  const barEl = document.getElementById('udashScoreBar');
  if (barEl) { barEl.style.width = '0'; setTimeout(() => barEl.style.width = sc + '%', 300); }
  set('udashScoreMeta', `${(s.gaps||[]).length} compliance gap${(s.gaps||[]).length!==1?'s':''} identified across all sections`);

  const yn = (v, id) => {
    const e = document.getElementById(id); if (!e) return;
    if (v === 'Yes')  { e.textContent='Yes ✅'; e.className='ust-val yes'; }
    else if (v === 'No') { e.textContent='No ❌'; e.className='ust-val no'; }
    else { e.textContent=v||'—'; e.className='ust-val partial'; }
  };
  yn(s.sd1,'ustPF'); yn(s.sf1,'ustESI'); yn(s.sc4,'ustPOSH');
  yn(s.se1,'ustLeave'); yn(s.sg1,'ustHR'); yn(s.sb1,'ustBonus');

  // ============================================
  // ORDER 1: SCORE (Already rendered above)
  // ============================================

  // ============================================
  // ORDER 2: GAPS (with leave compliance highlighted)
  // ============================================
  const gapsSection = document.getElementById('udashGapsSection');
  const gapsEl      = document.getElementById('udashGaps');
  if ((s.gaps||[]).length) {
    if (gapsSection) gapsSection.style.display = 'block';
    if (gapsEl) {
      const lc = getLeaveComplianceStatus(s);
      let gapsHTML = '';
      
      // Add leave compliance highlight if there's a gap
      if (lc && lc.hasGap) {
        gapsHTML += `
          <div class="leave-gap-highlight" style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left:4px solid #f59e0b; padding:1.25rem; margin-bottom:1.25rem; border-radius:8px; box-shadow:0 2px 8px rgba(245,158,11,0.15);">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
              <span style="font-size:1.25rem;">🏖</span>
              <div style="font-weight:700; color:#92400e; font-size:1rem;">Leave Compliance Issue</div>
            </div>
            <div style="color:#78350f; font-size:0.95rem; margin-bottom:0.75rem; line-height:1.5;">
              <strong>${lc.state} Law:</strong> You are giving <strong>${lc.totalGiven} days</strong> but the law requires minimum <strong>${lc.required} days</strong>
              <div style="margin-top:0.5rem; font-family:'JetBrains Mono',monospace; background:rgba(255,255,255,0.6); padding:0.5rem; border-radius:4px;">
                Breakdown: EL:${lc.ld.EL} + CL:${lc.ld.CL} + SL:${lc.ld.SL} = ${lc.required} days
              </div>
            </div>
            <div style="background:#fef2f2; border:1px solid #fecaca; padding:0.75rem; border-radius:6px; color:#dc2626; font-weight:700; font-size:0.95rem;">
              ⚠️ You are ${Math.abs(lc.diff)} days SHORT of mandatory requirement
            </div>
            <div style="color:#92400e; font-size:0.85rem; margin-top:0.75rem; font-style:italic;">
              📜 ${lc.ld.law}
            </div>
          </div>
        `;
      }
      
      // Regular gaps
      gapsHTML += `<div style="margin-top:1.5rem;"><div style="font-weight:700; color:var(--text); margin-bottom:1rem; font-size:0.95rem; text-transform:uppercase; letter-spacing:0.05em;">All Compliance Gaps</div>`;
      gapsHTML += s.gaps.map(g => `<div class="m-gap-item" style="padding:0.875rem; margin-bottom:0.75rem; background:var(--card-bg); border-left:3px solid #ef4444; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.05);"><span class="m-gap-icon" style="margin-right:0.75rem; color:#ef4444;">⚠</span><span style="color:var(--text); line-height:1.5;">${g}</span></div>`).join('');
      gapsHTML += `</div>`;
      
      gapsEl.innerHTML = gapsHTML;
    }
  } else {
    if (gapsSection) gapsSection.style.display = 'none';
  }

  // ============================================
  // ORDER 3: CHARTS (After gaps, before details)
  // ============================================
  setTimeout(() => renderUserCharts(s), 100);

  // ============================================
  // ORDER 4: DETAILS (All sections A-H)
  // ============================================
  
  // Profile
  document.getElementById('udashProfile').innerHTML = [
    ['Company', s.companyName], ['Contact Person', s.name], ['Phone', s.contact],
    ['Location', (s.location||'')+(s.state?', '+s.state:'')], ['Industry', s.field],
    ['Employees', s.employees], ['Est. Type', s.sa1||'—'],
    ['License in Owner Name', s.sa2||'—'],
    ['Submitted On', fmtDate(s.submittedAt)],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div><div class="m-item-val">${v||'—'}</div></div>`).join('');

  // Section B
  document.getElementById('udashBonus').innerHTML = [
    ['Bonus on Diwali', s.sb1], ['Aware ₹21,000 Bonus Rule', s.sb2],
    ['Structured Salary Format', s.sb4], ['Timely Salary Payment', s.sb5],
    ['Starting Salary', s.sb3 ? '₹'+Number(s.sb3).toLocaleString('en-IN') : '—'],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section C
  document.getElementById('udashPOSH').innerHTML = [
    ['Female Employees', s.sc1], ['Aware of POSH Act 2013', s.sc2],
    ['POSH Awareness Sessions', s.sc3], ['IC Committee Formed', s.sc4],
    ['Annual POSH Return Filed', s.sc5],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section D
  document.getElementById('udashPFSection').innerHTML = [
    ['PF on Monthly Basis', s.sd1],
    ['PF Capped at ₹15,000', s.sd3],
    ['PF on >₹50k/₹75k Salary', s.sd2],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section E - Simplified
  const lc = getLeaveComplianceStatus(s);
  const ld = lc ? lc.ld : null;
  document.getElementById('udashLeaves').innerHTML = [
    ['Leaves Given to Employees', s.se1],
    ['Total Annual Leaves', s.se2total !== undefined ? `${s.se2total} days` : (s.se2||'—')],
    ['State Law', ld ? ld.law : (s.state || '—')],
    ['Aware: ESIC Sick Leave Rule', s.se3],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section F
  document.getElementById('udashESI').innerHTML = [
    ['Aware ESI Coverage ₹42,000', s.sf1],
    ['Salary Restructured per Codes', s.sf3],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section G
  document.getElementById('udashHR').innerHTML = [
    ['HR/Leave/Appt Letter Updated', s.sg1],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section H
  document.getElementById('udashInspection').innerHTML = [
    ['Faced Labour Inspector Issues', s.sh1],
    ['Pending Notices / Cases', s.sh2],
    ['Notice Period Issues', s.sh3],
    ['Issues Assets to Employees', s.sh4],
    ['Asset Damage / Loss Faced', s.sh5],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // ============================================
  // ORDER 5: RECOMMENDED ACTIONS (LAST - at bottom)
  // ============================================
  const recsSection = document.getElementById('udashRecsSection');
  const recsEl      = document.getElementById('udashRecs');
  if ((s.recs||[]).length) {
    if (recsSection) recsSection.style.display = 'block';
    if (recsEl) {
      recsEl.innerHTML = `
        <div style="margin-bottom:1rem; font-weight:700; color:var(--text); font-size:0.95rem; text-transform:uppercase; letter-spacing:0.05em;">Action Items to Achieve Compliance</div>
        ${s.recs.map((r, idx) => `
          <div class="m-rec-item" style="padding:1rem; margin-bottom:0.75rem; background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left:4px solid #10b981; border-radius:6px; box-shadow:0 1px 3px rgba(16,185,129,0.1);">
            <div style="display:flex; gap:0.75rem; align-items:flex-start;">
              <span style="flex-shrink:0; width:24px; height:24px; background:#10b981; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700;">${idx+1}</span>
              <span style="color:#065f46; line-height:1.6; flex:1;">${r}</span>
            </div>
          </div>
        `).join('')}
      `;
    }
  } else {
    if (recsSection) recsSection.style.display = 'none';
  }

  const pdfBtn = document.getElementById('udashPDFBtn');
  if (pdfBtn) pdfBtn.onclick = () => downloadPDF(s.id);
}

// ===== LEAVE COMPLIANCE DASHBOARD WIDGET =====
function renderLeaveComplianceDashboard(s) {
  const lcSection = document.getElementById('udashLeaveComplianceSection');
  const lcCard    = document.getElementById('udashLeaveComplianceCard');
  if (!lcSection || !lcCard) return;

  const lc = getLeaveComplianceStatus(s);
  if (!lc) { lcSection.style.display = 'none'; return; }

  lcSection.style.display = 'block';
  const ld = lc.ld;

  lcCard.innerHTML = `
    <div class="lcd-header">
      <div class="lcd-state-badge">📋 ${lc.state}</div>
      <div class="lcd-law">${ld.law}</div>
      <div class="lcd-overall ${lc.hasGap ? 'gap' : 'ok'}">
        ${lc.hasGap ? '⚠️ Leave Deficit Detected — Non-Compliant' : '✅ Leave Policy is Fully Compliant'}
      </div>
    </div>
    <div class="lcd-comparison">
      <div class="lcd-compare-item">
        <div class="lcd-label">You Give</div>
        <div class="lcd-value ${lc.hasGap ? 'low' : 'good'}">${lc.totalGiven} days</div>
      </div>
      <div class="lcd-compare-divider">vs</div>
      <div class="lcd-compare-item">
        <div class="lcd-label">Law Requires</div>
        <div class="lcd-value">${ld.EL + ld.CL + ld.SL} days</div>
        <div class="lcd-breakdown">EL:${ld.EL} + CL:${ld.CL} + SL:${ld.SL}</div>
      </div>
    </div>
    ${lc.hasGap ? `
      <div class="lcd-deficit">
        <span class="deficit-icon">⚠️</span>
        <span class="deficit-text">You are ${Math.abs(lc.diff)} days SHORT of the mandatory requirement</span>
      </div>
    ` : `
      <div class="lcd-compliant">
        <span class="compliant-icon">✅</span>
        <span class="compliant-text">Your leave policy meets state law requirements</span>
      </div>
    `}
    <div class="lcd-note">${ld.ELNote}</div>
  `;
}

function ynHtml(v) {
  if (v === 'Yes')         return '<div class="m-item-val yes">✅ Yes</div>';
  if (v === 'No')          return '<div class="m-item-val no">❌ No</div>';
  if (v === 'Partial')     return '<div class="m-item-val partial">⚖ Partial</div>';
  if (v === 'Partially')   return '<div class="m-item-val partial">📄 Partially</div>';
  if (v === 'In Progress') return '<div class="m-item-val partial">🔄 In Progress</div>';
  if (v === 'Not Sure')    return '<div class="m-item-val partial">🤷 Not Sure</div>';
  if (v && (String(v).includes('days') || String(v).includes('Required') || String(v).includes('NIL') || !['Yes','No','Partial','Partially','In Progress','Not Sure'].includes(v))) {
    return `<div class="m-item-val">${v||'—'}</div>`;
  }
  return `<div class="m-item-val">${v||'—'}</div>`;
}

// ===== USER CHARTS =====
function renderUserCharts(s) {
  const tick = getTickColor();
  const grid = getGridColor();
  const ff   = 'Syne';
  const C    = getColors();

  Object.values(uCharts).forEach(c => { try { c.destroy(); } catch(e){} });
  uCharts = {};

  const scores = getSectionScores(s);

  // RADAR
  const rc = document.getElementById('uChartRadar');
  if (rc) {
    uCharts.radar = new Chart(rc, {
      type: 'radar',
      data: {
        labels: ['A: Licensing','B: Bonus/Salary','C: POSH','D: PF','E: Leaves','F: ESI','G: HR Policy','H: Inspection'],
        datasets: [{
          label: 'Compliance Score',
          data: [scores.A, scores.B, scores.C, scores.D, scores.E, scores.F, scores.G, scores.H],
          backgroundColor: C.gold + '28',
          borderColor: C.gold,
          pointBackgroundColor: C.gold,
          pointBorderColor: '#fff',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { color: tick, font: { family: ff, size: 9 }, stepSize: 25, backdropColor: 'transparent' },
            grid: { color: grid },
            pointLabels: { color: tick, font: { family: ff, size: 9 } }
          }
        },
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: tick, font: { family: ff, size: 10 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw}%` } }
        }
      }
    });
  }

  // DOUGHNUT
  const dc = document.getElementById('uChartDough');
  if (dc) {
    const active = [s.sd1 === 'Yes', s.sf1 === 'Yes', s.sc4 === 'Yes', s.sb1 === 'Yes'].filter(Boolean).length;
    uCharts.dough = new Chart(dc, {
      type: 'doughnut',
      data: {
        labels: ['PF Active', 'ESI Aware', 'POSH IC', 'Bonus Paid', 'Non-Compliant'],
        datasets: [{
          data: [s.sd1==='Yes'?1:0, s.sf1==='Yes'?1:0, s.sc4==='Yes'?1:0, s.sb1==='Yes'?1:0, Math.max(0,4-active)],
          backgroundColor: [C.green, C.blue, C.gold, C.purple, C.red + '88'],
          borderWidth: 0, hoverOffset: 12,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { color: tick, font: { family: ff, size: 10 }, padding: 10 } } }
      }
    });
  }

  // BAR — includes leave
  const bc = document.getElementById('uChartBar');
  if (bc) {
    const lc = getLeaveComplianceStatus(s);
    const leaveOk = lc ? !lc.hasGap : s.se1 === 'Yes';
    const vals = [
      s.sa2 === 'Yes' ? 100 : 0,
      s.sb5 === 'Yes' ? 100 : 0,
      s.sc3 === 'Yes' ? 100 : 0,
      s.sd1 === 'Yes' ? 100 : 0,
      s.sd3 === 'Yes' ? 100 : 0,
      leaveOk ? 100 : 0,
      s.sf3 === 'Yes' ? 100 : 0,
      s.sg1 === 'Yes' ? 100 : s.sg1 === 'Partial' ? 60 : 0,
    ];
    uCharts.bar = new Chart(bc, {
      type: 'bar',
      data: {
        labels: ['License\n(Owner)', 'Timely\nSalary', 'POSH\nSessions', 'PF\nMonthly', 'PF\nCapped', 'Leave\nCompliant', 'Salary\nRestructd', 'HR Policy\nUpdated'],
        datasets: [{
          label: 'Score %',
          data: vals,
          backgroundColor: vals.map(v => v >= 80 ? C.green : v >= 50 ? C.gold : C.red),
          borderRadius: 7, borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick, font: { family: ff, size: 8 } }, grid: { color: grid } },
          y: { ticks: { color: tick, font: { family: ff, size: 9 } }, grid: { color: grid }, beginAtZero: true, max: 100 }
        }
      }
    });
  }

  // POLAR
  const pc = document.getElementById('uChartPolar');
  if (pc) {
    uCharts.polar = new Chart(pc, {
      type: 'polarArea',
      data: {
        labels: ['POSH Awareness', 'IC Committee', 'POSH Return', 'HR Updated', 'Salary Restructd'],
        datasets: [{
          data: [
            s.sc3 === 'Yes' ? 100 : 0, s.sc4 === 'Yes' ? 100 : 0,
            s.sc5 === 'Yes' ? 100 : 0, s.sg1 === 'Yes' ? 100 : s.sg1 === 'Partial' ? 60 : 0,
            s.sf3 === 'Yes' ? 100 : 0,
          ],
          backgroundColor: [C.gold+'88', C.blue+'88', C.green+'88', C.purple+'88', C.green+'66'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { r: { ticks: { color: tick, font: { family: ff, size: 9 }, backdropColor: 'transparent' }, grid: { color: grid }, min: 0, max: 100 } },
        plugins: { legend: { position: 'bottom', labels: { color: tick, font: { family: ff, size: 9 }, padding: 8 } } }
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
  set('ast4', data.length ? Math.round(data.filter(s=>s.sc4==='Yes').length/data.length*100)+'%' : '—');
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
function renderAdminCharts(data) {
  const tick = getTickColor();
  const grid = getGridColor();
  const ff   = 'Syne';
  const C    = getColors();

  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {};
  if (!data.length) return;

  const pct = (fn) => data.length ? Math.round(fn(data) / data.length * 100) : 0;

  // Bar — compliance areas
  const bc = document.getElementById('adminChartBar');
  if (bc) {
    const labels = ['Owner\nLicense','Diwali\nBonus','POSH\nAware','POSH\nIC','POSH\nSessions','PF\nMonthly','PF\nCapped','Leaves\nGiven','ESI\nAware','HR\nUpdated','Salary\nRestructd'];
    const barVals = [
      pct(d => d.filter(s => s.sa2 === 'Yes').length),
      pct(d => d.filter(s => s.sb1 === 'Yes').length),
      pct(d => d.filter(s => s.sc2 === 'Yes').length),
      pct(d => d.filter(s => s.sc4 === 'Yes').length),
      pct(d => d.filter(s => s.sc3 === 'Yes').length),
      pct(d => d.filter(s => s.sd1 === 'Yes').length),
      pct(d => d.filter(s => s.sd3 === 'Yes').length),
      pct(d => d.filter(s => s.se1 === 'Yes').length),
      pct(d => d.filter(s => s.sf1 === 'Yes').length),
      pct(d => d.filter(s => s.sg1 === 'Yes' || s.sg1 === 'Partial').length),
      pct(d => d.filter(s => s.sf3 === 'Yes').length),
    ];
    charts.bar = new Chart(bc, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: '% Compliant', data: barVals, backgroundColor: barVals.map(v => v >= 70 ? C.green : v >= 40 ? C.gold : C.red), borderRadius: 7, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick, font: { family: ff, size: 8 } }, grid: { color: grid } },
          y: { ticks: { color: tick, font: { family: ff, size: 9 } }, grid: { color: grid }, beginAtZero: true, max: 100 }
        }
      }
    });
  }

  // Doughnut
  const dc = document.getElementById('adminChartDough');
  if (dc) {
    const cnt = {}; data.forEach(s => { if (s.sa1) cnt[s.sa1] = (cnt[s.sa1] || 0) + 1; });
    const lbls = Object.keys(cnt).length ? Object.keys(cnt) : ['No Data'];
    const vals = Object.keys(cnt).length ? Object.values(cnt) : [1];
    charts.dough = new Chart(dc, {
      type: 'doughnut',
      data: { labels: lbls, datasets: [{ data: vals, backgroundColor: [C.gold, C.green, C.blue, C.purple, C.red], borderWidth: 0, hoverOffset: 12 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: tick, font: { family: ff, size: 11 }, padding: 10 } } } }
    });
  }

  // Company Size Bar
  const ec = document.getElementById('adminChartEmp');
  if (ec) {
    const sizes = ['1–10','11–20','21–50','51–100','101–150','151–200','201–300','301–400','401–500','500+'];
    const cnt = {}; sizes.forEach(s => cnt[s] = 0); data.forEach(s => { if (s.employees) cnt[s.employees] = (cnt[s.employees] || 0) + 1; });
    charts.emp = new Chart(ec, {
      type: 'bar',
      data: { labels: sizes, datasets: [{ label: 'Companies', data: sizes.map(s => cnt[s]), backgroundColor: C.blue + 'cc', borderRadius: 7, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick, font: { family: ff, size: 8 } }, grid: { color: grid } },
          y: { ticks: { color: tick, font: { family: ff, size: 9 } }, grid: { color: grid }, beginAtZero: true }
        }
      }
    });
  }

  // POSH Pie
  const pieC = document.getElementById('adminChartPie');
  if (pieC) {
    charts.pie = new Chart(pieC, {
      type: 'pie',
      data: {
        labels: ['HR Policy Updated', 'POSH IC Formed', 'POSH Sessions Done', 'POSH Return Filed'],
        datasets: [{
          data: [
            pct(d => d.filter(s => s.sg1 === 'Yes').length),
            pct(d => d.filter(s => s.sc4 === 'Yes').length),
            pct(d => d.filter(s => s.sc3 === 'Yes').length),
            pct(d => d.filter(s => s.sc5 === 'Yes').length),
          ],
          backgroundColor: [C.green, C.blue, C.gold, C.purple], borderWidth: 0, hoverOffset: 10,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: tick, font: { family: ff, size: 10 }, padding: 10 } } } }
    });
  }

  // Score Distribution
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
    charts.score = new Chart(sc, {
      type: 'bar',
      data: { labels: Object.keys(ranges), datasets: [{ label: 'Companies', data: Object.values(ranges), backgroundColor: [C.red, C.red+'cc', C.gold, C.green+'cc', C.green], borderRadius: 7, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick, font: { family: ff, size: 10 } }, grid: { color: grid } },
          y: { ticks: { color: tick, font: { family: ff, size: 10 } }, grid: { color: grid }, beginAtZero: true }
        }
      }
    });
  }

  // Industry Bar
  const ic = document.getElementById('adminChartIndustry');
  if (ic) {
    const cnt = {}; data.forEach(s => { if (s.field) cnt[s.field] = (cnt[s.field] || 0) + 1; });
    const lbls = Object.keys(cnt).length ? Object.keys(cnt) : ['No Data'];
    const vals = Object.keys(cnt).length ? Object.values(cnt) : [0];
    charts.ind = new Chart(ic, {
      type: 'bar',
      data: { labels: lbls, datasets: [{ label: 'Submissions', data: vals, backgroundColor: C.purple + 'cc', borderRadius: 7, borderSkipped: false }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick, font: { family: ff, size: 9 } }, grid: { color: grid }, beginAtZero: true },
          y: { ticks: { color: tick, font: { family: ff, size: 9 } }, grid: { color: grid } }
        }
      }
    });
  }

  // State Leave EL Chart
  const lc = document.getElementById('adminChartLeave');
  if (lc) {
    // Group by state: avg total leaves given vs total required
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
            { label: 'Avg Total Leaves Given', data: givenVals, backgroundColor: C.blue + 'bb', borderRadius: 5, borderSkipped: false },
            { label: 'Total Required (Law)', data: reqVals, backgroundColor: C.gold + 'bb', borderRadius: 5, borderSkipped: false },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { color: tick, font: { family: ff, size: 10 } } } },
          scales: {
            x: { ticks: { color: tick, font: { family: ff, size: 8 } }, grid: { color: grid } },
            y: { ticks: { color: tick, font: { family: ff, size: 9 } }, grid: { color: grid }, beginAtZero: true }
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
function deleteSubmission(id) {
  if (!isAdmin) { showToast('Admin access required.','red'); return; }
  if (!confirm('Delete this submission?\n\nNote: This removes it from local view. To permanently delete from Google Sheets, remove the row there directly.')) return;
  submissions      = submissions.filter(s => s.id !== id);
  localSubmissions = localSubmissions.filter(s => s.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(localSubmissions));
  renderAdminDashboard();
  showToast('Removed from view.','gold');
}

// ===== DETAIL MODAL =====
function showDetail(id) {
  const s = submissions.find(x => x.id == id);
  if (!s) return;
  activeDetailId = id;
  renderAdminSidebar();

  const sc      = s.score || 0;
  const color   = sc >= 70 ? 'var(--green)' : sc >= 40 ? 'var(--blue)' : 'var(--red)';
  const verdict = sc >= 70 ? 'Strong compliance posture. Continue maintaining documentation and annual reviews.'
    : sc >= 40 ? 'Moderate compliance. Address highlighted gaps to avoid regulatory risk.'
    : 'Critical compliance gaps detected. Immediate corrective action required.';

  const gaps = Array.isArray(s.gaps) && s.gaps.length ? s.gaps : getGaps(s);
  const recs  = Array.isArray(s.recs) && s.recs.length ? s.recs  : getRecs(gaps);

  const yn = v => {
    if (v === 'Yes')       return '<span class="m-item-val yes">✅ Yes</span>';
    if (v === 'No')        return '<span class="m-item-val no">❌ No</span>';
    if (v === 'Partial')   return '<span class="m-item-val partial">⚖ Partial</span>';
    if (v === 'Partially') return '<span class="m-item-val partial">📄 Partially</span>';
    if (v === 'In Progress') return '<span class="m-item-val partial">🔄 In Progress</span>';
    return `<span class="m-item-val">${v||'—'}</span>`;
  };

  const lc = getLeaveComplianceStatus(s);
  const ld = lc ? lc.ld : null;

  const leaveHTML = lc ? `
    <div class="m-section">🏖 Leave Policy — State Law vs Practice (Section E)</div>
    <div class="modal-leave-compliance">
      <div class="mlc-header ${lc.hasGap ? 'gap' : 'ok'}">
        ${lc.hasGap ? '⚠️ Leave Deficit' : '✅ Compliant'} — ${lc.state} · ${ld.law}
      </div>
      <div class="m-grid">
        <div class="m-item"><div class="m-item-label">Total Leaves Given</div><div class="m-item-val">${lc.totalGiven} days</div></div>
        <div class="m-item"><div class="m-item-label">Mandatory Breakdown</div><div class="m-item-val">EL:${ld.EL} + CL:${ld.CL} + SL:${ld.SL} = ${ld.EL + ld.CL + ld.SL} days</div></div>
        <div class="m-item"><div class="m-item-label">Compliance Status</div><div class="m-item-val ${lc.hasGap ? 'no' : 'yes'}">${lc.hasGap ? '❌ '+Math.abs(lc.diff)+' days SHORT' : '✅ Compliant'}</div></div>
      </div>
    </div>` : `
    <div class="m-section">🏖 Leaves (Section E)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Leaves Given</div>${yn(s.se1)}</div>
      ${mi('Total Annual Leaves', s.se2||'—')}
      <div class="m-item"><div class="m-item-label">Aware: ESIC Sick Leave</div>${yn(s.se3)}</div>
    </div>`;

  document.getElementById('modalContent').innerHTML = `
    <div class="m-title">🏢 ${s.companyName||'Unknown Company'}</div>
    <div class="m-sub">${s.field||'—'} · ${s.state||'—'} · ${s.employees||'—'} employees · ${fmtDate(s.submittedAt)}</div>

    <div class="m-score-bar">
      <div class="m-score-num" style="color:${color}">${sc}%</div>
      <div class="m-score-info">
        <div class="m-score-label">Compliance Score — Sections A to H</div>
        <div class="m-bar"><div class="m-bar-fill" style="width:${sc}%"></div></div>
        <div class="m-verdict">${verdict}</div>
      </div>
    </div>

    <div class="m-section">📋 Business Profile</div>
    <div class="m-grid">
      ${mi('Contact', s.name)} ${mi('Phone', s.contact)} ${mi('Location', (s.location||'')+(s.state?', '+s.state:''))}
      ${mi('Est. Type', s.sa1)} <div class="m-item"><div class="m-item-label">License in Owner Name</div>${yn(s.sa2)}</div>
      ${mi('Industry', s.field)} ${mi('Employees', s.employees)}
    </div>

    <div class="m-section">💰 Bonus & Salary (Section B)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Diwali Bonus</div>${yn(s.sb1)}</div>
      <div class="m-item"><div class="m-item-label">Aware ₹21,000 Rule</div>${yn(s.sb2)}</div>
      <div class="m-item"><div class="m-item-label">Structured Salary</div>${yn(s.sb4)}</div>
      <div class="m-item"><div class="m-item-label">Timely Salary Payment</div>${yn(s.sb5)}</div>
      ${mi('Starting Salary', s.sb3 ? '₹' + Number(s.sb3).toLocaleString('en-IN') : '—')}
    </div>

    <div class="m-section">👩‍️ POSH (Section C)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Female Employees</div>${yn(s.sc1)}</div>
      <div class="m-item"><div class="m-item-label">Aware of POSH Act 2013</div>${yn(s.sc2)}</div>
      <div class="m-item"><div class="m-item-label">POSH Sessions</div>${yn(s.sc3)}</div>
      <div class="m-item"><div class="m-item-label">IC Committee Formed</div>${yn(s.sc4)}</div>
      <div class="m-item"><div class="m-item-label">Annual POSH Return</div>${yn(s.sc5)}</div>
    </div>

    <div class="m-section">🏦 Provident Fund (Section D)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">PF Monthly</div>${yn(s.sd1)}</div>
      <div class="m-item"><div class="m-item-label">PF Capped ₹15,000</div>${yn(s.sd3)}</div>
      <div class="m-item"><div class="m-item-label">PF on >₹50k/₹75k</div>${yn(s.sd2)}</div>
    </div>

    ${leaveHTML}

    <div class="m-section">🏥 ESI & Salary (Section F)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">ESI Aware ₹42,000</div>${yn(s.sf1)}</div>
      <div class="m-item"><div class="m-item-label">Salary Restructured</div>${yn(s.sf3)}</div>
    </div>

    <div class="m-section">📄 HR Policy (Section G)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">HR/Leave/Appt Updated</div>${yn(s.sg1)}</div>
    </div>

    <div class="m-section">🔍 Inspections & Assets (Section H)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Labour Inspector Issues</div>${yn(s.sh1)}</div>
      <div class="m-item"><div class="m-item-label">Pending Notices/Cases</div>${yn(s.sh2)}</div>
      <div class="m-item"><div class="m-item-label">Notice Period Issues</div>${yn(s.sh3)}</div>
      <div class="m-item"><div class="m-item-label">Issues Assets</div>${yn(s.sh4)}</div>
      <div class="m-item"><div class="m-item-label">Asset Damage/Loss</div>${yn(s.sh5)}</div>
    </div>

    ${gaps.length ? `
      <div class="m-section">⚠️ Compliance Gaps (${gaps.length})</div>
      <div class="m-gaps">${gaps.map(g=>`<div class="m-gap-item"><span class="m-gap-icon">⚠</span><span>${g}</span></div>`).join('')}</div>` : ''}

    ${recs.length ? `
      <div class="m-section">✅ Recommended Actions</div>
      <div class="m-recs">${recs.map(r=>`<div class="m-rec-item"><span class="m-rec-icon">→</span><span>${r}</span></div>`).join('')}</div>` : ''}

    <div class="m-actions">
      <button class="btn btn-gold" onclick="downloadPDF(${s.id})">⬇ Download PDF</button>
      <button class="btn btn-ghost" onclick="closeModal(true)">Close</button>
    </div>`;

  document.getElementById('modal')?.classList.add('open');
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
    'Diwali Bonus (B1)', 'Aware Bonus Rule (B2)', 'Starting Salary (B3)', 'Salary Structure (B4)', 'Timely Salary (B5)',
    'Female Employees (C1)', 'POSH Aware (C2)', 'POSH Sessions (C3)', 'IC Formed (C4)', 'POSH Return (C5)',
    'PF Monthly (D1)', 'PF >50k (D2)', 'PF Capped (D3)',
    'Leaves Given (E1)', 'Total Leaves Given', 'State EL Required', 'State CL Required', 'State SL Required', 'Total Required', 'Leave Gap',
    'ESIC Sick Leave (E3)',
    'ESI Aware (F1)', 'Salary Restructd (F3)',
    'HR Updated (G1)',
    'Labour Inspector (H1)', 'Pending Cases (H2)', 'Notice Period (H3)', 'Issues Assets (H4)', 'Asset Damage (H5)',
    'Score', 'Gaps Count', 'Gaps', 'Recommendations'
  ];
  const rows = submissions.map(s => {
    const ld = STATE_LEAVE_DATA[s.state];
    const totalGiven = parseInt(s.se2total) || 0;
    const totalReq = ld ? ld.EL + ld.CL + ld.SL : 0;
    const gap = ld ? (totalGiven - totalReq) : 0;
    return [
      s.id, s.submittedAt, s.companyName, s.name, s.contact, s.state, s.location, s.employees, s.field,
      s.sa1, s.sa2, s.sb1, s.sb2, s.sb3, s.sb4, s.sb5,
      s.sc1, s.sc2, s.sc3, s.sc4, s.sc5,
      s.sd1, s.sd2, s.sd3,
      s.se1, totalGiven,
      ld ? ld.EL : '', ld ? ld.CL : '', ld ? ld.SL : '', totalReq, gap,
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
async function downloadPDF(id) {
  const s = id ? submissions.find(x => x.id == id) : currentUserSubmission;
  if (!s) { showToast('Submission not found', 'red'); return; }

  showToast('⏳ Generating PDF…', 'blue');

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
  const pw = 210, ml = 18, mr = 18;
  let y = 0;

  const BG   = [248, 249, 251];
  const BG2  = [255, 255, 255];
  const GOLD = [184, 134, 11];
  const GREEN= [26, 138, 90];
  const RED  = [192, 57, 43];
  const BLUE = [37, 99, 235];
  const DARK = [17, 24, 39];
  const MUTED= [107, 114, 128];
  const NAV  = [14, 16, 24];

  const sc       = s.score || 0;
  const scoreCol = sc >= 70 ? GREEN : sc >= 40 ? BLUE : RED;
  const verdict  = sc >= 70 ? 'GOOD STANDING ✦' : sc >= 40 ? 'NEEDS IMPROVEMENT' : 'CRITICAL ATTENTION REQUIRED';

  const addPage = () => {
    doc.addPage();
    doc.setFillColor(...BG); doc.rect(0, 0, 210, 297, 'F');
    y = 18;
  };

  // COVER
  doc.setFillColor(...BG); doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(...NAV); doc.rect(0, 0, 210, 58, 'F');
  doc.setFillColor(...GOLD); doc.rect(0, 0, 210, 2.5, 'F');
  doc.setTextColor(...GOLD); doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
  doc.text('LABOURSHIELD  ·  PROFESSIONAL COMPLIANCE AUDIT REPORT  ·  INDIA', 105, 13, { align: 'center' });
  doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text((s.companyName || 'UNKNOWN COMPANY').toUpperCase(), 105, 27, { align: 'center' });
  doc.setTextColor(...MUTED); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`${s.field||'—'}  ·  ${s.state||'—'}  ·  ${s.employees||'—'} employees  ·  ${s.location||'—'}  ·  ${fmtDate(s.submittedAt)}`, 105, 37, { align: 'center' });
  doc.setFillColor(...scoreCol);
  doc.roundedRect(ml, 44, pw - ml - mr, 13, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(9.5); doc.setFont('helvetica', 'bold');
  doc.text(`COMPLIANCE SCORE: ${sc}%   —   ${verdict}`, 105, 52, { align: 'center' });
  y = 68;

  const sec = (title, emoji = '') => {
    if (y > 262) addPage();
    doc.setFillColor(...BG2); doc.rect(ml, y, pw - ml - mr, 9, 'F');
    doc.setFillColor(...GOLD); doc.rect(ml, y, 3.5, 9, 'F');
    doc.setTextColor(...GOLD); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text((emoji + ' ' + title).toUpperCase().trim(), ml + 7, y + 6.2);
    y += 13;
  };

  const row = (label, val, col) => {
    if (y > 270) addPage();
    doc.setTextColor(...MUTED); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(String(label), ml + 3, y);
    doc.setTextColor(...(col || DARK)); doc.setFont('helvetica', 'bold');
    const wrap = doc.splitTextToSize(String(val || '—'), 90);
    doc.text(wrap, ml + 100, y);
    y += wrap.length > 1 ? wrap.length * 5 + 1 : 6.5;
  };

  const yn2 = v => {
    if (v === 'Yes')       return { t: '✓ Yes',      c: GREEN };
    if (v === 'No')        return { t: '✗ No',       c: RED };
    if (v === 'Partial')   return { t: '~ Partial',  c: GOLD };
    if (v === 'Partially') return { t: '~ Partially',c: GOLD };
    return { t: v || '—', c: DARK };
  };

  let r;

  // PROFILE
  sec('Business Profile & Registration', '📋');
  row('Company Name', s.companyName || '—');
  row('Contact Person', s.name || '—');
  row('Phone Number', s.contact || '—');
  row('Location', (s.location || '') + (s.state ? ', ' + s.state : ''));
  row('Industry', s.field || '—');
  row('Number of Employees', s.employees || '—');
  y += 2;

  // A
  sec('Section A — Business Setup & Licensing', '🏢');
  row('Establishment Type', s.sa1 || '—');
  r = yn2(s.sa2); row('License in Name of Owner?', r.t, r.c); y += 2;

  // B
  sec('Section B — Bonus & Salary Practices', '💰');
  r = yn2(s.sb1); row('Diwali Bonus Paid to All Employees?', r.t, r.c);
  r = yn2(s.sb2); row('Aware of Rs.21,000 Bonus Wage Limit?', r.t, r.c);
  row('Starting Salary for Helpers', s.sb3 ? 'Rs.' + Number(s.sb3).toLocaleString('en-IN') : '—');
  r = yn2(s.sb4); row('Structured Salary Format in Place?', r.t, r.c);
  r = yn2(s.sb5); row('Salaries Paid On or Before 7th?', r.t, r.c); y += 2;

  // C
  sec('Section C — POSH Act 2013', '👩 ️');
  r = yn2(s.sc1); row('Female Employees Employed?', r.t, r.c);
  r = yn2(s.sc2); row('Aware of POSH Act 2013?', r.t, r.c);
  r = yn2(s.sc3); row('Periodic POSH Awareness Sessions?', r.t, r.c);
  r = yn2(s.sc4); row('Internal Committee (IC) Formed?', r.t, r.c);
  r = yn2(s.sc5); row('Annual POSH Return Filed?', r.t, r.c); y += 2;

  // D
  sec('Section D — Provident Fund (PF)', '🏦');
  r = yn2(s.sd1); row('PF Contribution on Monthly Basis?', r.t, r.c);
  r = yn2(s.sd3); row('PF Capped at Rs.15,000 Wage Ceiling?', r.t, r.c);
  r = yn2(s.sd2); row('Paying PF for Salary >Rs.50k/Rs.75k?', r.t, r.c); y += 2;

  // E — with state leave details
  sec('Section E — Leave Policy (State-Specific)', '🏖');
  const lc = getLeaveComplianceStatus(s);
  const ld = lc ? lc.ld : null;
  r = yn2(s.se1); row('Leaves Given to Employees?', r.t, r.c);
  if (ld) {
    row('Total Annual Leaves Given', `${lc.totalGiven} days`);
    row('Applicable State Law', ld.law);
    row('Mandatory Breakdown', `EL:${ld.EL} + CL:${ld.CL} + SL:${ld.SL} = ${ld.EL + ld.CL + ld.SL} days minimum`);
    row('Leave Compliance Status', lc.hasGap ? 'NON-COMPLIANT — Deficit in leave entitlement' : 'COMPLIANT — Meets state law minimum', lc.hasGap ? RED : GREEN);
    if (lc.hasGap) {
      row('Deficit', `${Math.abs(lc.diff)} days short of mandatory requirement`, RED);
    }
    row('EL Note', ld.ELNote);
  } else {
    row('Total Annual Leaves', s.se2 || '—');
  }
  r = yn2(s.se3); row('Aware: ESIC Covers Sick Leave?', r.t, r.c); y += 2;

  // F
  sec('Section F — ESI & Salary Structure', '🏥');
  r = yn2(s.sf1); row('Aware ESI Coverage up to Rs.42,000?', r.t, r.c);
  r = yn2(s.sf3); row('Salary Restructured per Labour Codes?', r.t, r.c); y += 2;

  // G
  sec('Section G — HR Policy & Documentation', '📄');
  r = yn2(s.sg1); row('HR Policy / Leave Policy / Appt Letter Updated?', r.t, r.c); y += 2;

  // H
  sec('Section H — Inspections, Legal & Asset Management', '🔍');
  r = yn2(s.sh1); row('Faced Labour Inspector Challenges?', r.t, r.c);
  r = yn2(s.sh2); row('Any Pending Notices / Cases?', r.t, r.c);
  r = yn2(s.sh3); row('Employees Leaving Without Notice?', r.t, r.c);
  r = yn2(s.sh4); row('Company Assets Issued to Employees?', r.t, r.c);
  r = yn2(s.sh5); row('Asset Damage or Loss Experienced?', r.t, r.c); y += 2;

  // GAPS
  const gaps2 = Array.isArray(s.gaps) && s.gaps.length ? s.gaps : getGaps(s);
  const recs2  = Array.isArray(s.recs) && s.recs.length ? s.recs  : getRecs(gaps2);

  if (gaps2.length) {
    sec(`Compliance Gaps Identified (${gaps2.length})`, '⚠️');
    gaps2.forEach(g => {
      if (y > 270) addPage();
      doc.setTextColor(...RED); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      const wrap = doc.splitTextToSize('!  ' + g, pw - ml - mr - 8);
      wrap.forEach(l => { doc.text(l, ml + 4, y); y += 5.5; });
    });
    y += 2;
  }

  if (recs2.length) {
    sec('Recommended Actions', '✅');
    recs2.forEach(rec => {
      if (y > 270) addPage();
      doc.setTextColor(...GREEN); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      const wrap = doc.splitTextToSize('->  ' + rec, pw - ml - mr - 8);
      wrap.forEach(l => { doc.text(l, ml + 4, y); y += 5.5; });
    });
    y += 2;
  }

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(...BG2); doc.rect(0, 284, 210, 13, 'F');
    doc.setFillColor(...GOLD); doc.rect(0, 284, 210, 0.8, 'F');
    doc.setTextColor(...MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('LabourShield — Professional Labour Law Compliance Audit Portal  ·  Sections A–H', ml, 291.5);
    doc.text(`Page ${i} of ${total}`, 210 - mr, 291.5, { align: 'right' });
  }

  const safe = (s.companyName || 'Report').replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  doc.save(`LabourShield_${safe}_Compliance_Report.pdf`);
  showToast('✅ PDF downloaded!', 'green');
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