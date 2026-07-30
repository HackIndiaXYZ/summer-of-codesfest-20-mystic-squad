(function () {
  'use strict';

  // State Machine Constants
  const UI_STATE = {
    COLUMN_SCAN: 'COLUMN_SCAN',
    ITEM_ZOOM: 'ITEM_ZOOM'
  };

  const Store = {
    state: {
      uiState: UI_STATE.COLUMN_SCAN,
      colIndex: 0, // 0..3
      itemIndex: 0, // 0..N
      voiceReadout: true,
      deviceCode: 'ECHO-A4F2',
      isEmergency: false,
      theme: 'dark',
      wsConnected: false
    }
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  // WebSocket Connection to ESP32 Hardware Task
  function initWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:81/`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        Store.state.wsConnected = true;
        const connBadge = $('#connection-badge');
        if (connBadge) {
          connBadge.className = 'badge badge--online';
          connBadge.innerHTML = '<span class="online-dot"></span> ESP32 Webserver Online';
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'single_click' || data.type === 'blink') {
            handleSingleButtonPress();
          } else if (data.type === 'double_click' || data.type === 'double_blink') {
            handleDoubleClick();
          } else if (data.type === 'live_click') {
            handleLiveClick(data.count);
          } else if (data.type === 'long_hold') {
            handleSingleButtonLongHold();
          } else if (data.type === 'emergency_sos') {
            triggerEmergency();
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        Store.state.wsConnected = false;
        setTimeout(initWebSocket, 3000);
      };
    } catch (e) {
      console.log('WS offline mode');
    }
  }

  // Sound click feedback
  function playClickSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Web Audio Synth Buzzer for SOS Alarm
  function playEmergencyBuzzer() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error(e);
    }
  }

  // Text-To-Speech Output
  function speak(text) {
    if (!Store.state.voiceReadout) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }
  }

  // Toast announcement
  function showToast(msg, type = 'info') {
    const container = $('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Theme Toggle Management
  function initTheme() {
    const saved = localStorage.getItem('echogaze-firmware-theme') || 'dark';
    Store.state.theme = saved;
    if (saved === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }

  function toggleTheme() {
    const next = Store.state.theme === 'dark' ? 'light' : 'dark';
    Store.state.theme = next;
    localStorage.setItem('echogaze-firmware-theme', next);
    if (next === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    showToast(`Theme set to ${next.toUpperCase()}`, 'info');
  }

  // Settings Modal Controls
  function openSettingsModal() {
    const modal = $('#settings-modal');
    if (modal) {
      $('#speed-slider').value = Store.state.scanSpeed;
      $('#speed-val').textContent = (Store.state.scanSpeed / 1000).toFixed(1) + 's';
      $('#voice-readout-chk').checked = Store.state.voiceReadout;
      modal.classList.remove('hidden');
    }
  }

  function closeSettingsModal() {
    const modal = $('#settings-modal');
    if (modal) modal.classList.add('hidden');
  }

  function saveSettings() {
    const newSpeed = parseInt($('#speed-slider').value);
    const newVoice = $('#voice-readout-chk').checked;

    Store.state.scanSpeed = newSpeed;
    Store.state.voiceReadout = newVoice;
    localStorage.setItem('echogaze-scan-speed', newSpeed);

    showToast('Settings saved successfully', 'success');
    closeSettingsModal();
  }

  // Get total rows in current column
  function getColumnItemsCount(c) {
    const colItems = $(`#col-items-${c}`);
    return colItems ? colItems.children.length : 3;
  }

  // Speak currently highlighted option
  function speakHighlighted() {
    const { uiState, colIndex, itemIndex, isEmergency } = Store.state;
    if (isEmergency) return;

    if (uiState === UI_STATE.COLUMN_SCAN) {
      speak(`Column ${colIndex + 1}`);
    } else {
      const cardEl = $(`#card-${colIndex}-${itemIndex}`);
      if (cardEl) {
        const title = cardEl.querySelector('.card__title').textContent;
        speak(title);
      }
    }
  }

  // Update UI Render
  function render() {
    const { uiState, colIndex, itemIndex } = Store.state;

    // Update Status Bar
    const stateLabel = $('#ui-state-label');
    const statusText = $('#status-text');

    if (stateLabel) {
      stateLabel.textContent = uiState === UI_STATE.COLUMN_SCAN
        ? `COLUMN SCANNING (Col ${colIndex + 1})`
        : `ZOOMED COLUMN ${colIndex + 1} (Item ${itemIndex + 1})`;
    }

    if (statusText) {
      statusText.textContent = uiState === UI_STATE.COLUMN_SCAN
        ? `Column ${colIndex + 1} highlighted - Press 1-Button to Zoom | Tap screen to bypass`
        : `Column ${colIndex + 1} Zoomed: Item ${itemIndex + 1} highlighted - Press 1-Button to Select | Hold to Back`;
    }

    // Update Columns & Cards active classes
    for (let c = 0; c < 4; c++) {
      const colEl = $(`#col-${c}`);
      if (!colEl) continue;

      const isColActive = colIndex === c;
      if (isColActive) {
        colEl.classList.add('col-active');
      } else {
        colEl.classList.remove('col-active');
      }

      const rowCount = getColumnItemsCount(c);
      for (let r = 0; r < rowCount; r++) {
        const cardEl = $(`#card-${c}-${r}`);
        if (!cardEl) continue;

        if (isColActive && uiState === UI_STATE.ITEM_ZOOM && itemIndex === r) {
          cardEl.classList.add('card-active');
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          cardEl.classList.remove('card-active');
        }
      }
    }

    speakHighlighted();
  }

  // 1-BUTTON MAIN INPUT CONTROL: Single press = SELECT / ZOOM
  function handleSingleButtonPress() {
    playClickSound();
    const { uiState, colIndex, itemIndex } = Store.state;

    if (uiState === UI_STATE.COLUMN_SCAN) {
      Store.state.uiState = UI_STATE.ITEM_ZOOM;
      Store.state.itemIndex = 0;
    } else {
      const selectedCard = $(`#card-${colIndex}-${itemIndex}`);
      const title = selectedCard ? selectedCard.querySelector('.card__title').textContent : 'Option';
      const phrase = selectedCard ? selectedCard.querySelector('.card__phrase').textContent : title;

      if (title.toUpperCase().includes('EMERGENCY')) {
        triggerEmergency();
      } else {
        speak(phrase);
        showToast(`Selected: ${title}`, 'success');
      }

      Store.state.uiState = UI_STATE.COLUMN_SCAN;
    }
    render();
  }

  // 2-BUTTON OR DOUBLE CLICK: SKIP / ADVANCE
  function handleDoubleClick() {
    playClickSound();
    const { uiState, colIndex, itemIndex } = Store.state;
    if (uiState === UI_STATE.COLUMN_SCAN) {
      Store.state.colIndex = (colIndex + 1) % 4;
    } else {
      const maxRows = getColumnItemsCount(Store.state.colIndex);
      Store.state.itemIndex = (itemIndex + 1) % maxRows;
    }
    render();
  }

  let bubbleTimeout;
  function handleLiveClick(count) {
    const bubble = $('#live-click-bubble');
    if (bubble) {
      bubble.textContent = count;
      bubble.classList.remove('hidden');
      bubble.classList.add('pop');
      setTimeout(() => bubble.classList.remove('pop'), 200);
      
      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.add('hidden');
      }, 1000);
    }
  }

  // Long press (>800ms) = BACK / UNZOOM
  function handleSingleButtonLongHold() {
    playClickSound();
    if (Store.state.uiState === UI_STATE.ITEM_ZOOM) {
      Store.state.uiState = UI_STATE.COLUMN_SCAN;
      render();
    }
  }

  // TOUCH BYPASS CONTROL: Directly selecting an item on screen
  function handleTouchBypassItem(c, r) {
    playClickSound();
    Store.state.colIndex = c;
    Store.state.itemIndex = r;
    const selectedCard = $(`#card-${c}-${r}`);
    const title = selectedCard ? selectedCard.querySelector('.card__title').textContent : 'Option';
    const phrase = selectedCard ? selectedCard.querySelector('.card__phrase').textContent : title;

    if (title.toUpperCase().includes('EMERGENCY')) {
      triggerEmergency();
    } else {
      speak(phrase);
      showToast(`Selected: ${title}`, 'success');
    }

    Store.state.uiState = UI_STATE.COLUMN_SCAN;
    render();
  }

  // Emergency Trigger
  function triggerEmergency() {
    Store.state.isEmergency = true;
    playEmergencyBuzzer();
    speak('EMERGENCY SOS ACTIVATED. CARETAKER NOTIFIED.');
    showToast('🚨 EMERGENCY ALERT ACTIVATED!', 'error');

    document.body.classList.add('emergency-flash');
    setTimeout(() => document.body.classList.remove('emergency-flash'), 5000);
  }

  // 4-Click Detector
  let clickTimes = [];
  function registerClick() {
    const now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(t => now - t <= 3000);
    if (clickTimes.length >= 4) {
      clickTimes = [];
      triggerEmergency();
    }
  }

  // Clock
  function updateTime() {
    const timeEl = $('#time-display');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  function updateAIContext() {
    const hour = new Date().getHours();
    let timeOfDay = 'Night';
    if (hour >= 6 && hour < 12) timeOfDay = 'Morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'Afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'Evening';
    
    const updates = {
      'card-0-0': { title: `${timeOfDay} Meal 🍲`, phrase: `I need my ${timeOfDay.toLowerCase()} meal` },
      'card-1-2': { title: timeOfDay === 'Night' ? 'Sleep 😴' : 'Rest 🛋️', phrase: `I want to rest for the ${timeOfDay.toLowerCase()}` }
    };

    for (const [id, data] of Object.entries(updates)) {
      const titleEl = $(`#${id} .card__title`);
      const phraseEl = $(`#${id} .card__phrase`);
      if (titleEl) titleEl.textContent = data.title;
      if (phraseEl) phraseEl.textContent = data.phrase;
    }
  }

  // Keypress duration tracker for 1-Button control
  let keyPressStart = 0;

  // DOM Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initWebSocket();
    updateAIContext();
    render();
    setInterval(updateTime, 1000);
    updateTime();

    $('#btn-login')?.addEventListener('click', () => {
      const pin = $('#pin-input').value;
      if (pin === '1234') {
        $('#login-overlay').classList.add('hidden');
        $('#main-ui').classList.remove('hidden');
        showToast('Login successful', 'success');
      } else {
        showToast('Invalid PIN', 'error');
      }
    });

    $('#theme-toggle')?.addEventListener('click', (e) => { e.stopPropagation(); toggleTheme(); });
    $('#settings-btn')?.addEventListener('click', (e) => { e.stopPropagation(); openSettingsModal(); });
    $('#close-settings')?.addEventListener('click', (e) => { e.stopPropagation(); closeSettingsModal(); });
    $('#save-settings')?.addEventListener('click', (e) => { e.stopPropagation(); saveSettings(); });

    $('#speed-slider')?.addEventListener('input', (e) => {
      $('#speed-val').textContent = (parseInt(e.target.value) / 1000).toFixed(1) + 's';
    });

    $('#btn-select')?.addEventListener('click', (e) => { e.stopPropagation(); handleSingleButtonPress(); });
    $('#btn-back')?.addEventListener('click', (e) => { e.stopPropagation(); handleSingleButtonLongHold(); });
    $('#emergency-btn')?.addEventListener('click', (e) => { e.stopPropagation(); triggerEmergency(); });

    // Touch Bypass Event Listeners on Column Cards
    for (let c = 0; c < 4; c++) {
      const rowCount = getColumnItemsCount(c);
      for (let r = 0; r < rowCount; r++) {
        $(`#card-${c}-${r}`)?.addEventListener('click', (e) => {
          e.stopPropagation();
          handleTouchBypassItem(c, r);
        });
      }
    }

    document.addEventListener('click', registerClick);

    document.addEventListener('keydown', (e) => {
      registerClick();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!keyPressStart) keyPressStart = Date.now();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        handleSingleButtonLongHold();
      } else if (e.key >= '1' && e.key <= '4') {
        Store.state.colIndex = parseInt(e.key) - 1;
        Store.state.uiState = UI_STATE.COLUMN_SCAN;
        render();
      } else if (e.key === 'e' || e.key === 'E') {
        triggerEmergency();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (keyPressStart) {
          const duration = Date.now() - keyPressStart;
          keyPressStart = 0;
          if (duration >= 800) {
            handleSingleButtonLongHold();
          } else {
            handleSingleButtonPress();
          }
        }
      }
    });
  });

})();
