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
09:00 - 13:15 Game 1 (Hard Dice Down 13:15)
13:15 - 14:00 Lunch
14:00 - 14:15 Briefing
14:15 - 18:15 Game 2 (Hard Dice Down 18:15)

Sunday
08:45 - 09:00 Registration
09:00 - 12:15 Game 3 (Hard Dice Down 12:15)
12:15 - 13:15 Lunch and Best Army Judging
13:15 - 17:25 Game 4 (Hard Dice Down 17:25)
17:30 Prizegiving
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
09:00-12:00 Round 1 -
12:00-13:00 Lunch and best single miniature judging
13:00-16:00 Round 2 -
16:30-19:30 Round 3 -

Sunday
08:30-09:00 Venue opens and announcements
09:00-12:00 Round 4 -
12:00-13:00 Lunch and best army judging
13:00-16:00 Round 5 -
16:30-17:00 Prizegiving
`
    }
};

let currentEvent = 'horus';

// Resolve which day's schedule to show: URL override (?day=saturday|sunday) takes
// priority for testing/preview, otherwise real Sunday shows Sunday, everything else Saturday
function getActiveDay() {
    const params = new URLSearchParams(window.location.search);
    const override = (params.get('day') || '').toLowerCase();
    if (override === 'saturday' || override === 'sunday') {
        return override === 'sunday' ? 'Sunday' : 'Saturday';
    }
    return new Date().getDay() === 0 ? 'Sunday' : 'Saturday';
}

// Pull just one day's block out of a two-day schedule blob, tolerant of heading case
// (schedule files mix "Saturday"/"SATURDAY")
function extractDaySchedule(fullText, dayName) {
    const lines = fullText.split('\n');
    const isHeading = (line, name) => line.trim().toLowerCase() === name.toLowerCase();
    const startIdx = lines.findIndex(l => isHeading(l, dayName));
    if (startIdx === -1) return fullText.trim();
    let endIdx = lines.findIndex((l, i) => i > startIdx && (isHeading(l, 'Saturday') || isHeading(l, 'Sunday')));
    if (endIdx === -1) endIdx = lines.length;
    return lines.slice(startIdx, endIdx).join('\n').trim();
}

// Load schedule text from a barebones file and show it
async function loadSchedule(eventKey) {
    const cfg = eventConfig[eventKey];
    const area = document.getElementById('scheduleArea');
    const titleEl = document.getElementById('schedule-title');
    if (!cfg || !area || !titleEl) return;
    const activeDay = getActiveDay();
    titleEl.textContent = `${cfg.title} — ${activeDay}`;
    let fullText;
    try {
        const res = await fetch(cfg.scheduleFile, { cache: 'no-store' });
        if (!res.ok) throw new Error('Not found');
        fullText = await res.text();
    } catch (err) {
        // If fetch failed (commonly when opening via file://), use the built-in fallback text
        fullText = cfg.fallback || ('Schedule file not found. Please ensure ' + cfg.scheduleFile + ' exists.');
    }
    area.textContent = extractDaySchedule(fullText, activeDay);
}

// Change the dynamic image using the active event's image set

// Show/hide elements (mission QR, Horus-only sponsor logos, etc.) depending on the selected event
function updateHorusOnlyVisibility(eventKey) {
    document.querySelectorAll('.horus-only').forEach(el => {
        el.classList.toggle('hidden', eventKey !== 'horus');
    });
}

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

// View toggling: cycle between image, sponsor, and food views, each with its own duration
const VIEW_DURATIONS_MS = {
    image: 60000,   // 60 seconds
    sponsor: 30000, // 30 seconds
    food: 60000     // 60 seconds
};
const VIEW_ORDER = ['image', 'sponsor', 'food'];
let currentView = 'image';

function showView(view) {
    const dynamicViewEl = document.getElementById('dynamic-view');
    const sponsorViewEl = document.getElementById('sponsor-view');
    const foodViewEl = document.getElementById('food-view');
    if (!dynamicViewEl || !sponsorViewEl || !foodViewEl) return;
    dynamicViewEl.style.display = view === 'image' ? '' : 'none';
    sponsorViewEl.style.display = view === 'sponsor' ? '' : 'none';
    foodViewEl.style.display = view === 'food' ? '' : 'none';
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
        updateHorusOnlyVisibility(currentEvent);
    });
}

// Initial load and start the cycle (60s image, 30s sponsor, 60s food)
loadSchedule(currentEvent);
setRandomImage();
updateHorusOnlyVisibility(currentEvent);
showView('image');

function scheduleNextView() {
    setTimeout(() => {
        const nextView = VIEW_ORDER[(VIEW_ORDER.indexOf(currentView) + 1) % VIEW_ORDER.length];
        if (nextView === 'image') setRandomImage();
        showView(nextView);
        scheduleNextView();
    }, VIEW_DURATIONS_MS[currentView]);
}
scheduleNextView();
