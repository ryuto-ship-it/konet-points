/* ========================================
   KONET POINTS — Institutional Logic
   ======================================== */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  // --- State ---
  let isRunning = false;
  let earnings = 14291.50000;
  let currentOps = 0;
  let animFrame = null;

  // --- Elements ---
  const btnPower = $('#btn-power');
  const connSteps = $('#conn-steps');
  const steps = [$('#step-1'), $('#step-2'), $('#step-3')];
  
  const statusDot = $('#status-dot');
  const statusText = $('#status-text');
  
  const earnAmount = $('#earn-amount');
  const earnRate = $('#earn-rate');
  const liveBadge = $('.live-badge');
  const miningAnim = $('#mining-anim');
  const hashBlocks = $('#hash-blocks');
  
  const metCpu = $('#met-cpu'), barCpu = $('#bar-cpu');
  const metRam = $('#met-ram'), barRam = $('#bar-ram');
  const metNet = $('#met-net'), barNet = $('#bar-net');
  
  const txTbody = $('#tx-tbody');
  const txCountEl = $('#tx-count');
  
  const termOut = $('#terminal-out');
  const chartCurrentOps = $('#chart-current-ops');

  // --- Utility ---
  const getTs = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`;
  };

  const termLog = (msg, type = 'info') => {
    const div = document.createElement('div');
    div.className = `t-line ${type}`;
    div.innerHTML = `<span class="ts">[${getTs()}]</span> ${msg}`;
    termOut.appendChild(div);
    if (termOut.children.length > 100) termOut.removeChild(termOut.firstChild);
    termOut.scrollTop = termOut.scrollHeight;
  };

  // Build hash blocks for animation
  for (let i = 0; i < 20; i++) {
    const b = document.createElement('div');
    b.className = 'h-block';
    hashBlocks.appendChild(b);
  }

  // --- Connection Sequence ---
  btnPower.addEventListener('click', () => {
    if (isRunning) return stopNode();
    startConnection();
  });

  function startConnection() {
    btnPower.disabled = true;
    btnPower.querySelector('.btn-text').textContent = 'INITIALIZING...';
    connSteps.style.display = 'flex';
    termLog('Initiating handshake with relay nodes...', 'info');

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx > 0) {
        steps[stepIdx - 1].classList.remove('active');
        steps[stepIdx - 1].classList.add('done');
      }
      if (stepIdx < 3) {
        steps[stepIdx].classList.add('active');
        termLog(steps[stepIdx].textContent.trim(), 'info');
      } else {
        clearInterval(interval);
        startNode();
      }
      stepIdx++;
    }, 800);
  }

  function startNode() {
    isRunning = true;
    btnPower.disabled = false;
    btnPower.classList.add('active');
    btnPower.querySelector('.btn-text').textContent = 'HALT NODE';
    
    statusDot.className = 'pulse-dot green';
    statusText.textContent = 'ONLINE & SYNCED';
    statusText.style.color = 'var(--primary-green)';
    
    liveBadge.style.display = 'block';
    miningAnim.classList.add('active');
    
    termLog('Node successfully synchronized.', 'success');
    termLog('Begin processing transaction batches.', 'success');
    
    lastTime = performance.now();
    animFrame = requestAnimationFrame(loop);
  }

  function stopNode() {
    isRunning = false;
    cancelAnimationFrame(animFrame);
    
    btnPower.classList.remove('active');
    btnPower.querySelector('.btn-text').textContent = 'INITIALIZE NODE';
    
    statusDot.className = 'pulse-dot red';
    statusText.textContent = 'OFFLINE';
    statusText.style.color = '';
    
    connSteps.style.display = 'none';
    steps.forEach(s => { s.className = 'step pending'; });
    
    liveBadge.style.display = 'none';
    miningAnim.classList.remove('active');
    
    currentOps = 0;
    chartCurrentOps.textContent = '0';
    earnRate.textContent = '+ 0.00000 KNT/sec';
    
    termLog('Node halted by operator.', 'err');
    
    // Reset metrics
    updateMetrics(0, 0, 0);
  }

  // --- Live Earnings & Simulation Loop ---
  let lastTime = 0;
  let tickAccumulator = 0;

  function loop(time) {
    if (!isRunning) return;
    const dt = time - lastTime;
    lastTime = time;

    // Simulate OPS mapping to earning rate
    currentOps = Math.floor(25000 + Math.random() * 8000 + Math.sin(time/1000) * 5000);
    chartCurrentOps.textContent = currentOps.toLocaleString();
    
    const ratePerSec = currentOps * 0.0000015; // KNT per second
    const earnedThisFrame = ratePerSec * (dt / 1000);
    
    earnings += earnedThisFrame;
    
    earnAmount.textContent = earnings.toFixed(5);
    earnRate.textContent = `+ ${ratePerSec.toFixed(5)} KNT/sec`;

    // Flash amount occasionally
    if (Math.random() < 0.05) {
      earnAmount.classList.add('flash');
      setTimeout(() => earnAmount.classList.remove('flash'), 50);
    }

    // Animate hash blocks
    if (Math.random() < 0.3) {
      const children = hashBlocks.children;
      const idx = Math.floor(Math.random() * children.length);
      children[idx].classList.add('active');
      setTimeout(() => children[idx].classList.remove('active'), 100);
    }

    // Metrics update (smooth noise)
    const cpu = Math.floor(45 + Math.random() * 30 + Math.sin(time/500)*10);
    const ram = (8.4 + Math.random() * 1.5).toFixed(1);
    const net = Math.floor(120 + Math.random() * 80);
    updateMetrics(cpu, ram, net);

    // TX Generation
    tickAccumulator += dt;
    if (tickAccumulator > (1000 / (15 + Math.random()*10))) { // ~20 TX per sec
      generateTx();
      tickAccumulator = 0;
    }

    animFrame = requestAnimationFrame(loop);
  }

  function updateMetrics(cpu, ram, net) {
    metCpu.textContent = `${cpu}%`;
    barCpu.style.width = `${cpu}%`;
    barCpu.className = `fill ${cpu > 80 ? 'crit' : cpu > 60 ? 'high' : ''}`;
    
    metRam.textContent = `${ram} GB`;
    const rPct = (parseFloat(ram) / 16) * 100;
    barRam.style.width = `${rPct}%`;
    
    metNet.textContent = `${net} MB/s`;
    const nPct = Math.min((net / 300) * 100, 100);
    barNet.style.width = `${nPct}%`;
  }

  // --- TX Feed ---
  const txTypes = ['EXECUTE', 'VERIFY', 'SYNC', 'COMMIT'];
  let totalTxs = 0;
  
  setInterval(() => {
    if (isRunning) txCountEl.textContent = `${Math.floor(15 + Math.random()*15)} TX/s`;
    else txCountEl.textContent = '0 TX/s';
  }, 1000);

  function generateTx() {
    const hash = '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const type = txTypes[Math.floor(Math.random() * txTypes.length)];
    const timeMs = (2 + Math.random() * 14).toFixed(1);
    const reward = (Math.random() * 0.005).toFixed(5);

    const tr = document.createElement('tr');
    tr.className = 'tx-row';
    tr.innerHTML = `
      <td class="tx-hash">${hash}..</td>
      <td class="tx-type">${type}</td>
      <td class="tx-time">${timeMs}</td>
      <td class="tx-reward">+${reward}</td>
    `;
    
    txTbody.prepend(tr);
    if (txTbody.children.length > 15) txTbody.removeChild(txTbody.lastChild);

    // Occasional terminal log for major events
    if (Math.random() < 0.02) {
      termLog(`Batch processed. Merkle root verified. TXs: ${Math.floor(Math.random()*500+100)}`, 'dim');
    }
    if (Math.random() < 0.005) {
      termLog(`Proof submitted to consensus layer. Target reached.`, 'success');
    }
  }

  // --- Real-time Chart using Canvas ---
  const canvas = $('#ops-chart');
  const ctx = canvas.getContext('2d');
  
  function resizeChart() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
  window.addEventListener('resize', resizeChart);
  resizeChart();

  const chartData = new Array(100).fill(0);
  
  function drawChart() {
    requestAnimationFrame(drawChart);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<4; i++) {
      const y = (canvas.height/4) * i;
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    if (!isRunning) {
      chartData.shift();
      chartData.push(0);
    } else {
      chartData.shift();
      // Normalize currentOps (0-40000) to 0-1
      const normalized = currentOps / 40000;
      chartData.push(normalized);
    }

    const w = canvas.width / (chartData.length - 1);
    const h = canvas.height;

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < chartData.length; i++) {
      ctx.lineTo(i * w, h - (chartData[i] * h * 0.8));
    }
    ctx.lineTo(canvas.width, h);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    for (let i = 0; i < chartData.length; i++) {
      const x = i * w;
      const y = h - (chartData[i] * h * 0.8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(0, 229, 255, 1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  drawChart();

})();
