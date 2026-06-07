import './style.css';
import confetti from 'canvas-confetti';

// --- IMPORTY Z NOVÉ DECENTRÁLNÍ SLOŽKY data_cj ---
import { quizDataCJPravopis } from './data_cj/data_cj_pravopis.js';
import { quizDataCJLexikologie } from './data_cj/data_cj_lexikologie.js';
import { quizDataCJSyntax } from './data_cj/data_cj_syntax.js';
import { quizDataCJPorozumeni } from './data_cj/data_cj_porozumeni.js';
import { quizDataCJStylistika } from './data_cj/data_cj_stylistika.js';
import { quizDataCJLiteratura } from './data_cj/data_cj_literatura.js';

// Import anglického jazyka
import { quizDataEN } from './data_en.js';

// Sloučení všech dílčích modulů do globální databáze otázek
const quizData = [
    ...quizDataCJPravopis,
    ...quizDataCJLexikologie,
    ...quizDataCJSyntax,
    ...quizDataCJPorozumeni,
    ...quizDataCJStylistika,
    ...quizDataCJLiteratura,
    ...quizDataEN
];

// --- STATE MANAGEMENT S PENĚŽENKOU A ZÁCHRANNOU SÍTÍ ---
let savedState = JSON.parse(localStorage.getItem('eco_academy_state')) || {};

let state = {
    xp: savedState.xp || 0,
    streak: savedState.streak || 0,
    lastLogin: savedState.lastLogin || Date.now(),
    unlocked: savedState.unlocked || { 'Český jazyk': ['Pravopis'], 'Anglický jazyk': ['Grammar'] },
    history: savedState.history || {},
    coins: savedState.coins || 0,
    tulipGrowthStage: savedState.tulipGrowthStage || 0
};

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
        if(part) {
            part.style.opacity = (i <= stage) ? '1' : '0';
            part.style.transform = (i <= stage) ? 'scale(1)' : 'scale(0.8)';
        }
    }

    const btnBuy = document.getElementById('btn-buy-tulip');
    const nextName = document.getElementById('next-upgrade-name');

    if(stage >= 4) {
        if(btnBuy) {
            btnBuy.innerHTML = "Tulipán je hotový! 🌸";
            btnBuy.disabled = true;
            btnBuy.style.background = "var(--border-light)";
            btnBuy.style.color = "var(--text-dark)";
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
}

const btnBuyTulip = document.getElementById('btn-buy-tulip');
if(btnBuyTulip) {
    btnBuyTulip.onclick = () => {
        if(state.tulipGrowthStage >= 4) return;
        const nextStage = tulipStages[state.tulipGrowthStage + 1];

        if(state.coins >= nextStage.cost) {
            state.coins -= nextStage.cost;
            state.tulipGrowthStage++;
            localStorage.setItem('eco_academy_state', JSON.stringify(state));

            playTone(600, 'sine', 0.1); setTimeout(() => playTone(800, 'sine', 0.2), 100);
            confetti({ particleCount: 30, spread: 40, origin: { x: 0.8, y: 0.6 }, colors: ['#f472b6', '#a855f7'] });

            updateTulipVisualization();
            updateHUD();
        } else {
            playTone(200, 'square', 0.2, 0.05);
            alert("Nemáš dost lístků! Udělej si další kvíz.");
        }
    }
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
    dropZone.ondrop = (e) => {
        e.preventDefault(); dropZone.classList.remove('active');
        const subject = e.dataTransfer.getData('text/plain');
        if (subject) bootSubject(subject);
    };
}

function bootSubject(subject) {
    activeSubject = subject;
    playTone(600, 'sine', 0.2); setTimeout(() => playTone(800, 'sine', 0.2), 100);
    if (term) term.innerText = `[OK] ${subject} zasazen. Vyber sektor péče...`;
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
        playTone(600, 'sine', 0.1); setTimeout(() => playTone(800, 'sine', 0.2), 100);
        if (finalPercent === 100) confetti();
        
        const mods = subjectModules[activeSubject];
        const cIdx = mods.indexOf(activeTier);
        if (cIdx < mods.length - 1 && !state.unlocked[activeSubject].includes(mods[cIdx + 1])) {
            state.unlocked[activeSubject].push(mods[cIdx + 1]);
            document.getElementById('res-subtext').innerText = `Odemčen nový modul: ${mods[cIdx + 1]}`;
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
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById(id);
    if(screen) screen.style.display = 'block';

    // Inteligentní skrývání zahrady: Viditelná pouze v menu, při testu uvolní místo a kvíz skočí na střed
    const garden = document.getElementById('garden-aside');
    if (garden) {
        if (id === 'subject-screen' || id === 'menu-screen') {
            garden.style.display = 'flex';
        } else {
            garden.style.display = 'none';
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
    
    localStorage.setItem('eco_academy_state', JSON.stringify(state));
}

// --- INICIALIZACE A SPUŠTĚNÍ ---
updateHUD();
updateTulipVisualization();
showScreen('subject-screen');