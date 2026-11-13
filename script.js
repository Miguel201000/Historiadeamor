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
            'Una cifra desciende mientras otra avanza; ambas nacieron del mismo instante.',
            'Hay un cielo trazado a mano donde cada punto prefiere contar algo.',
            'Tres caminos se mueven sin abandonar el lugar; repiten el viaje para que no termine.',
            'Lo cubierto no se abre con llave, sino con el gesto que suele borrar.',
            'Ocho voces comparten una ruta, aunque solo una puede sonar a la vez.',
            'Un sello de cera guarda lo que no es papel, y cede cuando cambia el modo de tocarlo.',
            'Hay una pregunta que no se resuelve buscando afuera, sino reconociendo a quien está en cada capítulo.',
            'Una sola constelación cabe en recuerdos que el azar no pudo ordenar.',
            'La última caja no guarda lo que brilla: guarda una pregunta para el futuro.',
            'No busques lomo ni páginas: dos capítulos se pliegan en una historia que todavía se escribe.'
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
                const messageIndex = Math.max(0, daysRemaining - 1) % giftTeaserMessages.length;
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
        const chapterViews = {
            two: document.getElementById('chapterTwo'),
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
                document.getElementById('audioTrack').pause();
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
            'Tu sonrisa tiene una forma preciosa de hacer mejor cualquier día. 💛',
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
            'Mi persona favorita 💛'
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
            const nextIdea = availableIdeas[Math.floor(Math.random() * availableIdeas.length)];
            previousDateIdea = nextIdea;
            const idea = document.getElementById('dateIdea');
            idea.classList.remove('is-changing');
            void idea.offsetWidth;
            idea.textContent = dateIdeas[nextIdea];
            idea.classList.add('is-changing');
        });

        // 1. FECHA DEL CONTADOR (21 de agosto; cumple dos meses el 21 de octubre)
        const startDate = new Date('2026-08-21T00:00:00');

        function updateTimer() {
            const now = new Date();
            const diff = now - startDate;

            if (diff < 0) {
                ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
                    document.getElementById(unit).textContent = '00';
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
                document.getElementById(unit).textContent = formatted;
                document.getElementById(`${unit}-three`).textContent = formatted;
            });
        }

        let timerInterval = null;
        function updateTimerVisibility() {
            const shouldRunTimer = !isTriviaView && !document.hidden && giftUnlockScreen.hidden;
            if (shouldRunTimer && timerInterval === null) {
                updateTimer();
                timerInterval = window.setInterval(updateTimer, 1000);
            } else if (!shouldRunTimer && timerInterval !== null) {
                window.clearInterval(timerInterval);
                timerInterval = null;
            }
        }
        document.addEventListener('visibilitychange', updateTimerVisibility);
        document.addEventListener('gift-unlocked', updateTimerVisibility);
        updateTimerVisibility();

        // 2. REPRODUCTOR DE MÚSICA
        const audio = document.getElementById('audioTrack');
        const vinyl = document.getElementById('vinyl');
        const playBtn = document.getElementById('playBtn');
        const playbackStatus = document.getElementById('playback-status');
        const playbackStateKey = 'regalo-musica-reproduccion';
        let savedPlayback = null;
        const voiceAudio = document.getElementById('voiceAudio');
        const voiceStatus = document.getElementById('voice-status');

        voiceAudio.addEventListener('error', () => {
            voiceStatus.innerText = 'No se pudo cargar el mensajito de voz. Inténtalo de nuevo más tarde.';
        });
        voiceAudio.addEventListener('playing', () => {
            document.getElementById('voiceAudioPlayer').classList.add('is-playing');
            voiceStatus.textContent = '';
        });
        ['pause', 'ended'].forEach(eventName => {
            voiceAudio.addEventListener(eventName, () => {
                document.getElementById('voiceAudioPlayer').classList.remove('is-playing');
            });
        });

        try {
            savedPlayback = JSON.parse(localStorage.getItem(playbackStateKey) || 'null');
        } catch (error) {
            console.error('No se pudo recuperar el estado de la música.', error);
            playbackStatus.innerText = 'No se pudo recuperar el estado de la música.';
        }
        if (savedPlayback && savedPlayback.shouldPlay) audio.preload = 'metadata';

        function savePlaybackState(shouldPlay = !audio.paused) {
            try {
                localStorage.setItem(playbackStateKey, JSON.stringify({
                    shouldPlay,
                    currentTime: audio.currentTime
                }));
            } catch (error) {
                console.error('No se pudo guardar el estado de la música.', error);
                playbackStatus.innerText = 'No se pudo guardar el progreso de la canción.';
            }
        }

        function updatePlaybackUI(isPlaying) {
            playBtn.innerText = isPlaying ? '❚❚' : '▶';
            playBtn.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
            vinyl.style.animationPlayState = isPlaying ? 'running' : 'paused';
            document.querySelector('.music-player').classList.toggle('is-playing', isPlaying);
        }

        function getAudioErrorMessage() {
            if (!audio.error) {
                return 'No se pudo cargar Cancion.mp3. Revisa la conexión e inténtalo de nuevo.';
            }

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
                    return 'No se pudo cargar Cancion.mp3. Revisa que esté junto a index.html.';
            }
        }

        async function playAudio() {
            try {
                await audio.play();
                playbackStatus.innerText = '';
            } catch (error) {
                updatePlaybackUI(false);
                if (error && error.name === 'NotAllowedError') {
                    playbackStatus.innerText = 'Toca ▶ para reanudar la música.';
                } else if (error && error.name === 'AbortError') {
                    playbackStatus.innerText = 'La reproducción se interrumpió. Toca ▶ para intentarlo de nuevo.';
                } else if (audio.error || (error && error.name === 'NotSupportedError')) {
                    playbackStatus.innerText = getAudioErrorMessage();
                } else {
                    playbackStatus.innerText = 'No se pudo iniciar el audio. Revisa la salida de sonido e inténtalo de nuevo.';
                    console.error('No se pudo reproducir la canción.', error);
                }
            }
        }

        audio.addEventListener('play', () => updatePlaybackUI(true));
        audio.addEventListener('pause', () => updatePlaybackUI(false));
        audio.addEventListener('timeupdate', () => savePlaybackState());
        audio.addEventListener('error', () => {
            playbackStatus.innerText = getAudioErrorMessage();
        });

        let playbackRestored = false;
        function restorePlayback() {
            if (playbackRestored) return;
            playbackRestored = true;

            const savedTime = Number(savedPlayback && savedPlayback.currentTime);
            if (Number.isFinite(savedTime) && savedTime > 0 && savedTime < audio.duration) {
                audio.currentTime = savedTime;
            }
            if (savedPlayback && savedPlayback.shouldPlay && !isChapterThreeFlowActive) {
                playAudio();
            }
        }

        if (!isTriviaView) {
            audio.addEventListener('loadedmetadata', restorePlayback, { once: true });
            if (audio.readyState >= 1) {
                restorePlayback();
            }
        }

        function togglePlay() {
            if (audio.paused) {
                savePlaybackState(true);
                playAudio();
            } else {
                savePlaybackState(false);
                audio.pause();
            }
        }

        window.addEventListener('pagehide', () => savePlaybackState());

        // 3. CARTA DE AMOR
        function toggleReason(button) {
            const isRevealed = button.classList.toggle('revealed');
            button.setAttribute('aria-expanded', String(isRevealed));
        }

        function openLetter() {
            const content = document.getElementById('letterText');
            const title = document.getElementById('env-title');
            if (content.style.display === 'block') {
                content.style.display = 'none';
                title.innerText = 'Toca aquí para abrir la carta';
            } else {
                content.style.display = 'block';
                title.innerText = 'Con todo mi amor... 💖';
                
                // Lluvia de confeti de corazones
                confetti({
                    particleCount: isCompactDevice ? 28 : 60,
                    spread: 70,
                    origin: { y: 0.7 },
                    colors: ['#ff4b72', '#ff7eb3', '#ffffff'],
                    disableForReducedMotion: true
                });
            }
        }

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

        function initStarMap() {
            const stage = document.getElementById('starMapStage');
            const starCanvas = document.getElementById('starMapCanvas');
            const tooltip = document.getElementById('starMemoryTooltip');
            if (!stage || !starCanvas || !tooltip || isTriviaView) return;

            const starContext = starCanvas.getContext('2d');
            if (!starContext) {
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
            const mapReduceMotion = reducedMotion;
            let mapIsVisible = !('IntersectionObserver' in window);

            function resizeStarMap() {
                const bounds = stage.getBoundingClientRect();
                const pixelRatio = Math.min(window.devicePixelRatio || 1, isCompactDevice ? 1 : 1.5);
                width = bounds.width;
                height = bounds.height;
                starCanvas.width = Math.round(width * pixelRatio);
                starCanvas.height = Math.round(height * pixelRatio);
                starContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                drawStarMap(performance.now());
            }

            function drawStarMap(time) {
                starContext.clearRect(0, 0, width, height);
                backgroundStars.forEach(star => {
                    const twinkle = 0.35 + (Math.sin(time * star.speed + star.phase) + 1) * 0.32;
                    starContext.beginPath();
                    starContext.fillStyle = `rgba(238, 220, 255, ${twinkle})`;
                    starContext.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
                    starContext.fill();
                });

                starContext.save();
                starContext.beginPath();
                starContext.moveTo(constellation[0].x * width, constellation[0].y * height);
                constellation.slice(1).forEach(point => starContext.lineTo(point.x * width, point.y * height));
                starContext.strokeStyle = 'rgba(198, 139, 255, 0.48)';
                starContext.lineWidth = 1;
                starContext.shadowColor = '#b66aff';
                starContext.shadowBlur = 12;
                starContext.stroke();
                starContext.restore();
            }

            function animateStarMap(time) {
                if (!mapIsVisible || document.hidden || mapReduceMotion) {
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
                const shouldAnimate = mapIsVisible && !document.hidden && !mapReduceMotion;
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
            if (mapReduceMotion) {
                drawStarMap(0);
            }
            const intersectionObserver = 'IntersectionObserver' in window
                ? new IntersectionObserver(entries => {
                    mapIsVisible = entries.some(entry => entry.isIntersecting);
                    updateStarMapAnimation();
                }, { threshold: 0.05 })
                : null;
            if (intersectionObserver) intersectionObserver.observe(stage);
            document.addEventListener('visibilitychange', updateStarMapAnimation);
            updateStarMapAnimation();
            window.addEventListener('pagehide', () => {
                cancelAnimationFrame(animationFrame);
                resizeObserver.disconnect();
                if (intersectionObserver) intersectionObserver.disconnect();
                document.removeEventListener('visibilitychange', updateStarMapAnimation);
            }, { once: true });
        }

        initStarMap();

        // Banco editable: agrega objetos con pregunta, opciones y respuesta correcta.
        const loveQuestions = [
            { question: '¿Qué convierte un día sencillo en uno especial?', options: ['Compartirlo contigo', 'Un día libre', 'Un regalo caro', 'Dormir hasta tarde'], answer: 'Compartirlo contigo' },
            { question: '¿Cuál es nuestro plan perfecto para una tarde juntos?', options: ['Una tarde de películas', 'Hacer trámites', 'Ordenar el clóset', 'Salir Juntos'], answer: 'Salir Juntos' },
            { question: '¿Qué es lo que más quiero seguir coleccionando contigo?', options: ['Recuerdos bonitos', 'Tazas', 'Puntos de viaje', 'Besos'], answer: 'Recuerdos bonitos' },
            { question: '¿Cuál es el mejor lugar para recibir un abrazo?', options: ['A tu lado', 'En el colegio', 'En el supermercado', 'En la fila del banco'], answer: 'En el colegio' },
            { question: '¿Qué postre sabe mejor si lo compartimos?', options: ['Cualquiera contigo', 'Solo gelatina', 'Ninguno', 'Yo'], answer: 'Yo' },
            { question: '¿Qué quiero para nuestra próxima salida?', options: ['Que tú la elijas', 'Quedarme trabajando', 'Irme a zarsal', 'No salir nunca'], answer: 'Que tú la elijas' },
            { question: '¿Qué hace que nuestra historia sea única?', options: ['Que la escribimos juntos', 'Que tiene muchas páginas', 'Que es una película', 'Que tiene un final'], answer: 'Que la escribimos juntos' },
            { question: '¿Qué significa un abrazo gigante?', options: ['Un montón de cariño', 'Un saludo formal', 'Una subida de grados', 'Una despedida'], answer: 'Un montón de cariño' }
            ,{ question: '¿Qué es lo que más me gusta de ti?', options: ['Tu sonrisa', 'Tu risa', 'Tus subidas de grados', 'Todo lo anterior'], answer: 'Todo lo anterior' },
            { question: '¿Cual es el amor de tu vida?', options: ['Sebastian', 'osuna', 'tu primo', 'Totas las anteriores'], answer: 'Estar contigo' }
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
