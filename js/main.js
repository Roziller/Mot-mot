// --- DOM ELEMENTS ---
const statusText = document.getElementById('status-text');
const acceptBtn = document.getElementById('accept-btn');
const deliveryPhase = document.getElementById('delivery-phase');
const letterPhase = document.getElementById('letter-phase');
const skipLetterBtn = document.getElementById('skip-letter-btn');
const cinemaPhase = document.getElementById('cinema-phase');
const dimLightsBtn = document.getElementById('dim-lights-btn');
const theaterHeader = document.querySelector('.theater-header');
const filterMenuContainer = document.querySelector('.filter-menu-container');
const shockwave = document.getElementById('shockwave-effect');
const startBtn = document.getElementById('start-experience-btn');
const blackScreen = document.getElementById('cinematic-black-screen');

// --- YOUTUBE IFRAME AUDIO ENGINE ---
let playerBeep, playerMotor, playerMusic;

// This function is automatically called by the YouTube IFrame API when it finishes loading
function onYouTubeIframeAPIReady() {
    // 1. Beeping Sequence
    playerBeep = new YT.Player('player-beep', {
        videoId: 'KFNhJnp7eQ0',
        playerVars: { 'playsinline': 1, 'controls': 0, 'modestbranding': 1, 'disablekb': 1 }
    });
    // 2. Motorcycle Riding (Loops)
    playerMotor = new YT.Player('player-motor', {
        videoId: 'sruRnTtDq34',
        playerVars: { 'playsinline': 1, 'controls': 0, 'modestbranding': 1, 'loop': 1, 'playlist': 'sruRnTtDq34' }
    });
    // 3. Romantic Music
    playerMusic = new YT.Player('player-music', {
        videoId: 'PWXhO29bIL8',
        playerVars: { 'playsinline': 1, 'controls': 0, 'modestbranding': 1 }
    });
}

// Fade audio out smoothly (like Premiere audio keyframes)
function fadeAudioOut(player, durationMs) {
    let vol = player.getVolume();
    const interval = 50; 
    const step = vol / (durationMs / interval);
    
    const fade = setInterval(() => {
        vol -= step;
        if (vol <= 0) {
            player.setVolume(0);
            player.pauseVideo();
            clearInterval(fade);
        } else {
            player.setVolume(vol);
        }
    }, interval);
}

// --- START SEQUENCE TRIGGER ---
startBtn.addEventListener('click', () => {
    // 1. Hide the button and fade the black screen out
    startBtn.style.opacity = 0;
    blackScreen.classList.add('reveal-scene');
    
    // 2. Start the Beep Audio
    playerBeep.setVolume(100);
    playerBeep.playVideo();

    // 3. Start the intro animations
    setTimeout(() => {
        runIntroSequence();
    }, 1000);
});


// --- 0. THE ANIMATED INTRO SEQUENCE ---
let globalAnimationFrames = null;

function runIntroSequence() {
    const introPhase = document.getElementById('intro-phase');
    const title = document.getElementById('intro-title');
    const subtitle = document.getElementById('intro-subtitle');
    const icon = document.getElementById('intro-icon');
    const radar = document.getElementById('intro-radar');

    setTimeout(() => {
        subtitle.style.opacity = 0;
        setTimeout(() => { subtitle.innerText = "Quality Check by Pot Pot 🐶..."; subtitle.style.opacity = 1; }, 300);
    }, 1500);

    setTimeout(() => {
        subtitle.style.opacity = 0;
        setTimeout(() => { subtitle.innerText = "Locking Route: Guiwan to Maasin 📍..."; subtitle.style.opacity = 1; }, 300);
    }, 3000);

    setTimeout(() => {
        title.style.opacity = 0;
        subtitle.style.opacity = 0;
        icon.style.opacity = 0;
        
        setTimeout(() => {
            title.innerText = "Order Confirmed";
            title.style.color = "#4CAF50"; 
            subtitle.innerText = "Dispatching Rider...";
            icon.innerText = "🛵";
            radar.style.borderColor = "#4CAF50";
            radar.style.animationDuration = "0.8s"; 
            title.style.opacity = 1;
            subtitle.style.opacity = 1;
            icon.style.opacity = 1;
        }, 300);
    }, 4500);

    // Fade into the Map
    setTimeout(() => {
        introPhase.classList.add('slide-up-out');
        
        // FADE OUT BEEP, START MOTORCYCLE
        fadeAudioOut(playerBeep, 1000);
        playerMotor.setVolume(80); // Mix it slightly lower so it's not overwhelming
        playerMotor.playVideo();
        
        let safetyCounter = 0;
        const checkReady = setInterval(() => {
            safetyCounter++;
            if (globalAnimationFrames) {
                clearInterval(checkReady);
                setTimeout(() => {
                    introPhase.classList.add('hidden');
                    startDeliveryAnimation(globalAnimationFrames);
                }, 1000); 
            }
            if (safetyCounter > 50 && !globalAnimationFrames) {
                clearInterval(checkReady);
                introPhase.classList.add('hidden');
            }
        }, 100);
    }, 6500);
}


// --- 1. THE LIVE LEAFLET API MAP (OSRM INTEGRATION) ---
const guiwanCoords = [6.933111, 122.089667]; 
const maasinCoords = [6.947139, 121.987500];

let map = L.map('map', { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView(guiwanCoords, 16);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

const guiwanIcon = L.divIcon({ html: '<div style="font-size:2rem; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3));">📍</div>', className: 'marker-clear', iconSize: [30, 30], iconAnchor: [15, 30] });
const maasinIcon = L.divIcon({ html: '<div style="font-size:2rem; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3));">💖</div>', className: 'marker-clear', iconSize: [30, 30], iconAnchor: [15, 30] });

L.marker(guiwanCoords, {icon: guiwanIcon}).addTo(map).bindTooltip("Guiwan", {permanent: true, direction: "bottom", className: "custom-map-label", offset: [0, 5]});
L.marker(maasinCoords, {icon: maasinIcon}).addTo(map).bindTooltip("Maasin", {permanent: true, direction: "bottom", className: "custom-map-label", offset: [0, 5]});

const potpotIcon = L.divIcon({ html: '<div class="rider-icon-container"><div class="rider-icon">🛵🐶</div></div>', className: 'marker-clear', iconSize: [60, 60], iconAnchor: [30, 45] });
let potpotMarker = L.marker(guiwanCoords, {icon: potpotIcon, zIndexOffset: 1000}).addTo(map);

async function fetchRealRoute() {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${guiwanCoords[1]},${guiwanCoords[0]};${maasinCoords[1]},${maasinCoords[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const routePath = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            L.polyline(routePath, { color: '#ff3355', weight: 5, dashArray: '10, 10', lineJoin: 'round' }).addTo(map);
            globalAnimationFrames = getEquidistantPoints(routePath, 500); 
        } else { throw new Error("Route not found"); }
    } catch (error) {
        const fallbackPath = [guiwanCoords, maasinCoords];
        L.polyline(fallbackPath, { color: '#ff3355', weight: 5, dashArray: '10, 10', lineJoin: 'round' }).addTo(map);
        globalAnimationFrames = getEquidistantPoints(fallbackPath, 500); 
    }
}

function getEquidistantPoints(latlngs, totalFrames) {
    let totalDist = 0;
    let segments = [];
    for(let i=0; i<latlngs.length-1; i++) {
        let d = map.distance(latlngs[i], latlngs[i+1]);
        totalDist += d;
        segments.push({ start: latlngs[i], end: latlngs[i+1], dist: d });
    }
    
    let points = [];
    let step = totalDist / totalFrames;
    
    for(let i=0; i<=totalFrames; i++) {
        let targetDist = step * i;
        let accum = 0;
        for(let j=0; j<segments.length; j++) {
            if (accum + segments[j].dist >= targetDist || j === segments.length - 1) {
                let remain = targetDist - accum;
                let fraction = remain / (segments[j].dist || 1);
                let lat = segments[j].start[0] + (segments[j].end[0] - segments[j].start[0]) * fraction;
                let lng = segments[j].start[1] + (segments[j].end[1] - segments[j].start[1]) * fraction;
                points.push([lat, lng]);
                break;
            }
            accum += segments[j].dist;
        }
    }
    return points;
}

// THE DRIVING ANIMATION LOOP
function startDeliveryAnimation(animationFrames) {
    let frame = 0;
    
    const rideInterval = setInterval(() => {
        if (frame >= animationFrames.length) {
            clearInterval(rideInterval);
            
            // FIRE CELEBRATION SHOCKWAVE & CAMERA SHAKE
            shockwave.classList.add('fire-shockwave');
            deliveryPhase.classList.add('camera-shake');
            
            // Fade out the motorcycle engine!
            fadeAudioOut(playerMotor, 1500);
            
            statusText.style.opacity = 0;
            setTimeout(() => {
                statusText.innerText = "Pot Pot has arrived at Mae Mae's heart! 💖";
                statusText.style.opacity = 1;
                acceptBtn.classList.remove('hidden');
            }, 400); 
            
            return;
        }

        const currentPosition = animationFrames[frame];
        potpotMarker.setLatLng(currentPosition);

        const currentPoint = map.latLngToContainerPoint(currentPosition);
        currentPoint.y += 120; 
        const newCenter = map.containerPointToLatLng(currentPoint);
        
        map.panTo(newCenter, {animate: true, duration: 0.05, easeLinearity: 1});

        let progress = (frame / animationFrames.length) * 100;
        
        if (progress >= 25 && progress < 50 && statusText.innerText.includes("Revving")) {
            statusText.style.opacity = 0; 
            setTimeout(() => { statusText.innerText = "Pot Pot is navigating traffic in Zamboanga..."; statusText.style.opacity = 1; }, 300);
        } else if (progress >= 50 && progress < 75 && statusText.innerText.includes("traffic")) {
            statusText.style.opacity = 0;
            setTimeout(() => { statusText.innerText = "Halfway there, holding tight to the memories..."; statusText.style.opacity = 1; }, 300);
        } else if (progress >= 75 && progress < 99 && statusText.innerText.includes("Halfway")) {
            statusText.style.opacity = 0;
            setTimeout(() => { statusText.innerText = "Entering Maasin! Almost at the door..."; statusText.style.opacity = 1; }, 300);
        }
        frame++;
    }, 35); 
}

// Start loading map data silently on boot
document.addEventListener('DOMContentLoaded', fetchRealRoute);


// --- 2. TRANSITIONS & ROMANTIC MUSIC START ---
let letterTimer;

acceptBtn.addEventListener('click', () => {
    deliveryPhase.classList.add('fade-out');
    
    // Start the romantic music track
    playerMusic.setVolume(100);
    playerMusic.playVideo();
    
    setTimeout(() => {
        deliveryPhase.classList.add('hidden');
        letterPhase.classList.remove('hidden');

        setTimeout(() => {
            skipLetterBtn.classList.remove('hidden');
            setTimeout(() => { skipLetterBtn.style.opacity = 1; }, 100);
        }, 8000);

        letterTimer = setTimeout(() => {
            transitionToGallery();
        }, 40000); 

    }, 1200);
});

skipLetterBtn.addEventListener('click', () => {
    clearTimeout(letterTimer); 
    transitionToGallery();
});

function transitionToGallery() {
    letterPhase.classList.add('fade-out');
    setTimeout(() => {
        letterPhase.classList.add('hidden');
        cinemaPhase.classList.remove('hidden');
    }, 1500);
}

// --- 3. FILTER MENU LOGIC ---
const filterBtns = document.querySelectorAll('.filter-btn');
const videoContent = document.getElementById('video-content');
const photoContent = document.getElementById('photo-content');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.getAttribute('data-target');

        if (target === 'all') {
            videoContent.classList.remove('hidden');
            photoContent.classList.remove('hidden');
            dimLightsBtn.classList.remove('hidden');
        } else if (target === 'videos') {
            videoContent.classList.remove('hidden');
            photoContent.classList.add('hidden');
            dimLightsBtn.classList.remove('hidden');
        } else if (target === 'photos') {
            videoContent.classList.add('hidden');
            photoContent.classList.remove('hidden');
            dimLightsBtn.classList.add('hidden'); 
        }
    });
});

// --- 4. CINEMA EXPERIENCE ---
let lightsDimmed = false;
dimLightsBtn.addEventListener('click', () => {
    if (!lightsDimmed) {
        document.body.style.backgroundColor = '#000000';
        theaterHeader.style.opacity = '0'; 
        filterMenuContainer.style.opacity = '0';
        dimLightsBtn.style.opacity = '0';
        
        setTimeout(() => {
            theaterHeader.classList.add('hidden');
            filterMenuContainer.classList.add('hidden');
            dimLightsBtn.classList.add('hidden');
        }, 1000); 
        lightsDimmed = true;
    }
});