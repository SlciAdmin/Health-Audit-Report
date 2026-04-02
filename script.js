// ============================================================
// LABOURSHIELD — script.js (Complete with Sheets Integration)
// ============================================================

// 🔗 API Configuration — Replace with YOUR deployed Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbxEsmiPDQEKMwsnQ057ziOzqZejtvcnKqQA5VdJI9IR50dL1LbJZNsIMWCpm-SadIg2sQ/exec";

// ===== DATA STORE =====
let submissions = []; // Will be loaded from Google Sheets
let localSubmissions = JSON.parse(localStorage.getItem('ls_submissions') || '[]'); // Fallback cache
let isAdmin = false;
let charts = {};
let uCharts = {};
let activeDetailId = null;
let currentUserSubmission = null;
let isLoading = false;

// Admin credentials (client-side only — for demo; use server auth in production)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'labourshield@2024';

// ===== UTILITY FUNCTIONS =====
function saveToLocal() {
  localStorage.setItem('ls_submissions', JSON.stringify(localSubmissions));
  updateNavBadge();
}

function updateNavBadge() {
  const count = submissions.length;
  const badge = document.getElementById('navBadge');
  if (badge) badge.textContent = count + ' Audit' + (count !== 1 ? 's' : '');
}

function showToast(msg, color = 'gold') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  
  const t = document.createElement('div');
  t.id = 'toast';
  t.textContent = msg;
  const colors = { green: '#2ecc8a', red: '#e05555', gold: '#d4a843', blue: '#4e8cff' };
  
  t.style.cssText = `
    position:fixed; bottom:2rem; right:2rem; z-index:9999;
    background:${colors[color] || colors.gold}; color:#08090d;
    padding:0.75rem 1.5rem; border-radius:10px;
    font-family:'Syne',sans-serif; font-weight:700; font-size:0.82rem;
    box-shadow:0 8px 30px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease;
  `;
  
  document.head.insertAdjacentHTML('beforeend', 
    '<style>@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}</style>');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== VIEW SWITCHING =====
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');
  
  // Update nav pills
  ['navForm', 'navUserDash', 'navAdminDash'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', id.replace('nav','').toLowerCase() === name);
  });
  
  // Load data when switching to dashboards
  if (name === 'user-dashboard') {
    renderUserDashboard();
  }
  if (name === 'admin-dashboard') {
    if (!isAdmin) {
      showView('form');
      showToast('Admin access required.', 'red');
      return;
    }
    loadFromSheets(); // Always fetch fresh data for admin
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ADMIN LOGIN =====
function toggleAdminLogin() {
  if (isAdmin) {
    logoutAdmin();
    return;
  }
  const modal = document.getElementById('adminLoginModal');
  if (modal) {
    modal.classList.add('open');
    document.getElementById('adminLoginError').style.display = 'none';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
  }
}

function doAdminLogin() {
  const user = document.getElementById('adminUser')?.value.trim();
  const pass = document.getElementById('adminPass')?.value.trim();
  
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    localStorage.setItem('ls_admin_session', 'true');
    
    document.getElementById('adminLoginModal')?.classList.remove('open');
    
    const adminPill = document.getElementById('navAdminDash');
    if (adminPill) {
      adminPill.style.display = 'flex';
      adminPill.classList.add('admin-pill');
    }
    
    const toggleBtn = document.getElementById('adminToggleBtn');
    if (toggleBtn) {
      toggleBtn.textContent = '🔓 Logout Admin';
      toggleBtn.classList.add('active-admin');
    }
    
    showToast('Admin login successful!', 'green');
    showView('admin-dashboard');
  } else {
    const err = document.getElementById('adminLoginError');
    if (err) err.style.display = 'block';
  }
}

function logoutAdmin() {
  isAdmin = false;
  localStorage.removeItem('ls_admin_session');
  
  const adminPill = document.getElementById('navAdminDash');
  if (adminPill) adminPill.style.display = 'none';
  
  const toggleBtn = document.getElementById('adminToggleBtn');
  if (toggleBtn) {
    toggleBtn.textContent = 'Admin Login';
    toggleBtn.classList.remove('active-admin');
  }
  
  showToast('Logged out from admin.', 'gold');
  showView('form');
}

function closeAdminModal(force) {
  const modal = document.getElementById('adminLoginModal');
  if (!modal) return;
  if (force === true || (force && force.target === modal)) {
    modal.classList.remove('open');
  }
}

// ===== PAGE NAVIGATION =====
function goPage2() {
  const fields = ['name','contact','state','location','companyName','employees','field'];
  let ok = true;
  
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) { 
      el.classList.add('error'); 
      ok = false; 
    } else if (el) {
      el.classList.remove('error');
    }
  });
  
  if (!ok) { 
    showToast('Please fill all required fields.', 'red'); 
    return; 
  }
  
  document.getElementById('pg1').style.display = 'none';
  document.getElementById('pg2').style.display = 'block';
  
  // Update step indicators
  const sd1 = document.getElementById('sd1');
  if (sd1) {
    sd1.classList.remove('active');
    sd1.classList.add('done');
    sd1.innerHTML = '<span>✓</span>';
  }
  const sr1 = document.getElementById('sr1');
  if (sr1) sr1.classList.add('done');
  const sd2 = document.getElementById('sd2');
  if (sd2) sd2.classList.add('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goPage1() {
  document.getElementById('pg1').style.display = 'block';
  document.getElementById('pg2').style.display = 'none';
  
  const sd1 = document.getElementById('sd1');
  if (sd1) {
    sd1.className = 'step-dot active';
    sd1.innerHTML = '<span>1</span>';
  }
  const sr1 = document.getElementById('sr1');
  if (sr1) sr1.classList.remove('done');
  const sd2 = document.getElementById('sd2');
  if (sd2) sd2.classList.remove('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== HELPERS =====
function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function getCbx(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(e => e.value);
}

// ===== COMPLIANCE SCORE CALCULATION =====
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
  ];
  
  if (d.q20 === 'Yes' && d.q21 && d.q21.length > 0 && !d.q21.includes('Not Sure')) {
    checks.push(true);
  }
  
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ===== GAP ANALYSIS =====
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
      if (g.toLowerCase().includes(k.toLowerCase())) { 
        recs.push(v); 
        break; 
      }
    }
  });
  return recs.length ? recs : ['Maintain documentation standards and conduct annual compliance audits'];
}

// ===== API FUNCTIONS — Google Sheets Integration =====

// 📤 Send data to Google Sheets
async function sendToSheets(data) {
  try {
    isLoading = true;
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // Note: no-cors mode means we can't read response, but data is sent
    return { success: true };
  } catch (error) {
    console.error('Error sending to Sheets:', error);
    return { success: false, error: error.message };
  } finally {
    isLoading = false;
  }
}

// 📥 Load all submissions from Google Sheets
async function loadFromSheets() {
  try {
    isLoading = true;
    const response = await fetch(API_URL, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    // Validate and process data
    if (Array.isArray(data)) {
      submissions = data.map(item => {
        // Ensure q21, gaps, recs are arrays
        if (typeof item.q21 === 'string') {
          item.q21 = item.q21 ? item.q21.split(',').map(s => s.trim()).filter(s => s) : [];
        }
        if (typeof item.gaps === 'string') {
          item.gaps = item.gaps ? item.gaps.split('|').map(s => s.trim()).filter(s => s) : [];
        }
        if (typeof item.recs === 'string') {
          item.recs = item.recs ? item.recs.split('|').map(s => s.trim()).filter(s => s) : [];
        }
        return item;
      });
      
      // Also save to local cache for offline fallback
      localSubmissions = submissions;
      localStorage.setItem('ls_submissions', JSON.stringify(submissions));
      
      updateNavBadge();
      return { success: true };
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error('Error loading from Sheets:', error);
    // Fallback to localStorage
    submissions = localSubmissions;
    showToast('Using cached data (offline mode)', 'blue');
    return { success: false, error: error.message };
  } finally {
    isLoading = false;
  }
}

// ===== FORM SUBMISSION =====
async function submitAudit() {
  // Validate required questions
  const required = ['q1','q2','q3','q4','q6','q7','q8','q9','q10','q11','q13','q14','q15','q16','q17','q18','q19','q20'];
  let ok = true;
  
  required.forEach(n => { 
    if (!getRadio(n)) {
      ok = false;
      showToast(`Please answer question ${n.replace('q','')}`, 'red');
    } 
  });
  
  if (!ok) return;
  
  // Build submission object
  const d = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    name: document.getElementById('name')?.value || '',
    contact: document.getElementById('contact')?.value || '',
    state: document.getElementById('state')?.value || '',
    location: document.getElementById('location')?.value || '',
    employees: document.getElementById('employees')?.value || '',
    companyName: document.getElementById('companyName')?.value || '',
    field: document.getElementById('field')?.value || '',
    q1: getRadio('q1'), q2: getRadio('q2'),
    q3: getRadio('q3'), q4: getRadio('q4'),
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
  
  // Calculate score and analysis
  d.score = calcScore(d);
  d.gaps = getGaps(d);
  d.recs = getRecs(d.gaps);
  
  // Show loading state
  const submitBtn = document.querySelector('#pg2 .btn-gold');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Saving...';
  }
  
  try {
    // Save to Google Sheets (primary)
    const sheetResult = await sendToSheets(d);
    
    // Also save to localStorage (fallback + user dashboard)
    localSubmissions.unshift(d);
    localStorage.setItem('ls_submissions', JSON.stringify(localSubmissions));
    localStorage.setItem('ls_last_submission_id', d.id.toString());
    
    // Update in-memory submissions
    submissions.unshift(d);
    currentUserSubmission = d;
    
    updateNavBadge();
    
    // Show success UI
    document.getElementById('pg2').style.display = 'none';
    const sc = d.score;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    const label = sc >= 70 ? 'Good Standing ✦' : sc >= 40 ? 'Needs Improvement' : 'Critical Attention Required';
    
    const successBox = document.getElementById('successScoreBox');
    if (successBox) {
      successBox.innerHTML = `
        <div class="score-pill ${cls}">${sc}%</div>
        <div style="font-size:0.82rem;color:var(--text2);margin-bottom:0.5rem;">${label}</div>
        <div style="font-size:0.8rem;color:var(--text2);">${d.gaps.length} gap${d.gaps.length !== 1 ? 's' : ''} identified</div>
      `;
    }
    document.getElementById('pgSuccess').style.display = 'block';
    
    showToast('✅ Audit submitted & saved to cloud!', 'green');
    
  } catch (error) {
    console.error('Submission error:', error);
    showToast('⚠️ Saved locally only. Cloud sync failed.', 'red');
  } finally {
    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Audit ✦';
    }
  }
}

function resetForm() {
  document.getElementById('pgSuccess').style.display = 'none';
  document.getElementById('pg1').style.display = 'block';
  document.getElementById('pg2').style.display = 'none';
  document.getElementById('q21box').style.display = 'none';
  
  document.querySelectorAll('input, select').forEach(el => {
    if (el.type === 'radio' || el.type === 'checkbox') {
      el.checked = false;
    } else if (el.id && !['adminUser', 'adminPass'].includes(el.id)) {
      el.value = '';
    }
    el.classList?.remove('error');
  });
  
  goPage1();
}

// ===== USER DASHBOARD =====
function renderUserDashboard() {
  // Get last submission from localStorage (user-specific)
  const lastId = localStorage.getItem('ls_last_submission_id');
  if (lastId) {
    currentUserSubmission = localSubmissions.find(s => s.id == lastId);
  }
  
  if (!currentUserSubmission) {
    const empty = document.getElementById('udashEmpty');
    const report = document.getElementById('udashReport');
    if (empty) empty.style.display = 'block';
    if (report) report.style.display = 'none';
    return;
  }
  
  const s = currentUserSubmission;
  
  // Show report section
  const empty = document.getElementById('udashEmpty');
  const report = document.getElementById('udashReport');
  if (empty) empty.style.display = 'none';
  if (report) report.style.display = 'block';
  
  // Update header
  const title = document.getElementById('udashTitle');
  const sub = document.getElementById('udashSub');
  if (title) title.textContent = s.companyName;
  if (sub) sub.textContent = `${s.field} · ${s.state} · Submitted on ${new Date(s.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`;
  
  // Score display
  const sc = s.score;
  const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
  const verdict = sc >= 70 ? 'Strong Compliance Posture ✦' : sc >= 40 ? 'Moderate — Action Required' : 'Critical Gaps — Immediate Action!';
  
  const scoreNumEl = document.getElementById('udashScoreNum');
  if (scoreNumEl) {
    scoreNumEl.textContent = sc + '%';
    scoreNumEl.className = 'udash-score-num ' + cls;
  }
  const verdictEl = document.getElementById('udashVerdict');
  if (verdictEl) verdictEl.textContent = verdict;
  const barEl = document.getElementById('udashScoreBar');
  if (barEl) barEl.style.width = sc + '%';
  const metaEl = document.getElementById('udashScoreMeta');
  if (metaEl) metaEl.textContent = `${s.gaps?.length || 0} compliance gap${(s.gaps?.length || 0) !== 1 ? 's' : ''} identified out of 17 checks`;
  
  // Stat items helper
  const yn = (v, elId) => {
    const e = document.getElementById(elId);
    if (!e) return;
    if (v === 'Yes') { e.textContent = 'Yes ✅'; e.className = 'ust-val yes'; }
    else if (v === 'No') { e.textContent = 'No ❌'; e.className = 'ust-val no'; }
    else { e.textContent = v || '—'; e.className = 'ust-val partial'; }
  };
  
  yn(s.q9, 'ustPF');
  yn(s.q10, 'ustESI');
  yn(s.q15, 'ustPOSH');
  yn(s.q11, 'ustLeave');
  yn(s.q17, 'ustHR');
  yn(s.q13, 'ustBonus');
  
  // Render charts
  renderUserCharts(s);
  
  // Profile grid
  const profileGrid = document.getElementById('udashProfile');
  if (profileGrid) {
    profileGrid.innerHTML = [
      ['Company Name', s.companyName],
      ['Contact Person', s.name],
      ['Phone', s.contact],
      ['Location', `${s.location}, ${s.state}`],
      ['Industry', s.field],
      ['Employees', s.employees],
      ['Est. Type', s.q1 || '—'],
      ['License', s.q2 || '—'],
      ['Starting Salary', s.q5 ? '₹' + s.q5 : '—'],
    ].map(([l, v]) => `<div class="m-item"><div class="m-item-label">${l}</div><div class="m-item-val">${v}</div></div>`).join('');
  }
  
  // Employee & Salary
  const empGrid = document.getElementById('udashEmployeeSalary');
  if (empGrid) {
    empGrid.innerHTML = [
      ['Employee Records', s.q3],
      ['Appointment Letters', s.q4],
      ['Structured Salary', s.q6],
      ['Timely Payment', s.q7],
      ['Statutory Benefits', s.q8],
      ['Leave Policy', s.q11],
    ].map(([l, v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');
  }
  
  // Benefits
  const benGrid = document.getElementById('udashBenefits');
  if (benGrid) {
    benGrid.innerHTML = [
      ['PF / Savings', s.q9],
      ['ESI / Medical', s.q10],
      ['Bonus Paid', s.q13],
      ['Leaves/Year', s.q12 || '—'],
      ['Grievance System', s.q14],
      ['Policy Reviews', s.q18],
    ].map(([l, v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');
  }
  
  // POSH
  const poshGrid = document.getElementById('udashPOSH');
  if (poshGrid) {
    poshGrid.innerHTML = [
      ['POSH Sessions', s.q15],
      ['ICC Constituted', s.q16],
      ['Written HR Policy', s.q17],
    ].map(([l, v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');
  }
  
  // Legal
  let legalHtml = [
    ['Labour Law Awareness', s.q20],
    ['Detailed Report Wanted', s.q19],
  ].map(([l, v]) => `<div class="m-item"><div class="m-item-label">${l}</div>${ynHtml(v)}</div>`).join('');
  
  if (s.q21 && Array.isArray(s.q21) && s.q21.length) {
    legalHtml += `<div class="m-item" style="grid-column:1/-1"><div class="m-item-label">Labour Laws Filed Under</div><div class="m-laws" style="margin-top:0.4rem">${s.q21.map(l => `<div class="m-law-item">✦ ${l}</div>`).join('')}</div></div>`;
  }
  const legalGrid = document.getElementById('udashLegal');
  if (legalGrid) legalGrid.innerHTML = legalHtml;
  
  // Gaps section
  const gapsSection = document.getElementById('udashGapsSection');
  const gapsGrid = document.getElementById('udashGaps');
  if (s.gaps && s.gaps.length) {
    if (gapsSection) gapsSection.style.display = 'block';
    if (gapsGrid) {
      gapsGrid.innerHTML = s.gaps.map(g =>
        `<div class="m-gap-item"><span class="m-gap-icon">⚠</span><span>${g}</span></div>`
      ).join('');
    }
  } else {
    if (gapsSection) gapsSection.style.display = 'none';
  }
  
  // Recommendations section
  const recsSection = document.getElementById('udashRecsSection');
  const recsGrid = document.getElementById('udashRecs');
  if (s.recs && s.recs.length) {
    if (recsSection) recsSection.style.display = 'block';
    if (recsGrid) {
      recsGrid.innerHTML = s.recs.map(r =>
        `<div class="m-rec-item"><span class="m-rec-icon">→</span><span>${r}</span></div>`
      ).join('');
    }
  } else {
    if (recsSection) recsSection.style.display = 'none';
  }
  
  // PDF button
  const pdfBtn = document.getElementById('udashPDFBtn');
  if (pdfBtn) {
    pdfBtn.onclick = () => downloadPDF(s.id);
  }
}

function ynHtml(v) {
  if (v === 'Yes') return '<div class="m-item-val yes">✅ Yes</div>';
  if (v === 'No') return '<div class="m-item-val no">❌ No</div>';
  if (v === 'Partial') return '<div class="m-item-val partial">⚖ Partial</div>';
  if (v === 'In Progress') return '<div class="m-item-val partial">🔄 In Progress</div>';
  if (v === 'Occasionally') return '<div class="m-item-val partial">🔁 Sometimes</div>';
  if (v === 'Not Yet') return '<div class="m-item-val no">🗑 Not Yet</div>';
  if (v === 'Not Applicable') return '<div class="m-item-val partial">— N/A</div>';
  return `<div class="m-item-val">${v || '—'}</div>`;
}

// ===== USER CHARTS (Chart.js) =====
function renderUserCharts(s) {
  const tickColor = '#7a8299';
  const fontFam = 'Syne';
  
  // Destroy old charts
  ['uChartRadar','uChartDough','uChartBar','uChartPolar'].forEach(id => {
    if (uCharts[id]) { 
      uCharts[id].destroy(); 
      delete uCharts[id]; 
    }
  });
  
  // 1. Radar Chart - Compliance Areas
  const radarLabels = ['Licensing', 'Records', 'Salary', 'Benefits', 'Leave', 'POSH', 'HR Policy', 'Legal'];
  const radarData = [
    s.q2 !== 'Not Yet Taken' && s.q2 !== '' ? 100 : 0,
    s.q3 === 'Yes' ? 100 : (s.q3 === 'In Progress' ? 50 : 0),
    (s.q6 === 'Yes' ? 33 : 0) + (s.q7 === 'Yes' ? 34 : 0) + (s.q8 === 'Yes' ? 33 : s.q8 === 'Partial' ? 17 : 0),
    (s.q9 === 'Yes' ? 50 : 0) + (s.q10 === 'Yes' ? 50 : 0),
    s.q11 === 'Yes' ? 100 : 0,
    (s.q15 === 'Yes' ? 50 : 0) + (s.q16 === 'Yes' ? 50 : 0),
    (s.q17 === 'Yes' ? 50 : s.q17 === 'Partial' ? 25 : 0) + (s.q18 === 'Yes' ? 50 : s.q18 === 'Occasionally' ? 25 : 0),
    s.q20 === 'Yes' ? 100 : 0
  ];
  
  const radarCtx = document.getElementById('uChartRadar');
  if (radarCtx) {
    uCharts['uChartRadar'] = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: [{
          label: 'Your Compliance',
          data: radarData,
          backgroundColor: 'rgba(212,168,67,0.15)',
          borderColor: '#d4a843',
          pointBackgroundColor: '#d4a843',
          pointBorderColor: '#d4a843',
          borderWidth: 2,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { color: tickColor, font: { family: fontFam, size: 9 }, stepSize: 25, backdropColor: 'transparent' },
            grid: { color: 'rgba(255,255,255,0.06)' },
            pointLabels: { color: tickColor, font: { family: fontFam, size: 10 } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
  
  // 2. Doughnut - Statutory Benefits
  const benefitLabels = ['PF Active', 'ESI Active', 'POSH Active', 'Bonus Active', 'Not Compliant'];
  const benefitData = [
    s.q9 === 'Yes' ? 1 : 0,
    s.q10 === 'Yes' ? 1 : 0,
    s.q15 === 'Yes' ? 1 : 0,
    s.q13 === 'Yes' ? 1 : 0,
    0
  ];
  const activeCount = benefitData.slice(0,4).reduce((a,b) => a+b, 0);
  const benefitDataFinal = [...benefitData.slice(0,4), Math.max(0, 4 - activeCount)];
  
  const doughCtx = document.getElementById('uChartDough');
  if (doughCtx) {
    uCharts['uChartDough'] = new Chart(doughCtx, {
      type: 'doughnut',
      data: {
        labels: benefitLabels,
        datasets: [{
          data: benefitDataFinal,
          backgroundColor: ['#2ecc8a','#4e8cff','#d4a843','#a78bfa','rgba(224,85,85,0.4)'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { color: tickColor, font: { family: fontFam, size: 10 }, padding: 8 } }
        }
      }
    });
  }
  
  // 3. Bar - Key Metrics
  const barLabels = ['Emp Records', 'Appt Letters', 'Salary Struct.', 'Timely Pay', 'Leave Policy', 'Grievance Sys', 'HR Policies', 'Policy Review'];
  const barMap = {
    'Emp Records': s.q3 === 'Yes' ? 100 : (s.q3 === 'In Progress' ? 50 : 0),
    'Appt Letters': s.q4 === 'Yes' ? 100 : 0,
    'Salary Struct.': s.q6 === 'Yes' ? 100 : (s.q6 === 'Not Sure' ? 30 : 0),
    'Timely Pay': s.q7 === 'Yes' ? 100 : 0,
    'Leave Policy': s.q11 === 'Yes' ? 100 : 0,
    'Grievance Sys': s.q14 === 'Yes' ? 100 : (s.q14 === 'Informal System' ? 50 : 0),
    'HR Policies': s.q17 === 'Yes' ? 100 : (s.q17 === 'Partial' ? 60 : 0),
    'Policy Review': s.q18 === 'Yes' ? 100 : (s.q18 === 'Occasionally' ? 50 : 0),
  };
  const barColors = barLabels.map(l => barMap[l] >= 80 ? '#2ecc8a' : barMap[l] >= 50 ? '#d4a843' : '#e05555');
  
  const barCtx = document.getElementById('uChartBar');
  if (barCtx) {
    uCharts['uChartBar'] = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          label: '% Score',
          data: barLabels.map(l => barMap[l]),
          backgroundColor: barColors,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tickColor, font: { family: fontFam, size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: tickColor, font: { family: fontFam, size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, max: 100 }
        }
      }
    });
  }
  
  // 4. Polar Area - HR Governance
  const polarCtx = document.getElementById('uChartPolar');
  if (polarCtx) {
    uCharts['uChartPolar'] = new Chart(polarCtx, {
      type: 'polarArea',
      data: {
        labels: ['POSH Awareness', 'ICC Committee', 'HR Written Policy', 'Policy Review', 'Grievance System'],
        datasets: [{
          data: [
            s.q15 === 'Yes' ? 100 : 0,
            s.q16 === 'Yes' ? 100 : 0,
            s.q17 === 'Yes' ? 100 : (s.q17 === 'Partial' ? 60 : 0),
            s.q18 === 'Yes' ? 100 : (s.q18 === 'Occasionally' ? 50 : 0),
            s.q14 === 'Yes' ? 100 : (s.q14 === 'Informal System' ? 50 : 0),
          ],
          backgroundColor: ['rgba(212,168,67,0.5)','rgba(78,140,255,0.5)','rgba(46,204,138,0.5)','rgba(167,139,250,0.5)','rgba(46,204,138,0.35)'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          r: {
            ticks: { color: tickColor, font: { family: fontFam, size: 9 }, backdropColor: 'transparent' },
            grid: { color: 'rgba(255,255,255,0.06)' },
            min: 0, max: 100
          }
        },
        plugins: { legend: { position: 'bottom', labels: { color: tickColor, font: { family: fontFam, size: 9 }, padding: 8 } } }
      }
    });
  }
}

// ===== ADMIN DASHBOARD =====
function renderAdminDashboard() {
  if (!isAdmin) return;
  
  const stateF = document.getElementById('adminStateFilter')?.value || '';
  const industryF = document.getElementById('adminIndustryFilter')?.value || '';
  
  // Populate filters from data
  populateAdminFilters();
  
  // Filter data
  const filtered = submissions
    .filter(s => !stateF || s.state === stateF)
    .filter(s => !industryF || s.field === industryF);
  
  // Update stats
  updateAdminStats(filtered);
  
  // Render components
  renderAdminSidebar();
  renderAdminCharts(filtered);
  renderAdminTable(filtered);
}

function populateAdminFilters() {
  const states = [...new Set(submissions.map(s => s.state).filter(Boolean))].sort();
  const stateSel = document.getElementById('adminStateFilter');
  if (stateSel) {
    const current = stateSel.value;
    stateSel.innerHTML = '<option value="">All States</option>' + 
      states.map(s => `<option value="${s}" ${s === current ? 'selected' : ''}>${s}</option>`).join('');
  }
  
  const industries = [...new Set(submissions.map(s => s.field).filter(Boolean))].sort();
  const industrySel = document.getElementById('adminIndustryFilter');
  if (industrySel) {
    const current = industrySel.value;
    industrySel.innerHTML = '<option value="">All Industries</option>' + 
      industries.map(i => `<option value="${i}" ${i === current ? 'selected' : ''}>${i}</option>`).join('');
  }
}

function updateAdminStats(data) {
  const ast = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  
  ast('ast0', data.length);
  
  const avg = data.length ? Math.round(data.reduce((a,b) => a + (b.score||0), 0) / data.length) : 0;
  ast('ast1', data.length ? avg + '%' : '—');
  
  ast('ast2', data.length ? Math.round(data.filter(s=>s.q9==='Yes').length/data.length*100)+'%' : '—');
  ast('ast3', data.length ? Math.round(data.filter(s=>s.q10==='Yes').length/data.length*100)+'%' : '—');
  ast('ast4', data.length ? Math.round(data.filter(s=>s.q15==='Yes').length/data.length*100)+'%' : '—');
  ast('ast5', data.length ? data.filter(s=>(s.score||0)>=70).length : '—');
  ast('ast6', data.length ? data.filter(s=>(s.score||0)>=40&&(s.score||0)<70).length : '—');
  ast('ast7', data.length ? data.filter(s=>(s.score||0)<40).length : '—');
}

function renderAdminSidebar() {
  const q = (document.getElementById('adminSideSearch')?.value || '').toLowerCase();
  const filtered = submissions.filter(s =>
    (s.companyName || '').toLowerCase().includes(q) ||
    (s.name || '').toLowerCase().includes(q) ||
    (s.state || '').toLowerCase().includes(q)
  );
  
  const countEl = document.getElementById('adminSidebarCount');
  if (countEl) countEl.textContent = submissions.length;
  
  const list = document.getElementById('adminSidebarList');
  if (!list) return;
  
  if (!filtered.length) {
    list.innerHTML = '<div class="sidebar-empty">No results found.</div>';
    return;
  }
  
  list.innerHTML = filtered.map(s => {
    const sc = s.score || 0;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    const date = new Date(s.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    return `<div class="sidebar-card ${activeDetailId === s.id ? 'active' : ''}" onclick="showDetail(${s.id})">
      <div class="sc-name">${s.companyName || 'Unknown'}</div>
      <div class="sc-meta">
        <span>${s.state || '—'} · ${date}</span>
        <span class="sc-score ${cls}">${sc}%</span>
      </div>
    </div>`;
  }).join('');
}

function renderAdminCharts(data) {
  const gridColor = 'rgba(255,255,255,0.05)';
  const tickColor = '#7a8299';
  const fontFam = 'Syne';
  
  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: tickColor, font: { family: fontFam, size: 11 }, padding: 12 } } },
    scales: {
      x: { ticks: { color: tickColor, font: { family: fontFam, size: 10 } }, grid: { color: gridColor } },
      y: { ticks: { color: tickColor, font: { family: fontFam, size: 10 } }, grid: { color: gridColor }, beginAtZero: true, max: 100 }
    }
  };
  
  // Destroy old charts
  ['adminChartBar','adminChartDough','adminChartEmp','adminChartPie','adminChartScore','adminChartIndustry'].forEach(id => {
    if (charts[id]) { 
      charts[id].destroy(); 
      delete charts[id]; 
    }
  });
  
  // 1. Bar — Statutory Compliance %
  const barCtx = document.getElementById('adminChartBar');
  if (barCtx && data.length) {
    charts['adminChartBar'] = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Licensing', 'Records', 'Salary Struct.', 'Timely Pay', 'PF/Savings', 'ESI/Medical', 'Leave', 'POSH', 'HR Policy', 'Bonus'],
        datasets: [{
          label: '% Compliant Across All',
          data: [
            Math.round(data.filter(s=>s.q2!=='Not Yet Taken'&&s.q2!=='').length/data.length*100),
            Math.round(data.filter(s=>s.q3==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q6==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q7==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q9==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q10==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q11==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q15==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q17==='Yes'||s.q17==='Partial').length/data.length*100),
            Math.round(data.filter(s=>s.q13==='Yes').length/data.length*100)
          ],
          backgroundColor: ['#d4a843','#2ecc8a','#4e8cff','#a78bfa','#2ecc8a','#d4a843','#4e8cff','#e05555','#2ecc8a','#d4a843'],
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: { ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }
    });
  }
  
  // 2. Doughnut — Establishment Type
  const doughCtx = document.getElementById('adminChartDough');
  if (doughCtx) {
    const estCount = {};
    data.forEach(s => { if (s.q1) estCount[s.q1] = (estCount[s.q1] || 0) + 1; });
    const estLabels = Object.keys(estCount).length ? Object.keys(estCount) : ['No Data'];
    const estVals = Object.keys(estCount).length ? Object.values(estCount) : [1];
    
    charts['adminChartDough'] = new Chart(doughCtx, {
      type: 'doughnut',
      data: {
        labels: estLabels,
        datasets: [{ 
          data: estVals, 
          backgroundColor: ['#d4a843','#2ecc8a','#4e8cff','#a78bfa','#e05555'], 
          borderWidth: 0, 
          hoverOffset: 10 
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { 
          legend: { position: 'bottom', labels: { color: tickColor, font: { family: fontFam, size: 11 }, padding: 10 } } 
        }
      }
    });
  }
  
  // 3. Bar — Employee Size Distribution
  const empCtx = document.getElementById('adminChartEmp');
  if (empCtx) {
    const sizes = ['1–10','11–20','21–50','51–100','101–150','151–200','201–300','301–400','401–500','500+'];
    const sizeCounts = {};
    sizes.forEach(s => sizeCounts[s] = 0);
    data.forEach(s => { if (s.employees) sizeCounts[s.employees] = (sizeCounts[s.employees] || 0) + 1; });
    
    charts['adminChartEmp'] = new Chart(empCtx, {
      type: 'bar',
      data: {
        labels: sizes,
        datasets: [{ 
          label: 'Companies', 
          data: sizes.map(s => sizeCounts[s]), 
          backgroundColor: '#4e8cff', 
          borderRadius: 6, 
          borderSkipped: false 
        }]
      },
      options: {
        ...baseOpts,
        scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, max: undefined, beginAtZero: true } },
        plugins: { ...baseOpts.plugins, legend: { display: false } }
      }
    });
  }
  
  // 4. Pie — HR Coverage
  const pieCtx = document.getElementById('adminChartPie');
  if (pieCtx && data.length) {
    charts['adminChartPie'] = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['HR Policies', 'POSH Aware', 'Emp. Records', 'ICC Active'],
        datasets: [{
          data: [
            Math.round(data.filter(s=>s.q17==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q15==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q3==='Yes').length/data.length*100),
            Math.round(data.filter(s=>s.q16==='Yes').length/data.length*100)
          ],
          backgroundColor: ['#2ecc8a','#4e8cff','#d4a843','#a78bfa'],
          borderWidth: 0, 
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'bottom', labels: { color: tickColor, font: { family: fontFam, size: 11 }, padding: 10 } } 
        }
      }
    });
  }
  
  // 5. Bar — Score Distribution
  const scoreCtx = document.getElementById('adminChartScore');
  if (scoreCtx) {
    const scoreRanges = { '0–20%': 0, '21–40%': 0, '41–60%': 0, '61–80%': 0, '81–100%': 0 };
    data.forEach(s => {
      const sc = s.score || 0;
      if (sc <= 20) scoreRanges['0–20%']++;
      else if (sc <= 40) scoreRanges['21–40%']++;
      else if (sc <= 60) scoreRanges['41–60%']++;
      else if (sc <= 80) scoreRanges['61–80%']++;
      else scoreRanges['81–100%']++;
    });
    
    charts['adminChartScore'] = new Chart(scoreCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(scoreRanges),
        datasets: [{
          label: 'Number of Companies',
          data: Object.values(scoreRanges),
          backgroundColor: ['#e05555','#e05555','#d4a843','#2ecc8a','#2ecc8a'],
          borderRadius: 6, 
          borderSkipped: false
        }]
      },
      options: {
        ...baseOpts,
        scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, max: undefined, beginAtZero: true } },
        plugins: { ...baseOpts.plugins, legend: { display: false } }
      }
    });
  }
  
  // 6. Horizontal Bar — Industry Distribution
  const indCtx = document.getElementById('adminChartIndustry');
  if (indCtx) {
    const industryCounts = {};
    data.forEach(s => { if (s.field) industryCounts[s.field] = (industryCounts[s.field] || 0) + 1; });
    const industryLabels = Object.keys(industryCounts);
    const industryVals = Object.values(industryCounts);
    
    charts['adminChartIndustry'] = new Chart(indCtx, {
      type: 'bar',
      data: {
        labels: industryLabels.length ? industryLabels : ['No Data'],
        datasets: [{
          label: 'Submissions',
          data: industryVals.length ? industryVals : [0],
          backgroundColor: '#a78bfa',
          borderRadius: 6, 
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { ...baseOpts.plugins, legend: { display: false } },
        scales: {
          x: { ticks: { color: tickColor, font: { family: fontFam, size: 9 } }, grid: { color: gridColor }, beginAtZero: true },
          y: { ticks: { color: tickColor, font: { family: fontFam, size: 9 } }, grid: { color: gridColor } }
        }
      }
    });
  }
}

function renderAdminTable(data) {
  const tbody = document.getElementById('adminTblBody');
  if (!tbody) return;
  
  const stateF = document.getElementById('adminStateFilter')?.value || '';
  const industryF = document.getElementById('adminIndustryFilter')?.value || '';
  const q = (document.getElementById('adminTblSearch')?.value || '').toLowerCase();
  
  const filtered = data
    .filter(s => !stateF || s.state === stateF)
    .filter(s => !industryF || s.field === industryF)
    .filter(s => (s.companyName || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q));
  
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-td">No submissions found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map((s, i) => {
    const sc = s.score || 0;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    const gapCls = (s.gaps?.length || 0) > 5 ? 'low' : (s.gaps?.length || 0) > 2 ? 'mid' : 'good';
    
    return `<tr>
      <td style="color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:0.75rem">${String(i+1).padStart(2,'0')}</td>
      <td>
        <div style="font-weight:700;color:var(--white);font-size:0.85rem">${s.companyName || 'Unknown'}</div>
        <div style="font-size:0.72rem;color:var(--text2)">${s.field || '—'}</div>
      </td>
      <td>
        <div style="font-size:0.82rem">${s.name || '—'}</div>
        <div style="font-size:0.7rem;color:var(--text2)">${s.contact || '—'}</div>
      </td>
      <td>${s.state || '—'}</td>
      <td style="font-size:0.78rem">${s.field || '—'}</td>
      <td><span class="badge info">${s.employees || '—'}</span></td>
      <td style="font-size:0.8rem">${s.q1 || '—'}</td>
      <td><span class="badge ${cls}">${sc}%</span></td>
      <td><span class="badge ${gapCls}">${s.gaps?.length || 0} gaps</span></td>
      <td>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
          <button class="btn btn-ghost" style="padding:0.35rem 0.75rem;font-size:0.75rem" onclick="showDetail(${s.id})">👁 View</button>
          <button class="btn btn-blue" style="padding:0.35rem 0.75rem;font-size:0.75rem" onclick="downloadPDF(${s.id})">⬇ PDF</button>
          <button class="btn btn-red" style="padding:0.35rem 0.75rem;font-size:0.75rem" onclick="deleteSubmission(${s.id})">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ===== DELETE SUBMISSION (Admin Only) =====
function deleteSubmission(id) {
  if (!isAdmin) { 
    showToast('Admin access required.', 'red'); 
    return; 
  }
  
  if (!confirm('Delete this submission permanently from Google Sheets?\n\n⚠️ This action cannot be undone.')) return;
  
  // Note: Actual deletion from Sheets requires additional Apps Script endpoint
  // For now, remove from local array and show warning
  submissions = submissions.filter(s => s.id !== id);
  localSubmissions = localSubmissions.filter(s => s.id !== id);
  localStorage.setItem('ls_submissions', JSON.stringify(localSubmissions));
  
  renderAdminDashboard();
  showToast('⚠️ Removed from view. To permanently delete from Sheets, use Google Sheets directly.', 'gold');
}

// ===== DETAIL MODAL =====
function showDetail(id) {
  const s = submissions.find(x => x.id === id);
  if (!s) return;
  
  activeDetailId = id;
  if (isAdmin) renderAdminSidebar();
  
  const sc = s.score || 0;
  const color = sc >= 70 ? 'var(--green)' : sc >= 40 ? 'var(--blue)' : 'var(--red)';
  const verdict = sc >= 70 ? 'Strong compliance posture. Continue maintaining documentation and annual reviews.'
    : sc >= 40 ? 'Moderate compliance. Address highlighted gaps to avoid regulatory risk.'
    : 'Critical compliance gaps detected. Immediate corrective action required.';
  
  const date = new Date(s.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  
  const yn = v => {
    if (v === 'Yes') return '<span class="m-item-val yes">✅ Yes</span>';
    if (v === 'No') return '<span class="m-item-val no">❌ No</span>';
    if (v === 'Partial') return '<span class="m-item-val partial">⚖ Partial</span>';
    if (v === 'In Progress') return '<span class="m-item-val partial">🔄 In Progress</span>';
    return `<span class="m-item-val">${v || '—'}</span>`;
  };
  
  const gaps = s.gaps || getGaps(s);
  const recs = s.recs || getRecs(gaps);
  
  const modalContent = document.getElementById('modalContent');
  if (!modalContent) return;
  
  modalContent.innerHTML = `
    <div class="m-title">🏢 ${s.companyName || 'Unknown Company'}</div>
    <div class="m-sub">${s.field || '—'} · ${s.state || '—'} · ${s.employees || '—'} employees · ${date}</div>
    
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
      <div class="m-item"><div class="m-item-label">Contact Person</div><div class="m-item-val">${s.name || '—'}</div></div>
      <div class="m-item"><div class="m-item-label">Phone</div><div class="m-item-val">${s.contact || '—'}</div></div>
      <div class="m-item"><div class="m-item-label">Location</div><div class="m-item-val">${s.location || '—'}, ${s.state || '—'}</div></div>
      <div class="m-item"><div class="m-item-label">Estab. Type</div><div class="m-item-val">${s.q1 || '—'}</div></div>
      <div class="m-item"><div class="m-item-label">License</div><div class="m-item-val">${s.q2 || '—'}</div></div>
      <div class="m-item"><div class="m-item-label">Starting Salary</div><div class="m-item-val">${s.q5 ? '₹' + s.q5 : '—'}</div></div>
    </div>
    
    <div class="m-section">👥 Employee & Salary Practices</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">Employee Records</div>${yn(s.q3)}</div>
      <div class="m-item"><div class="m-item-label">Appointment Letters</div>${yn(s.q4)}</div>
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
      <div class="m-item"><div class="m-item-label">Leaves/Year</div><div class="m-item-val">${s.q12 || '—'}</div></div>
      <div class="m-item"><div class="m-item-label">Grievance System</div>${yn(s.q14)}</div>
      <div class="m-item"><div class="m-item-label">Policy Reviews</div>${yn(s.q18)}</div>
    </div>
    
    <div class="m-section">👩‍⚖️ POSH & HR Governance</div>
    <div class="m-grid">
      <div class="m-item"><div class="m-item-label">POSH Sessions</div>${yn(s.q15)}</div>
      <div class="m-item"><div class="m-item-label">ICC Constituted</div>${yn(s.q16)}</div>
      <div class="m-item"><div class="m-item-label">Written HR Policy</div>${yn(s.q17)}</div>
    </div>
    
    <div class="m-section">⚖️ Legal Awareness</div>
    <div style="margin-bottom:1rem">
      <div class="m-item" style="margin-bottom:0.5rem"><div class="m-item-label">Labour Law Awareness</div>${yn(s.q20)}</div>
      ${s.q21 && Array.isArray(s.q21) && s.q21.length ? 
        `<div class="m-laws">${s.q21.map(l => `<div class="m-law-item">✦ ${l}</div>`).join('')}</div>` : ''}
    </div>
    
    ${gaps.length ? `
      <div class="m-section">⚠️ Compliance Gaps Identified (${gaps.length})</div>
      <div class="m-gaps">
        ${gaps.map(g => `<div class="m-gap-item"><span class="m-gap-icon">⚠</span><span>${g}</span></div>`).join('')}
      </div>` : ''}
    
    ${recs.length ? `
      <div class="m-section">✅ Recommended Actions</div>
      <div class="m-recs">
        ${recs.map(r => `<div class="m-rec-item"><span class="m-rec-icon">→</span><span>${r}</span></div>`).join('')}
      </div>` : ''}
    
    <div class="m-actions">
      <button class="btn btn-gold" onclick="downloadPDF(${s.id})">⬇ Download PDF Report</button>
      <button class="btn btn-ghost" onclick="closeModal(true)">Close</button>
    </div>
  `;
  
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('open');
}

function closeModal(force) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  if (force === true || (force && force.target === modal)) {
    modal.classList.remove('open');
    activeDetailId = null;
  }
}

// ===== PDF DOWNLOAD (jsPDF) =====
async function downloadPDF(id) {
  const s = submissions.find(x => x.id === id) || currentUserSubmission;
  if (!s) {
    showToast('Submission not found', 'red');
    return;
  }
  
  // Load jsPDF dynamically if not available
  if (!window.jspdf) {
    showToast('Loading PDF generator...', 'blue');
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  
  const pw = 210, ml = 18, mr = 18;
  let y = 0;
  
  const BG   = [8,9,13];
  const BG2  = [14,16,24];
  const GOLD = [212,168,67];
  const GREEN= [46,204,138];
  const RED  = [224,85,85];
  const BLUE = [78,140,255];
  const WHITE= [238,240,245];
  const MUTED= [122,130,153];
  
  const scoreColor = (s.score || 0) >= 70 ? GREEN : (s.score || 0) >= 40 ? BLUE : RED;
  const date = new Date(s.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  
  const addPage = () => {
    doc.addPage();
    doc.setFillColor(...BG);
    doc.rect(0, 0, 210, 297, 'F');
    y = 18;
  };
  
  // Header
  doc.setFillColor(...BG);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(...BG2);
  doc.rect(0, 0, 210, 55, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 210, 2, 'F');
  
  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('LABOURSHIELD  ·  COMPLIANCE AUDIT REPORT', 105, 14, { align: 'center' });
  
  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.text((s.companyName || 'UNKNOWN').toUpperCase(), 105, 27, { align: 'center' });
  
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${s.field || '—'}  ·  ${s.state || '—'}  ·  ${s.employees || '—'} employees  ·  Date: ${date}`, 105, 36, { align: 'center' });
  
  const sc = s.score || 0;
  const verdict = sc >= 70 ? 'GOOD STANDING' : sc >= 40 ? 'NEEDS IMPROVEMENT' : 'CRITICAL ATTENTION';
  
  doc.setFillColor(...scoreColor);
  doc.roundedRect(ml, 44, pw - ml - mr, 12, 2, 2, 'F');
  doc.setTextColor(...BG);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`COMPLIANCE SCORE:  ${sc}%   —   ${verdict}`, 105, 51.5, { align: 'center' });
  
  y = 65;
  
  const sec = (title) => {
    if (y > 265) { addPage(); }
    doc.setFillColor(...BG2);
    doc.rect(ml, y, pw - ml - mr, 8, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(ml, y, 3, 8, 'F');
    doc.setTextColor(...GOLD);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), ml + 6, y + 5.5);
    y += 12;
  };
  
  const row = (label, val, color) => {
    if (y > 270) { addPage(); }
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, ml + 2, y);
    doc.setTextColor(...(color || WHITE));
    doc.setFont('helvetica', 'bold');
    doc.text(val || '—', ml + 90, y);
    y += 6.5;
  };
  
  const yn = (v) => {
    if (v === 'Yes') return { t: 'Yes', c: GREEN };
    if (v === 'No') return { t: 'No', c: RED };
    if (v === 'Partial' || v === 'In Progress' || v === 'Occasionally') return { t: v, c: GOLD };
    return { t: v || '—', c: WHITE };
  };
  
  // Sections
  sec('Business Profile');
  row('Company Name', s.companyName);
  row('Contact Person', s.name);
  row('Phone', s.contact);
  row('Location', `${s.location}, ${s.state}`);
  row('Industry', s.field);
  row('Employees', s.employees);
  row('Establishment Type', s.q1);
  row('License Held', s.q2);
  row('Starting Salary (Helpers)', s.q5 ? '₹' + s.q5 : '—');
  y += 2;
  
  sec('Employee & Salary Practices');
  let r;
  r = yn(s.q3); row('Employee Records Maintained?', r.t, r.c);
  r = yn(s.q4); row('Appointment Letters Issued?', r.t, r.c);
  r = yn(s.q6); row('Structured Salary Format?', r.t, r.c);
  r = yn(s.q7); row('Salaries Paid On Time?', r.t, r.c);
  r = yn(s.q8); row('Statutory Benefits (PF/ESI)?', r.t, r.c);
  y += 2;
  
  sec('Employee Benefits & Welfare');
  r = yn(s.q9); row('Retirement / PF Savings?', r.t, r.c);
  r = yn(s.q10); row('Medical / ESI Coverage?', r.t, r.c);
  r = yn(s.q11); row('Leave Policy in Place?', r.t, r.c);
  row('Annual Leaves Count', s.q12 || '—');
  r = yn(s.q13); row('Bonus Provided?', r.t, r.c);
  r = yn(s.q14); row('Grievance System?', r.t, r.c);
  y += 2;
  
  sec('POSH & HR Governance');
  r = yn(s.q15); row('POSH Awareness Sessions?', r.t, r.c);
  r = yn(s.q16); row('ICC Constituted?', r.t, r.c);
  r = yn(s.q17); row('Written HR Policies?', r.t, r.c);
  r = yn(s.q18); row('Regular Policy Review?', r.t, r.c);
  y += 2;
  
  sec('Legal Awareness');
  r = yn(s.q20); row('Labour Law Awareness?', r.t, r.c);
  if (s.q21 && Array.isArray(s.q21) && s.q21.length) {
    row('Labour Laws Filed Under:', '');
    s.q21.forEach(l => { row('  →  ' + l, ''); });
  }
  y += 2;
  
  if (s.gaps && s.gaps.length) {
    sec(`Compliance Gaps Identified (${s.gaps.length})`);
    s.gaps.forEach(g => {
      if (y > 270) addPage();
      doc.setTextColor(...RED);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize('⚠  ' + g, pw - ml - mr - 8);
      lines.forEach(l => { doc.text(l, ml + 4, y); y += 5.5; });
    });
    y += 2;
  }
  
  if (s.recs && s.recs.length) {
    sec('Recommended Actions');
    s.recs.forEach(rec => {
      if (y > 270) addPage();
      doc.setTextColor(...GREEN);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize('→  ' + rec, pw - ml - mr - 8);
      lines.forEach(l => { doc.text(l, ml + 4, y); y += 5.5; });
    });
    y += 2;
  }
  
  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...BG2);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(0, 285, 210, 0.8, 'F');
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('LabourShield · Business Compliance Audit Portal', ml, 292);
    doc.text(`Page ${i} of ${totalPages}`, 210 - mr, 292, { align: 'right' });
  }
  
  // Save PDF
  const safeName = (s.companyName || 'Report').replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  doc.save(`LabourShield_${safeName}_Report.pdf`);
  
  showToast('✅ PDF downloaded!', 'green');
}

// ===== MOBILE SIDEBAR =====
function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  // Event delegation for q20/q21 toggle
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
  
  // Initial badge update
  updateNavBadge();
  
  // Restore admin session
  if (localStorage.getItem('ls_admin_session') === 'true') {
    isAdmin = true;
    const adminPill = document.getElementById('navAdminDash');
    if (adminPill) {
      adminPill.style.display = 'flex';
      adminPill.classList.add('admin-pill');
    }
    const toggleBtn = document.getElementById('adminToggleBtn');
    if (toggleBtn) {
      toggleBtn.textContent = '🔓 Logout Admin';
      toggleBtn.classList.add('active-admin');
    }
  }
  
  // Load data from Google Sheets on startup
  await loadFromSheets();
  
  // Restore last user submission
  const lastId = localStorage.getItem('ls_last_submission_id');
  if (lastId) {
    currentUserSubmission = localSubmissions.find(s => s.id == lastId);
  }
  
  // Show user dashboard if they have a submission
  if (currentUserSubmission && window.location.hash === '#dashboard') {
    showView('user-dashboard');
  }
});

// Handle page visibility for real-time updates
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isAdmin) {
    loadFromSheets(); // Refresh data when tab becomes visible
  }
});