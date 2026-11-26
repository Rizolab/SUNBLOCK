/* ========================================================================
2. TEMPORIZADOR INTELIGENTE DE 4 MODOS (CALENTAMIENTO, BLOQUE MURO, SERIES, MULTIPRESA)
   Incluye Screen Wake Lock API para evitar que la pantalla se apague mientras corre el reloj
   ======================================================================== */
let timerCfg = {
  mode: "rest",        // "warmup" | "block" | "rest" | "interval"
  prep: 5,
  work: 10,
  restRep: 0,
  reps: 1,
  sets: 4,
  setRest: 180,
  warmupSec: 900,      // 15 min por defecto para calentamiento
  blockWindowSec: 1200 // 20 min por defecto para bloques en muro
};

let latLinked = {
  checkKey: null,
  exId: null,
  exName: "Sin ejercicio cargado",
  sectionName: "",
  rx: "",
  restText: "",
  queueIndex: 0
};

let timerRun = {
  running: false,
  phase: "setrest",
  rep: 1,
  set: 1,
  attempt: 1,
  remaining: 180,
  phaseTotal: 180,
  intervalId: null,
  blockRemaining: 1200,
  blockRunning: false,
  blockIntervalId: null
};

let wakeLockSentinel = null;

function isAnyTimerRunning() {
  return Boolean(timerRun.running || timerRun.blockRunning);
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || !isAnyTimerRunning()) return;
  if (wakeLockSentinel && !wakeLockSentinel.released) return;
  try {
    wakeLockSentinel = await navigator.wakeLock.request("screen");
    wakeLockSentinel.addEventListener("release", () => {
      wakeLockSentinel = null;
    });
  } catch (_) {}
}

async function releaseWakeLock() {
  if (!wakeLockSentinel) return;
  const sentinel = wakeLockSentinel;
  wakeLockSentinel = null;
  try {
    await sentinel.release();
  } catch (_) {}
}

function syncWakeLock() {
  if (isAnyTimerRunning()) {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && isAnyTimerRunning()) {
    requestWakeLock();
  }
});

function beepPhase(type) {
  try {
    if (navigator.vibrate) navigator.vibrate(type === "work" ? [120, 60, 120] : 180);
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = type === "work" ? 880 : (type === "done" ? 523 : 660);
    gain.gain.value = 0.09;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 180);
  } catch (_) {}
}

function fmtSec(n) {
  const v = Math.max(0, Math.floor(n));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}

function parseSecondsFromText(text, fallbackSec) {
  if (!text) return fallbackSec;
  const t = String(text).toLowerCase();
  const m = t.match(/(\d+(?:\.\d+)?)\s*(?:-\s*\d+\s*)?min/);
  if (m) return Math.max(10, Math.round(parseFloat(m[1]) * 60));
  const s = t.match(/(\d+)\s*(?:-\s*\d+\s*)?seg/);
  if (s) return Math.max(1, parseInt(s[1], 10));
  return fallbackSec;
}

function parsePrescriptionSmart(exObj, rxText, restText, sectionName = "") {
  const rx = String(rxText || "").toLowerCase();
  const secLower = String(sectionName || "").toLowerCase();
  const nameLower = String((exObj && exObj.name) || "").toLowerCase();
  const restLower = String(restText || "").toLowerCase();
  const setRest = parseSecondsFromText(restText, (exObj && Number(exObj.set_rest_sec)) || 120);

  // 1. MODO CALENTAMIENTO: sección o ejercicio de calentamiento / activación o duración única sin series
  const isWarmup = /calentamiento|activaci[oó]n|movilidad articular/.test(secLower) ||
                   /calentamiento|activaci[oó]n/.test(nameLower) ||
                   (/^\d+\s*(?:-\s*\d+\s*)?min/.test(rx.trim()) && !restLower && !/serie|ronda|x\s*\d+/.test(rx));
  if (isWarmup) {
    const warmupSec = parseSecondsFromText(rxText, parseSecondsFromText(sectionName, 900));
    return {
      mode: "warmup",
      prep: 0, work: 0, restRep: 0, reps: 1, sets: 1,
      setRest: 60,
      warmupSec,
      blockWindowSec: 1200
    };
  }

  // 2. MODO BLOQUE EN MURO: tiene ventana total en minutos (ej. "20 min") + descanso entre pegues/intentos (ej. "2 min"), sin ser multipresa
  const blockMinMatch = rx.match(/(\d+(?:\.\d+)?)\s*(?:-\s*\d+\s*)?min/);
  const isRepeater = /(\d+)\s*:\s*(\d+)/.test(rx);
  const isShortHold = /(?:x|\()\s*\d+\s*(?:seg|s\b)/.test(rx);
  if (blockMinMatch && !isRepeater && !isShortHold) {
    const blockWindowSec = Math.max(60, Math.round(parseFloat(blockMinMatch[1]) * 60));
    return {
      mode: "block",
      prep: 0, work: 0, restRep: 0, reps: 1, sets: 1,
      setRest,
      warmupSec: 900,
      blockWindowSec
    };
  }

  // 3. MODO INTERVALOS / MULTIPRESA (ej. 7:3 x 6 reps o suspensiones de 10s)
  let sets = (exObj && Number(exObj.sets)) || 3;
  const setsMatch = rx.match(/(\d+)\s*(?:series|rondas)/);
  if (setsMatch) sets = Math.max(1, parseInt(setsMatch[1], 10));
  else {
    const xPrefix = rx.match(/^(\d+)\s*x\s*\d+/);
    if (xPrefix) sets = Math.max(1, parseInt(xPrefix[1], 10));
  }

  const repeaterMatch = rx.match(/(\d+)\s*:\s*(\d+)/);
  if (repeaterMatch) {
    const work = Math.max(1, parseInt(repeaterMatch[1], 10));
    const restRep = Math.max(1, parseInt(repeaterMatch[2], 10));
    const repsMatch = rx.match(/x\s*(\d+)\s*rep/);
    const reps = repsMatch ? Math.max(1, parseInt(repsMatch[1], 10)) : ((exObj && Number(exObj.reps)) || 6);
    return { mode: "interval", prep: 5, work, restRep, reps, sets, setRest, warmupSec: 900, blockWindowSec: 1200 };
  }

  const segMatch = rx.match(/(?:x|\()\s*(\d+)\s*(?:seg|s\b)/);
  const holdFromDb = exObj ? Number(exObj.hold_sec) : 0;
  if (segMatch || (holdFromDb > 0 && !rx.includes("rep"))) {
    const work = segMatch ? Math.max(1, parseInt(segMatch[1], 10)) : holdFromDb;
    const isLockoff = /90°|120°|bloqueo/.test(rx);
    return {
      mode: "interval",
      prep: 5,
      work,
      restRep: isLockoff ? 3 : (Number(exObj?.rest_rep_sec) || 0),
      reps: isLockoff ? 3 : (Number(exObj?.reps) || 1),
      sets,
      setRest,
      warmupSec: 900,
      blockWindowSec: 1200
    };
  }

  // 4. MODO DESCANSO ENTRE SERIES (Fuerza, barra, core, antagonistas)
  return { mode: "rest", prep: 0, work: 0, restRep: 0, reps: 1, sets, setRest, warmupSec: 900, blockWindowSec: 1200 };
}

function setTimerMode(newMode) {
  const valid = ["warmup", "block", "rest", "interval"];
  timerCfg.mode = valid.includes(newMode) ? newMode : "rest";
  resetTimer();
}

function setQuickRest(seconds) {
  if (timerCfg.mode === "warmup") {
    timerCfg.warmupSec = Math.max(60, Number(seconds) || 900);
    resetTimer();
    return;
  }
  if (timerCfg.mode !== "block") {
    timerCfg.mode = "rest";
  }
  timerCfg.setRest = Math.max(10, Number(seconds) || 120);
  resetTimer();
}

function enterPhase(phase, sec) {
  const safeSec = Math.max(1, Number(sec) || 1);
  timerRun.phase = phase;
  timerRun.remaining = safeSec;
  timerRun.phaseTotal = safeSec;
}

function resetBlockWindow() {
  clearInterval(timerRun.blockIntervalId);
  timerRun.blockIntervalId = null;
  timerRun.blockRunning = false;
  timerRun.blockRemaining = timerCfg.blockWindowSec || 1200;
  syncWakeLock();
}

function toggleBlockWindow() {
  if (timerRun.blockRunning) {
    clearInterval(timerRun.blockIntervalId);
    timerRun.blockIntervalId = null;
    timerRun.blockRunning = false;
    syncWakeLock();
    renderTimer();
    return;
  }
  if (timerRun.blockRemaining <= 0) timerRun.blockRemaining = timerCfg.blockWindowSec || 1200;
  timerRun.blockRunning = true;
  syncWakeLock();
  renderTimer();
  timerRun.blockIntervalId = setInterval(() => {
    if (timerRun.blockRemaining > 1) {
      timerRun.blockRemaining -= 1;
    } else {
      timerRun.blockRemaining = 0;
      timerRun.blockRunning = false;
      clearInterval(timerRun.blockIntervalId);
      timerRun.blockIntervalId = null;
      syncWakeLock();
      beepPhase("done");
    }
    renderTimer();
  }, 1000);
}

function resetTimer() {
  clearInterval(timerRun.intervalId);
  timerRun.intervalId = null;
  timerRun.running = false;
  timerRun.rep = 1;
  timerRun.set = 1;
  timerRun.attempt = 1;
  resetBlockWindow();

  if (timerCfg.mode === "warmup") enterPhase("warmup", timerCfg.warmupSec);
  else if (timerCfg.mode === "block") enterPhase("setrest", timerCfg.setRest);
  else if (timerCfg.mode === "rest") enterPhase("setrest", timerCfg.setRest);
  else if (timerCfg.prep > 0) enterPhase("prep", timerCfg.prep);
  else enterPhase("work", timerCfg.work);

  syncWakeLock();
  renderTimer();
}

function applyIntervalInputs() {
  timerCfg.prep = Math.max(0, Number(document.getElementById("lat-prep")?.value) || 0);
  timerCfg.work = Math.max(1, Number(document.getElementById("lat-work")?.value) || 10);
  timerCfg.restRep = Math.max(0, Number(document.getElementById("lat-rest")?.value) || 0);
  timerCfg.reps = Math.max(1, Number(document.getElementById("lat-reps")?.value) || 1);
  timerCfg.sets = Math.max(1, Number(document.getElementById("lat-sets")?.value) || 1);
  timerCfg.setRest = Math.max(10, Number(document.getElementById("lat-setrest")?.value) || 60);
  resetTimer();
}

function syncIntervalInputsFromCfg() {
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal("lat-prep", timerCfg.prep);
  setVal("lat-work", timerCfg.work);
  setVal("lat-rest", timerCfg.restRep);
  setVal("lat-reps", timerCfg.reps);
  setVal("lat-sets", timerCfg.sets);
  setVal("lat-setrest", timerCfg.setRest);
}

function advanceTimerTick() {
  if (timerCfg.mode === "warmup") {
    clearInterval(timerRun.intervalId);
    timerRun.intervalId = null;
    timerRun.running = false;
    timerRun.phase = "done";
    timerRun.remaining = 0;
    syncWakeLock();
    beepPhase("done");
    return;
  }

  if (timerCfg.mode === "block") {
    clearInterval(timerRun.intervalId);
    timerRun.intervalId = null;
    timerRun.running = false;
    syncWakeLock();
    beepPhase("work");
    timerRun.attempt += 1;
    enterPhase("setrest", timerCfg.setRest);
    return;
  }

  if (timerCfg.mode === "rest") {
    clearInterval(timerRun.intervalId);
    timerRun.intervalId = null;
    timerRun.running = false;
    syncWakeLock();
    beepPhase("done");
    if (timerRun.set < timerCfg.sets) {
      timerRun.set += 1;
      enterPhase("setrest", timerCfg.setRest);
    } else {
      timerRun.phase = "done";
      timerRun.remaining = 0;
    }
    return;
  }

  if (timerRun.phase === "prep") {
    enterPhase("work", timerCfg.work);
    beepPhase("work");
    return;
  }
  if (timerRun.phase === "work") {
    if (timerRun.rep < timerCfg.reps) {
      if (timerRun.restRep > 0) {
        enterPhase("rest", timerCfg.restRep);
        beepPhase("rest");
      } else {
        timerRun.rep += 1;
        enterPhase("work", timerCfg.work);
        beepPhase("work");
      }
      return;
    }
    if (timerRun.set < timerCfg.sets) {
      if (timerRun.setRest > 0) {
        enterPhase("setrest", timerCfg.setRest);
        beepPhase("rest");
      } else {
        timerRun.set += 1;
        timerRun.rep = 1;
        enterPhase("work", timerCfg.work);
        beepPhase("work");
      }
      return;
    }
    timerRun.phase = "done";
    timerRun.remaining = 0;
    timerRun.running = false;
    clearInterval(timerRun.intervalId);
    timerRun.intervalId = null;
    syncWakeLock();
    beepPhase("done");
    return;
  }
  if (timerRun.phase === "rest") {
    timerRun.rep += 1;
    enterPhase("work", timerCfg.work);
    beepPhase("work");
    return;
  }
  if (timerRun.phase === "setrest") {
    timerRun.set += 1;
    timerRun.rep = 1;
    enterPhase("work", timerCfg.work);
    beepPhase("work");
  }
}

function advanceSetOrPhase() {
  if (timerCfg.mode === "warmup") {
    completeLinkedExercise();
    return;
  }
  if (timerCfg.mode === "block") {
    clearInterval(timerRun.intervalId);
    timerRun.intervalId = null;
    timerRun.running = false;
    syncWakeLock();
    timerRun.attempt += 1;
    enterPhase("setrest", timerCfg.setRest);
    renderTimer();
    return;
  }
  if (timerCfg.mode === "rest") {
    clearInterval(timerRun.intervalId);
    timerRun.intervalId = null;
    timerRun.running = false;
    syncWakeLock();
    if (timerRun.set < timerCfg.sets) {
      timerRun.set += 1;
      enterPhase("setrest", timerCfg.setRest);
    } else {
      timerRun.phase = "done";
      timerRun.remaining = 0;
    }
    renderTimer();
    return;
  }
  if (timerRun.phase === "done") return;
  advanceTimerTick();
  renderTimer();
}

function toggleTimer() {
  if (timerRun.running) {
    clearInterval(timerRun.intervalId);
    timerRun.intervalId = null;
    timerRun.running = false;
    syncWakeLock();
    renderTimer();
    return;
  }
  if (timerRun.phase === "done") resetTimer();
  // En modo Bloque en Muro, arrancar el descanso también activa la ventana total si estaba detenida
  if (timerCfg.mode === "block" && !timerRun.blockRunning && timerRun.blockRemaining > 0) {
    toggleBlockWindow();
  }
  timerRun.running = true;
  syncWakeLock();
  renderTimer();
  timerRun.intervalId = setInterval(() => {
    if (timerRun.remaining > 1) timerRun.remaining -= 1;
    else advanceTimerTick();
    renderTimer();
  }, 1000);
}

function renderTimer() {
  const pill = document.getElementById("lat-phase-pill");
  const digits = document.getElementById("lat-digits");
  const sr = document.getElementById("lat-sr");
  const totalEl = document.getElementById("lat-total-left");
  const fill = document.getElementById("lat-phase-fill");
  const toggleIcon = document.getElementById("lat-toggle-icon");
  const toggleLabel = document.getElementById("lat-toggle-label");
  const skipLabel = document.getElementById("lat-skip-label");
  const exTitle = document.getElementById("lat-ex-title");
  const exSub = document.getElementById("lat-ex-sub");
  const paramsPanel = document.getElementById("lat-params-panel");
  const presetsBar = document.getElementById("rest-presets-bar");
  const blockBar = document.getElementById("block-window-bar");
  const blockDigits = document.getElementById("block-window-digits");
  const blockBtn = document.getElementById("block-window-btn");
  const queueEl = document.getElementById("lat-queue");
  if (!pill || !digits || !sr) return;

  const mode = timerCfg.mode;
  ["warmup", "block", "rest", "interval"].forEach(m => {
    document.getElementById(`mode-btn-${m}`)?.classList.toggle("active", mode === m);
  });

  const showPresets = mode === "rest" || mode === "block";
  if (presetsBar) presetsBar.classList.toggle("hidden", !showPresets);
  if (paramsPanel) paramsPanel.classList.toggle("hidden", mode !== "interval" || timerRun.running);
  if (blockBar) blockBar.classList.toggle("hidden", mode !== "block");

  if (mode === "block" && blockDigits && blockBtn) {
    blockDigits.textContent = fmtSec(timerRun.blockRemaining);
    blockBtn.textContent = timerRun.blockRunning ? "Pausar Bloque" : "Iniciar Bloque";
  }

  if (showPresets && presetsBar) {
    presetsBar.querySelectorAll(".preset-chip").forEach(btn => {
      const secMatch = btn.getAttribute("onclick")?.match(/\((\d+)\)/);
      const sVal = secMatch ? Number(secMatch[1]) : 0;
      btn.classList.toggle("active", sVal === timerCfg.setRest);
    });
  }

  const meta = {
    warmup: { label: "CALENTAMIENTO", cls: "p-warmup", color: "#fb923c" },
    prep: { label: "PREPARACIÓN", cls: "p-prep", color: "#38bdf8" },
    work: { label: "TRABAJO EN MURO / BARRA", cls: "p-work", color: "#2dd4bf" },
    rest: { label: "PAUSA ENTRE REPS", cls: "p-rest", color: "#34d399" },
    setrest: { label: mode === "block" ? "PAUSA ENTRE PEGUES" : "PAUSA ENTRE SERIES", cls: "p-setrest", color: "#fbbf24" },
    done: { label: "COMPLETADO", cls: "p-done", color: "#34d399" }
  };
  const cur = meta[timerRun.phase] || meta.setrest;

  pill.textContent = cur.label;
  pill.className = `phase-pill ${cur.cls}`;
  digits.textContent = fmtSec(timerRun.remaining);
  digits.style.color = cur.color;

  if (mode === "warmup") {
    sr.textContent = `Activación (${Math.round(timerCfg.warmupSec / 60)} min)`;
    if (totalEl) totalEl.textContent = timerRun.phase === "done"
      ? "Calentamiento listo · Pasa al primer ejercicio"
      : "Activa articulaciones y dedos a tu ritmo";
    if (toggleLabel) toggleLabel.textContent = timerRun.running ? "Pausar" : "Iniciar Calentamiento";
    if (skipLabel) skipLabel.textContent = "Listo → Rutina";
  } else if (mode === "block") {
    sr.textContent = `Pegue ${timerRun.attempt}`;
    if (totalEl) totalEl.textContent = timerRun.running
      ? "Recuperando ATP-PC antes del siguiente pegue..."
      : "Baja del muro y pulsa Iniciar Descanso";
    if (toggleLabel) toggleLabel.textContent = timerRun.running ? "Pausar" : "Iniciar Descanso";
    if (skipLabel) skipLabel.textContent = "+1 Pegue";
  } else if (mode === "rest") {
    sr.textContent = `Serie ${timerRun.set} de ${timerCfg.sets}`;
    if (totalEl) totalEl.textContent = timerRun.phase === "done"
      ? "Todas las series completadas"
      : (timerRun.running ? "Descansando antes de la siguiente serie..." : "Haz tus reps y pulsa Iniciar Descanso");
    if (toggleLabel) toggleLabel.textContent = timerRun.running ? "Pausar" : "Iniciar Descanso";
    if (skipLabel) skipLabel.textContent = "+1 Serie";
  } else {
    sr.textContent = `Serie ${timerRun.set}/${timerCfg.sets} · Rep ${timerRun.rep}/${timerCfg.reps}`;
    if (totalEl) totalEl.textContent = `Trabajo ${timerCfg.work}s · Descanso serie ${fmtSec(timerCfg.setRest)}`;
    if (toggleLabel) toggleLabel.textContent = timerRun.running ? "Pausar" : "Iniciar";
    if (skipLabel) skipLabel.textContent = "Saltar Fase";
  }

  if (exTitle) exTitle.textContent = latLinked.exName;
  if (exSub) exSub.textContent = latLinked.rx
    ? `${latLinked.rx}${latLinked.restText ? ` · Pausa: ${latLinked.restText}` : ""}`
    : "Selecciona un ejercicio abajo";

  if (fill) {
    const pct = timerRun.phaseTotal > 0 ? Math.max(0, Math.min(100, (timerRun.remaining / timerRun.phaseTotal) * 100)) : 0;
    fill.style.width = `${timerRun.phase === "done" ? 100 : pct}%`;
    fill.style.background = cur.color;
  }

  if (toggleIcon) toggleIcon.innerHTML = iconSvg(timerRun.running ? "pause" : "play", 13);

  const queue = getDayExerciseQueue();
  if (queueEl) {
    queueEl.innerHTML = queue.map((q, idx) => `
      <button type="button" class="q-chip ${idx === latLinked.queueIndex ? "active" : ""}" onclick="loadQueueExerciseAt(${idx}, false)">
        ${idx + 1}. ${q.exName}
      </button>
    `).join("");
  }
}
