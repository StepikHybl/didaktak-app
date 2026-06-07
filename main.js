import './style.css';
import confetti from 'https://unpkg.com/canvas-confetti?module';

// Lazy-loaded quiz data container. Modules are imported on demand to keep
// the initial bundle small (important for Pages / mobile load times).
let quizData = [];
const loadedSubjects = new Set();

async function ensureDataLoadedForSubject(subject) {
    if (subject.includes('Český') && !loadedSubjects.has('cz')) {
        const [pravopis, lexikologie, syntax, porozumeni, stylistika, literatura] = await Promise.all([
            import('./data_cj/data_cj_pravopis.js'),
            import('./data_cj/data_cj_lexikologie.js'),
            import('./data_cj/data_cj_syntax.js'),
            import('./data_cj/data_cj_porozumeni.js'),
            import('./data_cj/data_cj_stylistika.js'),
            import('./data_cj/data_cj_literatura.js')
        ]);
        quizData = [
            ...quizData,
            ...pravopis.quizDataCJPravopis,
            ...lexikologie.quizDataCJLexikologie,
            ...syntax.quizDataCJSyntax,
            ...porozumeni.quizDataCJPorozumeni,
            ...stylistika.quizDataCJStylistika,
            ...literatura.quizDataCJLiteratura
        ];
        loadedSubjects.add('cz');
    }
    if (subject.includes('Anglický') && !loadedSubjects.has('en')) {
        const en = await import('./data_en.js');
        quizData = [ ...quizData, ...en.quizDataEN ];
        loadedSubjects.add('en');
    }
}

// --- STATE MANAGEMENT S PENĚŽENKOU A ZÁCHRANNOU SÍTÍ ---
localStorage.removeItem('eco_academy_state');
let savedState = {};
try {
    savedState = JSON.parse(localStorage.getItem('eco_academy_state')) || {};
} catch (e) {
    savedState = {};
}

let state = {
    xp: 0,
    streak: 0,
    lastLogin: Date.now(),
    unlocked: savedState.unlocked || { 'Český jazyk': ['Pravopis'], 'Anglický jazyk': ['Grammar'] },
    history: {},
    coins: 0,
    tulipGrowthStage: 0
};

function saveState() {
    try {
        localStorage.setItem('eco_academy_state', JSON.stringify(state));
    } catch (e) {
        console.warn('Cannot persist state:', e);
    }
}

const subjectModules = {
    'Český jazyk': ['Pravopis', 'Lexikologie', 'Syntax', 'Porozumění textu', 'Stylistika', 'Literatura'],
    'Anglický jazyk': ['Grammar', 'Vocabulary', 'Idioms', 'Porozumění textu']
};

let activeSubject = ''; let activeTier = '';
let currentQuiz = []; let quizIndex = 0; let quizScore = 0;

// --- AUDIO SYSTÉM ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx; let soundsOn = true;

function playTone(freq, type, dur, vol = 0.05) {
    if (!soundsOn) return;
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

const toggleBtn = document.getElementById('audio-toggle');
if (toggleBtn) toggleBtn.onclick = function() {
    soundsOn = !soundsOn;
    this.classList.toggle('active', soundsOn);
    this.innerHTML = soundsOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    playTone(500, 'sine', 0.1);
};

// Theme toggle (light / pastel 'holcici' theme)
const themeToggle = document.getElementById('theme-toggle');
function applySavedTheme() {
    const saved = localStorage.getItem('eco_theme') || 'dark';
    if (saved === 'light') document.body.classList.add('light-theme');
    if (themeToggle) themeToggle.innerHTML = saved === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}
applySavedTheme();
if (themeToggle) themeToggle.onclick = function() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('eco_theme', isLight ? 'light' : 'dark');
    this.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
};

// --- EFEKT POZADÍ (POUZE PRO DESKTOPY) ---
const blobs = document.querySelectorAll('.bg-blob');
document.addEventListener('mousemove', (e) => {
    blobs.forEach((blob, index) => {
        const factor = (index + 1) * 20;
        const x = (e.clientX - window.innerWidth / 2) / factor;
        const y = (e.clientY - window.innerHeight / 2) / factor;
        blob.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// --- VÝRAZNĚJŠÍ OSLAVA PRO PERFEKTNÍ SKÓRE ---
function perfectScoreCelebration() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        colors: ['#ff6596', '#b53cd4', '#3ee679', '#ff7da1', '#f472b6']
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

// --- UKAZATEL RŮSTU TULIPÁNU & FUNKCE OBCHODU ---
const tulipStages = [
    { name: "Květináč", cost: 0, id: "t-pot" },
    { name: "Stonek", cost: 20, id: "t-stem" },
    { name: "Listy", cost: 40, id: "t-leaves" },
    { name: "Poupě", cost: 80, id: "t-bud" },
    { name: "Plný Květ", cost: 130, id: "t-bloom" }
];

function updateTulipVisualization() {
    const stage = state.tulipGrowthStage;
    for(let i = 0; i <= 4; i++) {
        const part = document.getElementById(tulipStages[i].id);
        if(!part) continue;
        const visible = i <= stage;
        // stagger appearance using CSS variable --delay
        part.style.setProperty('--delay', `${i * 110}ms`);
        if (visible) {
            part.classList.add('visible');
        } else {
            part.classList.remove('visible');
        }
    }

    const btnBuy = document.getElementById('btn-buy-tulip');
    const nextName = document.getElementById('next-upgrade-name');

    if(stage >= 4) {
        if(btnBuy) {
            btnBuy.innerHTML = "Tulipán je hotový! 🌸";
            btnBuy.disabled = true;
        }
        if(nextName) nextName.innerText = "Nádherná práce!";
    } else {
        const nextStage = tulipStages[stage + 1];
        if(btnBuy) {
            btnBuy.innerHTML = `Koupit (${nextStage.cost} <i class="fas fa-leaf"></i>)`;
            btnBuy.disabled = state.coins < nextStage.cost;
        }
        if(nextName) nextName.innerText = nextStage.name;
    }

    const btnReset = document.getElementById('btn-reset-tulip');
    if (btnReset) {
        btnReset.disabled = stage <= 0;
    }
}

let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast-message');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('toast-visible'), 2600);
}

// Reset tulip: refund spent coins and reset visual stage (always full refund)
const btnResetTulip = document.getElementById('btn-reset-tulip');
if (btnResetTulip) {
    btnResetTulip.onclick = () => {
        if (state.tulipGrowthStage <= 0) return;
        // Sum costs of stages already purchased (exclude stage 0)
        const spent = tulipStages.slice(1, state.tulipGrowthStage + 1).reduce((s, p) => s + (p.cost || 0), 0);
        const refund = spent;
        state.coins = (state.coins || 0) + refund;
        state.tulipGrowthStage = 0;
        saveState();
        // visual feedback
        try { confetti({ particleCount: 30, spread: 60, colors: ['#ffd7e4', '#ff7da1'] }); } catch(e) {}
        playTone(480, 'triangle', 0.12);
        updateTulipVisualization();
        updateHUD();
        showToast(`Tulipán resetován. Zpět ${refund} lístků.`);
    };
}

// --- INTERAKTIVNÍ DRAG & DROP NAVIGACE ---

const btnBuyTulip = document.getElementById('btn-buy-tulip');
if(btnBuyTulip) {
    btnBuyTulip.onclick = () => {
        if(state.tulipGrowthStage >= 4) return;
        const nextStage = tulipStages[state.tulipGrowthStage + 1];

        if(state.coins >= nextStage.cost) {
            state.coins -= nextStage.cost;
            state.tulipGrowthStage++;
            saveState();

            // small melodic cue for stage advance
            playTone(600, 'sine', 0.08);
            setTimeout(() => playStageSound(state.tulipGrowthStage), 80);
            confetti({ particleCount: 30, spread: 40, origin: { x: 0.8, y: 0.6 }, colors: ['#f472b6', '#a855f7'] });

            updateTulipVisualization();
            updateHUD();
        } else {
            playTone(200, 'square', 0.2, 0.05);
            alert("Nemáš dost lístků! Udělej si další kvíz.");
        }
    }
}

// Play a small audio cue for each growth stage
function playStageSound(stage) {
    // mapping: 1 - stem, 2 - leaves, 3 - bud, 4 - bloom
    const map = {
        1: { freq: 480, type: 'sine' },
        2: { freq: 620, type: 'triangle' },
        3: { freq: 780, type: 'sine' },
        4: { freq: 980, type: 'sine' }
    };
    const s = map[stage];
    if (s) playTone(s.freq, s.type, 0.15, 0.06);
}

// --- INTERAKTIVNÍ DRAG & DROP NAVIGACE ---
const cassettes = document.querySelectorAll('.draggable');
const dropZone = document.getElementById('main-drop-zone');
const term = document.getElementById('terminal-text');

cassettes.forEach(c => {
    c.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', c.dataset.subject);
        playTone(300, 'sine', 0.1);
        if (term) term.innerText = `Sázím ${c.dataset.subject}...`;
    };
});

if (dropZone) {
    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('active'); };
    dropZone.ondragleave = () => dropZone.classList.remove('active');
    dropZone.ondrop = async (e) => {
        e.preventDefault(); dropZone.classList.remove('active');
        const subject = e.dataTransfer.getData('text/plain');
        if (subject) await bootSubject(subject);
    };
}

async function bootSubject(subject) {
    activeSubject = subject;
    playTone(600, 'sine', 0.2); setTimeout(() => playTone(800, 'sine', 0.2), 100);
    if (term) term.innerText = `[OK] ${subject} zasazen. Vyber sektor péče...`;

    // Ensure required data modules are loaded for the chosen subject
    await ensureDataLoadedForSubject(subject);

    setTimeout(() => { 
        const nameEl = document.getElementById('active-subject-name');
        if (nameEl) nameEl.innerText = subject; 
        renderTiers(); 
        showScreen('menu-screen'); 
    }, 600);
}

const btnBackSubj = document.getElementById('btn-back-to-subjects');
if (btnBackSubj) btnBackSubj.onclick = () => {
    playTone(400, 'sine', 0.1);
    showScreen('subject-screen');
    if (term) term.innerText = "Chytrý záhon je připraven k setbě...";
};

// AKTUALIZOVÁNO: Vlastní tlačítko zpět, které ukončí kvíz a vrátí uživatele do menu podkategorií
const btnBackFromQuiz = document.getElementById('btn-back-from-quiz');
if (btnBackFromQuiz) {
    btnBackFromQuiz.onclick = () => {
        playTone(400, 'sine', 0.1);
        currentQuiz = [];
        quizIndex = 0;
        quizScore = 0;
        renderTiers(); 
        showScreen('menu-screen');
    };
}

// --- DYNAMICKÉ VYVTVOŘENÍ PODKATEGORIÍ (TIERS) ---
function renderTiers() {
    const list = document.getElementById('tier-list');
    if (!list) return;
    list.innerHTML = '';
    const mods = subjectModules[activeSubject] || [];
    mods.forEach(mod => {
        const isLocked = !state.unlocked[activeSubject].includes(mod);
        const btn = document.createElement('div');
        btn.className = `tier-card eco-card ${isLocked ? 'locked' : ''}`;
        btn.innerHTML = `<h3>${mod}</h3><p>${isLocked ? 'ZAMČENO' : 'READY'}</p>`;
        if (!isLocked) btn.onclick = () => { playTone(400, 'sine', 0.1); startQuiz(mod); };
        list.appendChild(btn);
    });
}

// Register a simple service worker for offline caching (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('./sw.js', import.meta.url)).catch(() => {});
}

// --- ALGORITMUS KVÍZU (CHYTRÝ ALGORITMUS SE SPACED REPETITION) ---
function fisherYates(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz(tier) {
    activeTier = tier;
    let pool = quizData.filter(q => q.predmet === activeSubject && q.typ === tier);
    
    // Inteligentní řazení: Upřednostňuje dříve chybované a málo zobrazené otázky
    pool.sort((a, b) => {
        const hA = state.history[a.id] || { seen: 0, mistakes: 0 };
        const hB = state.history[b.id] || { seen: 0, mistakes: 0 };
        return ((hB.mistakes * 10) - hB.seen) - ((hA.mistakes * 10) - hA.seen) + (Math.random() - 0.5);
    });
    currentQuiz = fisherYates(pool.slice(0, 10));
    
    if (!currentQuiz || currentQuiz.length === 0) return alert("Chyba: Nebyly nalezeny žádné otázky.");
    
    currentQuiz.forEach(q => { q.shuffledOptions = fisherYates(q.moznosti.map((text, index) => ({ text, isCorrect: index === q.spravna_odpoved }))); });
    quizIndex = 0; quizScore = 0;
    
    showScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuiz[quizIndex];
    if (!q) return; 
    
    if (!state.history[q.id]) state.history[q.id] = { seen: 0, mistakes: 0 };
    state.history[q.id].seen++;
    updateHUD();

    document.getElementById('feedback-box').style.display = 'none';
    document.getElementById('q-counter').innerText = `Otázka ${quizIndex + 1} / ${currentQuiz.length}`;
    document.getElementById('q-progress-fill').style.width = `${(quizIndex / currentQuiz.length) * 100}%`;
    document.getElementById('q-type').innerText = q.typ.toUpperCase();
    
    const vt = document.getElementById('vychozi-text');
    if (vt) {
        if (q.vychozi_text) { vt.innerText = q.vychozi_text; vt.style.display = 'block'; } 
        else vt.style.display = 'none';
    }
    
    const qt = document.getElementById('q-text');
    if (qt) qt.innerText = q.zadani;

    const options = document.getElementById('options-grid');
    if (options) {
        options.innerHTML = '';
        q.shuffledOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt.text.replace(/^[A-D]\)\s*/, '');
            btn.onclick = () => checkAnswer(btn, opt.isCorrect, q.vysvetleni);
            options.appendChild(btn);
        });
    }
}

function checkAnswer(btn, isCorrect, explanation) {
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);
    
    const btnNext = document.getElementById('btn-next');
    if(btnNext) btnNext.style.display = 'inline-flex';

    if (isCorrect) {
        quizScore += 1;
        btn.classList.add('correct');
        playTone(523.25, 'sine', 0.1); setTimeout(() => playTone(659.25, 'sine', 0.2), 100);
        document.getElementById('feedback-title').innerHTML = `<span style="color:var(--eco-green)">VÝBORNĚ!</span>`;
        if (state.history[currentQuiz[quizIndex].id].mistakes > 0) state.history[currentQuiz[quizIndex].id].mistakes--;
    } else {
        btn.classList.add('wrong');
        playTone(200, 'square', 0.2, 0.05); 
        state.history[currentQuiz[quizIndex].id].mistakes++;
        btns.forEach((b, i) => { if (currentQuiz[quizIndex].shuffledOptions[i].isCorrect) b.classList.add('correct'); });
        document.getElementById('feedback-title').innerHTML = `<span style="color:var(--error-red)">CHYBA</span>`;
    }

    document.getElementById('feedback-text').innerText = explanation;
    document.getElementById('feedback-box').style.display = 'block';
    
    if (btnNext) {
        if (quizIndex === currentQuiz.length - 1) btnNext.innerText = "ZOBRAZIT SKLIZEŇ";
        else btnNext.innerHTML = "DALŠÍ OTÁZKA <i class='fas fa-arrow-right'></i>";
    }
}

const btnNext = document.getElementById('btn-next');
if(btnNext) btnNext.onclick = () => {
    playTone(400, 'sine', 0.1);
    quizIndex++;
    if (quizIndex < currentQuiz.length) loadQuestion();
    else finishQuiz();
};

function finishQuiz() {
    showScreen('result-screen');
    const finalPercent = Math.round((quizScore / currentQuiz.length) * 100);
    const xpGained = Math.round(quizScore * 100);
    
    document.getElementById('res-percent').innerText = `${finalPercent}%`;
    document.getElementById('res-xp').innerText = quizScore; 
    
    if (finalPercent >= 80) {
        document.getElementById('res-msg').innerText = "Úspěšná sklizeň!";
        document.getElementById('res-msg').style.color = "var(--eco-green)";
        playTone(600, 'sine', 0.1); setTimeout(() => playTone(800, 'sine', 0.2), 100); // Základní zvuk úspěchu
        
        if (finalPercent === 100) {
            setTimeout(() => playTone(1050, 'sine', 0.3), 250); // Třetí, vyšší tón pro 100%
            perfectScoreCelebration(); // Větší konfety
        }
        
        const mods = subjectModules[activeSubject];
        const cIdx = mods.indexOf(activeTier);
        if (cIdx < mods.length - 1 && !state.unlocked[activeSubject].includes(mods[cIdx + 1])) {
            const newModule = mods[cIdx + 1];
            state.unlocked[activeSubject].push(newModule);
            document.getElementById('res-subtext').innerText = `Odemčen nový modul: ${newModule}`;
            playTone(700, 'triangle', 0.1); setTimeout(() => playTone(900, 'triangle', 0.15), 120);
            showToast(`🔓 Odemčeno: ${newModule}`);
        } else document.getElementById('res-subtext').innerText = "Skvělá práce.";
    } else {
        document.getElementById('res-msg').innerText = "Chce to praxi";
        document.getElementById('res-msg').style.color = "var(--error-red)";
        document.getElementById('res-subtext').innerText = "Pro postup potřebujete min. 80%.";
        playTone(200, 'square', 0.3, 0.05);
    }
    
    state.xp += xpGained;
    state.coins += quizScore; // Za každou správnou odpověď se přičte přesně jeden lístek k útratě
    
    updateHUD();
    updateTulipVisualization();
}

const btnFinish = document.getElementById('btn-finish-quiz');
if(btnFinish) btnFinish.onclick = () => {
    playTone(400, 'sine', 0.1);
    renderTiers(); 
    showScreen('menu-screen'); 
};

// --- FUNKCE PŘEPÍNÁNÍ OBRAZOVEK S AUTOMATICKÝM CENTROVÁNÍM LAYOUTU ---
function showScreen(id) {
    const screens = document.querySelectorAll('.screen');
    const activeScreen = Array.from(screens).find(s => s.style.display === 'block');
    const garden = document.getElementById('garden-aside');

    if (activeScreen && activeScreen.id !== id) {
        activeScreen.classList.remove('screen-fade-in');
        activeScreen.classList.add('screen-fade-out');
        
        // Schovat zahradu s animací, pokud jdeme do kvízu nebo výsledků
        const hideGarden = (id !== 'subject-screen' && id !== 'menu-screen');
        if (hideGarden && garden && garden.style.display !== 'none') {
            garden.classList.remove('screen-fade-in');
            garden.classList.add('screen-fade-out');
        }

        setTimeout(() => {
            activeScreen.classList.remove('screen-fade-out');
            if (garden) garden.classList.remove('screen-fade-out');
            switchScreenDisplay(id, screens, garden);
        }, 200); // Čas na dokončení fade-out animace
    } else {
        switchScreenDisplay(id, screens, garden);
    }
}

function switchScreenDisplay(id, screens, garden) {
    screens.forEach(s => {
        s.style.display = 'none';
        s.classList.remove('screen-fade-in');
    });
    
    const screen = document.getElementById(id);
    if (screen) {
        screen.style.display = 'block';
        void screen.offsetWidth; // Vynucení reflow pro restart animace
        screen.classList.add('screen-fade-in');
    }

    // Inteligentní skrývání zahrady
    if (garden) {
        if (id === 'subject-screen' || id === 'menu-screen') {
            if (garden.style.display === 'none' || garden.style.display === '') {
                garden.style.display = 'flex';
                void garden.offsetWidth;
                garden.classList.add('screen-fade-in');
            }
        } else {
            garden.style.display = 'none';
            garden.classList.remove('screen-fade-in');
        }
    }
}

// --- VÝPOČTY STATISTIK HUDU ---
function getLevelInfo(xp) {
    let currentLevel = 1; let requiredXP = 1000; let totalNeeded = requiredXP; let pastNeeded = 0;
    while (xp >= totalNeeded) { currentLevel++; pastNeeded = totalNeeded; requiredXP += 500; totalNeeded += requiredXP; }
    let rank = "Učeň";
    if (currentLevel >= 3) rank = "Zahradník";
    if (currentLevel >= 6) rank = "Eko Farmář";
    if (currentLevel >= 10) rank = "Mistr";
    return { level: currentLevel, xpInLevel: xp - pastNeeded, xpNeeded: requiredXP, rank };
}

function checkStreak() {
    const now = Date.now();
    const daysDiff = Math.floor((now - state.lastLogin) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) state.streak += 1;
    else if (daysDiff > 1) state.streak = 0;
    state.lastLogin = now;
}

function updateHUD() {
    checkStreak();
    const info = getLevelInfo(state.xp);
    
    const hudLvl = document.getElementById('hud-level');
    if(hudLvl) hudLvl.innerText = info.level;
    
    const hudRank = document.getElementById('hud-rank');
    if(hudRank) hudRank.innerText = info.rank;
    
    const hudXpTxt = document.getElementById('hud-xp-text');
    if(hudXpTxt) hudXpTxt.innerText = `${info.xpInLevel} / ${info.xpNeeded} XP`;
    
    const hudXpFill = document.getElementById('hud-xp-fill');
    if(hudXpFill) hudXpFill.style.width = `${(info.xpInLevel / info.xpNeeded) * 100}%`;
    
    const hudStreak = document.getElementById('hud-streak');
    if(hudStreak) hudStreak.innerText = state.streak;
    
    const hudCoins = document.getElementById('hud-coins');
    if(hudCoins) hudCoins.innerText = state.coins;
    
    saveState();
}

// --- INICIALIZACE A SPUŠTĚNÍ ---
updateHUD();
updateTulipVisualization();
showScreen('subject-screen');