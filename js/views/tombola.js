import { auth } from '../auth.js';
import { store } from '../store.js';
import { Toast } from '../toast.js';
import { Modal } from '../modal.js';

export function Tombola() {
    const user = auth.getUser();
    const isAdmin = user && (user.role === 'patron' || user.role === 'co_patron' || user.role === 'responsable');

    // Initialize logic after render
    setTimeout(() => {
        initTombola(isAdmin);
    }, 100);

    return `
        <div class="min-h-screen bg-slate-950 text-white p-4 lg:p-8">
            <div class="max-w-7xl mx-auto space-y-8">
                <!-- Header -->
                <div class="text-center space-y-4">
                    <h1 class="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg">
                        🎰 GRAND TIRAGE DRIVELINE 🎰
                    </h1>
                    <p class="text-slate-400 text-lg">La chance sourit aux audacieux !</p>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <!-- Left: Wheel -->
                    <div class="xl:col-span-7 space-y-6">
                        <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center">
                            <!-- Arrow -->
                            <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                                <i data-lucide="triangle" class="w-10 h-10 text-yellow-500 fill-current drop-shadow-lg rotate-180"></i>
                            </div>

                            <canvas id="wheelCanvas" width="500" height="500" class="max-w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-500"></canvas>
                            
                            <div class="mt-8">
                                <button onclick="window.tombolaSpin()" id="spinBtn" class="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
                                    LANCER LA ROUE 🎲
                                </button>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                                <p class="text-slate-500 text-sm uppercase font-bold">Participants</p>
                                <p id="stat-participants" class="text-3xl font-black text-white">0</p>
                            </div>
                            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                                <p class="text-slate-500 text-sm uppercase font-bold">Tickets</p>
                                <p id="stat-tickets" class="text-3xl font-black text-orange-500">0</p>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Controls -->
                    <div class="xl:col-span-5 space-y-6">
                        ${isAdmin ? `
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h3 class="text-xl font-bold text-white flex items-center gap-2">
                                <i data-lucide="plus-circle" class="w-5 h-5 text-green-500"></i>
                                Ajouter un participant
                            </h3>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-xs text-slate-500 uppercase font-bold">Nom</label>
                                    <input type="text" id="t-name" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none" placeholder="Ex: Jean Dupont">
                                </div>
                                <div>
                                    <label class="text-xs text-slate-500 uppercase font-bold">Tickets</label>
                                    <input type="number" id="t-tickets" value="1" min="1" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="window.tombolaAdd()" class="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors">
                                        Ajouter
                                    </button>
                                    <button onclick="window.tombolaClear()" class="px-4 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-lg transition-colors" title="Tout effacer">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[600px]">
                            <div class="p-4 border-b border-slate-800 bg-slate-950">
                                <h3 class="font-bold text-white">Liste des participants</h3>
                            </div>
                            <div id="tombola-list" class="flex-1 overflow-y-auto p-2 space-y-2">
                                <div class="text-center py-8 text-slate-500">Chargement...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- STATE ---
let _participants = [];
let _segments = []; // Mixed segments
let _isSpinning = false;
let _ctx = null;
let _canvas = null;

// --- INIT ---
async function initTombola(isAdmin) {
    if (window.lucide) lucide.createIcons();
    
    // Canvas Setup
    _canvas = document.getElementById('wheelCanvas');
    if (_canvas) {
        _ctx = _canvas.getContext('2d');
    }

    // Load Data
    await refreshData(isAdmin);
}

async function refreshData(isAdmin) {
    try {
        _participants = await store.fetchTombolaEntries();
        prepareSegments();
        renderList(isAdmin);
        renderStats();
        drawWheel();
    } catch (e) {
        console.error(e);
        Toast.show("Erreur de chargement", "error");
    }
}

function prepareSegments() {
    // Flatten tickets
    let flat = [];
    _participants.forEach(p => {
        const color = getColor(p.name);
        for(let i=0; i<p.tickets; i++) {
            flat.push({ name: p.name, color: color, id: p.id });
        }
    });
    
    // Shuffle (Fisher-Yates)
    for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    
    _segments = flat;
}

// --- RENDER HELPERS ---
function renderList(isAdmin) {
    const container = document.getElementById('tombola-list');
    if (!container) return;

    if (_participants.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-slate-600 italic">Aucun participant pour le moment.</div>`;
        return;
    }

    container.innerHTML = _participants.map(p => `
        <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors group">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-900" style="background-color: ${getColor(p.name)}">
                    ${p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="font-bold text-white text-sm">${p.name}</div>
                    <div class="text-xs text-slate-400">${p.tickets} ticket${p.tickets > 1 ? 's' : ''}</div>
                </div>
            </div>
            ${isAdmin ? `
            <button onclick="window.tombolaDelete('${p.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <i data-lucide="trash" class="w-4 h-4"></i>
            </button>
            ` : ''}
        </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
}

function renderStats() {
    const pCount = document.getElementById('stat-participants');
    const tCount = document.getElementById('stat-tickets');
    if (pCount) pCount.innerText = _participants.length;
    if (tCount) tCount.innerText = _participants.reduce((acc, p) => acc + p.tickets, 0);
}

// --- WHEEL LOGIC ---
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

function getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
}

function drawWheel(startAngle = 0) {
    if (!_ctx || !_canvas) return;
    
    const width = _canvas.width;
    const height = _canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    _ctx.clearRect(0, 0, width, height);

    if (_segments.length === 0) {
        // Draw empty wheel
        _ctx.beginPath();
        _ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        _ctx.fillStyle = '#1e293b';
        _ctx.fill();
        _ctx.strokeStyle = '#334155';
        _ctx.lineWidth = 4;
        _ctx.stroke();
        
        _ctx.fillStyle = '#64748b';
        _ctx.font = '20px Inter';
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        _ctx.fillText('Ajoutez des joueurs', centerX, centerY);
        return;
    }
    
    const arc = (2 * Math.PI) / _segments.length;

    _segments.forEach((seg, i) => {
        const angle = startAngle + i * arc;
        
        _ctx.beginPath();
        _ctx.moveTo(centerX, centerY);
        _ctx.arc(centerX, centerY, radius, angle, angle + arc);
        _ctx.fillStyle = seg.color;
        _ctx.fill();
        _ctx.stroke();

        // Only draw text if segment is large enough (e.g. > 2 degrees)
        // 2 degrees in radians is ~0.035
        if (arc > 0.035) {
            _ctx.save();
            _ctx.translate(centerX, centerY);
            _ctx.rotate(angle + arc / 2);
            _ctx.textAlign = "right";
            _ctx.fillStyle = "white";
            _ctx.font = "bold 12px Inter";
            _ctx.shadowColor = "rgba(0,0,0,0.5)";
            _ctx.shadowBlur = 4;
            // Truncate name if too long
            const maxChars = arc < 0.1 ? 10 : 15;
            let displayName = seg.name;
            if (displayName.length > maxChars) displayName = displayName.substring(0, maxChars) + '..';
            
            _ctx.fillText(displayName, radius - 10, 5);
            _ctx.restore();
        }
    });

    // Center Hub
    _ctx.beginPath();
    _ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    _ctx.fillStyle = '#ffffff';
    _ctx.fill();
    _ctx.shadowColor = "rgba(0,0,0,0.2)";
    _ctx.shadowBlur = 10;
    
    _ctx.fillStyle = '#0f172a';
    _ctx.font = '24px Inter';
    _ctx.textAlign = 'center';
    _ctx.textBaseline = 'middle';
    _ctx.fillText('🎰', centerX, centerY + 2);
}

// --- ACTIONS (Window Global) ---

window.tombolaAdd = async () => {
    const nameEl = document.getElementById('t-name');
    const ticketsEl = document.getElementById('t-tickets');
    if (!nameEl || !ticketsEl) return;

    const name = nameEl.value.trim();
    const tickets = parseInt(ticketsEl.value);

    if (!name || tickets < 1) {
        Toast.show("Nom et tickets requis", "warning");
        return;
    }

    try {
        await store.addTombolaEntry(name, tickets);
        nameEl.value = '';
        ticketsEl.value = '1';
        Toast.show("Participant ajouté !", "success");
        refreshData(true); // Assuming admin if adding
    } catch (e) {
        console.error(e);
        Toast.show("Erreur d'ajout", "error");
    }
};

window.tombolaDelete = async (id) => {
    if (!confirm("Supprimer ce participant ?")) return;
    try {
        await store.deleteTombolaEntry(id);
        refreshData(true);
        Toast.show("Supprimé");
    } catch (e) {
        Toast.show("Erreur", "error");
    }
};

window.tombolaClear = async () => {
    if (!confirm("TOUT supprimer ? Irréversible.")) return;
    try {
        await store.clearTombolaEntries();
        refreshData(true);
        Toast.show("Tout effacé");
    } catch (e) {
        Toast.show("Erreur", "error");
    }
};

window.tombolaSpin = () => {
    if (_isSpinning) return;
    if (_segments.length === 0) return;

    _isSpinning = true;
    const btn = document.getElementById('spinBtn');
    if (btn) btn.disabled = true;

    let startAngle = 0;
    let spinTime = 0;
    const spinTimeTotal = 4000 + Math.random() * 2000;
    const startVelocity = 0.5 + Math.random() * 0.5; // rad per frame

    function animate() {
        spinTime += 16; // ~60fps
        
        // Easing out
        const progress = spinTime / spinTimeTotal;
        const velocity = startVelocity * (1 - easeOutQuart(progress));
        
        startAngle += velocity;
        drawWheel(startAngle);

        if (spinTime < spinTimeTotal) {
            requestAnimationFrame(animate);
        } else {
            finishSpin(startAngle);
        }
    }
    animate();
};

function finishSpin(finalAngle) {
    _isSpinning = false;
    const btn = document.getElementById('spinBtn');
    if (btn) btn.disabled = false;

    // Calculate winner
    // Angle increases clockwise. 0 is 3 o'clock usually in canvas arc.
    // Arrow is at Top (270 deg or -90 deg or 1.5 PI).
    // We need to normalize angle.
    
    const arc = (2 * Math.PI) / _segments.length;
    // Normalize finalAngle to 0-2PI
    const normalizedAngle = finalAngle % (2 * Math.PI);
    
    // The pointer is at 1.5 * PI (Top).
    // We want to find which segment overlaps 1.5 PI.
    // Since we drew segments starting at 'normalizedAngle', the segment i is at [normalizedAngle + i*arc, normalizedAngle + (i+1)*arc]
    // We need to find i such that start <= 1.5PI <= end (modulo 2PI logic applies)
    
    // Easier way: Rotate the pointer backwards by normalizedAngle
    // Pointer relative angle = (1.5 PI - normalizedAngle)
    let pointerTheta = (1.5 * Math.PI - normalizedAngle) % (2 * Math.PI);
    if (pointerTheta < 0) pointerTheta += 2 * Math.PI;

    const index = Math.floor(pointerTheta / arc);
    const winner = _segments[index];

    fireConfetti();
    
    Modal.show({
        title: "🏆 LE GAGNANT EST...",
        message: `
            <div class="text-center py-6">
                <div class="text-6xl mb-4">🎉</div>
                <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-2">
                    ${winner.name}
                </div>
                <p class="text-slate-400">Félicitations !</p>
            </div>
        `,
        type: 'success',
        confirmText: 'Bravo !'
    });
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

function fireConfetti() {
    // Basic CSS confetti injection if not exists
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.innerHTML = `
            .confetti-piece {
                position: fixed;
                width: 10px; height: 10px;
                background-color: #f00;
                animation: fall linear forwards;
                z-index: 9999;
            }
            @keyframes fall {
                to { transform: translateY(100vh) rotate(720deg); }
            }
        `;
        document.head.appendChild(style);
    }

    for (let i = 0; i < 50; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = -10 + 'px';
        el.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        el.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}
