// Centralized script to handle time, per-event schedules, and per-event image sets

// --- Time display ---
function updateTime() {
    const timeElement = document.getElementById('time');
    if (!timeElement) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

updateTime();
setInterval(updateTime, 1000);

// --- Per-event resources ---
const eventConfig = {
    horus: {
        title: 'Horus Heresy',
        scheduleFile: 'schedules/horus.txt',
        images: [
            'assets/horus/Abaddon_Bust-1024x650.png', 'assets/horus/Angron-1024x691.png', 'assets/horus/Horus.png', 'assets/horus/Fulgrim-1024x768.png',
            'assets/horus/Justaerin2-1024x768.png', 'assets/horus/Jaghatai_Khan-1024x768.png', 'assets/horus/Konrad_Curze-1024x792.png',
            'assets/horus/Night_Lords_Terminator_30k-1024x792.png', 'assets/horus/NL_Raptor.png', 'assets/horus/WhiteScars_HH-1024x768.png',
            'assets/horus/Vulkan-1024x768.png', 'assets/horus/WB_Possessed-1024x768.png', 'assets/horus/Abaddon_Bust-1024x650.png'
        ],
        // Fallback schedule string used when fetch() fails (for file:// or blocked requests)
        fallback: `Saturday
08:30 - 09:00 Registration
09:10 - 09:15 Briefing
09:15 - 13:15 Game 1
13:15 - 14:00 Lunch and Best Miniature
14:00 - 14:15 Briefing
14:15 - 18:15 Game 2

Sunday
09:00 - 09:15 Briefing
09:15 - 12:15 Game 3
12:15 - 13:00 Lunch and Best Army
13:00 - 13:15 Briefing
13:15 - 17:15 Game 4
17:30 Epilogue + Prizegiving
`
    },
    '40k': {
        title: 'Warhammer 40K',
        scheduleFile: 'schedules/40k.txt',
        images: [
            'assets/40k/Admech_Banner2.png', 'assets/40k/Aeldari_Banner2.png', 'assets/40k/Astra_Militarum_Banner.png', 'assets/40k/Black_Templars_Banner.png',
            'assets/40k/Blade_Champion_Custodes_Banner.png', 'assets/40k/Blood_Angels_Banner.png', 'assets/40k/Chaos_Daemons_Banner2.png', 'assets/40k/Chaos_Knights_Banner2.png',
            'assets/40k/Dark_Angels_Banner2.png', 'assets/40k/Drukhari_Banner2.png', 'assets/40k/Genestealer_Cults_Banner2.png', 'assets/40k/GH_CSM_Banner_2.png',
            'assets/40k/GreyKnights_Banner2.png', 'assets/40k/Harlequins_Banner2.png', 'assets/40k/Imperial_Agents_Banner.png', 'assets/40k/Imperial_Knights_Banner2.png',
            'assets/40k/Necrons_Banner2.png', 'assets/40k/Orks_Banner2.png', 'assets/40k/Sororitas_Banner2.png', 'assets/40k/Space_Marines_Banner2.png',
            'assets/40k/Space_Wolves_Banner2.png', 'assets/40k/Tau_Banner2.png', 'assets/40k/Thousand_Sons_Banner2.png', 'assets/40k/Tyranids_Banner2.png',
            'assets/40k/Votann_Banner.png', 'assets/40k/WorldEaters_Banner2.png'
        ],
        fallback: `Saturday
08:30-09:00 Registration and announcements
09:00-12:00 Round 1
12:00-13:00 Lunch and Best Single Mini
13:00-16:00 Round 2
16:30-19:30 Round 3

Sunday
08:30-09:00 Venue opens and announcements
09:00-12:00 Round 4
12:00-13:00 Lunch and Best Painted Army
13:00-16:00 Round 5
16:30-19:30 Round 6
19:30-20:00 Prizegiving
`
    },
    killteam: {
        title: 'Kill Team',
        scheduleFile: 'schedules/killteam.txt',
        images: [
            'assets/killteam/KillTeam_Banner-750x469.png'
        ],
        fallback: `09:00 to 09:20 - Registration
09:20 to 09:30 - Briefing
09:30 to 11:30 - Round 1
11:30 to 11:45 - Break
11:45 to 13:45 - Round 2
13:45 to 14:30 - Lunch
14:30 to 16:30 - Round 3
16:30 to 16:45 - Break
16:45 to 18:45 - Round 4
19:00 - Awards and Wrap-up
`
    }
};

let currentEvent = 'horus';

// Load schedule text from a barebones file and show it
async function loadSchedule(eventKey) {
    const cfg = eventConfig[eventKey];
    const area = document.getElementById('scheduleArea');
    const titleEl = document.getElementById('schedule-title');
    if (!cfg || !area || !titleEl) return;
    titleEl.textContent = cfg.title;
    try {
        const res = await fetch(cfg.scheduleFile, { cache: 'no-store' });
        if (!res.ok) throw new Error('Not found');
        const text = await res.text();
        area.value = text.trim();
    } catch (err) {
        // If fetch failed (commonly when opening via file://), use the built-in fallback text
        area.value = cfg.fallback || ('Schedule file not found. Please ensure ' + cfg.scheduleFile + ' exists.');
    }
}

// Change the dynamic image using the active event's image set

// Pick and display a random image for the current event
function setRandomImage() {
    const imageElement = document.getElementById('dynamic-image');
    if (!imageElement) return;
    const cfg = eventConfig[currentEvent] || eventConfig.horus;
    const arr = cfg.images || [];
    if (arr.length === 0) return;
    const randomIndex = Math.floor(Math.random() * arr.length);
    imageElement.src = arr[randomIndex];
}

// View toggling: alternate between image view and sponsor view every N ms
const VIEW_TOGGLE_MS = 30000; // 30 seconds
let currentView = 'image'; // 'image' or 'sponsor'

function showView(view) {
    const dynamicViewEl = document.getElementById('dynamic-view');
    const sponsorViewEl = document.getElementById('sponsor-view');
    if (!dynamicViewEl || !sponsorViewEl) return;
    if (view === 'image') {
        dynamicViewEl.style.display = '';
        sponsorViewEl.style.display = 'none';
    } else {
        dynamicViewEl.style.display = 'none';
        sponsorViewEl.style.display = '';
    }
    currentView = view;
}

// Wire up event selection
const selectEl = document.getElementById('event-select');
if (selectEl) {
    selectEl.addEventListener('change', () => {
        currentEvent = selectEl.value;
        loadSchedule(currentEvent);
        // If we're currently showing images, immediately pick a new image
        if (currentView === 'image') setRandomImage();
    });
}

// Initial load and start the alternating cycle (30s image, 30s sponsor)
loadSchedule(currentEvent);
setRandomImage();
showView('image');

setInterval(() => {
    if (currentView === 'image') {
        // switch to sponsor page
        showView('sponsor');
    } else {
        // switch back to image and pick a new random image
        setRandomImage();
        showView('image');
    }
}, VIEW_TOGGLE_MS);
