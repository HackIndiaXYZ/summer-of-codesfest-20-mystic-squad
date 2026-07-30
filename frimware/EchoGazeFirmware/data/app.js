/* ==========================================================================
   EchoGaze — ESP32 Firmware Interface
   Column → item auto-scanning AAC board driven by a single physical switch.
   ========================================================================== */
(function () {
  'use strict';

  const NUM_COLS = 4;
  const NUM_ROWS = 4;
  const DOUBLE_TAP_MS = 380;  // max gap between taps that counts as "select"
  const SOS_WINDOW_MS = 3000; // window for counting the 4-tap SOS gesture

  /* ---------------------------------------------------------------------
     State
     ------------------------------------------------------------------- */
  const state = {
    mode: 'COLUMN_SCAN',   // COLUMN_SCAN | ITEM_SCAN
    colIndex: 0,
    itemIndex: 0,
    scanInterval: 2500,
    scanTimer: null,
    dwellStart: 0,
    progressRaf: null,
    voiceReadout: true,
    voiceCommandsOn: true,
    autoScanEnabled: false, // auto-scan cycling is off by default; enable in Settings
    sosTaps: [],
    lastTapTime: 0,
    singleTapTimer: null,
    suspended: false, // true during confirm / SOS overlays
  };

  /* ---------------------------------------------------------------------
     DOM references
     ------------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  const dom = {
    columns: [...document.querySelectorAll('.column')],
    statusText: $('status-text'),
    uiStateLabel: $('ui-state-label'),
    scanProgressBar: $('scan-progress-bar'),

    themeToggle: $('theme-toggle'),
    settingsBtn: $('settings-btn'),
    settingsModal: $('settings-modal'),
    closeSettings: $('close-settings'),
    saveSettings: $('save-settings'),
    speedSlider: $('speed-slider'),
    speedVal: $('speed-val'),
    voiceReadoutChk: $('voice-readout-chk'),
    autoscanEnableChk: $('autoscan-enable-chk'),
    deviceCodeInput: $('device-code-input'),

    voiceBtn: $('voice-btn'),
    emergencyBtn: $('emergency-btn'),

    switchBtn: $('switch-btn'),
    switchRing: $('switch-ring'),
    lastAction: $('last-action'),
    scanPosLabel: $('scan-pos-label'),
    sosDots: [...document.querySelectorAll('#sos-dots span')],

    btnSelect: $('btn-select'),
    btnBack: $('btn-back'),

    toastContainer: $('toast-container'),
    timeDisplay: $('time-display'),

    confirmOverlay: $('confirm-overlay'),
    confirmMsg: $('confirm-msg'),
    sosOverlay: $('sos-overlay'),

    speechBanner: $('speech-banner'),
    speechTranscript: $('speech-transcript'),
  };

  // 4x4 grid of card elements, addressed as cardEls[col][row]
  const cardEls = Array.from({ length: NUM_COLS }, (_, col) =>
    Array.from({ length: NUM_ROWS }, (_, row) => $(`card-${col}-${row}`))
  );

  /* ---------------------------------------------------------------------
     Toasts
     ------------------------------------------------------------------- */
  function toast(message, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    el.textContent = message;
    dom.toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 320);
    }, 2600);
  }

  /* ---------------------------------------------------------------------
     Speech (voice readout of selections / status)
     ------------------------------------------------------------------- */
  function speak(text) {
    if (!state.voiceReadout || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    } catch (e) { /* speech synthesis unavailable — fail silently */ }
  }

  /* ---------------------------------------------------------------------
     Rendering
     ------------------------------------------------------------------- */
  function render() {
    dom.columns.forEach((colEl, ci) => {
      const isActiveCol = ci === state.colIndex;
      colEl.classList.toggle('col-active', isActiveCol);

      cardEls[ci].forEach((cardEl, ri) => {
        if (!cardEl) return;
        const isScanTarget =
          state.mode === 'ITEM_SCAN' && ci === state.colIndex && ri === state.itemIndex;
        cardEl.classList.toggle('card-active', isScanTarget);
      });
    });

    const colName = dom.columns[state.colIndex]
      .querySelector('.column-header')
      .textContent.trim()
      .replace(/^\S+\s*/, ''); // strip the leading dot glyph

    if (state.mode === 'COLUMN_SCAN') {
      dom.uiStateLabel.textContent = 'COLUMN SCAN Mode';
      dom.statusText.textContent = `State: COLUMN_SCAN — scanning "${colName}" · double-tap to zoom in`;
      dom.scanPosLabel.textContent = `Col ${state.colIndex + 1} · ${colName}`;
    } else {
      const card = cardEls[state.colIndex][state.itemIndex];
      const title = card ? card.querySelector('.card__title').textContent.trim() : '';
      dom.uiStateLabel.textContent = 'ITEM SCAN Mode';
      dom.statusText.textContent = `State: ITEM_SCAN — "${colName}" → double-tap to select "${title}"`;
      dom.scanPosLabel.textContent = `Col ${state.colIndex + 1} · Item ${state.itemIndex + 1}`;
    }
  }

  /* ---------------------------------------------------------------------
     Auto-scan timer + progress bar
     ------------------------------------------------------------------- */
  function stepScan() {
    if (state.mode === 'COLUMN_SCAN') {
      state.colIndex = (state.colIndex + 1) % NUM_COLS;
    } else {
      state.itemIndex = (state.itemIndex + 1) % NUM_ROWS;
    }
    render();
  }

  function tickProgress() {
    if (state.suspended) return;
    const elapsed = performance.now() - state.dwellStart;
    const pct = Math.min(100, (elapsed / state.scanInterval) * 100);
    dom.scanProgressBar.style.width = pct + '%';
    state.progressRaf = requestAnimationFrame(tickProgress);
  }

  function restartAutoScan() {
    clearInterval(state.scanTimer);
    cancelAnimationFrame(state.progressRaf);
    dom.scanProgressBar.style.width = '0%';
    if (state.suspended || !state.autoScanEnabled) return;
    state.dwellStart = performance.now();
    state.progressRaf = requestAnimationFrame(tickProgress);
    state.scanTimer = setInterval(() => {
      stepScan();
      state.dwellStart = performance.now();
    }, state.scanInterval);
  }

  function pauseAutoScan() {
    clearInterval(state.scanTimer);
    cancelAnimationFrame(state.progressRaf);
    dom.scanProgressBar.style.width = '0%';
  }

  /* ---------------------------------------------------------------------
     Core actions: advance / select / back
     ------------------------------------------------------------------- */
  function advance() {
    if (state.suspended) return;
    stepScan();
    restartAutoScan();
  }

  function selectCurrent() {
    if (state.suspended) return;

    if (state.mode === 'COLUMN_SCAN') {
      state.mode = 'ITEM_SCAN';
      state.itemIndex = 0;
      render();
      restartAutoScan();
      return;
    }

    const card = cardEls[state.colIndex][state.itemIndex];
    if (!card) return;

    if (card.id === 'card-3-3') { // Emergency SOS card
      triggerSOS();
      return;
    }

    const title = card.querySelector('.card__title').textContent.trim();
    const phrase = card.querySelector('.card__phrase').textContent.trim();
    fireSelection(title, phrase);
  }

  function fireSelection(title, phrase) {
    state.suspended = true;
    pauseAutoScan();
    dom.confirmMsg.textContent = `Sending "${title}"`;
    dom.confirmOverlay.classList.add('show');
    speak(phrase);
    toast(`Sent: ${title}`);

    setTimeout(() => {
      dom.confirmOverlay.classList.remove('show');
      state.mode = 'COLUMN_SCAN';
      state.colIndex = 0;
      state.itemIndex = 0;
      state.suspended = false;
      render();
      restartAutoScan();
    }, 1500);
  }

  function back() {
    if (state.suspended) return;
    if (state.mode === 'ITEM_SCAN') {
      state.mode = 'COLUMN_SCAN';
      render();
      restartAutoScan();
    }
  }

  /* ---------------------------------------------------------------------
     Emergency SOS
     ------------------------------------------------------------------- */
  function triggerSOS() {
    state.suspended = true;
    pauseAutoScan();
    document.body.classList.add('emergency-flash');
    dom.sosOverlay.classList.add('show');
    toast('EMERGENCY SOS sent to caregiver', 'error');
    speak('Emergency. Sending SOS to caregiver now.');

    setTimeout(() => {
      dom.sosOverlay.classList.remove('show');
      document.body.classList.remove('emergency-flash');
      state.sosTaps = [];
      updateSosDots();
      state.mode = 'COLUMN_SCAN';
      state.colIndex = 0;
      state.itemIndex = 0;
      state.suspended = false;
      render();
      restartAutoScan();
    }, 2600);
  }

  function updateSosDots() {
    const now = Date.now();
    state.sosTaps = state.sosTaps.filter((t) => now - t < SOS_WINDOW_MS);
    dom.sosDots.forEach((d, i) => d.classList.toggle('lit', i < state.sosTaps.length));
  }

  /* ---------------------------------------------------------------------
     Single-switch gesture detection: tap = next · double-tap = select · 4-tap SOS
     ------------------------------------------------------------------- */
  function registerTap() {
    const now = Date.now();
    state.sosTaps.push(now);
    updateSosDots();

    if (state.sosTaps.length >= 4) {
      dom.lastAction.textContent = 'SOS (4 taps / 3s)';
      state.sosTaps = [];
      triggerSOS();
      return;
    }

    if (now - state.lastTapTime < DOUBLE_TAP_MS) {
      dom.lastAction.textContent = 'Double-tap → Select';
      clearTimeout(state.singleTapTimer);
      state.lastTapTime = 0;
      selectCurrent();
      return;
    }

    state.lastTapTime = now;
    clearTimeout(state.singleTapTimer);
    state.singleTapTimer = setTimeout(() => {
      if (state.lastTapTime !== 0) {
        dom.lastAction.textContent = 'Tap → Next';
        advance();
      }
    }, DOUBLE_TAP_MS);
  }

  function pressStartHandler(e) {
    e.preventDefault();
    dom.switchRing.style.setProperty('--p', 100);
  }

  function pressEndHandler(e) {
    e.preventDefault();
    dom.switchRing.style.setProperty('--p', 0);
    registerTap();
  }

  dom.switchBtn.addEventListener('mousedown', pressStartHandler);
  dom.switchBtn.addEventListener('mouseup', pressEndHandler);
  dom.switchBtn.addEventListener('mouseleave', () => dom.switchRing.style.setProperty('--p', 0));
  dom.switchBtn.addEventListener('touchstart', pressStartHandler, { passive: false });
  dom.switchBtn.addEventListener('touchend', pressEndHandler, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) pressStartHandler(e);
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') pressEndHandler(e);
  });

  /* ---------------------------------------------------------------------
     Manual test buttons (mirror hold/double-tap without needing timing)
     ------------------------------------------------------------------- */
  dom.btnSelect.addEventListener('click', () => {
    dom.lastAction.textContent = 'Manual → Select';
    selectCurrent();
  });
  dom.btnBack.addEventListener('click', () => {
    dom.lastAction.textContent = 'Manual → Back';
    back();
  });

  /* ---------------------------------------------------------------------
     Direct touch bypass: tap any card to jump straight to it and send it
     ------------------------------------------------------------------- */
  cardEls.forEach((col, ci) => {
    col.forEach((cardEl, ri) => {
      if (!cardEl) return;
      cardEl.addEventListener('click', () => {
        if (state.suspended) return;
        state.colIndex = ci;
        state.itemIndex = ri;
        state.mode = 'ITEM_SCAN';
        dom.lastAction.textContent = 'Touch bypass → Select';
        render();
        selectCurrent();
      });
    });
  });

  /* ---------------------------------------------------------------------
     Emergency button (manual SOS)
     ------------------------------------------------------------------- */
  dom.emergencyBtn.addEventListener('click', () => {
    dom.lastAction.textContent = 'Manual → SOS';
    triggerSOS();
  });

  /* ---------------------------------------------------------------------
     Settings modal
     ------------------------------------------------------------------- */
  function openSettings() {
    dom.settingsModal.classList.remove('hidden');
  }
  function closeSettingsModal() {
    dom.settingsModal.classList.add('hidden');
  }

  dom.settingsBtn.addEventListener('click', openSettings);
  dom.closeSettings.addEventListener('click', closeSettingsModal);
  dom.settingsModal.addEventListener('click', (e) => {
    if (e.target === dom.settingsModal) closeSettingsModal();
  });
  dom.saveSettings.addEventListener('click', () => {
    closeSettingsModal();
    toast('Settings saved to device');
  });

  dom.speedSlider.addEventListener('input', () => {
    state.scanInterval = Number(dom.speedSlider.value);
    dom.speedVal.textContent = (state.scanInterval / 1000).toFixed(1) + 's';
    restartAutoScan();
  });

  dom.voiceReadoutChk.addEventListener('change', () => {
    state.voiceReadout = dom.voiceReadoutChk.checked;
  });

  dom.autoscanEnableChk.addEventListener('change', () => {
    state.autoScanEnabled = dom.autoscanEnableChk.checked;
    if (state.autoScanEnabled) {
      toast('Auto-scan cycling enabled');
      restartAutoScan();
    } else {
      toast('Auto-scan cycling disabled');
      pauseAutoScan();
    }
  });

  /* ---------------------------------------------------------------------
     Theme toggle
     ------------------------------------------------------------------- */
  dom.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    toast(document.body.classList.contains('light') ? 'Light mode' : 'Dark mode');
  });

  /* ---------------------------------------------------------------------
     Voice feedback toggle (reads the sent phrase aloud via device TTS)
     ------------------------------------------------------------------- */
  dom.voiceBtn.addEventListener('click', () => {
    state.voiceCommandsOn = !state.voiceCommandsOn;
    state.voiceReadout = state.voiceCommandsOn;
    dom.voiceReadoutChk.checked = state.voiceCommandsOn;
    dom.voiceBtn.querySelector('span').textContent =
      'Voice Commands: ' + (state.voiceCommandsOn ? 'ON' : 'OFF');
    toast('Voice feedback ' + (state.voiceCommandsOn ? 'enabled' : 'disabled'));
  });

  /* ---------------------------------------------------------------------
     Clock
     ------------------------------------------------------------------- */
  function updateClock() {
    const now = new Date();
    dom.timeDisplay.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  updateClock();
  setInterval(updateClock, 15000);

  /* ---------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------- */
  dom.speedVal.textContent = (state.scanInterval / 1000).toFixed(1) + 's';
  dom.autoscanEnableChk.checked = state.autoScanEnabled;
  dom.speechBanner.classList.add('hidden');
  render();
  restartAutoScan(); // no-op scan schedule until autoScanEnabled is turned on in Settings
})();
