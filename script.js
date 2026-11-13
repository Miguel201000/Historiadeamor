        const giftUnlockScreen = document.getElementById('giftUnlockScreen');
        const giftUnlockDate = new Date(2026, 10, 21);
        const giftPasswordHash = 'c53c4d988a0e0512306eeaf2bcee85ca07d8c399ff86585e66f52f2800787214';
        const giftPasswordForm = document.getElementById('giftPasswordForm');
        const giftPassword = document.getElementById('giftPassword');
        const giftPasswordFeedback = document.getElementById('giftPasswordFeedback');
        const giftTeaserButton = document.getElementById('giftTeaserButton');
        const giftTeaserMessage = document.getElementById('giftTeaserMessage');
        const developerAccessTrigger = document.getElementById('developerAccessTrigger');
        const developerAccessPanel = document.getElementById('developerAccessPanel');
        const developerAccessClose = document.getElementById('developerAccessClose');
        const giftTeaserMessages = [
            'Una cajita guarda una pregunta y una promesa pensada para nuestro futuro.',
            'Tres meses caben en una entrada de cine, pero la función es solo nuestra.',
            'Cada postal conserva un instante; juntas cuentan nuestro álbum.',
            'Cinco letras bastan para abrir el secreto que empieza con una pregunta.',
            'No todas las sorpresas se leen: algunas se descubren al raspar.',
            'Un frasco guarda pequeñas palabras listas para alegrarte el día.',
            'Hay palabras esperando en sobres para cuando llegue el momento adecuado.',
            'Ocho melodías hacen compañía a nuestra historia.'
        ];
        const giftCountdownUnits = {
            days: document.getElementById('giftDays'),
            hours: document.getElementById('giftHours'),
            minutes: document.getElementById('giftMinutes'),
            seconds: document.getElementById('giftSeconds')
        };
        const giftLockedContent = Array.from(document.body.children)
            .filter(element => element !== giftUnlockScreen && element.tagName !== 'SCRIPT')
            .map(element => ({ element, wasInert: element.inert }));
        let giftCountdownInterval;

        function unlockGift() {
            giftUnlockScreen.hidden = true;
            developerAccessTrigger.hidden = true;
            developerAccessPanel.hidden = true;
            document.body.classList.remove('gift-locked');
            giftLockedContent.forEach(({ element, wasInert }) => {
                element.inert = wasInert;
            });
            window.clearInterval(giftCountdownInterval);
            document.dispatchEvent(new Event('gift-unlocked'));
        }

        function updateGiftCountdown() {
            const remaining = giftUnlockDate - new Date();
            if (remaining <= 0) {
                unlockGift();
                return;
            }

            const totalSeconds = Math.floor(remaining / 1000);
            const values = {
                days: Math.floor(totalSeconds / 86400),
                hours: Math.floor((totalSeconds % 86400) / 3600),
                minutes: Math.floor((totalSeconds % 3600) / 60),
                seconds: totalSeconds % 60
            };

            Object.keys(giftCountdownUnits).forEach(unit => {
                giftCountdownUnits[unit].textContent = String(values[unit]).padStart(2, '0');
            });
        }

        document.body.classList.add('gift-locked');
        giftLockedContent.forEach(({ element }) => {
            element.inert = true;
        });
        updateGiftCountdown();
        if (!giftUnlockScreen.hidden) giftCountdownInterval = window.setInterval(updateGiftCountdown, 1000);

        giftTeaserButton.addEventListener('click', () => {
            const isOpening = giftTeaserMessage.hidden;
            if (isOpening) {
                const daysRemaining = Math.max(0, Math.ceil((giftUnlockDate - new Date()) / 86400000));
                const messageIndex = Math.max(0, Math.min(daysRemaining, giftTeaserMessages.length) - 1);
                giftTeaserMessage.textContent = giftTeaserMessages[messageIndex];
            }
            giftTeaserMessage.hidden = !isOpening;
            giftTeaserButton.setAttribute('aria-expanded', String(isOpening));
            giftTeaserButton.textContent = isOpening ? 'Cerrar la pista' : 'Descifrar pista de hoy 🗝️';
        });

        developerAccessTrigger.addEventListener('click', () => {
            developerAccessPanel.hidden = false;
            giftPassword.focus();
        });
        developerAccessClose.addEventListener('click', () => {
            developerAccessPanel.hidden = true;
            giftPasswordForm.reset();
            giftPasswordFeedback.textContent = '';
            developerAccessTrigger.focus();
        });
        developerAccessPanel.addEventListener('keydown', event => {
            if (event.key === 'Escape') developerAccessClose.click();
        });

        giftPasswordForm.addEventListener('submit', async event => {
            event.preventDefault();
            giftPasswordFeedback.textContent = '';

            if (!window.crypto || !window.crypto.subtle) {
                giftPasswordFeedback.textContent = 'Este navegador no permite validar la contraseña en esta conexión.';
                return;
            }

            try {
                const passwordBytes = new TextEncoder().encode(giftPassword.value);
                const passwordDigest = await window.crypto.subtle.digest('SHA-256', passwordBytes);
                const passwordHash = Array.from(new Uint8Array(passwordDigest), byte =>
                    byte.toString(16).padStart(2, '0')
                ).join('');

                if (passwordHash !== giftPasswordHash) {
                    giftPassword.value = '';
                    giftPasswordFeedback.textContent = 'Esa contraseña no es correcta. Inténtalo de nuevo.';
                    giftPassword.focus();
                    return;
                }

                unlockGift();
            } catch (error) {
                giftPasswordFeedback.textContent = 'No se pudo validar la contraseña. Recarga la página e inténtalo de nuevo.';
                console.error('No se pudo validar la contraseña del regalo.', error);
            }
        });

        const isTriviaView = new URLSearchParams(window.location.search).get('sorpresa') === '1';
        const isCompactDevice = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
        if (isTriviaView) document.body.classList.add('trivia-mode');

        const splashScreen = document.getElementById('splashScreen');
        const chapterNav = document.getElementById('chapterNav');
        const chapterThreeAudio = document.getElementById('chapterThreeAudio');
        const chapterThreeAudioSource = document.getElementById('chapterThreeAudioSource');
        const chapterThreeAudioStatus = document.getElementById('chapterThreeAudioStatus');
        const chapterPlaylistPlayer = document.getElementById('chapterPlaylistPlayer');
        const chapterPlaylistCurrent = document.getElementById('chapterPlaylistCurrent');
        const chapterPlaylist = document.getElementById('chapterPlaylist');
        const chapterPlaylistSkip = document.getElementById('chapterPlaylistSkip');
        const anniversaryLetter = document.getElementById('anniversaryLetter');
        const openAnniversaryVideoButton = document.getElementById('openAnniversaryVideo');
        const anniversaryPlayer = document.getElementById('anniversaryPlayer');
        const anniversaryVideo = document.getElementById('anniversaryVideo');
        const anniversaryVideoStatus = document.getElementById('anniversaryVideoStatus');
        let pausedMusicTracks = null;
        const chapterViews = {
            three: document.getElementById('chapterThree')
        };
        let isChapterThreeFlowActive = false;
        const chapterPlaylistTracks = [
            { src: 'audios/cancionaleja (online-audio-converter.com).mp3', title: 'Nuestra canción de 3 meses' },
            { src: 'musica3meses/WhatsApp Audio 2026-11-11 at 8.32.14 PM.mp3', title: 'Audio sorpresa' },
            { src: 'musica3meses/sonido.mp3', title: 'Melodía sorpresa 1' },
            { src: 'musica3meses/sonido1.mp3', title: 'Melodía sorpresa 2' },
            { src: 'musica3meses/sonido2.mp3', title: 'Melodía sorpresa 3' },
            { src: 'musica3meses/sonido3.mp3', title: 'Melodía sorpresa 4' },
            { src: 'musica3meses/sonido4.mp3', title: 'Melodía sorpresa 5' },
            { src: 'musica3meses/sonido5.mp3', title: 'Melodía sorpresa 6' }
        ];
        let currentChapterTrackIndex = 0;
        let previousRandomTrackIndex = -1;

        function setChapterTrack(index) {
            const track = chapterPlaylistTracks[index];
            if (!track) return;

            currentChapterTrackIndex = index;
            chapterThreeAudioSource.src = track.src.split('/').map(encodeURIComponent).join('/');
            if (isChapterThreeFlowActive) chapterThreeAudio.load();
            chapterPlaylistCurrent.textContent = track.title;
            chapterPlaylist.querySelectorAll('button').forEach((button, buttonIndex) => {
                button.setAttribute('aria-pressed', String(buttonIndex === index));
            });
        }

        function playChapterTrack(index) {
            if (!isChapterThreeFlowActive) return;
            setChapterTrack(index);
            chapterThreeAudio.play().then(() => {
                chapterThreeAudioStatus.textContent = '';
            }).catch(error => {
                chapterThreeAudioStatus.textContent = 'Toca reproducir en los controles para escuchar la canción.';
                if (!error || (error.name !== 'NotAllowedError' && error.name !== 'AbortError')) {
                    console.error('No se pudo reproducir la canción de la playlist.', error);
                }
            });
        }

        function playNextRandomChapterTrack() {
            const randomTrackIndices = chapterPlaylistTracks.map((_, index) => index).filter(index => index > 0 && index !== previousRandomTrackIndex);
            const nextTrackIndex = randomTrackIndices[Math.floor(Math.random() * randomTrackIndices.length)];
            previousRandomTrackIndex = nextTrackIndex;
            playChapterTrack(nextTrackIndex);
        }

        chapterPlaylistTracks.forEach((track, index) => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-pressed', 'false');
            const number = document.createElement('span');
            number.className = 'chapter-playlist-number';
            number.setAttribute('aria-hidden', 'true');
            number.textContent = String(index + 1).padStart(2, '0');
            const title = document.createElement('span');
            title.textContent = track.title;
            button.append(number, title);
            button.addEventListener('click', () => {
                if (index > 0) previousRandomTrackIndex = index;
                playChapterTrack(index);
            });
            item.append(button);
            chapterPlaylist.append(item);
        });

        setChapterTrack(0);
        chapterPlaylistSkip.addEventListener('click', playNextRandomChapterTrack);
        chapterThreeAudio.addEventListener('playing', () => {
            chapterThreeAudioStatus.textContent = '';
        });
        chapterThreeAudio.addEventListener('ended', () => {
            if (isChapterThreeFlowActive) playNextRandomChapterTrack();
        });

        function openAnniversaryVideo() {
            if (openAnniversaryVideoButton.disabled) return;
            openAnniversaryVideoButton.disabled = true;
            openAnniversaryVideoButton.setAttribute('aria-expanded', 'true');
            anniversaryLetter.hidden = true;
            anniversaryPlayer.hidden = false;
            anniversaryVideo.focus();
        }

        openAnniversaryVideoButton.addEventListener('click', openAnniversaryVideo);
        anniversaryVideo.addEventListener('error', () => {
            anniversaryVideoStatus.textContent = 'No se pudo cargar el video. Revisa que aleja.mp4 esté en la carpeta video.';
        });
        anniversaryVideo.addEventListener('playing', () => {
            anniversaryVideo.closest('.anniversary-video-frame').classList.add('is-playing');
            if (pausedMusicTracks !== null) return;
            pausedMusicTracks = [chapterThreeAudio].filter(track => !track.paused && !track.ended);
            pausedMusicTracks.forEach(track => track.pause());
        });
        anniversaryVideo.addEventListener('ended', () => {
            if (pausedMusicTracks === null) return;
            const tracksToResume = pausedMusicTracks;
            pausedMusicTracks = null;
            tracksToResume.forEach(track => {
                track.play().catch(error => {
                    chapterThreeAudioStatus.textContent = 'El video terminó. Toca reproducir en los controles para reanudar la canción.';
                    if (!error || (error.name !== 'NotAllowedError' && error.name !== 'AbortError')) {
                        console.error('No se pudo reanudar la música después del video.', error);
                    }
                });
            });
        });
        ['pause', 'ended'].forEach(eventName => {
            anniversaryVideo.addEventListener(eventName, () => {
                anniversaryVideo.closest('.anniversary-video-frame').classList.remove('is-playing');
            });
        });

        chapterThreeAudio.addEventListener('playing', () => chapterPlaylistPlayer.classList.add('is-playing'));
        ['pause', 'ended'].forEach(eventName => {
            chapterThreeAudio.addEventListener(eventName, () => chapterPlaylistPlayer.classList.remove('is-playing'));
        });

        function selectChapter(chapter, showSplash = false) {
            Object.entries(chapterViews).forEach(([name, view]) => {
                const isActive = name === chapter;
                view.classList.toggle('is-active', isActive);
                view.setAttribute('aria-hidden', String(!isActive));
            });
            document.querySelectorAll('[data-chapter]').forEach(button => {
                if (button.closest('.chapter-nav')) {
                    button.setAttribute('aria-pressed', String(button.dataset.chapter === chapter));
                }
            });
            document.body.classList.add('chapter-selected');
            isChapterThreeFlowActive = chapter === 'three';
            chapterNav.hidden = false;

            if (chapter === 'three') {
                observeMemoryGallery();
                chapterThreeAudio.pause();
                chapterThreeAudio.currentTime = 0;
                previousRandomTrackIndex = -1;
                playChapterTrack(0);
            } else {
                chapterThreeAudio.pause();
            }

            if (showSplash) {
                splashScreen.hidden = false;
                requestAnimationFrame(() => splashScreen.classList.remove('is-leaving'));
            } else {
                splashScreen.classList.add('is-leaving');
                window.setTimeout(() => { splashScreen.hidden = true; }, 650);
            }
        }

        chapterThreeAudio.addEventListener('error', () => {
            const track = chapterPlaylistTracks[currentChapterTrackIndex];
            chapterThreeAudioStatus.textContent = `No se pudo cargar "${track.title}". Revisa el archivo de audio de la playlist.`;
        });

        if (isTriviaView) {
            splashScreen.hidden = true;
            chapterNav.hidden = true;
        } else {
            document.querySelectorAll('[data-chapter]').forEach(button => {
                button.addEventListener('click', () => selectChapter(button.dataset.chapter));
            });
            chapterNav.hidden = true;
        }

        const letterModal = document.getElementById('letterModal');
        const ringModal = document.getElementById('ringModal');
        const emergencyLoveModal = document.getElementById('emergencyLoveModal');
        let lastModalTrigger = null;

        function openModal(modal, trigger) {
            lastModalTrigger = trigger;
            modal.hidden = false;
            document.body.classList.add('modal-open');
            window.requestAnimationFrame(() => {
                if (modal === ringModal) modal.classList.add('is-open');
                modal.querySelector('.modal-close').focus();
            });
        }

        function closeModal(modal) {
            modal.hidden = true;
            modal.classList.remove('is-open');
            if (modal === ringModal) document.body.classList.remove('ring-reveal');
            if (document.querySelector('.letter-modal:not([hidden]), .ring-modal:not([hidden]), .emergency-love-modal:not([hidden])') === null) {
                document.body.classList.remove('modal-open');
            }
            if (lastModalTrigger) lastModalTrigger.focus();
        }

        const happinessNotes = [
            'Tu sonrisa tiene una forma preciosa de hacer mejor cualquier día. 💞',
            'Me encanta compartir la vida contigo, incluso en los momentos más sencillos. ☁️',
            'Eres una persona increíble y mereces que hoy te pasen cosas bonitas. ✨',
            'Un recuerdo para guardar: cada risa contigo se queda conmigo. 💞',
            'Estoy orgulloso de todo lo que eres y de todo lo que sigues logrando. 🌷',
            'Si este día se pone difícil, recuerda que no tienes que poder con todo a la vez. Aquí estoy para ti. 🤍',
            'Gracias por hacer que hasta un día cualquiera se sienta especial. 🌅',
            'Tu manera de ser hace más bonito todo lo que te rodea. 🌸',
            'Ojalá hoy encuentres muchos motivos para sonreír; aquí va uno: te amo demasiado. 💌',
            'Cada aventura a tu lado se convierte en mi nuevo recuerdo favorito. 🧭',
            'No tienes que ser perfecta para ser maravillosa: ya lo eres siendo tú. ✨',
            'Me encanta cómo podemos reírnos juntos hasta por las cosas más pequeñas. ☁️',
            'Si pudiera elegir un lugar feliz, elegiría cualquier lugar donde estés tú. 🏡',
            'Estoy aquí para celebrar tus logros y acompañarte en los días pesados. 🤍',
            'Tu corazón bonito es uno de mis lugares favoritos. 💗',
            'Un abrazo apretado en forma de notita, para cuando lo necesites. 🫂',
            'Qué suerte la mía poder escribir nuestra historia contigo, capítulo a capítulo. 📖',
            'Nunca olvides lo mucho que vales y todo lo lindo que mereces. 🌷',
            'Me haces feliz con solo ser parte de mis días. 💕',
            'Hoy también te elijo, y me encanta seguir construyendo esto contigo. 💍'
        ];
        let previousHappinessNote = -1;
        const happinessJar = document.getElementById('happinessJar');
        const happinessNote = document.getElementById('happinessNote');

        happinessJar.addEventListener('click', () => {
            const availableNotes = happinessNotes.map((_, index) => index).filter(index => index !== previousHappinessNote);
            previousHappinessNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
            happinessNote.textContent = happinessNotes[previousHappinessNote];
            happinessNote.hidden = false;
            happinessNote.classList.remove('is-flying');
            void happinessNote.offsetWidth;
            happinessNote.classList.add('is-flying');
        });

        const memoryPhotoFiles = [
            'WhatsApp Image 2026-11-10 at 7.30.00 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.00 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.01 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.01 PM (2).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.01 PM (3).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.01 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.02 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.02 PM (2).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.02 PM (3).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.02 PM (4).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.02 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.03 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.03 PM (2).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.03 PM (3).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.03 PM (4).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.03 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.04 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.04 PM (2).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.04 PM (3).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.04 PM (4).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.04 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.05 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.05 PM (2).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.05 PM (3).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.05 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.06 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.06 PM (2).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.06 PM (3).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.06 PM (4).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.06 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.07 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.07 PM.jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.08 PM (1).jpeg',
            'WhatsApp Image 2026-11-10 at 7.30.08 PM.jpeg'
        ];
        const memoryAlbum = document.getElementById('memoryAlbum');
        const memoryGalleryStage = document.getElementById('memoryGalleryStage');
        const memoryPhotoTitles = [
            'Un día para recordar ✨',
            'Contigo cualquier lugar es hogar',
            'Nuestra aventura favorita',
            'Risas que guardo conmigo',
            'Un instante solo nuestro',
            'Mi persona favorita'
        ];
        let memoryGalleryInitialized = false;
        let galleryLoadObserver = null;

        function createMemoryPhoto(file, index) {
            const card = document.createElement('figure');
            card.className = 'memory-photo-card';
            card.dataset.memoryNumber = String(index + 1).padStart(2, '0');

            const image = document.createElement('img');
            image.src = `Imagenes3meses/${encodeURIComponent(file)}`;
            image.alt = `Recuerdo de pareja ${index + 1}`;
            image.loading = 'lazy';
            image.decoding = 'async';

            const caption = document.createElement('figcaption');
            caption.className = 'memory-photo-caption';
            caption.textContent = memoryPhotoTitles[index % memoryPhotoTitles.length];
            card.append(image, caption);
            return card;
        }

        function initializeMemoryGallery() {
            if (memoryGalleryInitialized) return;
            memoryGalleryInitialized = true;
            memoryPhotoFiles.forEach((file, index) => {
                memoryAlbum.append(createMemoryPhoto(file, index));
            });
        }

        function observeMemoryGallery() {
            if (isTriviaView || memoryGalleryInitialized || galleryLoadObserver) return;
            if (!('IntersectionObserver' in window)) {
                initializeMemoryGallery();
                return;
            }

            galleryLoadObserver = new IntersectionObserver(entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                initializeMemoryGallery();
                galleryLoadObserver.disconnect();
                galleryLoadObserver = null;
            }, { rootMargin: '800px 0px' });
            galleryLoadObserver.observe(memoryGalleryStage);
            window.addEventListener('pagehide', () => {
                if (galleryLoadObserver) galleryLoadObserver.disconnect();
            }, { once: true });
        }

        function setupScratchCard(card) {
            const scratchCanvas = card.querySelector('.scratch-canvas');
            const context = scratchCanvas.getContext('2d', { willReadFrequently: true });
            const revealButton = card.querySelector('.scratch-reveal-button');
            let isScratching = false;

            function drawScratchSurface() {
                const bounds = scratchCanvas.getBoundingClientRect();
                if (!bounds.width || !bounds.height) return;

                const pixelRatio = window.devicePixelRatio || 1;
                scratchCanvas.width = Math.round(bounds.width * pixelRatio);
                scratchCanvas.height = Math.round(bounds.height * pixelRatio);
                context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                const surface = context.createLinearGradient(0, 0, bounds.width, bounds.height);
                surface.addColorStop(0, '#f9c9b8');
                surface.addColorStop(0.48, '#d98591');
                surface.addColorStop(1, '#a95875');
                context.globalCompositeOperation = 'source-over';
                context.fillStyle = surface;
                context.fillRect(0, 0, bounds.width, bounds.height);
                context.fillStyle = 'rgba(255, 248, 236, 0.22)';
                for (let x = -bounds.height; x < bounds.width; x += 22) {
                    context.beginPath();
                    context.moveTo(x, 0);
                    context.lineTo(x + bounds.height, bounds.height);
                    context.lineTo(x + bounds.height + 8, bounds.height);
                    context.lineTo(x + 8, 0);
                    context.fill();
                }
                context.fillStyle = '#fff8ef';
                context.font = '600 16px Montserrat, sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('Rasca aquí ✨', bounds.width / 2, bounds.height / 2);
            }

            function eraseAt(event) {
                const bounds = scratchCanvas.getBoundingClientRect();
                const x = event.clientX - bounds.left;
                const y = event.clientY - bounds.top;
                context.globalCompositeOperation = 'destination-out';
                context.beginPath();
                context.arc(x, y, 22, 0, Math.PI * 2);
                context.fill();
            }

            function revealIfScratchedEnough() {
                if (card.classList.contains('is-revealed')) return;
                const pixels = context.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
                let transparentPixels = 0;
                const pixelCount = pixels.length / 4;
                for (let index = 3; index < pixels.length; index += 4) {
                    if (pixels[index] < 128) transparentPixels++;
                }
                if (transparentPixels / pixelCount >= 0.45) {
                    revealScratchCard(card);
                }
            }

            scratchCanvas.addEventListener('pointerdown', event => {
                if (card.classList.contains('is-revealed')) return;
                isScratching = true;
                scratchCanvas.setPointerCapture(event.pointerId);
                eraseAt(event);
            });
            scratchCanvas.addEventListener('pointermove', event => {
                if (isScratching) eraseAt(event);
            });
            scratchCanvas.addEventListener('pointerup', () => {
                if (!isScratching) return;
                isScratching = false;
                revealIfScratchedEnough();
            });
            scratchCanvas.addEventListener('pointercancel', () => {
                isScratching = false;
            });
            revealButton.addEventListener('click', () => revealScratchCard(card));

            if ('ResizeObserver' in window) {
                new ResizeObserver(drawScratchSurface).observe(scratchCanvas);
            } else {
                window.addEventListener('resize', drawScratchSurface);
            }
            drawScratchSurface();
        }

        function revealScratchCard(card) {
            if (card.classList.contains('is-revealed')) return;
            card.classList.add('is-revealed');
            card.querySelector('.scratch-reveal-button').setAttribute('aria-pressed', 'true');
            document.querySelector('.scratch-status').textContent = card.querySelector('.scratch-prize').textContent;
        }

        document.querySelectorAll('.scratch-card').forEach(setupScratchCard);

        document.querySelectorAll('.secret-reason-card').forEach(card => {
            card.addEventListener('click', () => {
                const isFlipped = card.classList.toggle('is-flipped');
                card.setAttribute('aria-pressed', String(isFlipped));
            });
        });

        document.querySelectorAll('.bucket-list-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) return;
                const listItem = checkbox.closest('.bucket-list-item');
                const heart = document.createElement('span');
                heart.className = 'bucket-heart';
                heart.setAttribute('aria-hidden', 'true');
                heart.textContent = ['♥', '♡', '💖'][Math.floor(Math.random() * 3)];
                listItem.appendChild(heart);
                window.setTimeout(() => heart.remove(), 1500);
            });
        });

        document.getElementById('emergencyLoveTrigger').addEventListener('click', event => {
            openModal(emergencyLoveModal, event.currentTarget);
        });
        document.querySelectorAll('[data-close-emergency-love]').forEach(button => {
            button.addEventListener('click', () => closeModal(emergencyLoveModal));
        });

        document.querySelectorAll('[data-letter]').forEach(button => {
            button.addEventListener('click', () => {
                const letters = {
                    miss: {
                        title: 'Cuando me extrañes 💌',
                        text: 'Cierra los ojos un segundo e imagina que te doy uno de esos abrazos que hacen que todo lo demás se detenga. Aunque no esté justo a tu lado, siempre puedes contar con mi cariño. Ya falta menos para volver a vernos y crear otro recuerdo juntos.'
                    },
                    difficult: {
                        title: 'Cuando tengamos un día difícil 🕊️',
                        text: 'Un día complicado no cambia todo lo bonito que hemos construido. No somos tú contra mí: somos los dos buscando el mismo lado. Respiremos, hablemos con cariño y recordemos que siempre podemos volver a elegirnos.'
                    },
                    trip: {
                        title: 'En nuestro próximo viaje 🌅',
                        text: 'Que este sea el primero de muchos lugares nuevos, fotos espontáneas y planes que se alargan porque estamos juntos. No importa tanto el destino; mi parte favorita de cualquier aventura siempre será compartirla contigo.'
                    }
                };
                const letter = letters[button.dataset.letter];
                document.getElementById('letterModalTitle').textContent = letter.title;
                document.getElementById('letterModalText').textContent = letter.text;
                openModal(letterModal, button);
            });
        });

        document.getElementById('riddleForm').addEventListener('submit', event => {
            event.preventDefault();
            const answer = document.getElementById('riddleAnswer').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleUpperCase('es');
            const feedback = document.getElementById('riddleFeedback');
            const secretLetter = document.getElementById('secretLetter');
            if (answer === 'ALEJA') {
                feedback.textContent = '¡La llave era tu nombre! Este secreto es para ti ✨';
                secretLetter.hidden = false;
                if (typeof confetti === 'function') {
                    confetti({ particleCount: isCompactDevice ? 24 : 50, spread: 65, origin: { y: 0.7 }, colors: ['#ff8296', '#ffd6a2', '#ffffff'], disableForReducedMotion: true });
                }
            } else {
                feedback.textContent = 'Casi, mi amor. Son cinco letras y es la protagonista de esta historia 💕';
            }
        });

        document.getElementById('openRing').addEventListener('click', event => {
            document.body.classList.add('ring-reveal');
            openModal(ringModal, event.currentTarget);
            if (typeof confetti === 'function') {
                const options = {
                    particleCount: isCompactDevice ? 32 : 70,
                    spread: 100,
                    startVelocity: 38,
                    origin: { y: 0.65 },
                    colors: ['#ff8296', '#ffd6a2', '#fff4df', '#dc7890'],
                    disableForReducedMotion: true
                };
                if (typeof confetti.shapeFromText === 'function') {
                    options.shapes = [confetti.shapeFromText({ text: '💖', scalar: 1.4 })];
                }
                confetti(options);
                window.setTimeout(() => confetti({ ...options, particleCount: isCompactDevice ? 18 : 38, origin: { x: 0.25, y: 0.72 } }), 240);
                window.setTimeout(() => confetti({ ...options, particleCount: isCompactDevice ? 18 : 38, origin: { x: 0.75, y: 0.72 } }), 440);
            }
        });

        const chapterFourButton = document.getElementById('chapterFourButton');
        const chapterFourMessage = document.getElementById('chapterFourMessage');
        chapterFourButton.addEventListener('click', () => {
            const isOpening = chapterFourMessage.hidden;
            chapterFourMessage.hidden = !isOpening;
            chapterFourButton.setAttribute('aria-expanded', String(isOpening));
        });

        document.querySelectorAll('[data-close-letter]').forEach(button => {
            button.addEventListener('click', () => closeModal(letterModal));
        });
        document.querySelectorAll('[data-close-ring]').forEach(button => {
            button.addEventListener('click', () => closeModal(ringModal));
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                if (!letterModal.hidden) closeModal(letterModal);
                if (!ringModal.hidden) closeModal(ringModal);
                if (!emergencyLoveModal.hidden) closeModal(emergencyLoveModal);
            }
        });

        // Contador del capítulo de tres meses.
        const startDate = new Date('2026-08-21T00:00:00');

        function updateTimer() {
            const now = new Date();
            const diff = now - startDate;

            if (diff < 0) {
                ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
                    document.getElementById(`${unit}-three`).textContent = '00';
                });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            [days, hours, minutes, seconds].forEach((value, index) => {
                const unit = ['days', 'hours', 'minutes', 'seconds'][index];
                const formatted = String(value).padStart(2, '0');
                document.getElementById(`${unit}-three`).textContent = formatted;
            });
        }

        let timerInterval = null;
        function updateTimerVisibility() {
            const canUpdateTimer = !isTriviaView && giftUnlockScreen.hidden;
            if (canUpdateTimer) updateTimer();
            const shouldRunTimer = canUpdateTimer && !document.hidden;
            if (shouldRunTimer && timerInterval === null) {
                timerInterval = window.setInterval(updateTimer, 1000);
            } else if (!shouldRunTimer && timerInterval !== null) {
                window.clearInterval(timerInterval);
                timerInterval = null;
            }
        }
        document.addEventListener('visibilitychange', updateTimerVisibility);
        document.addEventListener('gift-unlocked', updateTimerVisibility);
        updateTimerVisibility();

        // 4. ANIMACIÓN CANVAS DE FONDO (Corazones flotantes)
        const canvas = document.getElementById('canvas-bg');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let bgFrame = 0;
        let lastBgFrameTime = 0;
        let bgAnimationRunning = false;
        const bgFrameInterval = isCompactDevice ? 1000 / 24 : 1000 / 30;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const particleCount = reducedMotion || isTriviaView ? 0 : (isCompactDevice ? 12 : 28);
            particles = Array.from({ length: particleCount }, () => new Particle());
            drawBg();
        }

        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 12 + 6;
                this.speedY = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            update() {
                this.y -= this.speedY;
                if (this.y < -20) {
                    this.y = canvas.height + 20;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#ff4b72';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function drawBg() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        }

        function animateBg(time) {
            if (!bgAnimationRunning) return;
            bgFrame = requestAnimationFrame(animateBg);
            if (time - lastBgFrameTime < bgFrameInterval) return;
            lastBgFrameTime = time;
            drawBg();
        }

        function updateBgAnimation() {
            const shouldAnimate = !reducedMotion && !isTriviaView && !document.hidden && giftUnlockScreen.hidden;
            if (shouldAnimate && !bgAnimationRunning) {
                bgAnimationRunning = true;
                bgFrame = requestAnimationFrame(animateBg);
            } else if (!shouldAnimate && bgAnimationRunning) {
                bgAnimationRunning = false;
                cancelAnimationFrame(bgFrame);
            }
        }

        document.addEventListener('visibilitychange', updateBgAnimation);
        document.addEventListener('gift-unlocked', updateBgAnimation);
        resizeCanvas();
        updateBgAnimation();

        // Banco editable: agrega objetos con pregunta, opciones y respuesta correcta.
        const loveQuestions = [
            { question: '¿Qué convierte un día sencillo en uno especial?', options: ['Compartirlo contigo', 'Un día libre', 'Un regalo caro', 'Dormir hasta tarde'], answer: 'Compartirlo contigo' },
            { question: '¿Cuál es nuestro plan perfecto para una tarde juntos?', options: ['Una tarde de películas', 'Hacer trámites', 'Ordenar el clóset', 'Salir Juntos'], answer: 'Salir Juntos' },
            { question: '¿Qué es lo que más quiero seguir coleccionando contigo?', options: ['Recuerdos bonitos', 'Tazas', 'Puntos de viaje', 'Besos'], answer: 'Recuerdos bonitos' },
            { question: '¿Cuál es el mejor lugar para recibir un abrazo?', options: ['A tu lado', 'En el colegio', 'En el supermercado', 'En la fila del banco'], answer: 'A tu lado' },
            { question: '¿Qué postre sabe mejor si lo compartimos?', options: ['Cualquiera contigo', 'Solo gelatina', 'Ninguno', 'Yo'], answer: 'Cualquiera contigo' },
            { question: '¿Qué quiero para nuestra próxima salida?', options: ['Que tú la elijas', 'Quedarme trabajando', 'Irme a zarsal', 'No salir nunca'], answer: 'Que tú la elijas' },
            { question: '¿Qué hace que nuestra historia sea única?', options: ['Que la escribimos juntos', 'Que tiene muchas páginas', 'Que es una película', 'Que tiene un final'], answer: 'Que la escribimos juntos' },
            { question: '¿Qué significa un abrazo gigante?', options: ['Un montón de cariño', 'Un saludo formal', 'Una subida de grados', 'Una despedida'], answer: 'Un montón de cariño' },
            { question: '¿Qué es lo que más me gusta de ti?', options: ['Tu sonrisa', 'Tu risa', 'Tu forma de ser', 'Todo lo anterior'], answer: 'Todo lo anterior' },
            { question: '¿Cuál es el amor de tu vida?', options: ['Sebastian', 'Osuna', 'Tu primo', 'Estar contigo'], answer: 'Estar contigo' }
        ];
        const triviaQuestionsPerGame = 5;
        const loveCoupons = ['Abrazo gigante 🤗', 'Helado o postre 🍦', 'Tarde de películas 🎬', 'Muchos Besitos'];
        let currentTriviaQuestions = [];
        let currentTriviaIndex = 0;
        let triviaScore = 0;
        let answerLocked = false;

        function shuffle(items) {
            const shuffled = [...items];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        function startTrivia() {
            currentTriviaQuestions = shuffle(loveQuestions).slice(0, Math.min(triviaQuestionsPerGame, loveQuestions.length));
            currentTriviaIndex = 0;
            triviaScore = 0;
            answerLocked = false;
            document.getElementById('prizeSection').classList.add('trivia-hidden');
            document.getElementById('triviaFeedback').textContent = '';
            renderTriviaQuestion();
        }

        function renderTriviaQuestion() {
            const question = currentTriviaQuestions[currentTriviaIndex];
            document.getElementById('triviaProgress').textContent = `Pregunta ${currentTriviaIndex + 1} de ${currentTriviaQuestions.length} · Aciertos: ${triviaScore}`;
            document.getElementById('triviaQuestion').textContent = question.question;
            document.getElementById('triviaFeedback').textContent = '';
            const answers = document.getElementById('answerList');
            answers.replaceChildren();
            shuffle(question.options).forEach(option => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'answer-option';
                button.textContent = option;
                button.addEventListener('click', () => answerTrivia(button, option, question.answer));
                answers.append(button);
            });
            answerLocked = false;
        }

        function answerTrivia(selectedButton, selectedAnswer, correctAnswer) {
            if (answerLocked) return;
            answerLocked = true;
            const options = document.querySelectorAll('.answer-option');
            options.forEach(button => {
                button.disabled = true;
                if (button.textContent === correctAnswer) button.classList.add('correct');
            });
            const feedback = document.getElementById('triviaFeedback');
            if (selectedAnswer === correctAnswer) {
                triviaScore++;
                feedback.textContent = '¡Correcto! Se nota cuánto nos queremos 💖';
                selectedButton.classList.add('correct');
                const triviaCard = document.querySelector('.trivia-card');
                triviaCard.classList.remove('celebrate');
                void triviaCard.offsetWidth;
                triviaCard.classList.add('celebrate');
                confetti({ particleCount: isCompactDevice ? 35 : 75, spread: 75, origin: { y: 0.65 }, colors: ['#ff4b72', '#a855f7', '#ffd166', '#ffffff'], disableForReducedMotion: true });
            } else {
                selectedButton.classList.add('incorrect');
                feedback.textContent = 'Casi 💕 ¡La respuesta correcta está iluminada!';
            }
            window.setTimeout(() => {
                currentTriviaIndex++;
                if (currentTriviaIndex < currentTriviaQuestions.length) {
                    renderTriviaQuestion();
                } else if (triviaScore === currentTriviaQuestions.length) {
                    showLoveCoupons();
                } else {
                    document.getElementById('triviaProgress').textContent = `Partida terminada · ${triviaScore} de ${currentTriviaQuestions.length} aciertos`;
                    document.getElementById('triviaQuestion').textContent = '¡Un poquito más y desbloqueas el premio secreto! 💌';
                    document.getElementById('answerList').replaceChildren();
                    document.getElementById('triviaFeedback').innerHTML = 'Inténtalo de nuevo para ganar tus cupones ✨';
                    const retryButton = document.createElement('button');
                    retryButton.type = 'button';
                    retryButton.className = 'restart-button';
                    retryButton.textContent = 'Volver a jugar 💞';
                    retryButton.addEventListener('click', startTrivia);
                    document.getElementById('answerList').append(retryButton);
                }
            }, 950);
        }

        function showLoveCoupons() {
            document.getElementById('triviaProgress').textContent = `¡${triviaScore} de ${currentTriviaQuestions.length} respuestas correctas!`;
            document.getElementById('triviaQuestion').textContent = '¡Lo lograste! Te ganaste todos estos apapachos 💝';
            document.getElementById('answerList').replaceChildren();
            document.getElementById('triviaFeedback').textContent = '¡Trivia completada con éxito!';
            const couponList = document.getElementById('couponList');
            couponList.replaceChildren();
            loveCoupons.forEach(couponName => {
                const coupon = document.createElement('article');
                coupon.className = 'coupon';
                const title = document.createElement('h3');
                title.textContent = couponName;
                const redeemButton = document.createElement('button');
                redeemButton.type = 'button';
                redeemButton.className = 'coupon-button';
                redeemButton.textContent = 'Canjear cupón';
                redeemButton.addEventListener('click', () => {
                    redeemButton.disabled = true;
                    redeemButton.textContent = '¡Canjeado! 💖';
                    title.textContent = `${couponName} · ¡A disfrutar!`;
                    confetti({ particleCount: isCompactDevice ? 22 : 45, spread: 55, origin: { y: 0.7 }, colors: ['#ff4b72', '#ffd166', '#ffffff'], disableForReducedMotion: true });
                });
                coupon.append(title, redeemButton);
                couponList.append(coupon);
            });
            document.getElementById('prizeSection').classList.remove('trivia-hidden');
            confetti({ particleCount: isCompactDevice ? 75 : 150, spread: 110, origin: { y: 0.6 }, colors: ['#ff4b72', '#a855f7', '#ffd166', '#ffffff'], disableForReducedMotion: true });
        }

        document.getElementById('restartTrivia').addEventListener('click', startTrivia);
        if (isTriviaView) startTrivia();
