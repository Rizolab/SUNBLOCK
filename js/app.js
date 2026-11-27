/* ========================================================================
4. LÓGICA PRINCIPAL DE VISTAS, PIN GATE, MESOCICLOS Y BITÁCORA
   ======================================================================== */
const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg>`,
  train: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c0-1.1.9-2 2-2s2 .9 2 2c0 2.2-1.8 4-4 4-3.3 0-6-2.7-6-6 0-4.4 3.6-8 8-8 5.5 0 10 4.5 10 10 0 6.6-5.4 12-12 12-7.7 0-14-6.3-14-14"/></svg>`,
  ency: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`,
  log: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  reset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  rest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 5.5v13l11-6.5-11-6.5Z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`,
  skip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5v14l10-7-10-7Z"/><path d="M19 5v14"/></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  dot: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg>`
};

function iconSvg(name, size = 16) {
  const raw = ICONS[name] || "";
  return raw.replace("<svg ", `<svg width="${size}" height="${size}" stroke-width="1.8" class="ui-icon" `);
}

const cachedInitial = safeJsonParse(safeStorage.get(STORAGE_KEYS.CACHE), null);
let state = {
  data: cachedInitial || { blocks: [], encyclopedia: [], microcycles: [], logs: [], dashboard: {} },
  blockId: safeStorage.get(STORAGE_KEYS.BLOCK) || "cimiento-4w",
  week: Number(safeStorage.get(STORAGE_KEYS.WEEK)) || 1,
  dayCode: "D1",
  currentView: "home",
  prevView: null,
  checks: safeJsonParse(safeStorage.get(STORAGE_KEYS.CHECKS), {}),
  extras: safeJsonParse(safeStorage.get(STORAGE_KEYS.EXTRAS || "sunblock_extras_v3"), {}),
  traffic: { dedos: "verde", codos: "verde" },
  encyGroup: "",
  encyFocus: "",
  encySearch: "",
  encyDetailId: null,
  deloadActive: safeStorage.get(STORAGE_KEYS.DELOAD_ALERT) === "1"
};

function renderStaticIcons() {
  const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  setHtml("nav-icon-home", iconSvg("home", 18));
  setHtml("nav-icon-train", iconSvg("train", 20));
  setHtml("nav-icon-ency", iconSvg("ency", 18));
  setHtml("nav-icon-log", iconSvg("log", 18));
  setHtml("hdr-gear-icon", iconSvg("gear", 14));
  setHtml("reset-block-icon", iconSvg("reset", 12));
  setHtml("lat-check-icon", iconSvg("check", 13));
  setHtml("lat-skip-icon", iconSvg("skip", 14));
  setHtml("lat-next-icon", iconSvg("next", 14));
  setHtml("lat-reset-icon", iconSvg("reset", 14));
  setHtml("ency-search-icon", iconSvg("search", 15));
  setHtml("home-legend", `
    <span><span style="color:var(--green)">${iconSvg("check", 12)}</span> Completado</span>
    <span>${iconSvg("clock", 12)} Pendiente</span>
    <span>${iconSvg("rest", 12)} Descanso</span>
  `);
  document.querySelectorAll(".t-dot.verde").forEach(el => { el.style.color = "var(--green)"; el.innerHTML = iconSvg("dot", 11); });
  document.querySelectorAll(".t-dot.amarillo").forEach(el => { el.style.color = "var(--yellow)"; el.innerHTML = iconSvg("dot", 11); });
  document.querySelectorAll(".t-dot.rojo").forEach(el => { el.style.color = "var(--red)"; el.innerHTML = iconSvg("dot", 11); });
}

function unlockApp() {
  const inputEl = document.getElementById("pin-input");
  const errEl = document.getElementById("pin-err");
  const val = String(inputEl?.value || "").replace(/\D/g, "").trim();
  if (val === PIN_CODE) {
    safeStorage.set(STORAGE_KEYS.AUTH, "1");
    document.getElementById("pin-gate")?.remove();
    initApp();
  } else if (errEl) {
    errEl.textContent = `PIN incorrecto. Usa ${PIN_CODE}.`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderStaticIcons();
  document.getElementById("pin-submit-btn")?.addEventListener("click", unlockApp);
  document.getElementById("pin-input")?.addEventListener("keydown", e => { if (e.key === "Enter") unlockApp(); });

  if (safeStorage.get(STORAGE_KEYS.AUTH) === "1") {
    document.getElementById("pin-gate")?.remove();
    initApp();
  }
});

function initApp() {
  initBackNavigation();
  renderAll();
  syncFromSheets(false);
}

function getActiveBlock() {
  return state.data.blocks.find(b => b.id === state.blockId) || state.data.blocks[0] || { id: "cimiento-4w", title: "Cargando...", weeks: 4, phases: [] };
}

function getBlockDays() {
  return state.data.microcycles.filter(m => m.blockId === state.blockId);
}

function getPhaseForWeek(block, weekNum) {
  const phases = block.phases || [];
  return phases.find(p => Array.isArray(p.weeks) && p.weeks.includes(Number(weekNum))) || phases[0] || { name: `Semana ${weekNum}`, desc: "" };
}

function renderAll() {
  const deloadEl = document.getElementById("deload-alert-banner");
  if (deloadEl) deloadEl.classList.toggle("hidden", !state.deloadActive);

  renderBlockSelector();
  renderHome();
  renderTrainView();
  syncQueueForCurrentDay(true);
  renderEncyclopedia();
  renderLogView();
}

function dismissDeloadBanner() {
  state.deloadActive = false;
  safeStorage.remove(STORAGE_KEYS.DELOAD_ALERT);
  renderAll();
}

function renderBlockSelector() {
  const sel = document.getElementById("block-select");
  if (!state.data.blocks.length) return;
  if (!state.data.blocks.some(b => b.id === state.blockId)) {
    state.blockId = state.data.blocks[0].id;
  }
  sel.innerHTML = state.data.blocks.map(b =>
    `<option value="${b.id}" ${b.id === state.blockId ? "selected" : ""}>${b.title}</option>`
  ).join("");

  const block = getActiveBlock();
  if (state.week > block.weeks) state.week = 1;
  document.getElementById("week-label").textContent = `Sem ${state.week} / ${block.weeks}`;

  const phase = getPhaseForWeek(block, state.week);
  document.getElementById("phase-badge").textContent = phase.name.split("·")[0].trim();
  document.getElementById("phase-desc").textContent = `${phase.name}: ${phase.desc}`;
}

function onBlockChange() {
  state.blockId = document.getElementById("block-select").value;
  state.week = 1;
  state.dayCode = "D1";
  latLinked.checkKey = null;
  safeStorage.set(STORAGE_KEYS.BLOCK, state.blockId);
  safeStorage.set(STORAGE_KEYS.WEEK, "1");
  renderAll();
}

function changeWeek(delta) {
  const block = getActiveBlock();
  let next = state.week + delta;
  if (next < 1) next = block.weeks;
  if (next > block.weeks) next = 1;
  state.week = next;
  latLinked.checkKey = null;
  safeStorage.set(STORAGE_KEYS.WEEK, String(state.week));
  renderAll();
}

function selectWeekDirect(w) {
  state.week = Number(w) || 1;
  latLinked.checkKey = null;
  safeStorage.set(STORAGE_KEYS.WEEK, String(state.week));
  renderAll();
}

function resetCurrentBlock() {
  Object.keys(state.checks).forEach(k => {
    if (k.startsWith(`${state.blockId}_w${state.week}_`)) delete state.checks[k];
  });
  safeStorage.set(STORAGE_KEYS.CHECKS, JSON.stringify(state.checks));
  latLinked.checkKey = null;
  renderAll();
}

function getSessionExtraKey(dayCode = state.dayCode) {
  return `${state.blockId}_w${state.week}_${dayCode}`;
}

function getExtraExercisesForDay(dayCode = state.dayCode) {
  const key = getSessionExtraKey(dayCode);
  return Array.isArray(state.extras[key]) ? state.extras[key] : [];
}

function addExtraExerciseToCurrentDay(exId, rxText, restText) {
  const key = getSessionExtraKey(state.dayCode);
  const list = Array.isArray(state.extras[key]) ? [...state.extras[key]] : [];
  if (!list.some(it => it.exId === exId)) {
    list.push({
      exId,
      rx: rxText || "3 series",
      rest: restText || "90 seg",
      addedAt: new Date().toISOString().slice(0, 10)
    });
    state.extras[key] = list;
    safeStorage.set(STORAGE_KEYS.EXTRAS || "sunblock_extras_v3", JSON.stringify(state.extras));
  }
}

function removeExtraExercise(exId, event) {
  if (event) event.stopPropagation();
  const key = getSessionExtraKey(state.dayCode);
  const list = Array.isArray(state.extras[key]) ? state.extras[key] : [];
  const idx = list.findIndex(it => it.exId === exId);
  if (idx >= 0) {
    const checkKey = `${state.blockId}_w${state.week}_${state.dayCode}_extra_${exId}`;
    delete state.checks[checkKey];
    safeStorage.set(STORAGE_KEYS.CHECKS, JSON.stringify(state.checks));
    list.splice(idx, 1);
    state.extras[key] = list;
    safeStorage.set(STORAGE_KEYS.EXTRAS || "sunblock_extras_v3", JSON.stringify(state.extras));
    if (latLinked.checkKey === checkKey) {
      latLinked.checkKey = null;
    }
    renderHome();
    renderTrainView();
    syncQueueForCurrentDay(true);
  }
}

function resolveSectionAccentClass(secName, isExtra = false) {
  if (isExtra) return "sec-extra";
  const s = String(secName || "").toLowerCase();
  if (/calentamiento|activaci[oó]n|movilidad|prehab|antagonista/.test(s)) return "sec-warmup";
  if (/multipresa|dedos|suspensi[oó]n|fuerza|pinza|regleta|no-hang|tracci[oó]n|lastre/.test(s)) return "sec-strength";
  if (/muro|b[uú]lder|bloque|t[eé]cnica|potencia|resistencia|4x4|continuidad|placa|desplome/.test(s)) return "sec-wall";
  return "sec-strength";
}

// INICIO
function renderHome() {
  const block = getActiveBlock();
  const days = getBlockDays();
  if (!days.length) return;
  if (!days.some(d => d.code === state.dayCode)) state.dayCode = days[0].code;

  const weekLogs = (state.data.logs || []).filter(l => l.blockId === block.id && Number(l.week) === Number(state.week));
  const completedCodes = new Set(weekLogs.map(l => normalizeDayCode(l.dayCode)));
  const activeDays = days.filter(d => d.sections && d.sections.length > 0);
  const totalTarget = activeDays.length || 4;
  const doneInWeek = Math.min(completedCodes.size, totalTarget);
  const pct = Math.round((doneInWeek / totalTarget) * 100);

  const day = days.find(d => d.code === state.dayCode) || days[0];
  const isDeload = state.week === block.weeks && block.weeks >= 4;
  const isPhase2 = !isDeload && state.week >= 3;

  const flatItems = [];
  (day.sections || []).forEach((sec, sIdx) => {
    (sec.items || []).forEach((item, iIdx) => {
      const ex = state.data.encyclopedia.find(e => e.id === item.exId) || { id: item.exId, name: item.exId };
      const grp = resolveExerciseGroup(ex);
      const rxText = (isDeload && item.p3) ? item.p3 : ((isPhase2 && item.p2) ? item.p2 : item.rx);
      const checkKey = `${state.blockId}_w${state.week}_${day.code}_s${sIdx}_i${iIdx}`;
      flatItems.push({ id: ex.id, name: ex.name, rx: rxText, color: grp.color, checkKey, isExtra: false });
    });
  });

  const dayExtras = getExtraExercisesForDay(day.code);
  dayExtras.forEach(item => {
    const ex = state.data.encyclopedia.find(e => e.id === item.exId) || { id: item.exId, name: item.exId };
    const checkKey = `${state.blockId}_w${state.week}_${day.code}_extra_${item.exId}`;
    flatItems.push({ id: ex.id, name: ex.name, rx: item.rx, color: "#a78bfa", checkKey, isExtra: true });
  });

  const doneTodayCount = flatItems.filter(it => !!state.checks[it.checkKey]).length;
  const todayPct = flatItems.length ? Math.round((doneTodayCount / flatItems.length) * 100) : pct;

  document.getElementById("home-today-code").textContent = `${day.code} · Sem ${state.week}`;
  document.getElementById("home-today-pct").textContent = flatItems.length
    ? `${todayPct}% Hoy (${doneTodayCount}/${flatItems.length}) · ${pct}% Sem`
    : `${pct}% Sem (${doneInWeek}/${totalTarget})`;

  const previewHtml = flatItems.length
    ? `<div class="today-ex-list">${flatItems.slice(0, 5).map(it => `
        <div class="today-ex-row" onclick="openExerciseDetail('${it.id}')">
          <div class="today-ex-left">
            <span class="grp-dot" style="background:${it.color};"></span>
            <span>${it.name}</span>
          </div>
          <span class="today-ex-rx">${it.rx}</span>
        </div>
      `).join("")}</div>`
    : `<p class="muted-small" style="margin-top:8px;">Día de descanso programado (0 min de carga).</p>`;

  document.getElementById("home-today-hero").innerHTML = `
    <div class="today-top">
      <div>
        <span class="pill-stat pill-accent">${day.tag}</span>
        <h2 class="today-title">${day.title}</h2>
      </div>
      <span style="font-size:12px;font-weight:700;color:var(--text-muted);">${day.duration}</span>
    </div>
    <p class="muted-small" style="margin-top:6px;">${day.focus}</p>
    ${previewHtml}
    <div class="today-actions">
      <button type="button" class="btn-primary" style="width:auto;padding:9px 14px;" onclick="openDayInTrain('${day.code}')">Abrir Sesión y Timer</button>
      <button type="button" class="btn-secondary" onclick="goToLogDay('${day.code}')">Registrar en Bitácora</button>
    </div>
  `;

  document.getElementById("home-map-week").textContent = state.week;
  document.getElementById("home-week-map").innerHTML = days.map(d => {
    const isDone = completedCodes.has(normalizeDayCode(d.code));
    const isRest = !d.sections || d.sections.length === 0;
    const isSelected = d.code === state.dayCode;
    const cls = [isDone ? "done" : (isRest ? "rest" : "pending"), isSelected ? "selected-day" : ""].join(" ");
    const iconName = isDone ? "check" : (isRest ? "rest" : "clock");
    return `
      <div class="day-node ${cls}" onclick="selectHomeDay('${d.code}')">
        <span class="d-code">${d.code}</span>
        <span class="d-short">${d.shortTitle}</span>
        <span class="d-status">${iconSvg(iconName, 13)}</span>
      </div>
    `;
  }).join("");

  document.getElementById("home-overview-count").textContent = `${block.weeks} semanas`;
  document.getElementById("home-overview-summary").textContent = `${block.title} · ${activeDays.length} días activos por semana.`;

  const rows = [];
  for (let w = 1; w <= block.weeks; w++) {
    const ph = getPhaseForWeek(block, w);
    const isCur = Number(w) === Number(state.week);
    const isPast = Number(w) < Number(state.week);
    const badge = isCur
      ? `<span class="pill-stat pill-accent">Semana actual</span>`
      : (isPast ? `<span class="pill-stat pill-green">${iconSvg("check", 11)} Completada</span>` : `<span class="pill-stat pill-blue">Planificada</span>`);
    rows.push(`
      <div class="week-row ${isCur ? "active-week" : ""}" onclick="selectWeekDirect(${w})">
        <div>
          <div class="week-row-num">SEMANA ${w} DE ${block.weeks}</div>
          <div class="week-row-phase">${ph.name}</div>
          <div class="week-row-desc">${ph.desc}</div>
        </div>
        <div class="week-row-meta">${badge}</div>
      </div>
    `);
  }
  document.getElementById("home-weekly-breakdown").innerHTML = rows.join("");
}

function selectHomeDay(code) {
  state.dayCode = code;
  latLinked.checkKey = null;
  renderHome();
  renderTrainView();
  syncQueueForCurrentDay(true);
}

function openDayInTrain(code) {
  state.dayCode = code;
  latLinked.checkKey = null;
  switchView("train", document.querySelector('.nav-btn[data-view="train"]'));
  renderTrainView();
  syncQueueForCurrentDay(true);
}

function goToLogDay(code) {
  state.dayCode = code;
  switchView("log", document.querySelector('.nav-btn[data-view="log"]'));
  renderLogView();
}

// ENTRENAR
function getDayExerciseQueue() {
  const days = getBlockDays();
  const day = days.find(d => d.code === state.dayCode) || days[0];
  const queue = [];
  if (!day) return queue;
  const block = getActiveBlock();
  const isDeload = state.week === block.weeks && block.weeks >= 4;
  const isPhase2 = !isDeload && state.week >= 3;

  (day.sections || []).forEach((sec, sIdx) => {
    sec.items.forEach((item, iIdx) => {
      const ex = state.data.encyclopedia.find(e => e.id === item.exId) || { id: item.exId, name: item.exId };
      const rxText = (isDeload && item.p3) ? item.p3 : ((isPhase2 && item.p2) ? item.p2 : item.rx);
      queue.push({
        checkKey: `${state.blockId}_w${state.week}_${day.code}_s${sIdx}_i${iIdx}`,
        exId: item.exId,
        exObj: ex,
        exName: ex.name,
        sectionName: sec.name,
        rx: rxText,
        restText: item.rest || "",
        isExtra: false
      });
    });
  });

  const extras = getExtraExercisesForDay(day.code);
  extras.forEach(item => {
    const ex = state.data.encyclopedia.find(e => e.id === item.exId) || { id: item.exId, name: item.exId };
    queue.push({
      checkKey: `${state.blockId}_w${state.week}_${day.code}_extra_${item.exId}`,
      exId: item.exId,
      exObj: ex,
      exName: ex.name,
      sectionName: "Extra · Enciclopedia",
      rx: item.rx || "3 series",
      restText: item.rest || "90 seg",
      isExtra: true
    });
  });

  return queue;
}

function syncQueueForCurrentDay(autoLoadFirst = false) {
  const queue = getDayExerciseQueue();
  if (!queue.length) {
    latLinked = { checkKey: null, exId: null, exName: "Día de descanso", sectionName: "", rx: "Sin carga programada", restText: "", queueIndex: 0 };
    renderTimer();
    return;
  }
  const idx = queue.findIndex(q => q.checkKey === latLinked.checkKey);
  if (idx >= 0) {
    latLinked.queueIndex = idx;
    latLinked.exName = queue[idx].exName;
    latLinked.sectionName = queue[idx].sectionName;
    latLinked.rx = queue[idx].rx;
    latLinked.restText = queue[idx].restText;
    renderTimer();
  } else if (autoLoadFirst || !latLinked.checkKey) {
    loadQueueExerciseAt(0, false);
  }
}

function loadQueueExerciseAt(index, shouldStart = false) {
  const queue = getDayExerciseQueue();
  if (!queue.length) return;
  const safeIdx = ((index % queue.length) + queue.length) % queue.length;
  const entry = queue[safeIdx];

  latLinked = {
    checkKey: entry.checkKey,
    exId: entry.exId,
    exName: entry.exName,
    sectionName: entry.sectionName,
    rx: entry.rx,
    restText: entry.restText,
    queueIndex: safeIdx
  };

  const parsed = parsePrescriptionSmart(entry.exObj, entry.rx, entry.restText, entry.sectionName);
  timerCfg = { ...timerCfg, ...parsed };
  syncIntervalInputsFromCfg();
  resetTimer();
  renderTrainView();

  if (shouldStart && !timerRun.running) toggleTimer();
}

function loadExerciseByKey(checkKey, shouldStart = false) {
  const queue = getDayExerciseQueue();
  const idx = queue.findIndex(q => q.checkKey === checkKey);
  if (idx >= 0) loadQueueExerciseAt(idx, shouldStart);
}

function nextQueueExercise() {
  const queue = getDayExerciseQueue();
  if (queue.length) loadQueueExerciseAt(latLinked.queueIndex + 1, false);
}

function completeLinkedExercise() {
  if (!latLinked.checkKey) return;
  state.checks[latLinked.checkKey] = true;
  safeStorage.set(STORAGE_KEYS.CHECKS, JSON.stringify(state.checks));
  renderHome();
  nextQueueExercise();
}

function renderTrainView() {
  const days = getBlockDays();
  if (!days.length) return;
  if (!days.some(d => d.code === state.dayCode)) state.dayCode = days[0].code;

  document.getElementById("day-tabs").innerHTML = days.map(d => `
    <button type="button" class="day-tab ${d.code === state.dayCode ? "active" : ""}" onclick="selectDay('${d.code}')">
      ${d.code} · ${d.shortTitle}
      <small>${d.duration}</small>
    </button>
  `).join("");

  const day = days.find(d => d.code === state.dayCode) || days[0];
  const block = getActiveBlock();
  document.getElementById("day-tag").textContent = day.tag;
  document.getElementById("day-title").textContent = day.title;
  document.getElementById("day-duration").textContent = day.duration;
  document.getElementById("day-focus").textContent = day.focus;

  const secEl = document.getElementById("day-sections");
  const extras = getExtraExercisesForDay(day.code);
  const hasBaseSections = day.sections && day.sections.length > 0;

  if (!hasBaseSections && !extras.length) {
    secEl.innerHTML = `<p class="muted-small" style="padding:8px 0;">Día de descanso programado. Sin carga física.</p>`;
    return;
  }

  const isDeload = state.week === block.weeks && block.weeks >= 4;
  const isPhase2 = !isDeload && state.week >= 3;

  const baseHtml = (day.sections || []).map((sec, sIdx) => {
    const secAccent = resolveSectionAccentClass(sec.name, false);
    const itemsHtml = sec.items.map((item, iIdx) => {
      const ex = state.data.encyclopedia.find(e => e.id === item.exId) || { id: item.exId, name: item.exId };
      const grp = resolveExerciseGroup(ex);
      const checkKey = `${state.blockId}_w${state.week}_${day.code}_s${sIdx}_i${iIdx}`;
      const isChecked = !!state.checks[checkKey];
      const isLinked = latLinked.checkKey === checkKey;
      const rxText = (isDeload && item.p3) ? item.p3 : ((isPhase2 && item.p2) ? item.p2 : item.rx);
      const imgSrc = ex.media_url ? (ex.media_url.startsWith("http") ? ex.media_url : `./${ex.media_url}`) : "";

      const regChip = ex.regression_prev_id
        ? `<button type="button" class="prog-chip" onclick="event.stopPropagation(); openExerciseDetail('${ex.regression_prev_id}')">↓ Regresión</button>`
        : "";
      const progChip = ex.progression_next_id
        ? `<button type="button" class="prog-chip" onclick="event.stopPropagation(); openExerciseDetail('${ex.progression_next_id}')">↑ Progresión</button>`
        : "";

      return `
        <div class="ex-item ${secAccent} ${isChecked ? "checked" : ""} ${isLinked ? "active-linked" : ""}">
          <input type="checkbox" class="ex-check" ${isChecked ? "checked" : ""} onchange="toggleCheck('${checkKey}')" />
          ${imgSrc ? `<img src="${imgSrc}" alt="${ex.name}" class="ex-thumb" loading="lazy" onclick="openExerciseDetail('${ex.id}')" onerror="this.style.display='none'" />` : ""}
          <div class="ex-body" onclick="openExerciseDetail('${ex.id}')">
            <div class="ex-name"><span class="grp-dot" style="background:${grp.color};"></span><span>${ex.name}</span></div>
            <div class="ex-meta">
              <span class="ex-rx-text">${rxText}</span>
              ${item.rest ? `<span>· Pausa: ${item.rest}</span>` : ""}
              <button type="button" class="ex-timer-btn" onclick="event.stopPropagation(); loadExerciseByKey('${checkKey}', false)">
                ${iconSvg("clock", 11)}<span>Timer</span>
              </button>
              ${regChip}${progChip}
            </div>
          </div>
        </div>
      `;
    }).join("");
    return `<div class="sec-block ${secAccent}"><div class="sec-header">${sec.name}</div>${itemsHtml}</div>`;
  }).join("");

  let extrasHtml = "";
  if (extras.length) {
    const extraItemsHtml = extras.map(item => {
      const ex = state.data.encyclopedia.find(e => e.id === item.exId) || { id: item.exId, name: item.exId };
      const checkKey = `${state.blockId}_w${state.week}_${day.code}_extra_${item.exId}`;
      const isChecked = !!state.checks[checkKey];
      const isLinked = latLinked.checkKey === checkKey;
      const imgSrc = ex.media_url ? (ex.media_url.startsWith("http") ? ex.media_url : `./${ex.media_url}`) : "";

      return `
        <div class="ex-item sec-extra ${isChecked ? "checked" : ""} ${isLinked ? "active-linked" : ""}">
          <input type="checkbox" class="ex-check" ${isChecked ? "checked" : ""} onchange="toggleCheck('${checkKey}')" />
          ${imgSrc ? `<img src="${imgSrc}" alt="${ex.name}" class="ex-thumb" loading="lazy" onclick="openExerciseDetail('${ex.id}')" onerror="this.style.display='none'" />` : ""}
          <div class="ex-body" onclick="openExerciseDetail('${ex.id}')">
            <div class="ex-name">
              <span class="grp-dot" style="background:#a78bfa;"></span>
              <span>${ex.name}</span>
              <span class="extra-pill-badge">Extra · Enciclopedia</span>
            </div>
            <div class="ex-meta">
              <span class="ex-rx-text">${item.rx}</span>
              ${item.rest ? `<span>· Pausa: ${item.rest}</span>` : ""}
              <button type="button" class="ex-timer-btn" onclick="event.stopPropagation(); loadExerciseByKey('${checkKey}', false)">
                ${iconSvg("clock", 11)}<span>Timer</span>
              </button>
            </div>
          </div>
          <button type="button" class="extra-remove-btn" title="Quitar ejercicio extra" onclick="removeExtraExercise('${ex.id}', event)">×</button>
        </div>
      `;
    }).join("");
    extrasHtml = `
      <div class="sec-block sec-extra">
        <div class="sec-header sec-header-extra">
          <span>Extra · Enciclopedia</span>
          <span class="extra-pill-badge">${extras.length} añadido${extras.length > 1 ? "s" : ""}</span>
        </div>
        ${extraItemsHtml}
      </div>
    `;
  }

  secEl.innerHTML = baseHtml + extrasHtml;
}

function selectDay(code) {
  state.dayCode = code;
  latLinked.checkKey = null;
  renderHome();
  renderTrainView();
  syncQueueForCurrentDay(true);
}

function toggleCheck(key) {
  state.checks[key] = !state.checks[key];
  safeStorage.set(STORAGE_KEYS.CHECKS, JSON.stringify(state.checks));
  renderHome();
  renderTrainView();
}

function goToLogCurrentDay() {
  switchView("log", document.querySelector('.nav-btn[data-view="log"]'));
  renderLogView();
}

// BITÁCORA Y BENCHMARKS
function renderLogView() {
  const dash = state.data.dashboard || {};
  const kpiEl = document.getElementById("kpi-grid");
  if (kpiEl) {
    const tiles = [
      { lbl: "Sesiones Activas", val: dash["SESIONES REGISTRADAS"] || (state.data.logs || []).length, sub: "Historial total" },
      { lbl: "RPE Promedio", val: dash["RPE PROMEDIO"] || "6.0", sub: "Excluye descansos" },
      { lbl: "Semáforo Articular", val: `${dash["ESTADO DEDOS"] || "VERDE"} / ${dash["ESTADO CODOS"] || "VERDE"}`, sub: "Dedos / Codos" },
      { lbl: "Regleta 20mm Máx", val: dash["Carga Máxima (Regleta 20mm)"] || "+15,0 kg", sub: dash["Peso Corporal"] || "68,0 kg" },
      { lbl: "Búlder Placa", val: dash["Grado Máximo Búlder (Placa)"] || "V5 (6C)", sub: "ELBLOQUE" },
      { lbl: "Búlder Desplome", val: dash["Grado Máximo Búlder (Desplome)"] || "V4 (6B+)", sub: "ELBLOQUE" }
    ];
    kpiEl.innerHTML = tiles.map(t => `
      <div class="kpi-tile">
        <div class="kpi-lbl">${t.lbl}</div>
        <div class="kpi-val">${t.val}</div>
        <div class="kpi-sub">${t.sub}</div>
      </div>
    `).join("");
  }

  const days = getBlockDays();
  const sel = document.getElementById("log-day");
  sel.innerHTML = days.map(d =>
    `<option value="${d.code}" ${d.code === state.dayCode ? "selected" : ""}>${d.code} · ${d.title}</option>`
  ).join("");
  onLogDayChange();

  const pending = safeJsonParse(safeStorage.get(STORAGE_KEYS.PENDING_QUEUE), []);
  const pendingBadge = document.getElementById("pending-queue-badge");
  if (pendingBadge) {
    pendingBadge.classList.toggle("hidden", pending.length === 0);
    pendingBadge.textContent = `${pending.length} pendiente(s)`;
  }

  const logs = [...(state.data.logs || [])].reverse();
  const histEl = document.getElementById("log-history");
  if (!logs.length) {
    histEl.innerHTML = `<p class="muted-small">No hay registros todavía.</p>`;
    return;
  }

  histEl.innerHTML = logs.map(l => `
    <div class="log-item">
      <div class="log-head">
        <span>${l.dayCode} · ${l.dayTitle} (Sem ${l.week})</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="pill-stat pill-blue">RPE ${l.rpe}/10</span>
          ${l._row_index ? `<button type="button" class="subtle-reset-btn" onclick="openEditLogModal(${l._row_index})">Editar</button>` : ""}
        </div>
      </div>
      <div class="log-meta">
        <span>${l.date}</span>
        <span>· ${l.durationMin} min</span>
        <span>· Dedos: <strong>${l.dedos}</strong></span>
        <span>· Codos: <strong>${l.codos}</strong></span>
      </div>
      ${l.note ? `<div style="margin-top:5px; color:var(--text);">${l.note}</div>` : ""}
    </div>
  `).join("");
}

function onLogDayChange() {
  const days = getBlockDays();
  const code = document.getElementById("log-day")?.value;
  const dayObj = days.find(d => d.code === code);
  const durInput = document.getElementById("log-duration");
  const rpeInput = document.getElementById("log-rpe");
  if (!dayObj || !durInput) return;

  const isRest = !dayObj.sections || dayObj.sections.length === 0;
  if (isRest) {
    durInput.value = 0;
    if (rpeInput) rpeInput.value = 0;
  } else {
    const mins = parseInt(String(dayObj.duration || "75"), 10) || 75;
    durInput.value = mins;
    if (rpeInput && Number(rpeInput.value) === 0) rpeInput.value = 7;
  }
}

function setTraffic(part, val, btn) {
  state.traffic[part] = val;
  document.getElementById(`${part}-selector`).querySelectorAll(".t-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

async function submitLog() {
  const block = getActiveBlock();
  const days = getBlockDays();
  const dayCode = document.getElementById("log-day").value;
  const dayObj = days.find(d => d.code === dayCode) || { title: dayCode };

  const queue = getDayExerciseQueue();
  const completedList = queue.map(q => ({
    ex_id: q.exId,
    status: state.checks[q.checkKey] ? "completed" : "pending"
  }));

  const logData = {
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    block_id: block.id,
    meso_title: block.title,
    week: state.week,
    day_code: dayCode,
    day_title: dayObj.title,
    rpe: Number(document.getElementById("log-rpe").value) || 0,
    dedos: state.traffic.dedos,
    codos: state.traffic.codos,
    note: document.getElementById("log-note").value.trim(),
    readiness_score: Number(document.getElementById("log-readiness").value) || 8,
    session_duration_min: Number(document.getElementById("log-duration").value) || 0,
    exercises_log_json: completedList
  };

  const btn = document.getElementById("btn-save-log");
  btn.disabled = true;
  btn.textContent = "Guardando en Sheets...";

  const res = await postToSheets({ action: "log_session", data: logData });
  if (res.alert_deload) {
    state.deloadActive = true;
    safeStorage.set(STORAGE_KEYS.DELOAD_ALERT, "1");
  }

  document.getElementById("log-note").value = "";
  btn.disabled = false;
  btn.textContent = "Guardar en Google Sheets";
  await syncFromSheets(true);
}

// EDICIÓN DE REGISTROS Y BENCHMARKS
function openEditLogModal(rowIndex) {
  const log = (state.data.logs || []).find(l => Number(l._row_index) === Number(rowIndex));
  if (!log) return;
  document.getElementById("edit-row-index").value = rowIndex;
  document.getElementById("edit-rpe").value = log.rpe;
  document.getElementById("edit-duration").value = log.durationMin;
  document.getElementById("edit-dedos").value = log.dedos;
  document.getElementById("edit-codos").value = log.codos;
  document.getElementById("edit-note").value = log.note;
  document.getElementById("edit-log-modal").classList.add("open");
  pushAppHistory({ modal: "edit-log" });
}

function closeEditLogModal() {
  document.getElementById("edit-log-modal").classList.remove("open");
}

async function saveEditedLog() {
  const rowIndex = Number(document.getElementById("edit-row-index").value);
  const btn = document.getElementById("btn-update-log");
  btn.disabled = true;
  btn.textContent = "Actualizando...";

  await postToSheets({
    action: "edit_log",
    row_index: rowIndex,
    data: {
      rpe: Number(document.getElementById("edit-rpe").value),
      session_duration_min: Number(document.getElementById("edit-duration").value),
      dedos: document.getElementById("edit-dedos").value,
      codos: document.getElementById("edit-codos").value,
      note: document.getElementById("edit-note").value.trim()
    }
  });

  btn.disabled = false;
  btn.textContent = "Actualizar en Sheets";
  closeEditLogModal();
  await syncFromSheets(true);
}

function openBenchmarkModal() {
  document.getElementById("bench-modal").classList.add("open");
  pushAppHistory({ modal: "bench" });
}

function closeBenchmarkModal() {
  document.getElementById("bench-modal").classList.remove("open");
}

async function saveBenchmarks() {
  const btn = document.getElementById("btn-save-bm");
  btn.disabled = true;
  btn.textContent = "Guardando...";

  const benchmarks = {};
  const w = document.getElementById("bm-weight").value.trim();
  const h = document.getElementById("bm-hang").value.trim();
  const s = document.getElementById("bm-slab").value.trim();
  const o = document.getElementById("bm-overhang").value.trim();
  if (w) benchmarks["Peso Corporal"] = `${w} kg`;
  if (h) benchmarks["Carga Máxima (Regleta 20mm)"] = `+${h} kg`;
  if (s) benchmarks["Grado Máximo Búlder (Placa)"] = s;
  if (o) benchmarks["Grado Máximo Búlder (Desplome)"] = o;

  await postToSheets({ action: "update_benchmarks", benchmarks });
  btn.disabled = false;
  btn.textContent = "Guardar Benchmarks";
  closeBenchmarkModal();
  await syncFromSheets(true);
}

// CONFIG Y NAVEGACIÓN
function openConfigModal() {
  document.getElementById("api-url-input").value = getApiUrl();
  document.getElementById("cfg-modal").classList.add("open");
  pushAppHistory({ modal: "cfg" });
}
function closeConfigModal() { document.getElementById("cfg-modal").classList.remove("open"); }
function saveApiUrl() {
  const val = document.getElementById("api-url-input").value.trim();
  if (val) safeStorage.set(STORAGE_KEYS.API_URL, val);
  closeConfigModal();
  syncFromSheets(true);
}

let backExitArmed = false;
let backExitTimer = null;
let navHistoryStack = ["home"];

function pushAppHistory(entry = {}) {
  try {
    history.pushState({ sunblock: true, view: state.currentView, ...entry }, "");
  } catch (_) {}
}

function showBackExitToast() {
  const toast = document.getElementById("back-exit-toast");
  if (!toast) return;
  toast.classList.remove("hidden");
  clearTimeout(backExitTimer);
  backExitArmed = true;
  backExitTimer = setTimeout(() => {
    backExitArmed = false;
    toast.classList.add("hidden");
  }, 2000);
}

function closeAnyOpenOverlay() {
  const openModalIds = ["edit-log-modal", "bench-modal", "cfg-modal"];
  for (const id of openModalIds) {
    const el = document.getElementById(id);
    if (el && el.classList.contains("open")) {
      el.classList.remove("open");
      return true;
    }
  }
  if (state.encyDetailId) {
    closeExerciseDetail(true);
    return true;
  }
  return false;
}

function initBackNavigation() {
  try {
    history.replaceState({ sunblock: true, root: true, view: "home" }, "");
    history.pushState({ sunblock: true, view: "home" }, "");
  } catch (_) {}

  window.addEventListener("popstate", () => {
    // Prioridad 1: Cerrar modales o vista de detalle de ejercicio
    if (closeAnyOpenOverlay()) {
      pushAppHistory({ view: state.currentView });
      return;
    }

    // Prioridad 2: Si está en otra pestaña, regresar a la pestaña anterior o a Inicio
    if (state.currentView !== "home") {
      navHistoryStack.pop();
      const targetView = navHistoryStack.pop() || "home";
      switchView(targetView, document.querySelector(`.nav-btn[data-view="${targetView}"]`), true);
      pushAppHistory({ view: targetView });
      return;
    }

    // Prioridad 3: En Inicio sin modales abiertos → protección con toast 2s
    if (!backExitArmed) {
      showBackExitToast();
      pushAppHistory({ view: "home" });
    }
  });
}

function switchView(viewName, btn, skipHistory = false) {
  if (state.currentView !== viewName) {
    navHistoryStack.push(viewName);
    if (navHistoryStack.length > 12) navHistoryStack.shift();
  }
  state.currentView = viewName;
  if (viewName === "ency") {
    state.encyDetailId = null;
    state.prevView = null;
    renderEncyclopedia();
  }
  ["home", "train", "ency", "log"].forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle("hidden", v !== viewName);
  });
  document.getElementById("global-plan-card")?.classList.toggle("hidden", viewName === "ency");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (!skipHistory) {
    pushAppHistory({ view: viewName });
  }
}
