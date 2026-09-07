(() => {
  const FAST_PORT = 8081;
  const fastBase = `${location.protocol}//${location.hostname}:${FAST_PORT}`;

  const status = document.getElementById("status");
  let statusTimer = null;

  function showStatus(msg, type) {
    status.textContent = msg;
    status.className = "status " + (type || "");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      status.textContent = "";
      status.className = "status";
    }, 1500);
  }

  function sendKeycode(kc) {
    fetch(`${fastBase}/kc/${kc}`).catch(() => {});
  }

  // Attach click/touch handlers to all buttons with data-kc
  document.querySelectorAll("[data-kc]").forEach((btn) => {
    btn.addEventListener("click", () => sendKeycode(btn.dataset.kc));
    btn.addEventListener("touchstart", () => btn.classList.add("active"), { passive: true });
    btn.addEventListener("touchend", () => btn.classList.remove("active"), { passive: true });
  });

  // Mute state
  const muteBtn = document.getElementById("mute-btn");
  let mutePoller = null;

  function fetchMuteState() {
    fetch(`/cmd/mutestate`).then(r => r.json()).then(data => {
      muteBtn.classList.toggle("muted", data.muted);
    }).catch(() => {});
  }

  function startMutePolling() {
    fetchMuteState();
    mutePoller = setInterval(fetchMuteState, 5000);
  }

  function stopMutePolling() {
    clearInterval(mutePoller);
    mutePoller = null;
  }

  muteBtn.addEventListener("click", () => {
    muteBtn.classList.toggle("muted");
  });

  // Screenshot
  const screenshotBtn = document.getElementById("screenshot-btn");
  const screenshotWrap = document.getElementById("screenshot-wrap");
  const screenshotImg = document.getElementById("screenshot-img");

  const screenshotRefresh = document.getElementById("screenshot-refresh");

  function refreshScreenshot() {
    screenshotImg.src = `/screen.png?t=${Date.now()}`;
    screenshotWrap.hidden = false;
  }

  screenshotBtn.addEventListener("click", () => {
    screenshotBtn.textContent = "Capturing...";
    fetch(`${fastBase}/cmd/screenshot`).then(() => {
      setTimeout(() => {
        refreshScreenshot();
        screenshotBtn.textContent = "Capture";
      }, 1500);
    }).catch(() => {
      screenshotBtn.textContent = "Capture";
    });
  });

  screenshotRefresh.addEventListener("click", refreshScreenshot);

  // Page switcher
  const pages = [
    document.getElementById("page-controls"),
    document.getElementById("page-media"),
    document.getElementById("page-screen"),
  ];
  const tabs = [
    document.getElementById("tab-controls"),
    document.getElementById("tab-media"),
    document.getElementById("tab-screen"),
  ];
  const slider = document.getElementById("toggle-slider");

  function switchPage(idx) {
    pages.forEach((p, i) => { p.hidden = i !== idx; });
    tabs.forEach((t, i) => { t.classList.toggle("active", i === idx); });
    slider.className = "toggle-slider" + (idx > 0 ? ` pos-${idx}` : "");
    if (idx === 1) startMutePolling(); else stopMutePolling();
  }

  tabs.forEach((t, i) => t.addEventListener("click", () => switchPage(i)));

  // Text input — queue characters and send with debounce
  const textInput = document.getElementById("text-input");

  const charToKeycode = {
    a:29,b:30,c:31,d:32,e:33,f:34,g:35,h:36,i:37,j:38,k:39,l:40,m:41,
    n:42,o:43,p:44,q:45,r:46,s:47,t:48,u:49,v:50,w:51,x:52,y:53,z:54,
    "0":7,"1":8,"2":9,"3":10,"4":11,"5":12,"6":13,"7":14,"8":15,"9":16,
    " ":62,",":55,".":56,"-":69,"=":70,"[":71,"]":72,"\\":73,";":74,
    "'":75,"/":76,"@":77,"+":81,"`":68,"*":17,"#":18,
  };

  let sendQueue = [];
  let sending = false;

  async function processQueue() {
    if (sending) return;
    sending = true;
    while (sendQueue.length > 0) {
      const kc = sendQueue.shift();
      sendKeycode(kc);
      // Small delay between keycodes so Android can keep up
      await new Promise(r => setTimeout(r, 100));
    }
    sending = false;
  }

  function queueKeycode(kc) {
    sendQueue.push(kc);
    processQueue();
  }

  textInput.addEventListener("input", (e) => {
    if (e.inputType === "deleteContentBackward") {
      queueKeycode(67);
    } else if (e.inputType === "insertText" && e.data) {
      for (const char of e.data) {
        const ch = char.toLowerCase();
        const kc = charToKeycode[ch];
        if (kc) queueKeycode(kc);
      }
    }
  });

  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendKeycode(66);
      textInput.value = "";
    }
    e.stopPropagation();
  });

  // Keyboard shortcuts for desktop use (only when text input not focused)
  const keyMap = {
    ArrowUp: 19,
    ArrowDown: 20,
    ArrowLeft: 21,
    ArrowRight: 22,
    Enter: 23,
    Backspace: 4,
    Escape: 4,
  };

  document.addEventListener("keydown", (e) => {
    if (document.activeElement === textInput) return;
    const kc = keyMap[e.key];
    if (kc) {
      e.preventDefault();
      sendKeycode(kc);
      const btn = document.querySelector(`[data-kc="${kc}"]`);
      if (btn) {
        btn.classList.add("active");
        setTimeout(() => btn.classList.remove("active"), 150);
      }
    }
  });
})();
