// ============================================================
// LABOURSHIELD — FULL CODE
// script.js
// ============================================================

// ===== AUTH & INIT =====
let submissions = JSON.parse(localStorage.getItem('ls_submissions') || '[]');
const currentUser = (() => {
  let uid = localStorage.getItem('ls_current_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ls_current_user_id', uid);
  }
  return uid;
})();

let charts = {};
let activeDetailId = null;

function saveData() {
  localStorage.setItem('ls_submissions', JSON.stringify(submissions));
  updateNavBadge();
}

function updateNavBadge() {
  const count = submissions.length;
  document.getElementById('navBadge').textContent = count + ' Audit' + (count !== 1 ? 's' : '');
}

// ===== VIEW SWITCHING =====
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  
  // Toggle Pills
  document.getElementById('navForm').classList.toggle('active', name === 'form');
  document.getElementById('navDash').classList.toggle('active', name === 'dashboard');
  document.getElementById('navAdmin').classList.toggle('active', name === 'admin');

  // Init specific view logic
  if (name === 'dashboard') {
    setTimeout(renderDashboard, 50);
  } else if (name === 'admin') {
    setTimeout(renderAdminDashboard, 50);
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PAGE NAVIGATION =====
function goPage2() {
  const fields = ['name','contact','state','location','companyName','employees','field'];
  let ok = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add('error'); ok = false; }
    else el.classList.remove('error');
  });
  if (!ok) { showToast('Please fill all required fields.', 'red'); return; }

  document.getElementById('pg1').style.display = 'none';
  document.getElementById('pg2').style.display = 'block';

  const sd1 = document.getElementById('sd1');
  sd1.classList.remove('active');
  sd1.classList.add('done');
  sd1.innerHTML = '<span>✓</span>';
  document.getElementById('sr1').classList.add('done');
  document.getElementById('sd2').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goPage1() {
  document.getElementById('pg1').style.display = 'block';
  document.getElementById('pg2').style.display = 'none';
  const sd1 = document.getElementById('sd1');
  sd1.className = 'step-dot active';
  sd1.innerHTML = '<span>1</span>';
  document.getElementById('sr1').classList.remove('done');
  document.getElementById('sd2').classList.remove('active');
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

// Q20 → Q21 conditional
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('change', e => {
    if (e.target.name === 'q20') {
      const box = document.getElementById('q21box');
      if (e.target.value === 'Yes') {
        box.style.display = 'block';
      } else {
        box.style.display = 'none';
        document.querySelectorAll('input[name="q21"]').forEach(c => c.checked = false);
      }
    }
  });
  updateNavBadge();
});

// ===== COMPLIANCE SCORE LOGIC =====
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
  if (d.q20 === 'Yes' && d.q21.length > 0 && !d.q21.includes('Not Sure')) {
    checks.push(true);
  }
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

// ===== SUBMIT =====
function submitAudit() {
  const required = ['q1','q2','q3','q4','q6','q7','q8','q9','q10','q11','q13','q14','q15','q16','q17','q18','q19','q20'];
  let ok = true;
  required.forEach(n => { if (!getRadio(n)) ok = false; });

  if (!ok) { showToast('Please answer all required questions (Q1–Q20).', 'red'); return; }

  const d = {
    id: Date.now(),
    userId: currentUser, // ATTACH USER ID HERE
    submittedAt: new Date().toISOString(),
    name: document.getElementById('name').value,
    contact: document.getElementById('contact').value,
    state: document.getElementById('state').value,
    location: document.getElementById('location').value,
    employees: document.getElementById('employees').value,
    companyName: document.getElementById('companyName').value,
    field: document.getElementById('field').value,
    q1: getRadio('q1'), q2: getRadio('q2'),
    q3: getRadio('q3'), q4: getRadio('q4'),
    q5: document.getElementById('q5').value,
    q6: getRadio('q6'), q7: getRadio('q7'), q8: getRadio('q8'),
    q9: getRadio('q9'), q10: getRadio('q10'),
    q11: getRadio('q11'), q12: document.getElementById('q12').value,
    q13: getRadio('q13'), q14: getRadio('q14'),
    q15: getRadio('q15'), q16: getRadio('q16'),
    q17: getRadio('q17'), q18: getRadio('q18'),
    q19: getRadio('q19'), q20: getRadio('q20'),
    q21: getCbx('q21'),
  };
  d.score = calcScore(d);
  d.gaps = getGaps(d);
  d.recs = getRecs(d.gaps);

  submissions.unshift(d);
  saveData();

  // Show success
  document.getElementById('pg2').style.display = 'none';
  const sc = d.score;
  const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
  const label = sc >= 70 ? 'Good Standing ✦' : sc >= 40 ? 'Needs Improvement' : 'Critical Attention Required';
  document.getElementById('successScoreBox').innerHTML = `
    <div class="score-pill ${cls}">${sc}%</div>
    <div style="font-size:0.82rem;color:var(--text2);margin-bottom:0.5rem;">${label}</div>
    <div style="font-size:0.8rem;color:var(--text2);">${d.gaps.length} gap${d.gaps.length !== 1 ? 's' : ''} identified</div>
  `;
  document.getElementById('pgSuccess').style.display = 'block';
  showToast('Audit submitted successfully!', 'green');
}

function resetForm() {
  document.getElementById('pgSuccess').style.display = 'none';
  document.getElementById('pg1').style.display = 'block';
  document.getElementById('pg2').style.display = 'none';
  document.getElementById('q21box').style.display = 'none';
  document.querySelectorAll('input, select').forEach(el => {
    if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  goPage1();
}

// ===== TOAST =====
function showToast(msg, color = 'gold') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'toast';
  t.textContent = msg;
  const colors = { green: '#2ecc8a', red: '#e05555', gold: '#d4a843' };
  t.style.cssText = `
    position:fixed; bottom:2rem; right:2rem; z-index:999;
    background:${colors[color] || colors.gold}; color:#08090d;
    padding:0.75rem 1.5rem; border-radius:10px;
    font-family:'Syne',sans-serif; font-weight:700; font-size:0.82rem;
    box-shadow:0 8px 30px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease;
  `;
  document.head.insertAdjacentHTML('beforeend', '<style>@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}</style>');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ========================================================
// USER DASHBOARD RENDER (Filtered by User)
// ========================================================
function renderDashboard() {
  // FILTER FOR CURRENT USER ONLY
  const userData = submissions.filter(s => s.userId === currentUser);
  
  // Stats
  document.getElementById('st0').textContent = userData.length;
  const avg = userData.length ? Math.round(userData.reduce((a,b) => a+b.score, 0) / userData.length) : 0;
  document.getElementById('st1').textContent = userData.length ? avg + '%' : '—';
  document.getElementById('st2').textContent = userData.length ? Math.round(userData.filter(s=>s.q9==='Yes').length/userData.length*100)+'%' : '—';
  document.getElementById('st3').textContent = userData.length ? Math.round(userData.filter(s=>s.q10==='Yes').length/userData.length*100)+'%' : '—';
  document.getElementById('st4').textContent = userData.length ? Math.round(userData.filter(s=>s.q15==='Yes').length/userData.length*100)+'%' : '—';

  renderSidebar(userData);
  renderCharts(userData);
  renderTable(userData);
}

// Sidebar for User
function renderSidebar(dataToUse) {
  const q = (document.getElementById('sideSearch').value || '').toLowerCase();
  const filtered = dataToUse.filter(s =>
    (s.companyName || '').toLowerCase().includes(q) ||
    (s.name || '').toLowerCase().includes(q)
  );
  
  // Only update count for user sidebar
  document.getElementById('sidebarCount').textContent = dataToUse.length;
  
  const list = document.getElementById('sidebarList');

  if (!filtered.length) {
    list.innerHTML = '<div class="sidebar-empty">No results found for you.</div>';
    return;
  }

  list.innerHTML = filtered.map(s => {
    const sc = s.score;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    const date = new Date(s.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    return `<div class="sidebar-card ${activeDetailId === s.id ? 'active' : ''}" onclick="showDetail(${s.id})">
      <div class="sc-name">${s.companyName}</div>
      <div class="sc-meta">
        <span>${s.state} · ${date}</span>
        <span class="sc-score ${cls}">${sc}%</span>
      </div>
    </div>`;
  }).join('');
}

// Tables for User
function renderTable(dataToUse) {
  const q = (document.getElementById('tblSearch').value || '').toLowerCase();
  const data = dataToUse
    .filter(s => (s.companyName || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q));

  const tbody = document.getElementById('tblBody');
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-td">No submissions found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((s, i) => {
    const sc = s.score;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    return `<tr>
      <td style="color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:0.75rem">${String(i+1).padStart(2,'0')}</td>
      <td>
        <div style="font-weight:700;color:var(--white);font-size:0.85rem">${s.companyName}</div>
        <div style="font-size:0.72rem;color:var(--text2)">${s.name}</div>
      </td>
      <td>${s.state}</td>
      <td><span class="badge info">${s.employees}</span></td>
      <td style="font-size:0.8rem">${s.q1 || '—'}</td>
      <td><span class="badge ${cls}">${sc}%</span></td>
      <td>
        <button class="btn btn-gold" style="padding:0.35rem 0.75rem;font-size:0.75rem" onclick="showDetail(${s.id})">View Report</button>
      </td>
    </tr>`;
  }).join('');
}

// ========================================================
// ADMIN DASHBOARD RENDER (ALL DATA)
// ========================================================
function renderAdminDashboard() {
  const allData = submissions; // GET EVERYTHING
  
  // Admin Stats
  document.getElementById('adminTotal').textContent = allData.length;
  
  const goodCount = allData.filter(s => s.score >= 70).length;
  const critCount = allData.filter(s => s.score < 40).length;
  const midCount = allData.filter(s => s.score >= 40 && s.score < 70).length;
  const pendingLic = allData.filter(s => s.q2 === 'Not Yet Taken' || s.q2 === '').length;

  document.getElementById('adminCrit').textContent = critCount;
  document.getElementById('adminMid').textContent = midCount;
  document.getElementById('adminGood').textContent = goodCount;
  document.getElementById('adminPending').textContent = pendingLic;
  document.getElementById('totalAdminCount').textContent = allData.length + " Companies";

  // Render Global Elements
  renderGlobalSidebar(allData);
  renderAdminCharts(allData);
  renderAdminTable(allData);
}

function renderGlobalSidebar(dataToUse) {
  const q = (document.getElementById('globalSearch').value || '').toLowerCase();
  const filtered = dataToUse.filter(s =>
    (s.companyName || '').toLowerCase().includes(q) ||
    (s.name || '').toLowerCase().includes(q) ||
    (s.state || '').toLowerCase().includes(q)
  );

  const list = document.getElementById('adminSidebarList');
  if (!filtered.length) {
    list.innerHTML = '<div class="sidebar-empty">No matches found globally.</div>';
    return;
  }

  list.innerHTML = filtered.map(s => {
    const sc = s.score;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    return `<div class="sidebar-card" onclick="showDetail(${s.id})">
      <div class="sc-name">${s.companyName}</div>
      <div class="sc-meta">
        <span>${s.state}</span>
        <span class="sc-score ${cls}">${sc}%</span>
      </div>
    </div>`;
  }).join('');
}

// Chart Logic Helper for Admin
function dc(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function pct(key, val) { return submissions.length ? Math.round(submissions.filter(s => s[key] === val).length / submissions.length * 100) : 0; }

function renderAdminCharts(allData) {
  const tickColor = '#7a8299';
  const gridColor = 'rgba(255,255,255,0.05)';
  const fontFam = 'Syne';

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: tickColor, font: { family: fontFam, size: 11 }, padding: 12 } }
    },
    scales: {
      x: { ticks: { color: tickColor, font: { family: fontFam, size: 10 } }, grid: { color: gridColor } },
      y: { ticks: { color: tickColor, font: { family: fontFam, size: 10 } }, grid: { color: gridColor }, beginAtZero: true, max: 100 }
    }
  };

  // 1. Bar — National Compliance
  dc('chartGlobalBar');
  charts.bar = new Chart(document.getElementById('chartGlobalBar'), {
    type: 'bar',
    data: {
      labels: ['Licensing', 'Records', 'Salary Struct.', 'Timely Pay', 'PF/Savings', 'ESI/Medical', 'Leave', 'POSH'],
      datasets: [{
        label: '% Compliant',
        data: [
          pct('q2', 'Factory License') + pct('q2', 'Shops & Establishment License') + pct('q2', 'Both'),
          pct('q3', 'Yes'), pct('q6', 'Yes'), pct('q7', 'Yes'),
          pct('q9', 'Yes'), pct('q10', 'Yes'), pct('q11', 'Yes'), pct('q15', 'Yes')
        ],
        backgroundColor: ['#d4a843','#2ecc8a','#4e8cff','#a78bfa','#2ecc8a','#d4a843','#4e8cff','#e05555'],
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: { ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }
  });

  // 2. Donut — Risk Distribution
  dc('chartGlobalDonut');
  charts.donut = new Chart(document.getElementById('chartGlobalDonut'), {
    type: 'doughnut',
    data: {
      labels: ['Good (>70)', 'Moderate (40-70)', 'Critical (<40)'],
      datasets: [{
        data: [
          allData.filter(s=>s.score>=70).length,
          allData.filter(s=>s.score>=40 && s.score<70).length,
          allData.filter(s=>s.score<40).length
        ],
        backgroundColor: ['#2ecc8a','#4e8cff','#e05555'],
        borderWidth: 0, hoverOffset: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { position: 'bottom', labels: { color: tickColor, font: { family: fontFam, size: 11 }, padding: 10 } } }
    }
  });

  // 3. Pie — Industry Breakdown
  dc('chartGlobalPie');
  const indCounts = {};
  allData.forEach(s => { if(s.field) indCounts[s.field] = (indCounts[s.field]||0)+1; });
  const labels = Object.keys(indCounts).slice(0, 5);
  const values = labels.map(l => indCounts[l]);
  
  charts.ind = new Chart(document.getElementById('chartGlobalPie'), {
    type: 'pie',
    data: {
      labels: labels.length ? labels : ['None'],
      datasets: [{ data: values.length ? values : [1], backgroundColor: ['#d4a843','#2ecc8a','#4e8cff','#a78bfa'] }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: tickColor, font: { family: fontFam, size: 11 }, padding: 10 } } }
    }
  });

  // 4. Polar — License Status
  dc('chartGlobalPolar');
  licenses = ['Licensed', 'Applied', 'Missing'];
  licVals = [
    allData.filter(s => s.q2 !== '' && s.q2 !== 'Not Yet Taken').length,
    allData.filter(s => s.q2 === 'Applied').length,
    allData.filter(s => s.q2 === 'Not Yet Taken').length
  ];
  charts.pol = new Chart(document.getElementById('chartGlobalPolar'), {
    type: 'polarArea',
    data: {
      labels: licenses,
      datasets: [{ data: licVals, backgroundColor: ['#2ecc8a','#d4a843','#e05555'], borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { r: { ticks: { display: false, backdropColor: 'transparent' }, grid: { color: gridColor } } },
      plugins: { legend: { position: 'right', labels: { color: tickColor, font: { family: fontFam, size: 11 }, padding: 10 } } }
    }
  });
}

function renderAdminTable(allData) {
  const q = (document.getElementById('tblSearch').value || '').toLowerCase();
  const data = allData.filter(s =>
    (s.companyName || '').toLowerCase().includes(q) ||
    (s.name || '').toLowerCase().includes(q) ||
    (s.state || '').toLowerCase().includes(q)
  );

  const tbody = document.getElementById('adminTblBody');
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-td">No submissions found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(s => {
    const sc = s.score;
    const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
    const verdict = sc >= 70 ? 'Compliant' : sc >= 40 ? 'Monitor' : 'Alert';
    
    return `<tr>
      <td><span class="badge info">#${String(s.id).slice(-4)}</span></td>
      <td>
        <div style="font-weight:700;color:var(--white)">${s.companyName}</div>
        <div style="font-size:0.7rem;color:var(--text2)">${s.field}</div>
      </td>
      <td>${s.name}<br><small style="color:var(--text2)">${s.contact}</small></td>
      <td>${s.state}</td>
      <td>${s.employees}</td>
      <td style="font-size:0.8rem">${s.q1 || '-'}</td>
      <td><span class="badge ${cls}">${sc}%</span></td>
      <td><span class="badge ${cls === 'low' ? 'low' : cls === 'mid' ? 'info' : 'good'}">${verdict}</span></td>
      <td style="font-size:0.75rem;color:var(--text2)">${verdict}</td>
      <td>
        <button class="btn btn-ghost" style="padding:0.35rem 0.6rem;font-size:0.7rem" onclick="showDetail(${s.id})">View</button>
      </td>
    </tr>`;
  }).join('');
}

// ========================================================
// MODAL & PDF (Shared)
// ========================================================
function showDetail(id) {
  const s = submissions.find(x => x.id === id);
  if (!s) return;
  activeDetailId = id;
  
  // Find which sidebar needs update
  if(document.getElementById('view-dashboard').classList.contains('active')) renderSidebar(submissions.filter(x=>x.userId===currentUser));
  else if(document.getElementById('view-admin').classList.contains('active')) renderGlobalSidebar(submissions);

  const sc = s.score;
  const cls = sc >= 70 ? 'good' : sc >= 40 ? 'mid' : 'low';
  const color = sc >= 70 ? 'var(--green)' : sc >= 40 ? 'var(--blue)' : 'var(--red)';
  const verdict = sc >= 70 ? 'Strong compliance posture. Continue maintaining documentation.'
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

  document.getElementById('modalContent').innerHTML = `
    <div class="m-title">🏢 ${s.companyName}</div>
    <div class="m-sub">${s.field} · ${s.state} · ${s.employees} employees · ${date}</div>

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
      <div class="m-item"><div class="m-item-label">Contact Person</div><div class="m-item-val">${s.name}</div></div>
      <div class="m-item"><div class="m-item-label">Phone</div><div class="m-item-val">${s.contact}</div></div>
      <div class="m-item"><div class="m-item-label">Location</div><div class="m-item-val">${s.location}, ${s.state}</div></div>
      <div class="m-item"><div class="m-item-label">Estab. Type</div><div class="m-item-val">${s.q1 || '—'}</div></div>
      <div class="m-item"><div class="m-item-label">License</div><div class="m-item-val">${s.q2 || '—'}</div></div>
    </div>

    <div class="m-section">⚠️ Compliance Gaps Identified (${gaps.length})</div>
    <div class="m-gaps">
      ${gaps.map(g => `<div class="m-gap-item"><span class="m-gap-icon">⚠</span><span>${g}</span></div>`).join('')}
    </div>

    <div class="m-section">✅ Recommended Actions</div>
    <div class="m-recs">
      ${recs.map(r => `<div class="m-rec-item"><span class="m-rec-icon">→</span><span>${r}</span></div>`).join('')}
    </div>

    <div class="m-actions">
      <button class="btn btn-gold" onclick="downloadPDF(${s.id})">⬇ Download PDF Report</button>
      <button class="btn btn-ghost" onclick="closeModal(true)">Close</button>
    </div>
  `;

  document.getElementById('modal').classList.add('open');
}

function closeModal(force) {
  if (force === true || (force && force.target === document.getElementById('modal'))) {
    document.getElementById('modal').classList.remove('open');
    activeDetailId = null;
  }
}

// PDF Generation (Shared)
async function downloadPDF(id) {
  const s = submissions.find(x => x.id === id);
  if (!s) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pw = 210, ml = 18, mr = 18;
  let y = 0;

  const BG   = [8,9,13];
  const GOLD = [212,168,67];
  const GREEN= [46,204,138];
  const RED  = [224,85,85];
  const WHITE= [238,240,245];
  const MUTED= [122,130,153];

  const scoreColor = s.score >= 70 ? GREEN : s.score >= 40 ? BLUE : RED;
  const date = new Date(s.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  const sec = (title) => {
    if (y > 265) { doc.addPage(); y = 18; }
    doc.setFillColor(...[14,16,24]);
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
    if (y > 270) { doc.addPage(); y = 18; }
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, ml + 2, y);
    doc.setTextColor(...(color || WHITE));
    doc.setFont('helvetica', 'bold');
    doc.text(val || '—', ml + 90, y);
    y += 6.5;
  };

  // PAGE SETUP
  doc.setFillColor(...BG);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(...[14,16,24]);
  doc.rect(0, 0, 210, 55, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 210, 2, 'F');
  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('LABOURSHIELD  ·  COMPLIANCE AUDIT REPORT', 105, 14, { align: 'center' });
  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.text(s.companyName.toUpperCase(), 105, 27, { align: 'center' });
  
  // SCORE BOX
  const sc = s.score;
  const verdict = sc >= 70 ? 'GOOD STANDING' : sc >= 40 ? 'NEEDS IMPROVEMENT' : 'CRITICAL ATTENTION';
  doc.setFillColor(...scoreColor);
  doc.roundedRect(ml, 44, pw - ml - mr, 12, 2, 2, 'F');
  doc.setTextColor(...BG);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`COMPLIANCE SCORE:  ${sc}%   —   ${verdict}`, 105, 51.5, { align: 'center' });

  y = 65;

  sec('Business Profile');
  row('Contact Person', s.name);
  row('Phone', s.contact);
  row('Location', `${s.location}, ${s.state}`);
  row('Industry', s.field);
  row('Employees', s.employees);
  row('Establishment Type', s.q1);
  row('License Held', s.q2);

  sec('Audit Answers');
  const yn = (v) => {
    if (v === 'Yes') return { t: 'Yes', c: GREEN };
    if (v === 'No') return { t: 'No', c: RED };
    if (v === 'Partial' || v === 'In Progress') return { t: v, c: GOLD };
    return { t: v || '—', c: WHITE };
  };
  row('Employee Records Maintained?', yn(s.q3).t, yn(s.q3).c);
  row('Appointment Letters Issued?', yn(s.q4).t, yn(s.q4).c);
  row('Structured Salary Format?', yn(s.q6).t, yn(s.q6).c);
  row('Salaries Paid On Time?', yn(s.q7).t, yn(s.q7).c);
  row('Statutory Benefits (PF/ESI)?', yn(s.q8).t, yn(s.q8).c);
  row('Retirement / PF Savings?', yn(s.q9).t, yn(s.q9).c);
  row('Medical / ESI Coverage?', yn(s.q10).t, yn(s.q10).c);
  row('Leave Policy in Place?', yn(s.q11).t, yn(s.q11).c);
  row('Bonus Provided?', yn(s.q13).t, yn(s.q13).c);
  row('POSH Sessions Conducted?', yn(s.q15).t, yn(s.q15).c);
  row('ICC Constituted?', yn(s.q16).t, yn(s.q16).c);
  row('Written HR Policies?', yn(s.q17).t, yn(s.q17).c);

  if (s.gaps && s.gaps.length) {
    sec(`Gaps (${s.gaps.length})`);
    s.gaps.forEach(g => {
       if (y > 270) doc.addPage();
       doc.setTextColor(...RED);
       doc.setFontSize(8);
       const lines = doc.splitTextToSize(g, pw - ml - mr - 8);
       lines.forEach(l => { doc.text(l, ml + 4, y); y += 5.5; });
    });
  }

  if (s.recs && s.recs.length) {
    sec('Recommendations');
    s.recs.forEach(r => {
       if (y > 270) doc.addPage();
       doc.setTextColor(...GREEN);
       doc.setFontSize(8);
       const lines = doc.splitTextToSize(r, pw - ml - mr - 8);
       lines.forEach(l => { doc.text(l, ml + 4, y); y += 5.5; });
    });
  }

  doc.save(`LabourShield_${s.companyName.replace(/\s+/g,'_')}_Report.pdf`);
  showToast('PDF downloaded!', 'green');
}

// Helper for PDF export all
function downloadAllReports() {
  alert('Feature: In a real app, this would loop through submissions and zip them or export a master CSV.');
}

// Mobile Sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Init
window.onload = () => {
  updateNavBadge();
  renderDashboard();
};