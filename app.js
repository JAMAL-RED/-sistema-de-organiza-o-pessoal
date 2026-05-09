/* ═══════════════════════════════════════════════
   LifeOS — app.js
   Full interactivity: navigation, tasks, habits,
   goals, study log, fitness, finance, pomodoro
═══════════════════════════════════════════════ */

'use strict';

/* ── UTILS ─────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const LS = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d = new Date()) =>
  d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtBRL = (n) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ── MOTIVATIONAL PHRASES ───────────────────── */
const PHRASES = [
  'A disciplina é a ponte entre metas e realizações.',
  'Cada dia é uma página em branco — escreva algo que valha a pena.',
  'O segredo é começar antes de estar pronto.',
  'Pequenas ações consistentes constroem grandes resultados.',
  'Excelência não é um ato, é um hábito.',
  'O momento de plantar uma árvore foi há 20 anos. O segundo melhor momento é agora.',
  'Foco no progresso, não na perfeição.',
  'Sua rotina define seu destino.',
  'Quem controla seu tempo controla sua vida.',
  'A grandeza começa onde a zona de conforto termina.'
];

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let state = LS.get('lifeos_state') || {
  tasks: [],
  studySessions: [],
  exercises: [],
  healthLogs: [],
  transactions: [],
  goals: {
    curto: [
      { id: 1, title: 'Ler 12 livros no ano', deadline: '2025-12-31', reason: 'Ampliar conhecimento', steps: 'Ler 30 min/dia', difficulty: 'Média', priority: 'Alta', progress: 58 },
      { id: 2, title: 'Correr 5km sem parar', deadline: '2025-09-01', reason: 'Condicionamento físico', steps: 'Treinar 4x/semana', difficulty: 'Alta', priority: 'Alta', progress: 72 }
    ],
    medio: [
      { id: 3, title: 'Certificação AWS', deadline: '2025-11-30', reason: 'Crescimento profissional', steps: 'Estudar 1h/dia', difficulty: 'Alta', priority: 'Alta', progress: 35 }
    ],
    longo: [
      { id: 4, title: 'Economizar R$10.000', deadline: '2026-06-01', reason: 'Reserva de emergência', steps: 'Economizar R$1.000/mês', difficulty: 'Média', priority: 'Alta', progress: 44 }
    ]
  },
  habits: {
    list: ['Acordar Cedo', 'Dormir no Horário', 'Beber Água', 'Estudar', 'Ler', 'Treinar', 'Meditar', 'Sem Redes Sociais', 'Alimentação Saudável'],
    log: {} // { 'YYYY-MM-DD': { 'Hábito': true/false } }
  },
  pomodoro: { sessions: 0, date: today() }
};

const save = () => LS.set('lifeos_state', state);

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  initPhrase();
  initNav();
  initConsistency();
  initProductivityBars();
  initDaily();
  initHabits();
  initGoals('curto');
  initStudy();
  initFitness();
  initFinance();
  initPomodoro();
  initModal();
  initPrint();
  initSidebarToggle();
});

/* ── DATE ───────────────────────────────────── */
function initDate() {
  const el = $('#currentDate');
  if (el) el.innerHTML = fmtDate().replace(',', ',<br>');
}

/* ── PHRASE ─────────────────────────────────── */
function initPhrase() {
  const el = $('#dailyPhrase');
  if (el) el.textContent = '"' + PHRASES[new Date().getDay() % PHRASES.length] + '"';
}

/* ── NAVIGATION ─────────────────────────────── */
function initNav() {
  $$('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = link.dataset.section;
      $$('.nav-item').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      $$('.section').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(sec);
      if (target) target.classList.add('active');
      // close sidebar on mobile
      if (window.innerWidth < 900) $('#sidebar').classList.remove('open');
    });
  });
}

/* ── SIDEBAR TOGGLE ─────────────────────────── */
function initSidebarToggle() {
  $('#menuToggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
  });
}

/* ── PRINT ──────────────────────────────────── */
function initPrint() {
  $('#printBtn').addEventListener('click', () => window.print());
}

/* ═══════════════════════════════════════════
   CONSISTENCY GRID (Dashboard)
═══════════════════════════════════════════ */
function initConsistency() {
  const grid = $('#consistencyGrid');
  if (!grid) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  grid.innerHTML = '';
  for (let d = 1; d <= days; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const log = state.habits.log[key] || {};
    const done = Object.values(log).filter(Boolean).length;
    const total = state.habits.list.length;
    const pct = total ? done / total : 0;
    const level = pct === 0 ? 0 : pct < .4 ? 1 : pct < .75 ? 2 : 3;
    const div = document.createElement('div');
    div.className = `cons-day level-${level}`;
    div.title = `${d}/${month+1}: ${done}/${total} hábitos`;
    div.addEventListener('click', () => {
      const lvl = (parseInt(div.className.match(/level-(\d)/)[1]) + 1) % 4;
      div.className = `cons-day level-${lvl}`;
    });
    grid.appendChild(div);
  }
}

/* ═══════════════════════════════════════════
   PRODUCTIVITY BARS (Dashboard)
═══════════════════════════════════════════ */
function initProductivityBars() {
  setTimeout(() => {
    $$('.prod-bar-row').forEach(row => {
      const val = parseInt(row.dataset.val);
      const fill = row.querySelector('.prod-fill');
      if (fill) fill.style.width = val + '%';
    });
  }, 200);
}

/* ═══════════════════════════════════════════
   DAILY PLANNER
═══════════════════════════════════════════ */
const CATEGORIES = ['Trabalho', 'Estudos', 'Academia', 'Alimentação', 'Dev. Pessoal', 'Descanso', 'Lazer', 'Projetos'];
const STATUSES = ['Não Iniciado', 'Em Andamento', 'Concluído', 'Atrasado'];
const STATUS_CLASSES = { 'Não Iniciado': 'badge-todo', 'Em Andamento': 'badge-doing', 'Concluído': 'badge-done', 'Atrasado': 'badge-late' };

function initDaily() {
  renderTasks();
  $('#addTaskBtn').addEventListener('click', () => openTaskModal());

  // Mood buttons
  $$('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

function renderTasks() {
  const tbody = $('#dailyBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!state.tasks.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-light)">Nenhuma tarefa ainda. Clique em "+ Adicionar" para começar.</td></tr>`;
    return;
  }
  state.tasks.forEach((task, i) => {
    const tr = document.createElement('tr');
    if (task.status === 'Concluído') tr.classList.add('completed');
    tr.innerHTML = `
      <td><input type="checkbox" ${task.status === 'Concluído' ? 'checked' : ''} style="accent-color:var(--teal);width:16px;height:16px;" data-i="${i}" class="task-check" /></td>
      <td>${task.time || '—'}</td>
      <td style="font-weight:500">${task.activity}</td>
      <td><span style="background:var(--teal-light);color:var(--teal);border-radius:99px;padding:2px 10px;font-size:11px;font-weight:600;">${task.category}</span></td>
      <td><span class="prio-${task.priority.toLowerCase()}"><span class="prio-dot"></span>${task.priority}</span></td>
      <td><span class="badge ${STATUS_CLASSES[task.status] || 'badge-todo'}">${task.status}</span></td>
      <td style="font-size:12px;color:var(--text-muted)">${task.notes || '—'}</td>
      <td><button class="btn-delete" data-i="${i}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  $$('.task-check', tbody).forEach(cb => {
    cb.addEventListener('change', () => {
      const i = parseInt(cb.dataset.i);
      state.tasks[i].status = cb.checked ? 'Concluído' : 'Não Iniciado';
      save(); renderTasks();
    });
  });
  $$('.btn-delete', tbody).forEach(btn => {
    btn.addEventListener('click', () => {
      state.tasks.splice(parseInt(btn.dataset.i), 1);
      save(); renderTasks();
    });
  });
}

function openTaskModal() {
  openModal('Nova Tarefa', `
    <div class="form-grid">
      <div class="form-row"><label>Horário</label><input type="time" id="fTime" /></div>
      <div class="form-row"><label>Prioridade</label>
        <select id="fPrio"><option>Alta</option><option>Média</option><option>Baixa</option></select></div>
    </div>
    <div class="form-row"><label>Atividade</label><input type="text" id="fAct" placeholder="Nome da atividade…" /></div>
    <div class="form-grid">
      <div class="form-row"><label>Categoria</label>
        <select id="fCat">${CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select></div>
      <div class="form-row"><label>Status</label>
        <select id="fStatus">${STATUSES.map(s => `<option>${s}</option>`).join('')}</select></div>
    </div>
    <div class="form-row"><label>Observações</label><input type="text" id="fNotes" placeholder="Opcional…" /></div>
  `, () => {
    const activity = $('#fAct').value.trim();
    if (!activity) return false;
    state.tasks.push({
      time: $('#fTime').value,
      activity,
      category: $('#fCat').value,
      priority: $('#fPrio').value,
      status: $('#fStatus').value,
      notes: $('#fNotes').value,
      date: today()
    });
    save(); renderTasks();
  });
}

/* ═══════════════════════════════════════════
   HABITS
═══════════════════════════════════════════ */
function initHabits() {
  renderHabitTable();
  renderHabitConsistency();
}

function getHabitLog(dateStr) {
  if (!state.habits.log[dateStr]) state.habits.log[dateStr] = {};
  return state.habits.log[dateStr];
}

function renderHabitTable() {
  const head = $('#habitHead');
  const body = $('#habitBody');
  if (!head || !body) return;

  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }) });
  }

  head.innerHTML = `<tr><th>Hábito</th>${days.map(d => `<th>${d.label}</th>`).join('')}<th>%</th></tr>`;
  body.innerHTML = '';

  state.habits.list.forEach(habit => {
    const tr = document.createElement('tr');
    let cells = `<td>${habit}</td>`;
    let count = 0;
    days.forEach(({ date }) => {
      const log = getHabitLog(date);
      const checked = log[habit] || false;
      if (checked) count++;
      cells += `<td><button class="habit-check ${checked ? 'checked' : ''}" data-habit="${habit}" data-date="${date}">${checked ? '✓' : ''}</button></td>`;
    });
    const pct = Math.round((count / days.length) * 100);
    cells += `<td style="font-weight:700;color:var(--teal)">${pct}%</td>`;
    tr.innerHTML = cells;
    body.appendChild(tr);
  });

  $$('.habit-check', body).forEach(btn => {
    btn.addEventListener('click', () => {
      const { habit, date } = btn.dataset;
      const log = getHabitLog(date);
      log[habit] = !log[habit];
      btn.classList.toggle('checked', log[habit]);
      btn.textContent = log[habit] ? '✓' : '';
      save();
      renderHabitConsistency();
      initConsistency();
    });
  });
}

function renderHabitConsistency() {
  const el = $('#habitConsistency');
  if (!el) return;
  const allDates = Object.keys(state.habits.log);
  el.innerHTML = '';
  state.habits.list.forEach(habit => {
    let done = 0;
    allDates.forEach(d => { if (state.habits.log[d][habit]) done++; });
    const total = Math.max(allDates.length, 1);
    const pct = Math.round((done / total) * 100);
    const row = document.createElement('div');
    row.className = 'hc-row';
    row.innerHTML = `<span class="hc-name">${habit}</span>
      <div class="hc-bar"><div class="hc-fill" style="width:${pct}%"></div></div>
      <span class="hc-pct">${pct}%</span>`;
    el.appendChild(row);
  });
}

/* ═══════════════════════════════════════════
   GOALS
═══════════════════════════════════════════ */
let currentGoalTab = 'curto';

function initGoals(tab) {
  currentGoalTab = tab;
  renderGoals();
  $$('.gtab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.gtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGoalTab = btn.dataset.tab;
      renderGoals();
    });
  });
  $('#addGoalBtn').addEventListener('click', openGoalModal);
}

function renderGoals() {
  const panel = $('#goalsPanel');
  if (!panel) return;
  const goals = state.goals[currentGoalTab] || [];
  panel.innerHTML = '';
  if (!goals.length) {
    panel.innerHTML = `<div style="color:var(--text-light);padding:20px 0">Nenhuma meta cadastrada ainda.</div>`;
    return;
  }
  goals.forEach((g, i) => {
    const pct = g.progress || 0;
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div>
        <div class="goal-card-title">${g.title}</div>
        <div class="goal-card-meta">
          <span>📅 ${g.deadline || '—'}</span>
          <span>⚡ ${g.priority}</span>
          <span>🎯 ${g.difficulty}</span>
        </div>
        <div style="margin-top:12px;font-size:13px;color:var(--text-muted)">${g.reason || ''}</div>
        <div class="progress-bar" style="margin-top:12px">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Passos: ${g.steps || '—'}</div>
      </div>
      <div class="goal-card-progress">
        <div class="goal-ring" style="--pct:${pct * 3.6}deg">
          <div class="goal-ring-inner">${pct}%</div>
        </div>
        <button class="btn-delete" data-i="${i}">✕</button>
      </div>
    `;
    panel.appendChild(card);
  });

  $$('.btn-delete', panel).forEach(btn => {
    btn.addEventListener('click', () => {
      state.goals[currentGoalTab].splice(parseInt(btn.dataset.i), 1);
      save(); renderGoals();
    });
  });
}

function openGoalModal() {
  openModal('Nova Meta', `
    <div class="form-row"><label>Meta</label><input type="text" id="gTitle" placeholder="Descreva sua meta…" /></div>
    <div class="form-grid">
      <div class="form-row"><label>Prazo</label><input type="date" id="gDeadline" /></div>
      <div class="form-row"><label>Progresso %</label><input type="number" id="gProgress" min="0" max="100" value="0" /></div>
    </div>
    <div class="form-row"><label>Motivo</label><input type="text" id="gReason" placeholder="Por que isso importa?" /></div>
    <div class="form-row"><label>Passos necessários</label><input type="text" id="gSteps" placeholder="Como você vai chegar lá?" /></div>
    <div class="form-grid">
      <div class="form-row"><label>Dificuldade</label>
        <select id="gDiff"><option>Baixa</option><option>Média</option><option>Alta</option></select></div>
      <div class="form-row"><label>Prioridade</label>
        <select id="gPrio"><option>Alta</option><option>Média</option><option>Baixa</option></select></div>
    </div>
  `, () => {
    const title = $('#gTitle').value.trim();
    if (!title) return false;
    state.goals[currentGoalTab].push({
      id: Date.now(),
      title,
      deadline: $('#gDeadline').value,
      reason: $('#gReason').value,
      steps: $('#gSteps').value,
      difficulty: $('#gDiff').value,
      priority: $('#gPrio').value,
      progress: parseInt($('#gProgress').value) || 0
    });
    save(); renderGoals();
  });
}

/* ═══════════════════════════════════════════
   STUDY
═══════════════════════════════════════════ */
const DIFFICULTIES = ['Fácil', 'Médio', 'Difícil'];

function initStudy() {
  renderStudy();
  $('#addStudyBtn').addEventListener('click', openStudyModal);
}

function renderStudy() {
  const tbody = $('#studyBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!state.studySessions.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-light)">Nenhuma sessão de estudo registrada ainda.</td></tr>`;
    return;
  }
  state.studySessions.forEach((s, i) => {
    const pct = s.progress || 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:500">${s.subject}</td>
      <td>${s.topic}</td>
      <td>${s.time}h</td>
      <td><span class="badge ${s.difficulty === 'Fácil' ? 'badge-done' : s.difficulty === 'Médio' ? 'badge-doing' : 'badge-late'}">${s.difficulty}</span></td>
      <td>${s.review ? '✅' : '—'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="progress-bar" style="flex:1;margin:0"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span style="font-size:12px;font-weight:600;color:var(--teal)">${pct}%</span>
        </div>
      </td>
      <td><button class="btn-delete" data-i="${i}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });
  $$('.btn-delete', tbody).forEach(btn => {
    btn.addEventListener('click', () => {
      state.studySessions.splice(parseInt(btn.dataset.i), 1);
      save(); renderStudy();
    });
  });
}

function openStudyModal() {
  openModal('Nova Sessão de Estudo', `
    <div class="form-grid">
      <div class="form-row"><label>Matéria</label><input type="text" id="sSubj" placeholder="Ex: Matemática" /></div>
      <div class="form-row"><label>Tempo (h)</label><input type="number" id="sTime" step="0.5" value="1" /></div>
    </div>
    <div class="form-row"><label>Assunto</label><input type="text" id="sTopic" placeholder="Tópico estudado…" /></div>
    <div class="form-grid">
      <div class="form-row"><label>Dificuldade</label>
        <select id="sDiff">${DIFFICULTIES.map(d => `<option>${d}</option>`).join('')}</select></div>
      <div class="form-row"><label>Progresso %</label><input type="number" id="sProg" min="0" max="100" value="50" /></div>
    </div>
    <div class="form-row" style="flex-direction:row;align-items:center;gap:10px">
      <input type="checkbox" id="sReview" style="accent-color:var(--teal);width:16px;height:16px" />
      <label for="sReview" style="text-transform:none;font-size:14px;font-weight:500;color:var(--text)">Revisão realizada</label>
    </div>
  `, () => {
    const subject = $('#sSubj').value.trim();
    if (!subject) return false;
    state.studySessions.push({
      subject,
      time: parseFloat($('#sTime').value) || 1,
      topic: $('#sTopic').value,
      difficulty: $('#sDiff').value,
      progress: parseInt($('#sProg').value) || 0,
      review: $('#sReview').checked,
      date: today()
    });
    save(); renderStudy();
  });
}

/* ── POMODORO ───────────────────────────────── */
function initPomodoro() {
  let minutes = 25, seconds = 0;
  let interval = null;
  let isBreak = false;
  if (state.pomodoro.date !== today()) { state.pomodoro = { sessions: 0, date: today() }; save(); }
  const timeEl = $('#pomodoroTime');
  const phaseEl = $('#pomodoroPhase');
  const sessEl = $('#pomSessions');
  const startBtn = $('#pomStart');
  const resetBtn = $('#pomReset');
  if (!timeEl) return;

  sessEl.textContent = state.pomodoro.sessions;

  function updateDisplay() {
    timeEl.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }

  function tick() {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(interval); interval = null;
        if (!isBreak) { state.pomodoro.sessions++; save(); sessEl.textContent = state.pomodoro.sessions; }
        isBreak = !isBreak;
        minutes = isBreak ? 5 : 25; seconds = 0;
        phaseEl.textContent = isBreak ? 'Pausa' : 'Foco';
        updateDisplay();
        startBtn.textContent = '▶ Iniciar';
        return;
      }
      minutes--; seconds = 59;
    } else { seconds--; }
    updateDisplay();
  }

  startBtn.addEventListener('click', () => {
    if (interval) { clearInterval(interval); interval = null; startBtn.textContent = '▶ Iniciar'; }
    else { interval = setInterval(tick, 1000); startBtn.textContent = '⏸ Pausar'; }
  });
  resetBtn.addEventListener('click', () => {
    clearInterval(interval); interval = null;
    isBreak = false; minutes = 25; seconds = 0;
    phaseEl.textContent = 'Foco'; updateDisplay();
    startBtn.textContent = '▶ Iniciar';
  });
}

/* ═══════════════════════════════════════════
   FITNESS
═══════════════════════════════════════════ */
function initFitness() {
  renderExercises();
  renderHealthHistory();
  $('#addExerciseBtn').addEventListener('click', openExerciseModal);
  $('#saveHealthBtn').addEventListener('click', () => {
    const entry = {
      date: today(),
      water: parseFloat($('#waterInput').value) || 0,
      sleep: parseFloat($('#sleepInput').value) || 0,
      weight: parseFloat($('#weightInput').value) || 0,
      energy: parseInt($('#energyInput').value) || 0
    };
    // Update or add
    const idx = state.healthLogs.findIndex(l => l.date === today());
    if (idx >= 0) state.healthLogs[idx] = entry;
    else state.healthLogs.push(entry);
    save(); renderHealthHistory();
    // Flash button
    const btn = $('#saveHealthBtn');
    btn.textContent = '✓ Salvo!';
    btn.style.background = 'var(--sage)';
    setTimeout(() => { btn.textContent = 'Salvar dia'; btn.style.background = ''; }, 1500);
  });
}

function renderExercises() {
  const tbody = $('#fitnessBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!state.exercises.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-light)">Nenhum exercício registrado ainda.</td></tr>`;
    return;
  }
  state.exercises.forEach((ex, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:500">${ex.name}</td>
      <td>${ex.sets}</td>
      <td>${ex.reps}</td>
      <td>${ex.weight} kg</td>
      <td>${ex.evolution || '—'}</td>
      <td><button class="btn-delete" data-i="${i}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });
  $$('.btn-delete', tbody).forEach(btn => {
    btn.addEventListener('click', () => {
      state.exercises.splice(parseInt(btn.dataset.i), 1);
      save(); renderExercises();
    });
  });
}

function renderHealthHistory() {
  const el = $('#healthHistory');
  if (!el) return;
  const logs = state.healthLogs.slice(-7).reverse();
  el.innerHTML = '';
  if (!logs.length) { el.innerHTML = `<p style="color:var(--text-light);font-size:13px">Nenhum registro ainda.</p>`; return; }
  logs.forEach(log => {
    const card = document.createElement('div');
    card.className = 'health-hist-card';
    card.innerHTML = `
      <div class="health-hist-date">${log.date}</div>
      <div class="health-hist-row"><span>💧 Água</span><span>${log.water}L</span></div>
      <div class="health-hist-row"><span>😴 Sono</span><span>${log.sleep}h</span></div>
      <div class="health-hist-row"><span>⚖️ Peso</span><span>${log.weight}kg</span></div>
      <div class="health-hist-row"><span>⚡ Energia</span><span>${log.energy}/5</span></div>
    `;
    el.appendChild(card);
  });
}

function openExerciseModal() {
  openModal('Novo Exercício', `
    <div class="form-row"><label>Exercício</label><input type="text" id="exName" placeholder="Ex: Supino Reto" /></div>
    <div class="form-grid">
      <div class="form-row"><label>Séries</label><input type="number" id="exSets" value="3" /></div>
      <div class="form-row"><label>Repetições</label><input type="number" id="exReps" value="12" /></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Peso (kg)</label><input type="number" id="exWeight" step="0.5" value="0" /></div>
      <div class="form-row"><label>Evolução</label><input type="text" id="exEvolution" placeholder="Ex: +2.5kg vs semana anterior" /></div>
    </div>
  `, () => {
    const name = $('#exName').value.trim();
    if (!name) return false;
    state.exercises.push({
      name, sets: $('#exSets').value, reps: $('#exReps').value,
      weight: $('#exWeight').value, evolution: $('#exEvolution').value, date: today()
    });
    save(); renderExercises();
  });
}

/* ═══════════════════════════════════════════
   FINANCE
═══════════════════════════════════════════ */
const FIN_CATS = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Investimentos', 'Outros'];
const CAT_COLORS = ['#2D7D74','#5C7A5C','#B07D33','#9B5057','#4A6B8A','#7A5C8A','#4A8A6B','#8A7A5C'];

function initFinance() {
  renderTransactions();
  $('#addFinBtn').addEventListener('click', openFinModal);
}

function calcFinance() {
  let income = 0, expense = 0;
  state.transactions.forEach(t => {
    if (t.type === 'Entrada') income += t.value;
    else expense += t.value;
  });
  return { income, expense, balance: income - expense };
}

function renderTransactions() {
  const tbody = $('#finBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const { income, expense, balance } = calcFinance();
  $('#finIncome').textContent = fmtBRL(income);
  $('#finExpense').textContent = fmtBRL(expense);
  $('#finBalance').textContent = fmtBRL(balance);
  $('#finBalance').style.color = balance >= 0 ? 'var(--sage)' : 'var(--rose)';

  if (!state.transactions.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-light)">Nenhuma transação registrada.</td></tr>`;
  } else {
    state.transactions.forEach((t, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.date}</td>
        <td style="font-weight:500">${t.desc}</td>
        <td><span style="background:var(--teal-light);color:var(--teal);border-radius:99px;padding:2px 10px;font-size:11px;font-weight:600;">${t.category}</span></td>
        <td><span class="badge ${t.type === 'Entrada' ? 'badge-done' : 'badge-late'}">${t.type}</span></td>
        <td style="font-weight:700;color:${t.type === 'Entrada' ? 'var(--sage)' : 'var(--rose)'}">${t.type === 'Entrada' ? '+' : '-'}${fmtBRL(t.value)}</td>
        <td><button class="btn-delete" data-i="${i}">✕</button></td>
      `;
      tbody.appendChild(tr);
    });
    $$('.btn-delete', tbody).forEach(btn => {
      btn.addEventListener('click', () => {
        state.transactions.splice(parseInt(btn.dataset.i), 1);
        save(); renderTransactions();
      });
    });
  }

  renderCatChart();
}

function renderCatChart() {
  const el = $('#catChart');
  if (!el) return;
  el.innerHTML = '';
  const catTotals = {};
  state.transactions.filter(t => t.type === 'Saída').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.value;
  });
  const total = Object.values(catTotals).reduce((a, b) => a + b, 0);
  if (!total) { el.innerHTML = `<p style="color:var(--text-light);font-size:13px">Nenhuma saída registrada ainda.</p>`; return; }
  Object.entries(catTotals).sort((a, b) => b[1] - a[1]).forEach(([cat, val], i) => {
    const pct = Math.round((val / total) * 100);
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.innerHTML = `
      <span class="cat-name">${cat}</span>
      <div class="cat-track"><div class="cat-fill" style="width:${pct}%;background:${CAT_COLORS[i % CAT_COLORS.length]}"></div></div>
      <span class="cat-amt" style="color:${CAT_COLORS[i % CAT_COLORS.length]}">${fmtBRL(val)}</span>
    `;
    el.appendChild(row);
  });
}

function openFinModal() {
  openModal('Novo Lançamento', `
    <div class="form-row"><label>Descrição</label><input type="text" id="fDesc" placeholder="Ex: Aluguel, Salário…" /></div>
    <div class="form-grid">
      <div class="form-row"><label>Valor (R$)</label><input type="number" id="fVal" step="0.01" value="0" /></div>
      <div class="form-row"><label>Data</label><input type="date" id="fDate" value="${today()}" /></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Tipo</label>
        <select id="fType"><option>Saída</option><option>Entrada</option></select></div>
      <div class="form-row"><label>Categoria</label>
        <select id="fFinCat">${FIN_CATS.map(c => `<option>${c}</option>`).join('')}</select></div>
    </div>
  `, () => {
    const desc = $('#fDesc').value.trim();
    if (!desc) return false;
    state.transactions.push({
      desc, value: parseFloat($('#fVal').value) || 0,
      date: $('#fDate').value, type: $('#fType').value,
      category: $('#fFinCat').value
    });
    save(); renderTransactions();
  });
}

/* ═══════════════════════════════════════════
   MODAL ENGINE
═══════════════════════════════════════════ */
let modalSaveCallback = null;

function initModal() {
  const overlay = $('#modalOverlay');
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalCancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  $('#modalSave').addEventListener('click', () => {
    if (modalSaveCallback) {
      const result = modalSaveCallback();
      if (result !== false) closeModal();
    }
  });
}

function openModal(title, bodyHTML, onSave) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHTML;
  modalSaveCallback = onSave;
  $('#modalOverlay').classList.add('open');
}

function closeModal() {
  $('#modalOverlay').classList.remove('open');
  modalSaveCallback = null;
}

/* ── WEEKLY GOAL ADD ────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const addWeekGoal = $('#addWeekGoal');
  if (addWeekGoal) {
    addWeekGoal.addEventListener('click', () => {
      const list = $('#weeklyGoalsList');
      const row = document.createElement('div');
      row.className = 'weekly-goal-row';
      row.innerHTML = `<input type="checkbox" /><input type="text" placeholder="Nova meta…" class="inline-input" />`;
      list.appendChild(row);
    });
  }
});
