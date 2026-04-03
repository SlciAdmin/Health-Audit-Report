// ============================================================
// LABOURSHIELD — script.js
// Light/Dark Mode + Full Responsive + Google Sheets Integration
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbwyKhpfBAWRxo1qWWFrPKqN2ThJoY9QG6XSuSZ-fot5vPHkNhMZSVGJ4I5RZqOjag/exec";

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
const LS_KEY     = 'ls_submissions_v2';
const LS_LAST    = 'ls_last_submission_id';
const LS_ADMIN   = 'ls_admin_session';
const LS_THEME   = 'ls_theme';

// ===== THEME =====
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(LS_THEME, theme);
  // Destroy and re-render charts on theme change (colors change)
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
  const navCenter   = document.getElementById('navCenter');
  const hamburger   = document.getElementById('hamburgerBtn');
  const overlay     = document.getElementById('mobileNavOverlay');
  const isOpen      = navCenter.classList.contains('mobile-open');
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
  // Apply saved theme (default: light)
  const savedTheme = localStorage.getItem(LS_THEME) || 'light';
  applyTheme(savedTheme);

  // Load local cache
  try { localSubmissions = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e) { localSubmissions = []; }
  submissions = [...localSubmissions];
  updateNavBadge();

  // Restore admin session
  if (localStorage.getItem(LS_ADMIN) === 'true') {
    isAdmin = true;
    showAdminUI();
  }

  // Restore last user submission
  const lastId = localStorage.getItem(LS_LAST);
  if (lastId) {
    currentUserSubmission = localSubmissions.find(s => String(s.id) === lastId) || null;
  }

  // Q20 toggle Q21
  document.body.addEventListener('change', e => {
    if (e.target.name === 'q20') {
      const box = document.getElementById('q21box');
      if (!box) return;
      if (e.target.value === 'Yes') {
        box.style.display = 'block';
      } else {
        box.style.display = 'none';
        document.querySelectorAll('input[name="q21"]').forEach(c => c.checked = false);
      }
    }
  });

  // Fetch from Sheets
  await loadFromSheets(false);

  if (window.location.hash === '#dashboard' && currentUserSubmission) {
    showView('user-dashboard');
  }
});

// Refresh when tab becomes visible (admin)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isAdmin) loadFromSheets(true);
});

// ===== UTILITIES =====
function updateNavBadge() {
  // Badge hidden on mobile, shown in admin only
  const n = submissions.length;
  // We no longer show a badge in nav for the user side
}

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
function getCbx(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(e => e.value);
}

// Chart tick colour based on theme
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
function calcScore(d) {
  const checks = [
    d.q1 !== '',
    d.q2 !== '' && d.q2 !== 'Not Yet Taken',
    d.q3 === 'Yes',
    d.q4 === 'Yes',
    d.q6 === 'Yes',
    d.q7 === 'Yes',
    d.q8 === 'Yes' || d.q8 === 'Partial',
    d.q9 === 'Yes',
    d.q10 === 'Yes',
    d.q11 === 'Yes',
    d.q13 === 'Yes',
    d.q14 !== 'No',
    d.q15 === 'Yes',
    d.q16 === 'Yes',
    d.q17 === 'Yes' || d.q17 === 'Partial',
    d.q18 === 'Yes' || d.q18 === 'Occasionally',
    (d.q20 === 'Yes' && Array.isArray(d.q21) && d.q21.length > 0 && !d.q21.includes('Not Sure')),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getGaps(d) {
  const gaps = [];
  if (d.q2 === 'Not Yet Taken' || d.q2 === '') gaps.push('No valid business license obtained');
  if (d.q3 !== 'Yes') gaps.push('Employee records not properly maintained');
  if (d.q4 !== 'Yes') gaps.push('Appointment letters not issued to employees');
  if (d.q6 !== 'Yes') gaps.push('No structured salary format (Basic + Allowances)');
  if (d.q7 !== 'Yes') gaps.push('Salaries not paid on time (before 7th of month)');
  if (d.q8 === 'No') gaps.push('No statutory benefits (PF/ESI) being provided');
  if (d.q9 !== 'Yes') gaps.push('No retirement/PF savings scheme in place');
  if (d.q10 === 'Not Yet') gaps.push('No medical/ESI coverage for employees');
  if (d.q11 !== 'Yes') gaps.push('Employees not granted statutory leave');
  if (d.q13 !== 'Yes') gaps.push('No statutory/festive bonus provided');
  if (d.q14 === 'No') gaps.push('No complaint/grievance system exists');
  if (d.q15 !== 'Yes') gaps.push('POSH awareness sessions not conducted');
  if (d.q16 !== 'Yes') gaps.push('No Internal Committee (ICC) constituted under POSH');
  if (d.q17 === 'No') gaps.push('Written HR policies not in place');
  return gaps;
}

function getRecs(gaps) {
  const map = {
    'No valid business license': 'Obtain Factory License or Shops & Establishment License immediately',
    'Employee records': 'Start maintaining employee register with joining date, ID proof, wage records',
    'Appointment letters': 'Issue appointment letters with CTC, designation and terms within 30 days of joining',
    'structured salary': 'Restructure salary into Basic (50%) + HRA + Allowances to reduce PF liability',
    'Salaries not paid': 'Implement payroll cycle to ensure salary disbursement before 7th of each month',
    'statutory benefits': 'Register under EPFO and ESIC immediately if employee count exceeds threshold',
    'retirement/PF': 'Enrol all eligible employees (₹15,000 wage) under PF within 30 days',
    'medical/ESI': 'Register under ESIC for employees earning below ₹21,000/month',
    'statutory leave': 'Define and communicate leave policy (CL/PL/SL) as per state Shops Act',
    'bonus': 'Pay statutory bonus (8.33% to 20% of wages) under Payment of Bonus Act',
    'complaint': 'Establish a formal HR grievance mechanism with escalation matrix',
    'POSH awareness': 'Conduct POSH awareness workshop for all employees annually',
    'Internal Committee': 'Constitute ICC with at least 50% women members as mandated by POSH Act',
    'HR policies': 'Draft Employee Handbook covering attendance, leave, code of conduct, disciplinary process',
  };
  const recs = [];
  gaps.forEach(g => {
    for (const [k, v] of Object.entries(map)) {
      if (g.toLowerCase().includes(k.toLowerCase())) { recs.push(v); break; }
    }
  });
  return recs.length ? recs : ['Maintain documentation standards and conduct annual compliance audits'];
}

// ===== GOOGLE SHEETS API =====
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
    return { success: false, error: err.message };
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
  if (typeof out.q21 === 'string') out.q21 = out.q21 ? out.q21.split(',').map(s=>s.trim()).filter(Boolean) : [];
  else if (!Array.isArray(out.q21)) out.q21 = [];
  if (typeof out.gaps === 'string') out.gaps = out.gaps ? out.gaps.split('|').map(s=>s.trim()).filter(Boolean) : [];
  else if (!Array.isArray(out.gaps)) out.gaps = [];
  if (typeof out.recs === 'string') out.recs = out.recs ? out.recs.split('|').map(s=>s.trim()).filter(Boolean) : [];
  else if (!Array.isArray(out.recs)) out.recs = [];
  if (typeof out.score === 'string') out.score = parseInt(out.score) || 0;
  return out;
}

// ===== FORM SUBMISSION =====
async function submitAudit() {
  const required = ['q1','q2','q3','q4','q6','q7','q8','q9','q10','q11','q13','q14','q15','q16','q17','q18','q19','q20'];
  let missingQ = null;
  for (const n of required) {
    if (!getRadio(n)) { missingQ = n; break; }
  }
  if (missingQ) {
    showToast(`Please answer question ${missingQ.replace('q','')}`, 'red');
    const el = document.querySelector(`input[name="${missingQ}"]`);
    if (el) el.closest('.qblock')?.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }

  const d = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    name:        document.getElementById('name')?.value.trim() || '',
    contact:     document.getElementById('contact')?.value.trim() || '',
    state:       document.getElementById('state')?.value || '',
    location:    document.getElementById('location')?.value.trim() || '',
    employees:   document.getElementById('employees')?.value || '',
    companyName: document.getElementById('companyName')?.value.trim() || '',
    field:       document.getElementById('field')?.value || '',
    q1: getRadio('q1'), q2: getRadio('q2'), q3: getRadio('q3'), q4: getRadio('q4'),
    q5: document.getElementById('q5')?.value || '',
    q6: getRadio('q6'), q7: getRadio('q7'), q8: getRadio('q8'),
    q9: getRadio('q9'), q10: getRadio('q10'),
    q11: getRadio('q11'), q12: document.getElementById('q12')?.value || '',
    q13: getRadio('q13'), q14: getRadio('q14'),
    q15: getRadio('q15'), q16: getRadio('q16'),
    q17: getRadio('q17'), q18: getRadio('q18'),
    q19: getRadio('q19'), q20: getRadio('q20'),
    q21: getCbx('q21'),
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
  document.getElementById('q21box').style.display = 'none';
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
  set('udashScoreMeta', `${(s.gaps||[]).length} compliance gap${(s.gaps||[]).length!==1?'s':''} identified out of 17 checks`);

  const yn = (v, id) => {
    const e = document.getElementById(id); if (!e) return;
    if (v === 'Yes')  { e.textContent='Yes ✅'; e.className='ust-val yes'; }
    else if (v === 'No') { e.textContent='No ❌'; e.className='ust-val no'; }
    else { e.textContent=v||'—'; e.className='ust-val partial'; }
  };
  yn(s.q9,'ustPF'); yn(s.q10,'ustESI'); yn(s.q15,'ustPOSH');
  yn(s.q11,'ustLeave'); yn(s.q17,'ustHR'); yn(s.q13,'ustBonus');

  renderUserCharts(s);

  function makeGrid(containerId, rows) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = rows.map(([l,v]) =>
      `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`
    ).join('');
  }

  document.getElementById('udashProfile').innerHTML = [
    ['Company', s.companyName], ['Contact', s.name], ['Phone', s.contact],
    ['Location', (s.location||'')+(s.state?', '+s.state:'')], ['Industry', s.field],
    ['Employees', s.employees], ['Est. Type', s.q1||'—'],
    ['License', s.q2||'—'], ['Starting Salary', s.q5?'₹'+s.q5:'—'],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div><div class="m-item-val">${v||'—'}</div></div>`).join('');

  makeGrid('udashEmployeeSalary', [
    ['Emp Records',s.q3],['Appt Letters',s.q4],['Structured Salary',s.q6],
    ['Timely Payment',s.q7],['Statutory Benefits',s.q8],['Leave Policy',s.q11],
  ]);
  makeGrid('udashBenefits', [
    ['PF / Savings',s.q9],['ESI / Medical',s.q10],['Bonus Paid',s.q13],
    ['Leaves/Year',s.q12||'—'],['Grievance System',s.q14],['Policy Reviews',s.q18],
  ]);
  makeGrid('udashPOSH', [
    ['POSH Sessions',s.q15],['ICC Constituted',s.q16],['Written HR Policy',s.q17],
  ]);

  let legalHtml = [
    ['Labour Law Awareness',s.q20],['Detailed Report',s.q19],
  ].map(([l,v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');
  if (s.q21?.length) {
    legalHtml += `<div class="m-item" style="grid-column:1/-1"><div class="m-item-label">Labour Laws Filed Under</div><div class="m-laws" style="margin-top:0.4rem">${s.q21.map(l=>`<div class="m-law-item">✦ ${l}</div>`).join('')}</div></div>`;
  }
  document.getElementById('udashLegal').innerHTML = legalHtml;

  const gapsSection = document.getElementById('udashGapsSection');
  const gapsEl      = document.getElementById('udashGaps');
  if ((s.gaps||[]).length) {
    if (gapsSection) gapsSection.style.display = 'block';
    if (gapsEl) gapsEl.innerHTML = s.gaps.map(g => `<div class="m-gap-item"><span class="m-gap-icon">⚠</span><span>${g}</span></div>`).join('');
  } else {
    if (gapsSection) gapsSection.style.display = 'none';
  }

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
  if (v === 'In Progress')  return '<div class="m-item-val partial">🔄 In Progress</div>';
  if (v === 'Occasionally') return '<div class="m-item-val partial">🔁 Sometimes</div>';
  if (v === 'Not Yet')      return '<div class="m-item-val no">🗑 Not Yet</div>';
  if (v === 'Not Applicable') return '<div class="m-item-val partial">— N/A</div>';
  return `<div class="m-item-val">${v||'—'}</div>`;
}

// ===== USER CHARTS =====
function renderUserCharts(s) {
  const tick = getTickColor(), grid = getGridColor(), ff = 'Syne';
  Object.keys(uCharts).forEach(k => { try { uCharts[k].destroy(); } catch(e){} });
  uCharts = {};

  const gold   = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#d4a843';
  const green  = getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#2ecc8a';
  const red    = getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#e05555';
  const blue   = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#4e8cff';
  const purple = getComputedStyle(document.documentElement).getPropertyValue('--purple').trim() || '#a78bfa';

  const rc = document.getElementById('uChartRadar');
  if (rc) {
    uCharts['r'] = new Chart(rc, {
      type: 'radar',
      data: {
        labels: ['Licensing','Records','Salary','Benefits','Leave','POSH','HR Policy','Legal'],
        datasets: [{
          label: 'Your Compliance',
          data: [
            s.q2 !== 'Not Yet Taken' && s.q2 !== '' ? 100 : 0,
            s.q3 === 'Yes' ? 100 : s.q3 === 'In Progress' ? 50 : 0,
            (s.q6==='Yes'?33:0)+(s.q7==='Yes'?34:0)+(s.q8==='Yes'?33:s.q8==='Partial'?17:0),
            (s.q9==='Yes'?50:0)+(s.q10==='Yes'?50:0),
            s.q11==='Yes'?100:0,
            (s.q15==='Yes'?50:0)+(s.q16==='Yes'?50:0),
            (s.q17==='Yes'?50:s.q17==='Partial'?25:0)+(s.q18==='Yes'?50:s.q18==='Occasionally'?25:0),
            s.q20==='Yes'?100:0
          ],
          backgroundColor: gold + '26', borderColor: gold,
          pointBackgroundColor: gold, borderWidth:2, pointRadius:4,
        }]
      },
      options:{responsive:true,maintainAspectRatio:false,
        scales:{r:{min:0,max:100,ticks:{color:tick,font:{family:ff,size:9},stepSize:25,backdropColor:'transparent'},
          grid:{color:grid},pointLabels:{color:tick,font:{family:ff,size:10}}}},
        plugins:{legend:{display:false}}}
    });
  }

  const dc = document.getElementById('uChartDough');
  if (dc) {
    const active = [s.q9==='Yes',s.q10==='Yes',s.q15==='Yes',s.q13==='Yes'].filter(Boolean).length;
    uCharts['d'] = new Chart(dc, {
      type: 'doughnut',
      data: {
        labels: ['PF Active','ESI Active','POSH Active','Bonus Active','Not Compliant'],
        datasets: [{ data: [s.q9==='Yes'?1:0,s.q10==='Yes'?1:0,s.q15==='Yes'?1:0,s.q13==='Yes'?1:0,Math.max(0,4-active)],
          backgroundColor:[green,blue,gold,purple,red+'66'],
          borderWidth:0,hoverOffset:10 }]
      },
      options:{responsive:true,maintainAspectRatio:false,cutout:'68%',
        plugins:{legend:{position:'bottom',labels:{color:tick,font:{family:ff,size:10},padding:8}}}}
    });
  }

  const bc = document.getElementById('uChartBar');
  if (bc) {
    const vals = [
      s.q3==='Yes'?100:s.q3==='In Progress'?50:0,
      s.q4==='Yes'?100:0,
      s.q6==='Yes'?100:s.q6==='Not Sure'?30:0,
      s.q7==='Yes'?100:0,
      s.q11==='Yes'?100:0,
      s.q14==='Yes'?100:s.q14==='Informal System'?50:0,
      s.q17==='Yes'?100:s.q17==='Partial'?60:0,
      s.q18==='Yes'?100:s.q18==='Occasionally'?50:0,
    ];
    uCharts['b'] = new Chart(bc, {
      type: 'bar',
      data: {
        labels:['Emp Records','Appt Letters','Salary Struct.','Timely Pay','Leave Policy','Grievance','HR Policies','Policy Review'],
        datasets:[{label:'% Score',data:vals,
          backgroundColor:vals.map(v=>v>=80?green:v>=50?gold:red),
          borderRadius:6,borderSkipped:false}]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{x:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid}},
          y:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid},beginAtZero:true,max:100}}}
    });
  }

  const pc = document.getElementById('uChartPolar');
  if (pc) {
    uCharts['p'] = new Chart(pc, {
      type: 'polarArea',
      data: {
        labels:['POSH Awareness','ICC Committee','HR Written Policy','Policy Review','Grievance System'],
        datasets:[{
          data:[s.q15==='Yes'?100:0,s.q16==='Yes'?100:0,
            s.q17==='Yes'?100:s.q17==='Partial'?60:0,
            s.q18==='Yes'?100:s.q18==='Occasionally'?50:0,
            s.q14==='Yes'?100:s.q14==='Informal System'?50:0],
          backgroundColor:[gold+'80',blue+'80',green+'80',purple+'80',green+'59'],
          borderWidth:0,
        }]
      },
      options:{responsive:true,maintainAspectRatio:false,
        scales:{r:{ticks:{color:tick,font:{family:ff,size:9},backdropColor:'transparent'},
          grid:{color:grid},min:0,max:100}},
        plugins:{legend:{position:'bottom',labels:{color:tick,font:{family:ff,size:9},padding:8}}}}
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
  set('ast2', data.length ? Math.round(data.filter(s=>s.q9==='Yes').length/data.length*100)+'%' : '—');
  set('ast3', data.length ? Math.round(data.filter(s=>s.q10==='Yes').length/data.length*100)+'%' : '—');
  set('ast4', data.length ? Math.round(data.filter(s=>s.q15==='Yes').length/data.length*100)+'%' : '—');
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

  const pct = (fn) => Math.round(fn(data)/data.length*100);

  const bc = document.getElementById('adminChartBar');
  if (bc) {
    charts['bar'] = new Chart(bc, {
      type:'bar',
      data:{
        labels:['Licensing','Records','Salary','Timely Pay','PF','ESI','Leave','POSH','HR Policy','Bonus'],
        datasets:[{label:'% Compliant',
          data:[
            pct(d=>d.filter(s=>s.q2!=='Not Yet Taken'&&s.q2!=='').length),
            pct(d=>d.filter(s=>s.q3==='Yes').length),
            pct(d=>d.filter(s=>s.q6==='Yes').length),
            pct(d=>d.filter(s=>s.q7==='Yes').length),
            pct(d=>d.filter(s=>s.q9==='Yes').length),
            pct(d=>d.filter(s=>s.q10==='Yes').length),
            pct(d=>d.filter(s=>s.q11==='Yes').length),
            pct(d=>d.filter(s=>s.q15==='Yes').length),
            pct(d=>d.filter(s=>s.q17==='Yes'||s.q17==='Partial').length),
            pct(d=>d.filter(s=>s.q13==='Yes').length),
          ],
          backgroundColor:[gold,green,blue,purple,green,gold,blue,red,green,gold],
          borderRadius:6,borderSkipped:false}]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{x:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid}},
          y:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid},beginAtZero:true,max:100}}}
    });
  }

  const dc = document.getElementById('adminChartDough');
  if (dc) {
    const cnt={}; data.forEach(s=>{if(s.q1) cnt[s.q1]=(cnt[s.q1]||0)+1;});
    const lbls=Object.keys(cnt).length?Object.keys(cnt):['No Data'];
    const vals=Object.keys(cnt).length?Object.values(cnt):[1];
    charts['dough'] = new Chart(dc, {
      type:'doughnut',
      data:{labels:lbls,datasets:[{data:vals,backgroundColor:[gold,green,blue,purple,red],borderWidth:0,hoverOffset:10}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'68%',
        plugins:{legend:{position:'bottom',labels:{color:tick,font:{family:ff,size:11},padding:10}}}}
    });
  }

  const ec = document.getElementById('adminChartEmp');
  if (ec) {
    const sizes=['1–10','11–20','21–50','51–100','101–150','151–200','201–300','301–400','401–500','500+'];
    const cnt={}; sizes.forEach(s=>cnt[s]=0); data.forEach(s=>{if(s.employees) cnt[s.employees]=(cnt[s.employees]||0)+1;});
    charts['emp'] = new Chart(ec, {
      type:'bar',
      data:{labels:sizes,datasets:[{label:'Companies',data:sizes.map(s=>cnt[s]),backgroundColor:blue,borderRadius:6,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{x:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid}},
          y:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid},beginAtZero:true}}}
    });
  }

  const pieC = document.getElementById('adminChartPie');
  if (pieC) {
    charts['pie'] = new Chart(pieC, {
      type:'pie',
      data:{
        labels:['HR Policies','POSH Aware','Emp. Records','ICC Active'],
        datasets:[{data:[
          pct(d=>d.filter(s=>s.q17==='Yes').length),
          pct(d=>d.filter(s=>s.q15==='Yes').length),
          pct(d=>d.filter(s=>s.q3==='Yes').length),
          pct(d=>d.filter(s=>s.q16==='Yes').length),
        ],backgroundColor:[green,blue,gold,purple],borderWidth:0,hoverOffset:8}]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{color:tick,font:{family:ff,size:11},padding:10}}}}
    });
  }

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
      data:{labels:Object.keys(ranges),datasets:[{label:'Companies',data:Object.values(ranges),
        backgroundColor:[red,red,gold,green,green],borderRadius:6,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{x:{ticks:{color:tick,font:{family:ff,size:10}},grid:{color:grid}},
          y:{ticks:{color:tick,font:{family:ff,size:10}},grid:{color:grid},beginAtZero:true}}}
    });
  }

  const ic = document.getElementById('adminChartIndustry');
  if (ic) {
    const cnt={}; data.forEach(s=>{if(s.field) cnt[s.field]=(cnt[s.field]||0)+1;});
    const lbls=Object.keys(cnt).length?Object.keys(cnt):['No Data'];
    const vals=Object.keys(cnt).length?Object.values(cnt):[0];
    charts['ind'] = new Chart(ic, {
      type:'bar',
      data:{labels:lbls,datasets:[{label:'Submissions',data:vals,backgroundColor:purple,borderRadius:6,borderSkipped:false}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{x:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid},beginAtZero:true},
          y:{ticks:{color:tick,font:{family:ff,size:9}},grid:{color:grid}}}}
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
      <td style="font-size:0.8rem;white-space:nowrap">${s.q1||'—'}</td>
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
      ${mi('Est. Type',s.q1)} ${mi('License',s.q2)} ${mi('Starting Salary',s.q5?'₹'+s.q5:'—')}
    </div>
    <div class="m-section">👥 Employee & Salary</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Employee Records</div>${yn(s.q3)}</div>
      <div class="m-item"><div class="m-item-label">Appt Letters</div>${yn(s.q4)}</div>
      <div class="m-item"><div class="m-item-label">Structured Salary</div>${yn(s.q6)}</div>
      <div class="m-item"><div class="m-item-label">Timely Payment</div>${yn(s.q7)}</div>
      <div class="m-item"><div class="m-item-label">Statutory Benefits</div>${yn(s.q8)}</div>
      <div class="m-item"><div class="m-item-label">Leave Policy</div>${yn(s.q11)}</div>
    </div>
    <div class="m-section">🏦 Benefits & Welfare</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">PF / Savings</div>${yn(s.q9)}</div>
      <div class="m-item"><div class="m-item-label">ESI / Medical</div>${yn(s.q10)}</div>
      <div class="m-item"><div class="m-item-label">Bonus Paid</div>${yn(s.q13)}</div>
      ${mi('Leaves/Year',s.q12||'—')}
      <div class="m-item"><div class="m-item-label">Grievance System</div>${yn(s.q14)}</div>
      <div class="m-item"><div class="m-item-label">Policy Reviews</div>${yn(s.q18)}</div>
    </div>
    <div class="m-section">👩‍⚖️ POSH & HR</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">POSH Sessions</div>${yn(s.q15)}</div>
      <div class="m-item"><div class="m-item-label">ICC Constituted</div>${yn(s.q16)}</div>
      <div class="m-item"><div class="m-item-label">Written HR Policy</div>${yn(s.q17)}</div>
    </div>
    <div class="m-section">⚖️ Legal Awareness</div>
    <div style="margin-bottom:1rem">
      <div class="m-grid" style="margin-bottom:0.5rem">
        <div class="m-item"><div class="m-item-label">Labour Law Awareness</div>${yn(s.q20)}</div>
      </div>
      ${s.q21?.length ? `<div class="m-laws">${s.q21.map(l=>`<div class="m-law-item">✦ ${l}</div>`).join('')}</div>` : ''}
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
    y=18;
  };

  doc.setFillColor(...BG);  doc.rect(0,0,210,297,'F');
  doc.setFillColor(...DARK); doc.rect(0,0,210,56,'F');
  doc.setFillColor(...GOLD); doc.rect(0,0,210,2,'F');

  doc.setTextColor(...GOLD); doc.setFontSize(7); doc.setFont('helvetica','bold');
  doc.text('LABOURSHIELD  ·  COMPLIANCE AUDIT REPORT',105,14,{align:'center'});
  doc.setTextColor(255,255,255); doc.setFontSize(18);
  doc.text((s.companyName||'UNKNOWN').toUpperCase(),105,27,{align:'center'});
  doc.setTextColor(...MUTED); doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text(`${s.field||'—'}  ·  ${s.state||'—'}  ·  ${s.employees||'—'} employees  ·  ${fmtDate(s.submittedAt)}`,105,36,{align:'center'});

  doc.setFillColor(...scoreCol);
  doc.roundedRect(ml,44,pw-ml-mr,12,2,2,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text(`COMPLIANCE SCORE:  ${sc}%   —   ${verdict}`,105,51.5,{align:'center'});
  y=65;

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
    doc.text(label,ml+2,y);
    doc.setTextColor(...(col||DARK)); doc.setFont('helvetica','bold');
    doc.text(String(val||'—'),ml+90,y); y+=6.5;
  };

  const yn2 = v => {
    if (v==='Yes')    return {t:'Yes',c:GREEN};
    if (v==='No')     return {t:'No',c:RED};
    if (v==='Partial'||v==='In Progress'||v==='Occasionally') return {t:v,c:GOLD};
    return {t:v||'—',c:DARK};
  };

  sec('Business Profile');
  row('Company Name',s.companyName); row('Contact Person',s.name); row('Phone',s.contact);
  row('Location',`${s.location||'—'}, ${s.state||'—'}`); row('Industry',s.field);
  row('Employees',s.employees); row('Establishment Type',s.q1); row('License Held',s.q2);
  row('Starting Salary',s.q5?'₹'+s.q5:'—'); y+=2;

  sec('Employee & Salary Practices');
  let r;
  r=yn2(s.q3); row('Employee Records Maintained?',r.t,r.c);
  r=yn2(s.q4); row('Appointment Letters Issued?',r.t,r.c);
  r=yn2(s.q6); row('Structured Salary Format?',r.t,r.c);
  r=yn2(s.q7); row('Salaries Paid On Time?',r.t,r.c);
  r=yn2(s.q8); row('Statutory Benefits (PF/ESI)?',r.t,r.c); y+=2;

  sec('Employee Benefits & Welfare');
  r=yn2(s.q9);  row('Retirement / PF Savings?',r.t,r.c);
  r=yn2(s.q10); row('Medical / ESI Coverage?',r.t,r.c);
  r=yn2(s.q11); row('Leave Policy in Place?',r.t,r.c);
  row('Annual Leaves Count',s.q12||'—');
  r=yn2(s.q13); row('Bonus Provided?',r.t,r.c);
  r=yn2(s.q14); row('Grievance System?',r.t,r.c); y+=2;

  sec('POSH & HR Governance');
  r=yn2(s.q15); row('POSH Awareness Sessions?',r.t,r.c);
  r=yn2(s.q16); row('ICC Constituted?',r.t,r.c);
  r=yn2(s.q17); row('Written HR Policies?',r.t,r.c);
  r=yn2(s.q18); row('Regular Policy Review?',r.t,r.c); y+=2;

  sec('Legal Awareness');
  r=yn2(s.q20); row('Labour Law Awareness?',r.t,r.c);
  if (s.q21?.length) { row('Labour Laws Filed Under:',''); s.q21.forEach(l=>row('  →  '+l,'')); }
  y+=2;

  const gaps2 = Array.isArray(s.gaps)&&s.gaps.length?s.gaps:getGaps(s);
  const recs2  = Array.isArray(s.recs)&&s.recs.length?s.recs:getRecs(gaps2);

  if (gaps2.length) {
    sec(`Compliance Gaps Identified (${gaps2.length})`);
    gaps2.forEach(g => {
      if (y>270) addPage();
      doc.setTextColor(...RED); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.splitTextToSize('⚠  '+g,pw-ml-mr-8).forEach(l=>{doc.text(l,ml+4,y);y+=5.5;});
    }); y+=2;
  }
  if (recs2.length) {
    sec('Recommended Actions');
    recs2.forEach(rec => {
      if (y>270) addPage();
      doc.setTextColor(...GREEN); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.splitTextToSize('→  '+rec,pw-ml-mr-8).forEach(l=>{doc.text(l,ml+4,y);y+=5.5;});
    }); y+=2;
  }

  const total = doc.getNumberOfPages();
  for (let i=1;i<=total;i++) {
    doc.setPage(i);
    doc.setFillColor(...BG2); doc.rect(0,285,210,12,'F');
    doc.setFillColor(...GOLD); doc.rect(0,285,210,0.8,'F');
    doc.setTextColor(...MUTED); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text('LabourShield · Business Compliance Audit Portal',ml,292);
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