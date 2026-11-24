        const isTriviaView = new URLSearchParams(window.location.search).get('sorpresa') === '1';
        const isThreeMonthPage = document.body.classList.contains('three-month-page');
        const isCompactDevice = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
        if (isTriviaView) document.body.classList.add('trivia-mode');

        function showConfetti(options) {
            if (typeof confetti !== 'function') return;
            if (typeof confetti.reset === 'function') confetti.reset();
            confetti({ ...options, particleCount: Math.min(options.particleCount || 15, 15) });
        }

        const splashScreen = document.getElementById('splashScreen');
        const chapterFourCinematic = document.getElementById('chapterFourCinematic');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const chapterFourCinematicDuration = prefersReducedMotion ? 1 : 5000;
        const chapterFourFadeDuration = prefersReducedMotion ? 1 : 650;
        const chapterSelectionAudio = document.getElementById('chapterSelectionAudio');
        const chapterSelectionAudioButton = document.getElementById('chapterSelectionAudioButton');
        const chapterSelectionAudioStatus = document.getElementById('chapterSelectionAudioStatus');
        const chapterNav = document.getElementById('chapterNav');
        const chapterThreeAudio = document.getElementById('chapterThreeAudio');
        const chapterThreeAudioSource = document.getElementById('chapterThreeAudioSource');
        const chapterThreeAudioStatus = document.getElementById('chapterThreeAudioStatus');
        const chapterPlaylistPlayer = document.getElementById('chapterPlaylistPlayer');
        const chapterPlaylistCurrent = document.getElementById('chapterPlaylistCurrent');
        const chapterPlaylist = document.getElementById('chapterPlaylist');
        const chapterPlaylistSkip = document.getElementById('chapterPlaylistSkip');
        const anniversaryVideo = document.getElementById('anniversaryVideo');
        const anniversaryVideoRevealButton = document.getElementById('anniversaryVideoRevealButton');
        const anniversaryVideoStatus = document.getElementById('anniversaryVideoStatus');
        anniversaryVideo.preload = 'none';
        let pausedMusicTracks = null;
        const chapterViews = {
            three: document.getElementById('chapterThree')
        };
        let isChapterThreeFlowActive = false;

        function isChapterSelectionAudioActive() {
            return !splashScreen.hidden
                && (!chapterFourCinematic || chapterFourCinematic.hidden)
                && !splashScreen.classList.contains('is-leaving')
                && !isTriviaView;
        }

        function handleChapterSelectionAudioError(error) {
            if (error && error.name === 'AbortError') return;
            if (!isChapterSelectionAudioActive()) return;

            chapterSelectionAudioButton.hidden = false;
            if (error && error.name === 'NotAllowedError') {
                chapterSelectionAudioStatus.textContent = 'Tu navegador bloqueó la reproducción automática. Toca «Activar música» para escucharla.';
                return;
            }

            chapterSelectionAudioStatus.textContent = 'No se pudo reproducir la música. Revisa que el archivo esté en la carpeta musica3meses.';
            console.error('No se pudo reproducir la música de la selección de capítulos.', error);
        }

        function startChapterSelectionAudio() {
            if (!isChapterSelectionAudioActive()) return;

            chapterSelectionAudio.loop = true;
            chapterSelectionAudio.play().then(() => {
                if (!isChapterSelectionAudioActive()) {
                    stopChapterSelectionAudio();
                    return;
                }
                chapterSelectionAudioButton.hidden = true;
                chapterSelectionAudioStatus.textContent = '';
            }).catch(handleChapterSelectionAudioError);
        }

        function stopChapterSelectionAudio() {
            chapterSelectionAudio.pause();
            chapterSelectionAudio.currentTime = 0;
        }

        chapterSelectionAudioButton.addEventListener('click', startChapterSelectionAudio);
        chapterSelectionAudio.addEventListener('playing', () => {
            if (!isChapterSelectionAudioActive()) {
                stopChapterSelectionAudio();
                return;
            }
            chapterSelectionAudioButton.hidden = true;
            chapterSelectionAudioStatus.textContent = '';
        });
        chapterSelectionAudio.addEventListener('error', () => {
            if (!isChapterSelectionAudioActive()) return;
            chapterSelectionAudioStatus.textContent = 'No se pudo cargar la música. Revisa que el archivo esté en la carpeta musica3meses.';
            console.error('No se pudo cargar la música de la selección de capítulos.', chapterSelectionAudio.error);
        });
        const chapterPlaylistTracks = [
            { src: 'audios/cancionaleja (online-audio-converter.com).mp3', title: 'El Fin del Mundo - La La Love You, Axolotes Mexicanos' },
            { src: 'musica3meses/WhatsApp Audio 2026-11-11 at 8.32.14 PM.mp3', title: 'Devuélveme a mi chica - Hombres G' },
            { src: 'musica3meses/sonido.mp3', title: 'Bonita - Juanes, Sebastian Yatra' },
            { src: 'musica3meses/sonido1.mp3', title: 'Por Ti - 3AM' },
            { src: 'musica3meses/sonido2.mp3', title: 'Gasolina - Daddy Yankee' },
            { src: 'musica3meses/sonido3.mp3', title: 'Darte un Beso - Prince Royce' },
            { src: 'musica3meses/sonido4.mp3', title: 'SUPERESTRELLA - Aitana' },
            { src: 'musica3meses/sonido5.mp3', title: 'Doma - Jósean Log' }
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
            title.className = 'chapter-playlist-title';
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

        anniversaryVideoRevealButton.addEventListener('click', () => {
            anniversaryVideoRevealButton.hidden = true;
            anniversaryVideo.hidden = false;
            anniversaryVideo.focus();
        });
        anniversaryVideo.addEventListener('error', () => {
            anniversaryVideoStatus.textContent = 'No se pudo cargar el video. Revisa que aleja.mp4 esté en la carpeta video.';
        });
        anniversaryVideo.addEventListener('playing', () => {
            anniversaryVideo.classList.add('is-playing');
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
                anniversaryVideo.classList.remove('is-playing');
            });
        });

        chapterThreeAudio.addEventListener('playing', () => chapterPlaylistPlayer.classList.add('is-playing'));
        ['pause', 'ended'].forEach(eventName => {
            chapterThreeAudio.addEventListener(eventName, () => chapterPlaylistPlayer.classList.remove('is-playing'));
        });

        function selectChapter(chapter, showSplash = false, shouldStartMusic = true) {
            stopChapterSelectionAudio();
            Object.entries(chapterViews).forEach(([name, view]) => {
                const isActive = name === chapter;
                view.classList.toggle('is-active', isActive);
                view.setAttribute('aria-hidden', String(!isActive));
            });
            if (chapter === 'three') {
                const chapterView = chapterViews.three;
                chapterView.classList.remove('is-entering');
                void chapterView.offsetWidth;
                chapterView.classList.add('is-entering');
            }
            document.querySelectorAll('[data-chapter]').forEach(button => {
                if (button.closest('.chapter-nav')) {
                    button.setAttribute('aria-pressed', String(button.dataset.chapter === chapter));
                }
            });
            document.body.classList.add('chapter-selected');
            document.body.classList.toggle('beach-chapter-active', chapter === 'three' && !showSplash);
            isChapterThreeFlowActive = chapter === 'three';
            chapterNav.hidden = false;
            document.title = chapter === 'three' && !showSplash
                ? 'Capítulo 2 · Marea de Amor 🌊'
                : 'Nuestra Historia de Amor ❤️';

            if (chapter === 'three') {
                observeMemoryGallery();
                chapterThreeAudio.pause();
                chapterThreeAudio.currentTime = 0;
                previousRandomTrackIndex = -1;
                if (shouldStartMusic) playChapterTrack(0);
            } else {
                chapterThreeAudio.pause();
            }

            if (showSplash) {
                splashScreen.hidden = false;
                requestAnimationFrame(() => {
                    splashScreen.classList.remove('is-leaving');
                    startChapterSelectionAudio();
                });
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
            if (chapterFourCinematic) {
                chapterFourCinematic.hidden = true;
                chapterFourCinematic.setAttribute('aria-hidden', 'true');
            }
        } else if (isThreeMonthPage) {
            splashScreen.hidden = true;
            window.setTimeout(() => selectChapter('three', false, false), 0);
        } else {
            document.querySelectorAll('[data-chapter]').forEach(button => {
                button.addEventListener('click', () => selectChapter(button.dataset.chapter));
            });
            chapterNav.hidden = true;

            stopChapterSelectionAudio();
            document.body.classList.add('chapter-four-cinematic-open');
            chapterFourCinematic.querySelector('[role="dialog"]').focus();
            window.setTimeout(() => {
                splashScreen.hidden = false;
                splashScreen.classList.add('is-entering');
                chapterFourCinematic.setAttribute('aria-hidden', 'true');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        chapterFourCinematic.classList.add('is-leaving');
                        splashScreen.classList.remove('is-entering');
                        window.setTimeout(() => {
                            chapterFourCinematic.hidden = true;
                            chapterFourCinematic.classList.remove('is-leaving');
                            document.body.classList.remove('chapter-four-cinematic-open');
                            splashScreen.querySelector('.chapter-choice').focus();
                            startChapterSelectionAudio();
                        }, chapterFourFadeDuration);
                    });
                });
            }, chapterFourCinematicDuration);
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

        const scratchCards = Array.from(document.querySelectorAll('.scratch-card'));
        const scratchChoicePrompt = document.querySelector('.scratch-choice-prompt');
        const scratchStatus = document.querySelector('.scratch-status');
        let selectedScratchCard = null;

        function setupScratchCard(card) {
            const scratchCanvas = card.querySelector('.scratch-canvas');
            const context = scratchCanvas.getContext('2d', { willReadFrequently: true });
            const revealButton = card.querySelector('.scratch-reveal-button');
            const choiceButton = card.querySelector('.scratch-choice-button');
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
            choiceButton.addEventListener('click', () => selectScratchPrize(card));

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
            if (scratchCards.every(scratchCard => scratchCard.classList.contains('is-revealed'))) {
                scratchChoicePrompt.hidden = false;
                scratchCards.forEach(scratchCard => {
                    scratchCard.querySelector('.scratch-choice-button').hidden = false;
                });
                scratchStatus.textContent = 'Raspaste las tres tarjetas. Ahora elige un único premio.';
            } else {
                scratchStatus.textContent = '¡Detalle revelado! Raspa las otras tarjetas para elegir tu premio.';
            }
        }

        function selectScratchPrize(card) {
            if (selectedScratchCard || !scratchCards.every(scratchCard => scratchCard.classList.contains('is-revealed'))) return;

            selectedScratchCard = card;
            scratchCards.forEach(scratchCard => {
                const choiceButton = scratchCard.querySelector('.scratch-choice-button');
                const isSelected = scratchCard === selectedScratchCard;
                scratchCard.classList.toggle('is-selected', isSelected);
                scratchCard.classList.toggle('is-not-selected', !isSelected);
                choiceButton.disabled = true;
                choiceButton.setAttribute('aria-pressed', String(isSelected));
                choiceButton.textContent = isSelected ? 'Premio elegido ✓' : 'No elegido';
            });
            scratchChoicePrompt.textContent = `¡Elegiste: ${card.querySelector('.scratch-prize').textContent}!`;
            scratchStatus.textContent = 'Tu elección quedó guardada. Solo puedes elegir un premio.';
        }

        scratchCards.forEach(setupScratchCard);

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
                    showConfetti({ particleCount: 15, spread: 65, origin: { y: 0.7 }, colors: ['#ff8296', '#ffd6a2', '#ffffff'], disableForReducedMotion: true });
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
                    particleCount: 15,
                    spread: 100,
                    startVelocity: 38,
                    origin: { y: 0.65 },
                    colors: ['#ff8296', '#ffd6a2', '#fff4df', '#dc7890'],
                    disableForReducedMotion: true
                };
                if (typeof confetti.shapeFromText === 'function') {
                    options.shapes = [confetti.shapeFromText({ text: '💖', scalar: 1.4 })];
                }
                showConfetti(options);
                window.setTimeout(() => showConfetti({ ...options, origin: { x: 0.25, y: 0.72 } }), 240);
                window.setTimeout(() => showConfetti({ ...options, origin: { x: 0.75, y: 0.72 } }), 440);
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
            const canUpdateTimer = !isTriviaView;
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
        updateTimerVisibility();

        // Partículas CSS para evitar redibujar el fondo mientras se hace scroll.
        const backgroundParticles = document.getElementById('canvas-bg');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function createBackgroundParticles() {
            if (reducedMotion || isTriviaView) return;
            const particleCount = isCompactDevice ? 12 : 15;
            for (let index = 0; index < particleCount; index++) {
                const particle = document.createElement('span');
                particle.className = 'background-particle';
                particle.setAttribute('aria-hidden', 'true');
                particle.textContent = '♡';
                particle.style.setProperty('--particle-x', `${Math.random() * 100}%`);
                particle.style.setProperty('--particle-duration', `${14 + Math.random() * 12}s`);
                particle.style.setProperty('--particle-delay', `${-Math.random() * 24}s`);
                particle.style.setProperty('--particle-opacity', `${0.2 + Math.random() * 0.3}`);
                backgroundParticles.append(particle);
            }
        }

        createBackgroundParticles();

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
                showConfetti({ particleCount: 15, spread: 75, origin: { y: 0.65 }, colors: ['#ff4b72', '#a855f7', '#ffd166', '#ffffff'], disableForReducedMotion: true });
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
                    showConfetti({ particleCount: 15, spread: 55, origin: { y: 0.7 }, colors: ['#ff4b72', '#ffd166', '#ffffff'], disableForReducedMotion: true });
                });
                coupon.append(title, redeemButton);
                couponList.append(coupon);
            });
            document.getElementById('prizeSection').classList.remove('trivia-hidden');
            showConfetti({ particleCount: 15, spread: 110, origin: { y: 0.6 }, colors: ['#ff4b72', '#a855f7', '#ffd166', '#ffffff'], disableForReducedMotion: true });
        }

        document.getElementById('restartTrivia').addEventListener('click', startTrivia);
        if (isTriviaView) startTrivia();
