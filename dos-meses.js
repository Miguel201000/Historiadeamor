const isCompactDevice = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const startDate = new Date('2026-08-21T00:00:00');
const timerUnits = ['days', 'hours', 'minutes', 'seconds'];

function updateTwoMonthTimer() {
    const elapsed = Date.now() - startDate.getTime();
    const values = elapsed < 0
        ? [0, 0, 0, 0]
        : [
            Math.floor(elapsed / 86400000),
            Math.floor((elapsed / 3600000) % 24),
            Math.floor((elapsed / 60000) % 60),
            Math.floor((elapsed / 1000) % 60)
        ];

    timerUnits.forEach((unit, index) => {
        document.getElementById(unit).textContent = String(values[index]).padStart(2, '0');
    });
}

let timerInterval = null;
function updateTimerVisibility() {
    if (!document.hidden && timerInterval === null) {
        updateTwoMonthTimer();
        timerInterval = window.setInterval(updateTwoMonthTimer, 1000);
    } else if (document.hidden && timerInterval !== null) {
        window.clearInterval(timerInterval);
        timerInterval = null;
    }
}

document.addEventListener('visibilitychange', updateTimerVisibility);
window.addEventListener('pagehide', () => window.clearInterval(timerInterval), { once: true });
updateTwoMonthTimer();
updateTimerVisibility();

const audio = document.getElementById('audioTrack');
const vinyl = document.getElementById('vinyl');
const playButton = document.getElementById('playBtn');
const playbackStatus = document.getElementById('playback-status');
const playbackStateKey = 'regalo-musica-reproduccion';
let savedPlayback = null;
let playbackRestored = false;

function updatePlaybackUI(isPlaying) {
    playButton.textContent = isPlaying ? '❚❚' : '▶';
    playButton.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    vinyl.style.animationPlayState = isPlaying ? 'running' : 'paused';
    document.querySelector('.music-player').classList.toggle('is-playing', isPlaying);
}

function savePlaybackState(shouldPlay = !audio.paused) {
    try {
        localStorage.setItem(playbackStateKey, JSON.stringify({
            shouldPlay,
            currentTime: audio.currentTime
        }));
    } catch (error) {
        console.error('No se pudo guardar el progreso de la canción.', error);
        playbackStatus.textContent = 'No se pudo guardar el progreso de la canción.';
    }
}

function getAudioErrorMessage() {
    if (!audio.error) return 'No se pudo cargar Cancion.mp3. Revisa la conexión e inténtalo de nuevo.';
    switch (audio.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
            return 'La carga de la canción se interrumpió. Toca ▶ para intentarlo de nuevo.';
        case MediaError.MEDIA_ERR_NETWORK:
            return 'No se pudo descargar Cancion.mp3. Revisa la conexión e inténtalo de nuevo.';
        case MediaError.MEDIA_ERR_DECODE:
            return 'Cancion.mp3 se descargó, pero el navegador no pudo decodificar el audio.';
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            return 'No se encontró Cancion.mp3 o su formato no es compatible.';
        default:
            return 'No se pudo cargar Cancion.mp3. Revisa que esté junto a dos-meses.html.';
    }
}

async function playAudio() {
    try {
        await audio.play();
        playbackStatus.textContent = '';
    } catch (error) {
        updatePlaybackUI(false);
        if (error && error.name === 'NotAllowedError') {
            playbackStatus.textContent = 'Toca ▶ para reanudar la música.';
        } else if (error && error.name === 'AbortError') {
            playbackStatus.textContent = 'La reproducción se interrumpió. Toca ▶ para intentarlo de nuevo.';
        } else if (audio.error || (error && error.name === 'NotSupportedError')) {
            playbackStatus.textContent = getAudioErrorMessage();
        } else {
            playbackStatus.textContent = 'No se pudo iniciar el audio. Revisa la salida de sonido e inténtalo de nuevo.';
            console.error('No se pudo reproducir la canción.', error);
        }
    }
}

function restorePlayback() {
    if (playbackRestored) return;
    playbackRestored = true;
    const savedTime = Number(savedPlayback && savedPlayback.currentTime);
    if (Number.isFinite(savedTime) && savedTime > 0 && savedTime < audio.duration) {
        audio.currentTime = savedTime;
    }
    if (savedPlayback && savedPlayback.shouldPlay) playAudio();
}

try {
    savedPlayback = JSON.parse(localStorage.getItem(playbackStateKey) || 'null');
} catch (error) {
    console.error('No se pudo recuperar el estado de la música.', error);
    playbackStatus.textContent = 'No se pudo recuperar el estado de la música.';
}
if (savedPlayback && savedPlayback.shouldPlay) audio.preload = 'metadata';

playButton.addEventListener('click', () => {
    if (audio.paused) {
        savePlaybackState(true);
        playAudio();
    } else {
        savePlaybackState(false);
        audio.pause();
    }
});
audio.addEventListener('play', () => updatePlaybackUI(true));
audio.addEventListener('pause', () => updatePlaybackUI(false));
audio.addEventListener('timeupdate', () => savePlaybackState());
audio.addEventListener('error', () => {
    playbackStatus.textContent = getAudioErrorMessage();
});
audio.addEventListener('loadedmetadata', restorePlayback, { once: true });
if (audio.readyState >= 1) restorePlayback();
window.addEventListener('pagehide', () => savePlaybackState(), { once: true });

const voiceAudio = document.getElementById('voiceAudio');
const voiceStatus = document.getElementById('voice-status');
const voicePlayer = document.getElementById('voiceAudioPlayer');

voiceAudio.addEventListener('error', () => {
    voiceStatus.textContent = 'No se pudo cargar el mensajito de voz. Inténtalo de nuevo más tarde.';
});
voiceAudio.addEventListener('playing', () => {
    voicePlayer.classList.add('is-playing');
    voiceStatus.textContent = '';
});
['pause', 'ended'].forEach(eventName => {
    voiceAudio.addEventListener(eventName, () => voicePlayer.classList.remove('is-playing'));
});

function togglePolaroid(card) {
    const isFlipped = card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', String(isFlipped));
}

document.querySelectorAll('.polaroid').forEach(card => {
    card.addEventListener('click', () => togglePolaroid(card));
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            togglePolaroid(card);
        }
    });
});

function toggleReason(button) {
    const isRevealed = button.classList.toggle('revealed');
    button.setAttribute('aria-expanded', String(isRevealed));
}

document.querySelectorAll('.reason-card').forEach(button => {
    button.addEventListener('click', () => toggleReason(button));
});

const loveLetterButton = document.getElementById('loveLetterButton');
const letterContent = document.getElementById('letterText');
const letterTitle = document.getElementById('env-title');

loveLetterButton.addEventListener('click', () => {
    const isOpening = letterContent.hidden;
    letterContent.hidden = !isOpening;
    letterContent.style.display = isOpening ? 'block' : 'none';
    loveLetterButton.setAttribute('aria-expanded', String(isOpening));
    letterTitle.textContent = isOpening ? 'Con todo mi amor... 💖' : 'Toca aquí para abrir la carta';
    if (isOpening && typeof confetti === 'function') {
        confetti({
            particleCount: isCompactDevice ? 28 : 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#ff4b72', '#ff7eb3', '#ffffff'],
            disableForReducedMotion: true
        });
    }
});

const dateIdeas = [
    'Noche de Snoopy, palomitas y una manta para acurrucarnos 🍿☁️',
    'Preparar algo rico juntos y elegir nuestro episodio o película favorita 🍪🎬',
    'Paseo por un cafecito bonito y una charla sin mirar el reloj ☕💞',
    'Tarde de pijama, snacks y una maratón de dibujos que te hagan sonreír 🧸✨',
    'Intercambiar una notita bonita y guardarla como recuerdo de nuestra cita 💌🐾',
    'Salir por un helado y después volver a casa a descansar juntitos 🍦💕',
    'Hacer un picnic sencillo con tus snacks favoritos y una playlist bonita 🧺🎶',
    'Dibujar a Snoopy juntos, aunque terminemos inventando nuestro propio personaje 🎨🐶',
    'Armar un fuerte de almohadas y contar historias bajo una guirnalda de luces 🏕️✨',
    'Preparar chocolate caliente y ver una película abrazaditos ☕🎥',
    'Hacer galletas con formas divertidas y decorarlas como queramos 🍪💗',
    'Salir a caminar al atardecer y tomarnos fotos bonitas juntos 🌇📸',
    'Crear una playlist con canciones que nos recuerden a nuestra historia 🎧💕',
    'Tener una cita de café y postre donde cada uno elija algo para compartir 🧁☕',
    'Jugar cartas o un juego de mesa y que quien pierda deba dar un abrazo 😄🃏',
    'Hacer una mini sesión de fotos con poses tiernas y graciosas 📷🐾',
    'Elegir un libro o cuento corto y leerlo juntos, turnándonos cada página 📖💞',
    'Preparar una cena sencilla juntos y poner la mesa como si fuera una ocasión especial 🍝🕯️',
    'Salir a buscar el mejor postre de la zona y calificarlo como críticos expertos 🍰⭐',
    'Hacer una noche temática de pijamas, snacks y nuestra película favorita 🌙🍿',
    'Escribir tres cosas que queremos hacer juntos y escoger la primera para nuestra próxima cita 📝💖',
    'Pintar tazas o hacer una manualidad para tener un recuerdo hecho por los dos 🎨☕',
    'Ir a una librería o tienda bonita y elegir un pequeño detalle sorpresa el uno para el otro 🎁📚',
    'Ver las nubes y encontrarles formas mientras inventamos nombres para cada una ☁️😊',
    'Preparar una degustación de dulces y elegir juntos nuestro favorito 🍬💛',
    'Hacer una caminata tranquila y parar por algo rico para llevar 🥐🚶‍♀️',
    'Recrear nuestra primera cita y contar qué fue lo que más nos gustó de ese día 🌹✨',
    'Hacer una cápsula del tiempo con una foto y una nota para leerla en el futuro ⏳💌',
    'Cantar nuestras canciones favoritas en un karaoke casero, sin importar cómo suene 🎤😂',
    'Preparar una noche de autocuidado con mascarillas, música suave y muchos mimos 🧖‍♀️🫶',
    'Visitar un parque, sentarnos juntitos y disfrutar un rato sin prisas 🌳💑',
    'Hacer un intercambio de dibujos: cada quien dibuja cómo ve al otro 🖍️❤️',
    'Elegir una receta nueva y cocinarla en equipo; la diversión cuenta aunque salga diferente 👩‍🍳🍓',
    'Buscar un lugar bonito para ver las estrellas y pedir un deseo juntos 🌌💫',
    'Hacer una búsqueda del tesoro con notitas cariñosas escondidas por la casa 🔎💌',
    'Tener una cita sorpresa en casa: uno prepara el ambiente y el otro elige la música 🕯️🎵',
    'Ir por bebidas ricas y dar un paseo mientras nos contamos cómo estuvo la semana 🧋💕',
    'Armar un rompecabezas juntos con una película de fondo 🧩🎬',
    'Hacer una lista de apodos tiernos y elegir uno nuevo solo para nuestra próxima cita 🐻💗',
    'Organizar un desayuno especial y empezar el día con una cita tranquila 🥞☀️',
    'Elegir fotos favoritas y crear juntos un mini álbum de nuestros recuerdos 📸📔',
    'Hacer una tarde de preguntas curiosas para descubrir todavía más cosas el uno del otro 💬💖',
    'Pasear por un mercado o feria y escoger algo rico para compartir 🎪🍓',
    'Crear tarjetas de cupones caseros: abrazos, besitos, postres y planes a elección 🎟️😘',
    'Ver una película con temática perruna y escoger al personaje más adorable 🐾🎞️',
    'Preparar una manta en el suelo, poner música bajita y hacer un picnic dentro de casa 🧺🏠',
    'Hacer una competencia amistosa de quién prepara el snack más rico 🥪🏆',
    'Salir a conocer un rinconcito nuevo de la ciudad y guardarlo como nuestro lugar secreto 🗺️💞',
    'Escribir una carta para abrir en nuestro próximo aniversario de meses 💌🗓️',
    'Hacer una tarde de manualidades para decorar un marco con una foto nuestra 🖼️💕',
    'Elegir una película cada uno y decidir con una moneda cuál vemos primero 🪙🍿',
    'Preparar limonada o una bebida favorita y brindar por todas nuestras aventuras 🍹🥂',
    'Inventar juntos una historia romántica protagonizada por dos personajes muy despistados 📚😄',
    'Regalarnos una tarde sin celulares para conversar, reír y estar presentes 📵🫶',
    'Hacer una lista de nuestros planes soñados y elegir uno que podamos cumplir pronto 🌈📝',
    'Salir a desayunar algo rico y luego dar una vuelta de la mano 🥐🤍',
    'Darnos un abrazo largo mientras escuchamos una canción que nos encante 🤗🎶',
    'Preparar una mini fiesta para dos con postre, luces y nuestra música favorita 🎉💝'
];
let previousDateIdea = -1;

document.getElementById('newDateIdea').addEventListener('click', () => {
    const availableIdeas = dateIdeas.map((_, index) => index).filter(index => index !== previousDateIdea);
    previousDateIdea = availableIdeas[Math.floor(Math.random() * availableIdeas.length)];
    const idea = document.getElementById('dateIdea');
    idea.classList.remove('is-changing');
    void idea.offsetWidth;
    idea.textContent = dateIdeas[previousDateIdea];
    idea.classList.add('is-changing');
});

const emergencyLoveModal = document.getElementById('emergencyLoveModal');
const emergencyLoveTrigger = document.getElementById('emergencyLoveTrigger');
let lastModalTrigger = null;

function openEmergencyLoveModal(trigger) {
    lastModalTrigger = trigger;
    emergencyLoveModal.hidden = false;
    document.body.classList.add('modal-open');
    emergencyLoveModal.querySelector('.modal-close').focus();
}

function closeEmergencyLoveModal() {
    emergencyLoveModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastModalTrigger) lastModalTrigger.focus();
}

emergencyLoveTrigger.addEventListener('click', event => {
    openEmergencyLoveModal(event.currentTarget);
});
document.querySelectorAll('[data-close-emergency-love]').forEach(button => {
    button.addEventListener('click', closeEmergencyLoveModal);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !emergencyLoveModal.hidden) closeEmergencyLoveModal();
});

function initStarMap() {
    const stage = document.getElementById('starMapStage');
    const starCanvas = document.getElementById('starMapCanvas');
    const tooltip = document.getElementById('starMemoryTooltip');
    const context = starCanvas.getContext('2d');
    if (!context) {
        console.error('No se pudo iniciar el lienzo del mapa estelar.');
        return;
    }

    const memoryStars = [...stage.querySelectorAll('.memory-star')];
    const constellation = memoryStars.map(star => ({
        x: parseFloat(star.style.getPropertyValue('--star-x')) / 100,
        y: parseFloat(star.style.getPropertyValue('--star-y')) / 100
    }));
    const backgroundStars = Array.from({ length: isCompactDevice ? 38 : 75 }, () => ({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.2 + 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0018 + 0.0004
    }));
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let mapIsVisible = !('IntersectionObserver' in window);

    function resizeStarMap() {
        const bounds = stage.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, isCompactDevice ? 1 : 1.5);
        width = bounds.width;
        height = bounds.height;
        starCanvas.width = Math.round(width * pixelRatio);
        starCanvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        drawStarMap(performance.now());
    }

    function drawStarMap(time) {
        context.clearRect(0, 0, width, height);
        backgroundStars.forEach(star => {
            const twinkle = 0.35 + (Math.sin(time * star.speed + star.phase) + 1) * 0.32;
            context.beginPath();
            context.fillStyle = `rgba(238, 220, 255, ${twinkle})`;
            context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
            context.fill();
        });

        if (constellation.length < 2) return;
        context.save();
        context.beginPath();
        context.moveTo(constellation[0].x * width, constellation[0].y * height);
        constellation.slice(1).forEach(point => context.lineTo(point.x * width, point.y * height));
        context.strokeStyle = 'rgba(198, 139, 255, 0.48)';
        context.lineWidth = 1;
        context.shadowColor = '#b66aff';
        context.shadowBlur = 12;
        context.stroke();
        context.restore();
    }

    function animateStarMap(time) {
        if (!mapIsVisible || document.hidden || reducedMotion) {
            animationFrame = 0;
            return;
        }
        if (time - lastFrameTime >= 50) {
            lastFrameTime = time;
            drawStarMap(time);
        }
        animationFrame = requestAnimationFrame(animateStarMap);
    }

    function updateStarMapAnimation() {
        const shouldAnimate = mapIsVisible && !document.hidden && !reducedMotion;
        if (shouldAnimate && !animationFrame) {
            animationFrame = requestAnimationFrame(animateStarMap);
        } else if (!shouldAnimate && animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        }
    }

    function showMemory(star) {
        tooltip.textContent = star.dataset.memory;
        tooltip.classList.add('is-visible');
        memoryStars.forEach(item => item.setAttribute('aria-pressed', String(item === star)));
        if (star.classList.contains('star-main') && typeof confetti === 'function') {
            const bounds = star.getBoundingClientRect();
            confetti({
                particleCount: isCompactDevice ? 14 : 28,
                spread: 42,
                startVelocity: 16,
                gravity: 0.8,
                ticks: 100,
                scalar: 0.65,
                origin: {
                    x: (bounds.left + bounds.width / 2) / window.innerWidth,
                    y: (bounds.top + bounds.height / 2) / window.innerHeight
                },
                colors: ['#ffd166', '#fff1bd', '#ffcf70', '#ffffff'],
                disableForReducedMotion: true
            });
        }
    }

    memoryStars.forEach(star => {
        star.addEventListener('mouseenter', () => showMemory(star));
        star.addEventListener('focus', () => showMemory(star));
        star.addEventListener('click', () => showMemory(star));
        star.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                tooltip.classList.remove('is-visible');
                star.setAttribute('aria-pressed', 'false');
                star.blur();
            }
        });
    });

    const resizeObserver = new ResizeObserver(resizeStarMap);
    resizeObserver.observe(stage);
    const intersectionObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver(entries => {
            mapIsVisible = entries.some(entry => entry.isIntersecting);
            updateStarMapAnimation();
        }, { threshold: 0.05 })
        : null;
    if (intersectionObserver) intersectionObserver.observe(stage);
    document.addEventListener('visibilitychange', updateStarMapAnimation);
    updateStarMapAnimation();
    if (reducedMotion) drawStarMap(0);
    window.addEventListener('pagehide', () => {
        cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
        if (intersectionObserver) intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', updateStarMapAnimation);
    }, { once: true });
}

initStarMap();

const backgroundCanvas = document.getElementById('canvas-bg');
const backgroundContext = backgroundCanvas.getContext('2d');
let particles = [];
let backgroundFrame = 0;
let lastBackgroundFrameTime = 0;
let backgroundAnimationRunning = false;
const backgroundFrameInterval = isCompactDevice ? 1000 / 24 : 1000 / 30;

function resizeBackgroundCanvas() {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
    const particleCount = reducedMotion ? 0 : (isCompactDevice ? 12 : 28);
    particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * backgroundCanvas.width,
        y: backgroundCanvas.height + Math.random() * 100,
        size: Math.random() * 6 + 3,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3
    }));
    drawBackground();
}

function drawBackground() {
    backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    particles.forEach(particle => {
        particle.y -= particle.speed;
        if (particle.y < -20) {
            particle.y = backgroundCanvas.height + 20;
            particle.x = Math.random() * backgroundCanvas.width;
        }
        backgroundContext.globalAlpha = particle.opacity;
        backgroundContext.fillStyle = '#ff4b72';
        backgroundContext.beginPath();
        backgroundContext.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        backgroundContext.fill();
    });
    backgroundContext.globalAlpha = 1;
}

function animateBackground(time) {
    if (!backgroundAnimationRunning) return;
    backgroundFrame = requestAnimationFrame(animateBackground);
    if (time - lastBackgroundFrameTime < backgroundFrameInterval) return;
    lastBackgroundFrameTime = time;
    drawBackground();
}

function updateBackgroundAnimation() {
    const shouldAnimate = !reducedMotion && !document.hidden;
    if (shouldAnimate && !backgroundAnimationRunning) {
        backgroundAnimationRunning = true;
        backgroundFrame = requestAnimationFrame(animateBackground);
    } else if (!shouldAnimate && backgroundAnimationRunning) {
        backgroundAnimationRunning = false;
        cancelAnimationFrame(backgroundFrame);
    }
}

if (backgroundContext) {
    window.addEventListener('resize', resizeBackgroundCanvas);
    document.addEventListener('visibilitychange', updateBackgroundAnimation);
    window.addEventListener('pagehide', () => {
        cancelAnimationFrame(backgroundFrame);
        document.removeEventListener('visibilitychange', updateBackgroundAnimation);
    }, { once: true });
    resizeBackgroundCanvas();
    updateBackgroundAnimation();
} else {
    console.error('No se pudo iniciar el lienzo de fondo.');
}
