const topLeft     = document.querySelector('.top-left-panel');
const topRight    = document.querySelector('.top-right-panel');
const bottomLeft  = document.querySelector('.bottom-left-panel');
const bottomRight = document.querySelector('.bottom-right-panel');
const statusEl    = document.getElementById('status');
const levelEl     = document.getElementById('level-num');
const startBtn    = document.getElementById('start-btn');

// ── Sound frequencies for each panel ────────────────────────
const sounds = {
    'top-left-panel':     260,   // Green  - low
    'top-right-panel':    440,   // Red    - high
    'bottom-left-panel':  330,   // Yellow - mid
    'bottom-right-panel': 392    // Blue   - mid-high
};

// ── Play beep sound ──────────────────────────────────────────
const playSound = (panel) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const panelClass = panel.className.split(' ').find(c => sounds[c]);
    osc.frequency.value = sounds[panelClass] || 300;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
};

// ── Wrong answer buzz sound ──────────────────────────────────
const playWrongSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 100;
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
};

// ── Pick a random panel ──────────────────────────────────────
const getRandomPanel = () => {
    const panels = [topLeft, topRight, bottomLeft, bottomRight];
    return panels[Math.floor(Math.random() * panels.length)];
};

let sequence        = [];
let sequenceToGuess = [];
let canClick        = false;
let gameStarted     = false;

// ── Flash one panel + play sound ─────────────────────────────
const flash = (panel) => {
    return new Promise((resolve) => {
        playSound(panel);                  // 🔊 Sound plays here
        panel.classList.add('active');
        setTimeout(() => {
            panel.classList.remove('active');
            setTimeout(resolve, 300);
        }, 700);
    });
};

// ── Play sequence ────────────────────────────────────────────
const startFlashing = async () => {
    canClick = false;
    statusEl.textContent = 'Watch the pattern...';
    for (const panel of sequence) {
        await flash(panel);
    }
    canClick = true;
    statusEl.textContent = 'Your turn! Repeat the pattern.';
};

// ── Panel click handler ──────────────────────────────────────
const panelClicked = (clickedPanel) => {
    if (!canClick) return;

    playSound(clickedPanel);               // 🔊 Sound when user clicks

    const expectedPanel = sequenceToGuess.shift();

    if (expectedPanel === clickedPanel) {
        if (sequenceToGuess.length === 0) {
            levelEl.textContent = sequence.length + 1;
            statusEl.textContent = '✅ Correct! Next round...';
            canClick = false;
            setTimeout(() => {
                sequence.push(getRandomPanel());
                sequenceToGuess = [...sequence];
                startFlashing();
            }, 800);
        }
    } else {
        gameOver();
    }
};

// ── Game over ────────────────────────────────────────────────
const gameOver = () => {
    canClick = false;
    gameStarted = false;

    playWrongSound();                      // 🔊 Wrong buzz sound

    document.body.classList.add('game-over');
    setTimeout(() => document.body.classList.remove('game-over'), 600);

    statusEl.textContent = '❌ Wrong! You reached Level ' + sequence.length;
    levelEl.textContent  = '0';
    startBtn.textContent = 'Restart';
    startBtn.style.display = 'inline-block';
};

// ── Start / Restart ──────────────────────────────────────────
const main = async () => {
    if (gameStarted) return;
    gameStarted = true;
    startBtn.style.display = 'none';

    sequence        = [getRandomPanel()];
    sequenceToGuess = [...sequence];
    levelEl.textContent = '1';

    await startFlashing();
};
