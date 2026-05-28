/* ========================================
   KONET POINTS — App Logic
   ======================================== */

(function () {
  'use strict';

  // --- State ---
  let isConnected = false;
  let opsPerSec = 0;
  let totalPoints = 0;
  let sessionUptime = 0;
  let totalOps = 1284021;
  let animFrame = null;

  // --- DOM References ---
  const $ = (sel) => document.querySelector(sel);
  const activeNodesEl = $('#active-nodes-val');
  const throughputEl = $('#throughput-val');
  const totalNodesEl = $('#total-nodes-val');
  const opsValueEl = $('#ops-value');
  const pointsValueEl = $('#points-value');
  const btnConnect = $('#btn-connect');
  const nodeKeyInput = $('#node-key-input');
  const statusBadge = $('#status-badge');
  const activityLog = $('#activity-log');
  const canvas = $('#core-canvas');
  const ctx = canvas.getContext('2d');

  // Nav tabs
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // --- Animate Numbers ---
  function animateValue(el, start, end, duration) {
    const startTime = performance.now();
    const diff = end - start;
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Initial stat animations
  setTimeout(() => animateValue(activeNodesEl, 0, 247, 1200), 200);
  setTimeout(() => animateValue(throughputEl, 0, 18432, 1400), 400);
  setTimeout(() => animateValue(totalNodesEl, 0, 1024, 1000), 600);

  // --- Core Canvas (Rotating Hexagon) ---
  const W = canvas.width;
  const H = canvas.height;
  const CX = W / 2;
  const CY = H / 2;
  let coreAngle = 0;
  let glowIntensity = 0;

  function drawHexagon(cx, cy, r, rotation, strokeColor, lineWidth, glow) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (glow > 0) {
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = glow;
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  function drawCore() {
    ctx.clearRect(0, 0, W, H);
    const time = performance.now() * 0.001;
    glowIntensity = 8 + Math.sin(time * 2) * 6;

    // Outer hex
    drawHexagon(CX, CY, 90, coreAngle, 'rgba(0,229,255,0.15)', 1, 0);
    // Mid hex
    drawHexagon(CX, CY, 65, -coreAngle * 1.3, 'rgba(0,229,255,0.3)', 1.5, glowIntensity * 0.5);
    // Inner hex
    drawHexagon(CX, CY, 40, coreAngle * 2, '#00e5ff', 2, glowIntensity);

    // Center dot
    ctx.beginPath();
    ctx.arc(CX, CY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Connecting lines from center to inner hex vertices
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(coreAngle * 2);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = 40 * Math.cos(angle);
      const y = 40 * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(0,229,255,0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Vertex dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,0.6)';
      ctx.fill();
    }
    ctx.restore();

    // Data orbiting particles
    for (let i = 0; i < 3; i++) {
      const orbitR = 55 + i * 18;
      const speed = (0.5 + i * 0.3) * (i % 2 === 0 ? 1 : -1);
      const px = CX + orbitR * Math.cos(time * speed + i * 2.1);
      const py = CY + orbitR * Math.sin(time * speed + i * 2.1);
      ctx.beginPath();
      ctx.arc(px, py, 2.5 - i * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${0.8 - i * 0.2})`;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    coreAngle += 0.003;
    animFrame = requestAnimationFrame(drawCore);
  }

  drawCore();

  // --- Activity Log ---
  const logMessages = [
    { msg: 'Node connected to network', type: 'success' },
    { msg: 'Job received: compute_hash_0x7a3f', type: 'info' },
    { msg: 'Processing batch #12847...', type: 'info' },
    { msg: 'Job completed successfully', type: 'success' },
    { msg: 'Points credited: +284 KNT', type: 'success' },
    { msg: 'Job deadline exceeded — retry queued', type: 'warning' },
    { msg: 'New job assigned: verify_block_0x9f2a', type: 'info' },
    { msg: 'CPU throttle warning: 89%', type: 'warning' },
    { msg: 'Reward distributed: 0.042 KNT', type: 'success' },
    { msg: 'Node heartbeat OK', type: 'info' },
    { msg: 'Peer sync complete — 247 peers', type: 'success' },
    { msg: 'Job failed: timeout on batch #12849', type: 'error' },
    { msg: 'Reconnecting to relay node...', type: 'warning' },
    { msg: 'Relay connection restored', type: 'success' },
    { msg: 'New epoch started: #4821', type: 'info' },
    { msg: 'Validator stake updated', type: 'info' },
    { msg: 'Memory warning: 2.1GB / 4GB used', type: 'warning' },
    { msg: 'Node stopped by operator', type: 'error' },
  ];

  function getTimestamp() {
    const now = new Date();
    return now.toTimeString().slice(0, 8);
  }

  function addLogEntry(msg, type) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-time">${getTimestamp()}</span><span class="log-msg">${msg}</span>`;
    activityLog.prepend(entry);

    // Keep max 50 entries
    while (activityLog.children.length > 50) {
      activityLog.removeChild(activityLog.lastChild);
    }
  }

  // Initial log entries
  function populateInitialLogs() {
    const initial = [
      { msg: 'System initialized', type: 'info' },
      { msg: 'Loading node configuration...', type: 'info' },
      { msg: 'Connecting to KONET relay...', type: 'info' },
      { msg: 'Relay handshake successful', type: 'success' },
      { msg: 'Node registered on network', type: 'success' },
      { msg: 'Job received: compute_hash_0x7a3f', type: 'info' },
      { msg: 'Points credited: +142 KNT', type: 'success' },
    ];
    initial.forEach((l) => addLogEntry(l.msg, l.type));
  }

  populateInitialLogs();

  // Live log feed
  let logInterval;
  function startLogFeed() {
    logInterval = setInterval(() => {
      const item = logMessages[Math.floor(Math.random() * logMessages.length)];
      addLogEntry(item.msg, item.type);
    }, 3000 + Math.random() * 2000);
  }

  startLogFeed();

  // --- Connect Button ---
  btnConnect.addEventListener('click', () => {
    if (!isConnected) {
      // Connect
      isConnected = true;
      btnConnect.textContent = 'DISCONNECT';
      btnConnect.classList.add('connected-state');
      statusBadge.className = 'status-badge connected';
      statusBadge.querySelector('.status-text').textContent = 'CONNECTED';
      addLogEntry('Node connected — earning points', 'success');

      // Start earning
      startEarning();
    } else {
      // Disconnect
      isConnected = false;
      btnConnect.textContent = 'CONNECT';
      btnConnect.classList.remove('connected-state');
      statusBadge.className = 'status-badge disconnected';
      statusBadge.querySelector('.status-text').textContent = 'DISCONNECTED';
      addLogEntry('Node stopped by operator', 'error');

      opsPerSec = 0;
      opsValueEl.textContent = '0';
    }
  });

  // --- Earning Simulation ---
  let earnInterval;
  function startEarning() {
    clearInterval(earnInterval);
    opsPerSec = 0;

    // Ramp up ops
    let rampStep = 0;
    const rampTarget = 1200 + Math.floor(Math.random() * 2000);

    earnInterval = setInterval(() => {
      if (!isConnected) {
        clearInterval(earnInterval);
        return;
      }

      // Ramp up
      if (opsPerSec < rampTarget) {
        opsPerSec = Math.min(opsPerSec + Math.floor(rampTarget / 20), rampTarget);
      }

      // Fluctuate
      opsPerSec = Math.max(100, opsPerSec + Math.floor((Math.random() - 0.5) * 200));

      // Earn points
      const earned = Math.floor(opsPerSec * 0.01);
      totalPoints += earned;

      opsValueEl.textContent = opsPerSec.toLocaleString();
      pointsValueEl.textContent = totalPoints.toLocaleString();

      // Update job info
      $('#job-ops').textContent = opsPerSec.toLocaleString();
      const pts = '+' + earned;
      $('#job-points').textContent = pts;

      // Update system info
      const cpu = 20 + Math.floor(Math.random() * 50);
      $('#sys-cpu').textContent = cpu + '%';
      const ram = (1.5 + Math.random() * 2).toFixed(1);
      $('#sys-ram').textContent = ram + ' GB';
      const netUp = Math.floor(5 + Math.random() * 20);
      const netDown = Math.floor(20 + Math.random() * 60);
      $('#sys-net').textContent = `↑${netUp} ↓${netDown} MB/s`;

      // Update session
      sessionUptime++;
      const h = String(Math.floor(sessionUptime / 3600)).padStart(2, '0');
      const m = String(Math.floor((sessionUptime % 3600) / 60)).padStart(2, '0');
      const s = String(sessionUptime % 60).padStart(2, '0');
      $('#sess-uptime').textContent = `${h}:${m}:${s}`;
      totalOps += opsPerSec;
      $('#sess-ops').textContent = totalOps.toLocaleString();

      // Update throughput stat
      const tp = 15000 + Math.floor(Math.random() * 5000);
      throughputEl.textContent = tp.toLocaleString();

      // Fluctuate active nodes
      const an = 240 + Math.floor(Math.random() * 20);
      activeNodesEl.textContent = an.toLocaleString();

      // Random job id
      if (Math.random() < 0.1) {
        const hex = Math.random().toString(16).slice(2, 6);
        const hex2 = Math.random().toString(16).slice(2, 6);
        $('#job-id').textContent = `0x${hex}...${hex2}`;
        const deadline = (5 + Math.random() * 20).toFixed(1);
        $('#job-deadline').textContent = deadline + 's';
        const succNum = 100 + Math.floor(Math.random() * 100);
        const failNum = Math.floor(Math.random() * 10);
        $('#job-success').textContent = succNum.toString();
        $('#job-fail').textContent = failNum.toString();
        const reward = (0.01 + Math.random() * 0.08).toFixed(3);
        $('#job-reward').textContent = reward + ' KNT';
        const txHex1 = Math.random().toString(16).slice(2, 6);
        const txHex2 = Math.random().toString(16).slice(2, 6);
        $('#job-tx').textContent = `0x${txHex1}...${txHex2}`;
      }
    }, 1000);
  }

  // --- Floating Particles ---
  const particlesContainer = $('#core-particles');
  function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    const coreRect = document.querySelector('.core-container').getBoundingClientRect();
    const containerRect = document.querySelector('.core-section').getBoundingClientRect();
    const cx = coreRect.left - containerRect.left + coreRect.width / 2;
    const cy = coreRect.top - containerRect.top + coreRect.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    p.style.left = (cx + Math.cos(angle) * dist) + 'px';
    p.style.top = (cy + Math.sin(angle) * dist) + 'px';
    p.style.animationDuration = (3 + Math.random() * 3) + 's';
    p.style.animationDelay = Math.random() * 2 + 's';
    particlesContainer.appendChild(p);

    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 6000);
  }

  setInterval(spawnParticle, 800);

  // --- Keyboard shortcut: Enter to connect ---
  nodeKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnConnect.click();
  });
})();
