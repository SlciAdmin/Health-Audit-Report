// ============================================================
// LABOURSHIELD — script.js  (Sections A–H, Complete)
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbwtnHj0xCiup7v6yXlcTIvpVYYHrvDufpnZln5dT3lJVL_o_be6MvKMdNY_BRjKsc9tuQ/exec";

// ===== STATE =====
let submissions        = [];
let localSubmissions   = [];
let isAdmin            = false;
let charts             = {};
let uCharts            = {};
let activeDetailId     = null;
let currentUserSubmission = null;

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'labourshield@2024';
const LS_KEY     = 'ls_submissions_v3';
const LS_LAST    = 'ls_last_submission_id_v3';
const LS_ADMIN   = 'ls_admin_session';
const LS_THEME   = 'ls_theme';

// ===== THEME =====
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(LS_THEME, theme);
  Object.keys(charts).forEach(k => { try { charts[k].destroy(); } catch(e){} });
  Object.keys(uCharts).forEach(k => { try { uCharts[k].destroy(); } catch(e){} });
  charts = {}; uCharts = {};
  if (currentUserSubmission && document.getElementById('udashReport')?.style.display !== 'none') {
    renderUserCharts(currentUserSubmission);
  }
  if (isAdmin && document.getElementById('view-admin-dashboard')?.classList.contains('active')) {
    const stateF = document.getElementById('adminStateFilter')?.value || '';
    const indF   = document.getElementById('adminIndustryFilter')?.value || '';
    const filtered = submissions.filter(s => (!stateF || s.state === stateF) && (!indF || s.field === indF));
    renderAdminCharts(filtered);
  }
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
  applyTheme(savedTheme);

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
  const colors = { green: '#1a8a5a', red: '#c0392b', gold: '#b8860b', blue: '#2563eb' };
  const darkColors = { green: '#2ecc8a', red: '#e05555', gold: '#d4a843', blue: '#4e8cff' };
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const col = isDark ? (darkColors[color] || darkColors.gold) : (colors[color] || colors.gold);
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

function getTickColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? '#7a8299' : '#6b7280';
}
function getGridColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
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

// ===== SCORE & ANALYSIS =====
// 26 scoring checks mapped to all sections A–H
function calcScore(d) {
  const checks = [
    // Section A (2)
    d.sa1 !== '',
    d.sa2 === 'Yes',
    // Section B (3)
    d.sb1 === 'Yes',
    d.sb2 === 'Yes',
    d.sb4 === 'Yes',
    // Section C (5)
    d.sc2 === 'Yes',
    d.sc3 === 'Yes',
    d.sc4 === 'Yes',
    d.sc5 === 'Yes',
    // Section D (3)
    d.sd1 === 'Yes',
    d.sd2 === 'Yes',
    d.sd3 === 'No', // NOT paying PF above 50k/75k = correct
    // Section E (2)
    d.se1 === 'Yes',
    d.se3 === 'Yes',
    // Section F (3)
    d.sf1 === 'Yes',
    d.sf2 === 'Yes' || d.sf2 === 'Partial',
    d.sf3 === 'Yes',
    // Section G (4)
    d.sg1 === 'Yes' || d.sg1 === 'Partial',
    d.sg2 === 'Yes' || d.sg2 === 'Partial',
    d.sg3 === 'Yes',
    d.sg4 === 'Yes',
    // Section H (5 — awareness flags)
    d.sh1 === 'No',  // never faced labour inspector issue = compliant
    d.sh2 === 'No',  // no pending notices = compliant
    d.sh3 === 'No',  // no notice period issues = compliant
    d.sh4 === 'Yes' && d.sh5 === 'No', // issues assets but no damage = compliant
    d.sb5 === 'Yes',
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getGaps(d) {
  const gaps = [];

  // Section A
  if (d.sa2 !== 'Yes') gaps.push('License is not in the name of the owner himself — this may create legal complications');

  // Section B
  if (d.sb1 !== 'Yes') gaps.push('Diwali / festive bonus not being paid to all employees');
  if (d.sb2 !== 'Yes') gaps.push('Unaware that statutory bonus is only for employees with wages up to ₹21,000');
  if (d.sb4 !== 'Yes') gaps.push('No structured salary format (Basic + Allowances) in place');
  if (d.sb5 !== 'Yes') gaps.push('Salaries not paid on time — must be paid on or before 7th of each month');

  // Section C
  if (d.sc2 !== 'Yes') gaps.push('Unaware of POSH Act 2013 — mandatory if female employees are employed');
  if (d.sc3 !== 'Yes') gaps.push('Periodic POSH awareness sessions not being conducted');
  if (d.sc4 !== 'Yes') gaps.push('Internal Committee (IC) under POSH Act 2013 not formed');
  if (d.sc5 !== 'Yes') gaps.push('Annual return under POSH Act 2013 not filed');

  // Section D
  if (d.sd1 !== 'Yes') gaps.push('PF contribution not being made on a monthly basis');
  if (d.sd2 !== 'Yes') gaps.push('PF contribution not capped at ₹15,000 — may result in excess liability');
  if (d.sd3 === 'Yes') gaps.push('Paying PF for employees with salary above ₹50,000/₹75,000 — review need');

  // Section E
  if (d.se1 !== 'Yes') gaps.push('Employees not receiving statutory leaves');
  if (d.se3 !== 'Yes') gaps.push('Unaware that ESIC-covered employees are not entitled for separate sick leave');

  // Section F
  if (d.sf1 !== 'Yes') gaps.push('Unaware that employees earning up to ₹42,000 are covered under ESI');
  if (d.sf2 === 'No') gaps.push('Statutory benefits (PF/ESI) not being provided to eligible employees');
  if (d.sf3 !== 'Yes') gaps.push('Salary not restructured as per the new Labour Codes');

  // Section G
  if (d.sg1 === 'No') gaps.push('HR Policy / Leave Policy / Appointment Letter not updated as per new Labour Codes');
  if (d.sg2 === 'No') gaps.push('Written HR policies and guidelines not in place');
  if (d.sg3 !== 'Yes') gaps.push('Appointment letters not issued to employees');
  if (d.sg4 !== 'Yes') gaps.push('Basic employee records not maintained (ID proof, joining details)');

  // Section H
  if (d.sh1 === 'Yes') gaps.push('Faced challenges with Labour Inspector — documentation and compliance records must be strengthened');
  if (d.sh2 === 'Yes') gaps.push('Pending Notices / Inspections / Cases require immediate legal attention');
  if (d.sh3 === 'Yes') gaps.push('Employees leaving without notice period — employment agreements need enforcement clauses');
  if (d.sh5 === 'Yes') gaps.push('Employees have damaged or left with assets without proper handover — Asset Agreement Policy required');

  return gaps;
}

function getRecs(gaps) {
  const map = {
    'License is not in the name': 'Transfer or obtain the business license in the owner\'s name immediately to avoid legal disputes',
    'Diwali / festive bonus': 'Ensure Diwali bonus payment to all eligible employees as per Payment of Bonus Act',
    'Unaware that statutory bonus': 'Verify bonus eligibility — only employees with wages up to ₹21,000 per month are eligible under the Act',
    'structured salary format': 'Restructure salary into Basic (50%) + HRA + Other Allowances for proper PF & ESI computation',
    'Salaries not paid on time': 'Implement payroll cycle — disburse salaries before 7th of every month to avoid penalties',
    'Unaware of POSH Act': 'Immediately study and implement POSH Act 2013 — mandatory for all businesses employing women',
    'POSH awareness sessions': 'Conduct POSH awareness workshop at least once a year for all employees',
    'Internal Committee': 'Constitute Internal Committee (IC) under POSH Act with at least 50% women members',
    'Annual return under POSH': 'File Annual Return under POSH Act 2013 before 31st January each year',
    'PF contribution not being made': 'Register and contribute to PF monthly — mandatory for establishments with 20+ employees',
    'PF contribution not capped': 'Cap PF contribution at ₹15,000 wage ceiling to control employer liability',
    'Paying PF for employees with salary above': 'Review whether PF is mandatory for high-salary employees — may be avoidable above ₹15,000 basic',
    'Employees not receiving statutory leaves': 'Implement statutory leave policy — Casual, Privilege, and Sick leave as per State Shops Act',
    'ESIC-covered employees': 'Educate HR — ESIC-covered employees get medical benefits via ESI scheme; separate sick leave may not apply',
    'Unaware that employees earning up to ₹42,000': 'Register under ESIC — employees earning up to ₹42,000 gross are mandatorily covered',
    'Statutory benefits (PF/ESI) not being provided': 'Enrol all eligible employees under EPFO and ESIC within 30 days of crossing threshold',
    'Salary not restructured': 'Restructure salary components as per the four new Labour Codes — Wages, Social Security, OSH, IR',
    'HR Policy / Leave Policy / Appointment Letter not updated': 'Update all HR documents to align with the four Labour Codes introduced by the Government',
    'Written HR policies': 'Draft an Employee Handbook covering attendance, leave, conduct, disciplinary and termination process',
    'Appointment letters not issued': 'Issue appointment letters to all employees within 30 days of joining with CTC and designation details',
    'Basic employee records not maintained': 'Maintain employee register with joining date, ID proof, PAN, Aadhaar, and wage records',
    'Faced challenges with Labour Inspector': 'Maintain compliance files — registers, returns, licences — ready for inspection at all times',
    'Pending Notices / Inspections': 'Immediately engage a labour law consultant to address pending notices and cases',
    'Employees leaving without notice': 'Include notice period clauses in appointment letters with recovery provision for shortfall',
    'Employees have damaged or left with assets': 'Implement an Asset Agreement policy — get employee sign-off on all company assets issued',
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
  return recs.length ? recs : ['Maintain all compliance documentation and conduct annual internal audits'];
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
    console.error('loadFromSheets error:', err);
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
  // Validate required radio groups
  const requiredRadios = ['sa1','sa2','sb1','sb2','sb4','sb5','sc1','sc2','sc3','sc4','sc5','sd1','sd2','sd3','se1','se3','sf1','sf2','sf3','sg1','sg2','sg3','sg4','sh1','sh2','sh3','sh4','sh5'];
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

  const d = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    // Profile
    name:        document.getElementById('name')?.value.trim() || '',
    contact:     document.getElementById('contact')?.value.trim() || '',
    state:       document.getElementById('state')?.value || '',
    location:    document.getElementById('location')?.value.trim() || '',
    employees:   document.getElementById('employees')?.value || '',
    companyName: document.getElementById('companyName')?.value.trim() || '',
    field:       document.getElementById('field')?.value || '',
    // Section A
    sa1: getRadio('sa1'), sa2: getRadio('sa2'),
    // Section B
    sb1: getRadio('sb1'), sb2: getRadio('sb2'),
    sb3: document.getElementById('sb3')?.value || '',
    sb4: getRadio('sb4'), sb5: getRadio('sb5'),
    // Section C
    sc1: getRadio('sc1'), sc2: getRadio('sc2'), sc3: getRadio('sc3'),
    sc4: getRadio('sc4'), sc5: getRadio('sc5'),
    // Section D
    sd1: getRadio('sd1'), sd2: getRadio('sd2'), sd3: getRadio('sd3'),
    // Section E
    se1: getRadio('se1'),
    se2: document.getElementById('se2')?.value || '',
    se3: getRadio('se3'),
    // Section F
    sf1: getRadio('sf1'), sf2: getRadio('sf2'), sf3: getRadio('sf3'),
    // Section G
    sg1: getRadio('sg1'), sg2: getRadio('sg2'), sg3: getRadio('sg3'), sg4: getRadio('sg4'),
    // Section H
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
      if (result.success) showToast('✅ Synced to cloud successfully!', 'green');
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
    console.error('submitAudit error:', err);
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
  set('udashSub', `${s.field||'—'} · ${s.state||'—'} · Submitted on ${fmtDate(s.submittedAt)}`);

  const numEl = document.getElementById('udashScoreNum');
  if (numEl) { numEl.textContent = sc + '%'; numEl.className = 'udash-score-num ' + cls; }
  set('udashVerdict', verdict);
  const barEl = document.getElementById('udashScoreBar');
  if (barEl) { barEl.style.width = '0'; setTimeout(() => barEl.style.width = sc + '%', 200); }
  set('udashScoreMeta', `${(s.gaps||[]).length} compliance gap${(s.gaps||[]).length!==1?'s':''} identified across all sections`);

  const yn = (v, id) => {
    const e = document.getElementById(id); if (!e) return;
    if (v === 'Yes')  { e.textContent='Yes ✅'; e.className='ust-val yes'; }
    else if (v === 'No') { e.textContent='No ❌'; e.className='ust-val no'; }
    else { e.textContent=v||'—'; e.className='ust-val partial'; }
  };
  yn(s.sd1,'ustPF'); yn(s.sf1,'ustESI'); yn(s.sc4,'ustPOSH');
  yn(s.se1,'ustLeave'); yn(s.sg2,'ustHR'); yn(s.sb1,'ustBonus');

  renderUserCharts(s);

  // Profile
  document.getElementById('udashProfile').innerHTML = [
    ['Company', s.companyName], ['Contact', s.name], ['Phone', s.contact],
    ['Location', (s.location||'')+(s.state?', '+s.state:'')], ['Industry', s.field],
    ['Employees', s.employees], ['Est. Type', s.sa1||'—'],
    ['License in Owner Name', s.sa2||'—'],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div><div class="m-item-val">${v||'—'}</div></div>`).join('');

  // Section B — Bonus & Salary
  document.getElementById('udashBonus').innerHTML = [
    ['Bonus on Diwali', s.sb1], ['Aware of ₹21,000 Bonus Rule', s.sb2],
    ['Structured Salary Format', s.sb4], ['Timely Salary Payment', s.sb5],
    ['Starting Salary', s.sb3 ? '₹'+s.sb3 : '—'],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section C — POSH
  document.getElementById('udashPOSH').innerHTML = [
    ['Female Employees', s.sc1], ['Aware of POSH Act 2013', s.sc2],
    ['POSH Awareness Sessions', s.sc3], ['IC Committee Formed', s.sc4],
    ['Annual POSH Return Filed', s.sc5],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section D — PF
  document.getElementById('udashPFSection').innerHTML = [
    ['PF on Monthly Basis', s.sd1], ['PF Capped at ₹15,000', s.sd2],
    ['PF on >₹50k/₹75k salary', s.sd3],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section E — Leaves
  document.getElementById('udashLeaves').innerHTML = [
    ['Leaves Given to Employees', s.se1],
    ['Average Annual Leaves', s.se2||'—'],
    ['Aware: ESIC = No Sick Leave', s.se3],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section F — ESI
  document.getElementById('udashESI').innerHTML = [
    ['Aware ESI Coverage ₹42,000', s.sf1],
    ['Statutory Benefits Provided', s.sf2],
    ['Salary Restructured per Codes', s.sf3],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section G — HR
  document.getElementById('udashHR').innerHTML = [
    ['HR/Leave/Appt Letter Updated', s.sg1],
    ['Written HR Policies', s.sg2],
    ['Appointment Letters Issued', s.sg3],
    ['Employee Records Maintained', s.sg4],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Section H — Inspection
  document.getElementById('udashInspection').innerHTML = [
    ['Faced Labour Inspector Issues', s.sh1],
    ['Pending Notices / Cases', s.sh2],
    ['Notice Period Issues', s.sh3],
    ['Issues Assets to Employees', s.sh4],
    ['Asset Damage / Loss Faced', s.sh5],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');

  // Gaps
  const gapsSection = document.getElementById('udashGapsSection');
  const gapsEl      = document.getElementById('udashGaps');
  if ((s.gaps||[]).length) {
    if (gapsSection) gapsSection.style.display = 'block';
    if (gapsEl) gapsEl.innerHTML = s.gaps.map(g => `<div class="m-gap-item"><span class="m-gap-icon">⚠</span><span>${g}</span></div>`).join('');
  } else {
    if (gapsSection) gapsSection.style.display = 'none';
  }

  // Recs
  const recsSection = document.getElementById('udashRecsSection');
  const recsEl      = document.getElementById('udashRecs');
  if ((s.recs||[]).length) {
    if (recsSection) recsSection.style.display = 'block';
    if (recsEl) recsEl.innerHTML = s.recs.map(r => `<div class="m-rec-item"><span class="m-rec-icon">→</span><span>${r}</span></div>`).join('');
  } else {
    if (recsSection) recsSection.style.display = 'none';
  }

  const pdfBtn = document.getElementById('udashPDFBtn');
  if (pdfBtn) pdfBtn.onclick = () => downloadPDF(s.id);
}

function ynHtml(v) {
  if (v === 'Yes')          return '<div class="m-item-val yes">✅ Yes</div>';
  if (v === 'No')           return '<div class="m-item-val no">❌ No</div>';
  if (v === 'Partial')      return '<div class="m-item-val partial">⚖ Partial</div>';
  if (v === 'Partially')    return '<div class="m-item-val partial">📄 Partially</div>';
  if (v === 'In Progress')  return '<div class="m-item-val partial">🔄 In Progress</div>';
  if (v === 'Not Sure')     return '<div class="m-item-val partial">🤷 Not Sure</div>';
  return `<div class="m-item-val">${v||'—'}</div>`;
}

// ===== USER CHARTS =====
function renderUserCharts(s) {
  const tick = getTickColor(), grid = getGridColor(), ff = 'Syne';
  Object.keys(uCharts).forEach(k => { try { uCharts[k].destroy(); } catch(e){} });
  uCharts = {};

  const gold   = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()   || '#d4a843';
  const green  = getComputedStyle(document.documentElement).getPropertyValue('--green').trim()  || '#2ecc8a';
  const red    = getComputedStyle(document.documentElement).getPropertyValue('--red').trim()    || '#e05555';
  const blue   = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim()   || '#4e8cff';
  const purple = getComputedStyle(document.documentElement).getPropertyValue('--purple').trim() || '#a78bfa';

  // Radar — 8 sections
  const rc = document.getElementById('uChartRadar');
  if (rc) {
    uCharts['r'] = new Chart(rc, {
      type: 'radar',
      data: {
        labels: ['Sec A\nLicensing','Sec B\nBonus/Salary','Sec C\nPOSH','Sec D\nPF','Sec E\nLeaves','Sec F\nESI','Sec G\nHR Policy','Sec H\nInspection'],
        datasets: [{
          label: 'Your Score',
          data: [
            // A: 2 checks
            ((s.sa1?50:0) + (s.sa2==='Yes'?50:0)),
            // B: 5 checks → bonus, awareness, salary struct, timely
            ((s.sb1==='Yes'?25:0)+(s.sb2==='Yes'?25:0)+(s.sb4==='Yes'?25:0)+(s.sb5==='Yes'?25:0)),
            // C: 4 checks
            ((s.sc2==='Yes'?25:0)+(s.sc3==='Yes'?25:0)+(s.sc4==='Yes'?25:0)+(s.sc5==='Yes'?25:0)),
            // D: 3 checks
            ((s.sd1==='Yes'?34:0)+(s.sd2==='Yes'?33:0)+(s.sd3==='No'?33:0)),
            // E: 2 checks
            ((s.se1==='Yes'?50:0)+(s.se3==='Yes'?50:0)),
            // F: 3 checks
            ((s.sf1==='Yes'?34:0)+(s.sf2==='Yes'?33:0)+(s.sf3==='Yes'?33:0)),
            // G: 4 checks
            ((s.sg1==='Yes'||s.sg1==='Partial'?25:0)+(s.sg2==='Yes'||s.sg2==='Partial'?25:0)+(s.sg3==='Yes'?25:0)+(s.sg4==='Yes'?25:0)),
            // H: 4 checks (no issues = compliant)
            ((s.sh1==='No'?25:0)+(s.sh2==='No'?25:0)+(s.sh3==='No'?25:0)+(s.sh5==='No'?25:0)),
          ],
          backgroundColor: gold + '26', borderColor: gold,
          pointBackgroundColor: gold, borderWidth: 2, pointRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { r: { min:0, max:100, ticks:{ color:tick, font:{family:ff,size:9}, stepSize:25, backdropColor:'transparent' },
          grid:{ color:grid }, pointLabels:{ color:tick, font:{family:ff,size:9} } } },
        plugins: { legend:{ display:false } }
      }
    });
  }

  // Doughnut — key benefits
  const dc = document.getElementById('uChartDough');
  if (dc) {
    const active = [s.sd1==='Yes', s.sf2==='Yes'||s.sf2==='Partial', s.sc4==='Yes', s.sb1==='Yes'].filter(Boolean).length;
    uCharts['d'] = new Chart(dc, {
      type: 'doughnut',
      data: {
        labels: ['PF Active','ESI/Benefits','POSH IC','Bonus Paid','Non-Compliant'],
        datasets: [{ data:[
          s.sd1==='Yes'?1:0, s.sf2==='Yes'||s.sf2==='Partial'?1:0,
          s.sc4==='Yes'?1:0, s.sb1==='Yes'?1:0, Math.max(0,4-active)
        ], backgroundColor:[green,blue,gold,purple,red+'66'], borderWidth:0, hoverOffset:10 }]
      },
      options: { responsive:true, maintainAspectRatio:false, cutout:'68%',
        plugins:{ legend:{ position:'bottom', labels:{ color:tick, font:{family:ff,size:10}, padding:8 } } } }
    });
  }

  // Bar — key metrics
  const bc = document.getElementById('uChartBar');
  if (bc) {
    const vals = [
      s.sa2==='Yes'?100:0,
      s.sb5==='Yes'?100:0,
      s.sc3==='Yes'?100:0,
      s.sd1==='Yes'?100:0,
      s.sd2==='Yes'?100:0,
      s.se1==='Yes'?100:0,
      s.sf3==='Yes'?100:0,
      s.sg1==='Yes'?100:s.sg1==='Partial'?60:0,
    ];
    uCharts['b'] = new Chart(bc, {
      type: 'bar',
      data: {
        labels:['License\n(Owner)','Timely\nSalary','POSH\nSessions','PF\nMonthly','PF\nCapped','Leaves\nGiven','Salary\nRestructd','HR Policy\nUpdated'],
        datasets:[{ label:'% Score', data:vals,
          backgroundColor: vals.map(v => v>=80?green : v>=50?gold : red),
          borderRadius:6, borderSkipped:false }]
      },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ x:{ ticks:{ color:tick, font:{family:ff,size:8} }, grid:{ color:grid } },
          y:{ ticks:{ color:tick, font:{family:ff,size:9} }, grid:{ color:grid }, beginAtZero:true, max:100 } } }
    });
  }

  // Polar — HR Governance
  const pc = document.getElementById('uChartPolar');
  if (pc) {
    uCharts['p'] = new Chart(pc, {
      type: 'polarArea',
      data: {
        labels:['POSH Awareness','IC Committee','HR Written Policy','Appt. Letters','Emp. Records'],
        datasets:[{
          data:[
            s.sc3==='Yes'?100:0, s.sc4==='Yes'?100:0,
            s.sg2==='Yes'?100:s.sg2==='Partial'?60:0,
            s.sg3==='Yes'?100:0, s.sg4==='Yes'?100:0,
          ],
          backgroundColor:[gold+'80',blue+'80',green+'80',purple+'80',green+'59'],
          borderWidth:0,
        }]
      },
      options:{ responsive:true, maintainAspectRatio:false,
        scales:{ r:{ ticks:{ color:tick, font:{family:ff,size:9}, backdropColor:'transparent' },
          grid:{ color:grid }, min:0, max:100 } },
        plugins:{ legend:{ position:'bottom', labels:{ color:tick, font:{family:ff,size:9}, padding:8 } } } }
    });
  }
}

// ===== ADMIN DASHBOARD =====
function renderAdminDashboard() {
  if (!isAdmin) return;
  populateAdminFilters();
  const stateF = document.getElementById('adminStateFilter')?.value || '';
  const indF   = document.getElementById('adminIndustryFilter')?.value || '';
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
  const q = (document.getElementById('adminSideSearch')?.value||'').toLowerCase();
  const list = document.getElementById('adminSidebarList');
  const countEl = document.getElementById('adminSidebarCount');
  if (countEl) countEl.textContent = submissions.length;
  if (!list) return;
  const filtered = submissions.filter(s =>
    (s.companyName||'').toLowerCase().includes(q) ||
    (s.name||'').toLowerCase().includes(q) ||
    (s.state||'').toLowerCase().includes(q)
  );
  if (!filtered.length) { list.innerHTML='<div class="sidebar-empty">No results found.</div>'; return; }
  list.innerHTML = filtered.map(s => {
    const sc=s.score||0, cls=sc>=70?'good':sc>=40?'mid':'low';
    return `<div class="sidebar-card ${activeDetailId===s.id?'active':''}" onclick="showDetail(${s.id})">
      <div class="sc-name">${s.companyName||'Unknown'}</div>
      <div class="sc-meta"><span>${s.state||'—'} · ${fmtDate(s.submittedAt,true)}</span><span class="sc-score ${cls}">${sc}%</span></div>
    </div>`;
  }).join('');
}

function renderAdminCharts(data) {
  const tick = getTickColor(), grid = getGridColor(), ff = 'Syne';
  Object.keys(charts).forEach(k => { try { charts[k].destroy(); } catch(e){} });
  charts = {};
  if (!data.length) return;

  const gold   = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
  const green  = getComputedStyle(document.documentElement).getPropertyValue('--green').trim();
  const red    = getComputedStyle(document.documentElement).getPropertyValue('--red').trim();
  const blue   = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim();
  const purple = getComputedStyle(document.documentElement).getPropertyValue('--purple').trim();

  const pct = (fn) => data.length ? Math.round(fn(data)/data.length*100) : 0;

  // Main compliance bar
  const bc = document.getElementById('adminChartBar');
  if (bc) {
    charts['bar'] = new Chart(bc, {
      type:'bar',
      data:{
        labels:['Owner\nLicense','Diwali\nBonus','POSH\nIC','POSH\nSessions','PF\nMonthly','PF\nCapped','Leaves\nGiven','ESI\nAware','HR\nUpdated','Appt\nLetter'],
        datasets:[{ label:'% Compliant',
          data:[
            pct(d=>d.filter(s=>s.sa2==='Yes').length),
            pct(d=>d.filter(s=>s.sb1==='Yes').length),
            pct(d=>d.filter(s=>s.sc4==='Yes').length),
            pct(d=>d.filter(s=>s.sc3==='Yes').length),
            pct(d=>d.filter(s=>s.sd1==='Yes').length),
            pct(d=>d.filter(s=>s.sd2==='Yes').length),
            pct(d=>d.filter(s=>s.se1==='Yes').length),
            pct(d=>d.filter(s=>s.sf1==='Yes').length),
            pct(d=>d.filter(s=>s.sg1==='Yes'||s.sg1==='Partial').length),
            pct(d=>d.filter(s=>s.sg3==='Yes').length),
          ],
          backgroundColor:[gold,green,blue,purple,green,gold,blue,red,green,gold],
          borderRadius:6, borderSkipped:false }]
      },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ x:{ ticks:{ color:tick, font:{family:ff,size:8} }, grid:{ color:grid } },
          y:{ ticks:{ color:tick, font:{family:ff,size:9} }, grid:{ color:grid }, beginAtZero:true, max:100 } } }
    });
  }

  // Establishment type doughnut
  const dc = document.getElementById('adminChartDough');
  if (dc) {
    const cnt={}; data.forEach(s=>{ if(s.sa1) cnt[s.sa1]=(cnt[s.sa1]||0)+1; });
    const lbls=Object.keys(cnt).length?Object.keys(cnt):['No Data'];
    const vals=Object.keys(cnt).length?Object.values(cnt):[1];
    charts['dough'] = new Chart(dc, {
      type:'doughnut',
      data:{ labels:lbls, datasets:[{ data:vals, backgroundColor:[gold,green,blue,purple,red], borderWidth:0, hoverOffset:10 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'68%',
        plugins:{ legend:{ position:'bottom', labels:{ color:tick, font:{family:ff,size:11}, padding:10 } } } }
    });
  }

  // Employee size bar
  const ec = document.getElementById('adminChartEmp');
  if (ec) {
    const sizes=['1–10','11–20','21–50','51–100','101–150','151–200','201–300','301–400','401–500','500+'];
    const cnt={}; sizes.forEach(s=>cnt[s]=0); data.forEach(s=>{ if(s.employees) cnt[s.employees]=(cnt[s.employees]||0)+1; });
    charts['emp'] = new Chart(ec, {
      type:'bar',
      data:{ labels:sizes, datasets:[{ label:'Companies', data:sizes.map(s=>cnt[s]), backgroundColor:blue, borderRadius:6, borderSkipped:false }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } },
        scales:{ x:{ ticks:{ color:tick, font:{family:ff,size:9} }, grid:{ color:grid } },
          y:{ ticks:{ color:tick, font:{family:ff,size:9} }, grid:{ color:grid }, beginAtZero:true } } }
    });
  }

  // HR pie
  const pieC = document.getElementById('adminChartPie');
  if (pieC) {
    charts['pie'] = new Chart(pieC, {
      type:'pie',
      data:{
        labels:['HR Policy Updated','POSH IC Formed','Appt Letters Issued','Emp Records Maintained'],
        datasets:[{ data:[
          pct(d=>d.filter(s=>s.sg1==='Yes').length),
          pct(d=>d.filter(s=>s.sc4==='Yes').length),
          pct(d=>d.filter(s=>s.sg3==='Yes').length),
          pct(d=>d.filter(s=>s.sg4==='Yes').length),
        ], backgroundColor:[green,blue,gold,purple], borderWidth:0, hoverOffset:8 }]
      },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ color:tick, font:{family:ff,size:11}, padding:10 } } } }
    });
  }

  // Score distribution
  const sc = document.getElementById('adminChartScore');
  if (sc) {
    const ranges={'0–20%':0,'21–40%':0,'41–60%':0,'61–80%':0,'81–100%':0};
    data.forEach(s=>{
      const v=s.score||0;
      if(v<=20) ranges['0–20%']++;
      else if(v<=40) ranges['21–40%']++;
      else if(v<=60) ranges['41–60%']++;
      else if(v<=80) ranges['61–80%']++;
      else ranges['81–100%']++;
    });
    charts['score'] = new Chart(sc, {
      type:'bar',
      data:{ labels:Object.keys(ranges), datasets:[{ label:'Companies', data:Object.values(ranges),
        backgroundColor:[red,red,gold,green,green], borderRadius:6, borderSkipped:false }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } },
        scales:{ x:{ ticks:{ color:tick, font:{family:ff,size:10} }, grid:{ color:grid } },
          y:{ ticks:{ color:tick, font:{family:ff,size:10} }, grid:{ color:grid }, beginAtZero:true } } }
    });
  }

  // Industry bar
  const ic = document.getElementById('adminChartIndustry');
  if (ic) {
    const cnt={}; data.forEach(s=>{ if(s.field) cnt[s.field]=(cnt[s.field]||0)+1; });
    const lbls=Object.keys(cnt).length?Object.keys(cnt):['No Data'];
    const vals=Object.keys(cnt).length?Object.values(cnt):[0];
    charts['ind'] = new Chart(ic, {
      type:'bar',
      data:{ labels:lbls, datasets:[{ label:'Submissions', data:vals, backgroundColor:purple, borderRadius:6, borderSkipped:false }] },
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } },
        scales:{ x:{ ticks:{ color:tick, font:{family:ff,size:9} }, grid:{ color:grid }, beginAtZero:true },
          y:{ ticks:{ color:tick, font:{family:ff,size:9} }, grid:{ color:grid } } } }
    });
  }
}

function renderAdminTable() {
  const tbody = document.getElementById('adminTblBody');
  if (!tbody) return;
  const stateF = document.getElementById('adminStateFilter')?.value || '';
  const indF   = document.getElementById('adminIndustryFilter')?.value || '';
  const q      = (document.getElementById('adminTblSearch')?.value || '').toLowerCase();
  const filtered = submissions
    .filter(s => !stateF || s.state === stateF)
    .filter(s => !indF   || s.field === indF)
    .filter(s => (s.companyName||'').toLowerCase().includes(q) || (s.name||'').toLowerCase().includes(q));

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-td">No submissions found.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((s, i) => {
    const sc=s.score||0, cls=sc>=70?'good':sc>=40?'mid':'low';
    const gl=(s.gaps||[]).length, gc=gl>5?'low':gl>2?'mid':'good';
    return `<tr>
      <td style="color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:0.75rem">${String(i+1).padStart(2,'0')}</td>
      <td>
        <div style="font-weight:700;color:var(--white);font-size:0.85rem">${s.companyName||'Unknown'}</div>
        <div style="font-size:0.72rem;color:var(--text2)">${s.field||'—'}</div>
      </td>
      <td>
        <div style="font-size:0.82rem">${s.name||'—'}</div>
        <div style="font-size:0.7rem;color:var(--text2)">${s.contact||'—'}</div>
      </td>
      <td style="white-space:nowrap">${s.state||'—'}</td>
      <td style="font-size:0.78rem;white-space:nowrap">${s.field||'—'}</td>
      <td><span class="badge info">${s.employees||'—'}</span></td>
      <td style="font-size:0.8rem;white-space:nowrap">${s.sa1||'—'}</td>
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

  const sc = s.score||0;
  const color = sc>=70?'var(--green)':sc>=40?'var(--blue)':'var(--red)';
  const verdict = sc>=70?'Strong compliance posture. Continue maintaining documentation and annual reviews.'
    : sc>=40?'Moderate compliance. Address highlighted gaps to avoid regulatory risk.'
    : 'Critical compliance gaps detected. Immediate corrective action required.';

  const gaps = Array.isArray(s.gaps) && s.gaps.length ? s.gaps : getGaps(s);
  const recs  = Array.isArray(s.recs) && s.recs.length ? s.recs  : getRecs(gaps);

  const yn = v => {
    if (v==='Yes')     return '<span class="m-item-val yes">✅ Yes</span>';
    if (v==='No')      return '<span class="m-item-val no">❌ No</span>';
    if (v==='Partial') return '<span class="m-item-val partial">⚖ Partial</span>';
    if (v==='Partially') return '<span class="m-item-val partial">📄 Partially</span>';
    if (v==='In Progress') return '<span class="m-item-val partial">🔄 In Progress</span>';
    return `<span class="m-item-val">${v||'—'}</span>`;
  };

  document.getElementById('modalContent').innerHTML = `
    <div class="m-title">🏢 ${s.companyName||'Unknown Company'}</div>
    <div class="m-sub">${s.field||'—'} · ${s.state||'—'} · ${s.employees||'—'} employees · ${fmtDate(s.submittedAt)}</div>
    <div class="m-score-bar">
      <div class="m-score-num" style="color:${color}">${sc}%</div>
      <div class="m-score-info">
        <div class="m-score-label">Compliance Score</div>
        <div class="m-bar"><div class="m-bar-fill" style="width:${sc}%"></div></div>
        <div class="m-verdict">${verdict}</div>
      </div>
    </div>

    <div class="m-section">📋 Business Profile</div>
    <div class="m-grid">
      ${mi('Contact',s.name)} ${mi('Phone',s.contact)} ${mi('Location',(s.location||'')+(s.state?', '+s.state:''))}
      ${mi('Est. Type',s.sa1)} <div class="m-item"><div class="m-item-label">License in Owner Name</div>${yn(s.sa2)}</div>
      ${mi('Industry',s.field)} ${mi('Employees',s.employees)}
    </div>

    <div class="m-section">💰 Bonus & Salary (Section B)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Diwali Bonus</div>${yn(s.sb1)}</div>
      <div class="m-item"><div class="m-item-label">Aware ₹21,000 Bonus Rule</div>${yn(s.sb2)}</div>
      <div class="m-item"><div class="m-item-label">Structured Salary</div>${yn(s.sb4)}</div>
      <div class="m-item"><div class="m-item-label">Timely Salary Payment</div>${yn(s.sb5)}</div>
      ${mi('Starting Salary', s.sb3?'₹'+s.sb3:'—')}
    </div>

    <div class="m-section">👩‍⚖️ POSH (Section C)</div>
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
      <div class="m-item"><div class="m-item-label">PF Capped ₹15,000</div>${yn(s.sd2)}</div>
      <div class="m-item"><div class="m-item-label">PF on >₹50k/₹75k</div>${yn(s.sd3)}</div>
    </div>

    <div class="m-section">🏖 Leaves (Section E)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Leaves Given</div>${yn(s.se1)}</div>
      ${mi('Average Annual Leaves', s.se2||'—')}
      <div class="m-item"><div class="m-item-label">ESIC = No Sick Leave</div>${yn(s.se3)}</div>
    </div>

    <div class="m-section">🏥 ESI & Salary Structure (Section F)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">ESI Aware ₹42,000</div>${yn(s.sf1)}</div>
      <div class="m-item"><div class="m-item-label">Statutory Benefits</div>${yn(s.sf2)}</div>
      <div class="m-item"><div class="m-item-label">Salary Restructured</div>${yn(s.sf3)}</div>
    </div>

    <div class="m-section">📄 HR Policy (Section G)</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">HR/Leave/Appt Updated</div>${yn(s.sg1)}</div>
      <div class="m-item"><div class="m-item-label">Written HR Policies</div>${yn(s.sg2)}</div>
      <div class="m-item"><div class="m-item-label">Appointment Letters</div>${yn(s.sg3)}</div>
      <div class="m-item"><div class="m-item-label">Emp. Records</div>${yn(s.sg4)}</div>
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

// ===== PDF DOWNLOAD =====
async function downloadPDF(id) {
  const s = id ? submissions.find(x => x.id == id) : currentUserSubmission;
  if (!s) { showToast('Submission not found','red'); return; }

  if (!window.jspdf?.jsPDF) {
    showToast('Loading PDF generator…','blue');
    await new Promise((res,rej) => {
      const el = document.createElement('script');
      el.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      el.onload = res; el.onerror = rej;
      document.head.appendChild(el);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format:'a4', unit:'mm' });
  const pw=210, ml=18, mr=18;
  let y=0;

  const BG=[248,249,250],BG2=[255,255,255],GOLD=[184,134,11],GREEN=[26,138,90],
        RED=[192,57,43],BLUE=[37,99,235],DARK=[17,24,39],MUTED=[107,114,128];
  const sc = s.score||0;
  const scoreCol = sc>=70?GREEN:sc>=40?BLUE:RED;
  const verdict  = sc>=70?'GOOD STANDING':sc>=40?'NEEDS IMPROVEMENT':'CRITICAL ATTENTION';

  const addPage = () => {
    doc.addPage();
    doc.setFillColor(...BG); doc.rect(0,0,210,297,'F');
    y = 18;
  };

  // Cover header
  doc.setFillColor(...BG);  doc.rect(0,0,210,297,'F');
  doc.setFillColor(...DARK); doc.rect(0,0,210,56,'F');
  doc.setFillColor(...GOLD); doc.rect(0,0,210,2,'F');

  doc.setTextColor(...GOLD); doc.setFontSize(7); doc.setFont('helvetica','bold');
  doc.text('LABOURSHIELD  ·  COMPLIANCE AUDIT REPORT  ·  SECTIONS A–H',105,14,{align:'center'});
  doc.setTextColor(255,255,255); doc.setFontSize(18);
  doc.text((s.companyName||'UNKNOWN').toUpperCase(),105,27,{align:'center'});
  doc.setTextColor(...MUTED); doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text(`${s.field||'—'}  ·  ${s.state||'—'}  ·  ${s.employees||'—'} employees  ·  ${fmtDate(s.submittedAt)}`,105,36,{align:'center'});

  doc.setFillColor(...scoreCol);
  doc.roundedRect(ml,44,pw-ml-mr,12,2,2,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text(`COMPLIANCE SCORE:  ${sc}%   —   ${verdict}`,105,51.5,{align:'center'});
  y = 65;

  const sec = (title) => {
    if (y>265) addPage();
    doc.setFillColor(...BG2); doc.rect(ml,y,pw-ml-mr,8,'F');
    doc.setFillColor(...GOLD); doc.rect(ml,y,3,8,'F');
    doc.setTextColor(...GOLD); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
    doc.text(title.toUpperCase(),ml+6,y+5.5); y+=12;
  };

  const row = (label, val, col) => {
    if (y>270) addPage();
    doc.setTextColor(...MUTED); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(String(label),ml+2,y);
    doc.setTextColor(...(col||DARK)); doc.setFont('helvetica','bold');
    doc.text(String(val||'—'),ml+100,y); y+=6.5;
  };

  const yn2 = v => {
    if (v==='Yes')     return { t:'Yes',     c:GREEN };
    if (v==='No')      return { t:'No',      c:RED };
    if (v==='Partial') return { t:'Partial', c:GOLD };
    if (v==='Partially') return { t:'Partially', c:GOLD };
    return { t:v||'—', c:DARK };
  };

  let r;

  sec('Section A — Business Setup & Licensing');
  row('Establishment Type', s.sa1||'—');
  r=yn2(s.sa2); row('License in Owner Name?', r.t, r.c); y+=2;

  sec('Section B — Bonus & Salary Practices');
  r=yn2(s.sb1); row('Diwali Bonus to All Employees?', r.t, r.c);
  r=yn2(s.sb2); row('Aware of ₹21,000 Bonus Rule?', r.t, r.c);
  row('Starting Salary', s.sb3?'₹'+s.sb3:'—');
  r=yn2(s.sb4); row('Structured Salary Format?', r.t, r.c);
  r=yn2(s.sb5); row('Salaries Paid On Time?', r.t, r.c); y+=2;

  sec('Section C — POSH & Female Employment');
  r=yn2(s.sc1); row('Female Employees?', r.t, r.c);
  r=yn2(s.sc2); row('Aware of POSH Act 2013?', r.t, r.c);
  r=yn2(s.sc3); row('POSH Awareness Sessions?', r.t, r.c);
  r=yn2(s.sc4); row('IC Committee Formed?', r.t, r.c);
  r=yn2(s.sc5); row('Annual POSH Return Filed?', r.t, r.c); y+=2;

  sec('Section D — Provident Fund (PF)');
  r=yn2(s.sd1); row('PF Contribution Monthly?', r.t, r.c);
  r=yn2(s.sd2); row('PF Capped at ₹15,000?', r.t, r.c);
  r=yn2(s.sd3); row('Paying PF on Salary >₹50k/₹75k?', r.t, r.c); y+=2;

  sec('Section E — Leave Policy');
  r=yn2(s.se1); row('Leaves Given to Employees?', r.t, r.c);
  row('Average Annual Leaves', s.se2||'—');
  r=yn2(s.se3); row('Aware: ESIC = No Sick Leave?', r.t, r.c); y+=2;

  sec('Section F — ESI & Salary Structure');
  r=yn2(s.sf1); row('Aware ESI Coverage ₹42,000?', r.t, r.c);
  r=yn2(s.sf2); row('Statutory Benefits Provided?', r.t, r.c);
  r=yn2(s.sf3); row('Salary Restructured per Labour Codes?', r.t, r.c); y+=2;

  sec('Section G — HR Policy & Documentation');
  r=yn2(s.sg1); row('HR/Leave/Appt Letter Updated?', r.t, r.c);
  r=yn2(s.sg2); row('Written HR Policies in Place?', r.t, r.c);
  r=yn2(s.sg3); row('Appointment Letters Issued?', r.t, r.c);
  r=yn2(s.sg4); row('Employee Records Maintained?', r.t, r.c); y+=2;

  sec('Section H — Inspections, Legal & Assets');
  r=yn2(s.sh1); row('Faced Labour Inspector Challenges?', r.t, r.c);
  r=yn2(s.sh2); row('Pending Notices / Cases?', r.t, r.c);
  r=yn2(s.sh3); row('Notice Period Issues?', r.t, r.c);
  r=yn2(s.sh4); row('Issues Assets to Employees?', r.t, r.c);
  r=yn2(s.sh5); row('Asset Damage / Loss Faced?', r.t, r.c); y+=2;

  const gaps2 = Array.isArray(s.gaps)&&s.gaps.length ? s.gaps : getGaps(s);
  const recs2  = Array.isArray(s.recs)&&s.recs.length ? s.recs  : getRecs(gaps2);

  if (gaps2.length) {
    sec(`Compliance Gaps Identified (${gaps2.length})`);
    gaps2.forEach(g => {
      if (y>270) addPage();
      doc.setTextColor(...RED); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.splitTextToSize('⚠  '+g, pw-ml-mr-8).forEach(l=>{ doc.text(l,ml+4,y); y+=5.5; });
    }); y+=2;
  }

  if (recs2.length) {
    sec('Recommended Actions');
    recs2.forEach(rec => {
      if (y>270) addPage();
      doc.setTextColor(...GREEN); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.splitTextToSize('→  '+rec, pw-ml-mr-8).forEach(l=>{ doc.text(l,ml+4,y); y+=5.5; });
    }); y+=2;
  }

  const total = doc.getNumberOfPages();
  for (let i=1; i<=total; i++) {
    doc.setPage(i);
    doc.setFillColor(...BG2); doc.rect(0,285,210,12,'F');
    doc.setFillColor(...GOLD); doc.rect(0,285,210,0.8,'F');
    doc.setTextColor(...MUTED); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text('LabourShield · Business Compliance Audit Portal · Sections A–H',ml,292);
    doc.text(`Page ${i} of ${total}`,210-mr,292,{align:'right'});
  }

  const safe = (s.companyName||'Report').replace(/[^a-z0-9]/gi,'_').substring(0,30);
  doc.save(`LabourShield_${safe}_Report.pdf`);
  showToast('✅ PDF downloaded!','green');
}

// ===== HELPERS =====
function fmtDate(iso, short=false) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (short) return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    return d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  } catch(e) { return iso; }
}

function toggleSidebar() {
  document.getElementById('adminSidebar')?.classList.toggle('open');
}