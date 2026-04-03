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
  if (!s) { alert("Submission not found"); return; }

  // ===== LOAD jsPDF =====
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

  // ===== COLORS =====
  const BG=[248,249,250],BG2=[255,255,255],GOLD=[184,134,11],
        GREEN=[26,138,90],RED=[192,57,43],BLUE=[37,99,235],
        DARK=[17,24,39],MUTED=[107,114,128];

  // ===== LOGO BASE64 (PASTE HERE) =====
  const LOGO = "data:image/png;base64,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";

  // ===== SCORE =====
  const sc = s.score || 0;
  const scoreCol = sc>=70?GREEN:sc>=40?BLUE:RED;
  const verdict  = sc>=70?'GOOD STANDING':sc>=40?'NEEDS IMPROVEMENT':'CRITICAL ATTENTION';

  // ===== PAGE ADD =====
  const addPage = () => {
    doc.addPage();
    doc.setFillColor(...BG);
    doc.rect(0,0,210,297,'F');
    y = 18;
  };

  // ===== HEADER =====
  doc.setFillColor(...BG);
  doc.rect(0,0,210,297,'F');

  doc.setFillColor(...DARK);
  doc.rect(0,0,210,56,'F');

  doc.setFillColor(...GOLD);
  doc.rect(0,0,210,2,'F');

  // ===== LOGO =====
  try {
    doc.addImage(LOGO, "PNG", 90, 4, 26, 26);
  } catch(e) {
    console.log("Logo error", e);
  }

  // ===== TITLE =====
  doc.setTextColor(...GOLD);
  doc.setFontSize(8);
  doc.setFont('helvetica','bold');
  doc.text('SLCI SHIELD  ·  COMPLIANCE AUDIT REPORT',105,18,{align:'center'});

  // ===== COMPANY NAME =====
  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.text((s.companyName || 'SLCI SHIELD').toUpperCase(),105,30,{align:'center'});

  // ===== DETAILS =====
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.setFont('helvetica','normal');
  doc.text(`${s.field||'-'} · ${s.state||'-'} · ${s.employees||'-'} employees`,105,38,{align:'center'});

  // ===== SCORE BAR =====
  doc.setFillColor(...scoreCol);
  doc.roundedRect(ml,44,pw-ml-mr,12,2,2,'F');

  doc.setTextColor(255,255,255);
  doc.setFontSize(9);
  doc.setFont('helvetica','bold');
  doc.text(`COMPLIANCE SCORE: ${sc}% — ${verdict}`,105,51.5,{align:'center'});

  y = 65;

  // ===== SECTION FUNCTION =====
  const sec = (title) => {
    if (y > 265) addPage();
    doc.setFillColor(...BG2);
    doc.rect(ml,y,pw-ml-mr,8,'F');

    doc.setFillColor(...GOLD);
    doc.rect(ml,y,3,8,'F');

    doc.setTextColor(...GOLD);
    doc.setFontSize(8);
    doc.setFont('helvetica','bold');
    doc.text(title.toUpperCase(),ml+6,y+5);

    y += 12;
  };

  // ===== ROW FUNCTION =====
  const row = (label, val) => {
    if (y > 270) addPage();
    doc.setTextColor(...MUTED);
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.text(label,ml,y);

    doc.setTextColor(0,0,0);
    doc.setFont('helvetica','bold');
    doc.text(String(val || '-'),ml+90,y);

    y += 7;
  };

  // ===== DATA =====
  sec("Business Profile");
  row("Company Name", s.companyName);
  row("Contact Person", s.name);
  row("Phone", s.contact);
  row("Location", s.location);
  row("Industry", s.field);
  row("Employees", s.employees);

  sec("Employee Management");
  row("Employee Records", s.q3);
  row("Appointment Letters", s.q4);
  row("Salary Structure", s.q6);
  row("Salary On Time", s.q7);

  sec("Compliance");
  row("PF / ESI", s.q8);
  row("Leave Policy", s.q11);
  row("Bonus", s.q13);

  // ===== FOOTER =====
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    doc.setFillColor(...BG2);
    doc.rect(0,285,210,12,'F');

    doc.setFillColor(...GOLD);
    doc.rect(0,285,210,1,'F');

    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.text('SLCI Shield · Compliance Audit System',ml,292);

    doc.text(`Page ${i} of ${total}`,210-mr,292,{align:'right'});
  }

  // ===== SAVE =====
  doc.save("SLCI_Shield_Report.pdf");
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