(() => {
    const unlockAt = new Date(2026, 11, 21, 0, 0, 0, 0).getTime();
    const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
    const isLocalPreview = new URLSearchParams(window.location.search).get('preview') === '1'
        && localHosts.has(window.location.hostname);
    const comingSoonScreen = document.getElementById('comingSoonScreen');
    const treePreview = document.getElementById('treePreview');

    if (!isLocalPreview && Date.now() < unlockAt) {
        const countdown = document.getElementById('chapterUnlockCountdown');
        let unlockInterval = null;

        function updateUnlockCountdown() {
            const remainingMilliseconds = unlockAt - Date.now();
            if (remainingMilliseconds <= 0) {
                if (unlockInterval !== null) window.clearInterval(unlockInterval);
                window.location.reload();
                return;
            }

            const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
            const days = Math.floor(remainingSeconds / 86400);
            const hours = Math.floor((remainingSeconds / 3600) % 24);
            const minutes = Math.floor((remainingSeconds / 60) % 60);
            const seconds = remainingSeconds % 60;
            const dayLabel = days === 1 ? 'día' : 'días';
            countdown.textContent = `Se desbloquea el 21 de diciembre de 2026 · Faltan ${days} ${dayLabel}, ${hours} h, ${minutes} min y ${seconds} s`;
        }

        function syncUnlockCountdown() {
            if (document.hidden) {
                if (unlockInterval !== null) {
                    window.clearInterval(unlockInterval);
                    unlockInterval = null;
                }
                return;
            }

            updateUnlockCountdown();
            if (Date.now() < unlockAt && unlockInterval === null) {
                unlockInterval = window.setInterval(updateUnlockCountdown, 1000);
            }
        }

        document.addEventListener('visibilitychange', syncUnlockCountdown);
        window.addEventListener('pagehide', () => {
            if (unlockInterval !== null) window.clearInterval(unlockInterval);
        }, { once: true });
        syncUnlockCountdown();
        return;
    }

    comingSoonScreen.hidden = true;
    treePreview.hidden = false;
    document.title = 'Capítulo 3 · Navidad para Aleja 🎄';

    const storyStartDate = new Date('2026-08-21T00:00:00');
    const anniversaryCounter = [
        document.getElementById('days-four-month'),
        document.getElementById('hours-four-month'),
        document.getElementById('minutes-four-month'),
        document.getElementById('seconds-four-month')
    ];

    function updateAnniversaryCounter() {
        const elapsed = Date.now() - storyStartDate.getTime();
        const safeElapsed = Math.max(0, elapsed);
        const values = [
            Math.floor(safeElapsed / 86400000),
            Math.floor(safeElapsed / 3600000) % 24,
            Math.floor(safeElapsed / 60000) % 60,
            Math.floor(safeElapsed / 1000) % 60
        ];

        anniversaryCounter.forEach((unit, index) => {
            unit.textContent = String(values[index]).padStart(2, '0');
        });
    }

    let anniversaryInterval = null;
    function syncAnniversaryCounter() {
        updateAnniversaryCounter();
        if (!document.hidden && anniversaryInterval === null) {
            anniversaryInterval = window.setInterval(updateAnniversaryCounter, 1000);
        } else if (document.hidden && anniversaryInterval !== null) {
            window.clearInterval(anniversaryInterval);
            anniversaryInterval = null;
        }
    }

    document.addEventListener('visibilitychange', syncAnniversaryCounter);
    syncAnniversaryCounter();

    const tree = document.getElementById('christmasTree');
    const progress = document.getElementById('treeProgress');
    const letterButton = document.getElementById('openFourMonthLetter');
    const memoryModal = document.getElementById('memoryModal');
    const letterModal = document.getElementById('fourMonthLetter');
    const ornaments = [...document.querySelectorAll('.christmas-ornament')];
    let lastModalTrigger = null;

    function openModal(modal, trigger) {
        lastModalTrigger = trigger;
        modal.hidden = false;
        document.body.classList.add('christmas-modal-open');
        modal.querySelector('.christmas-modal-close').focus();
    }

    function closeModal(modal) {
        modal.hidden = true;
        if (memoryModal.hidden && letterModal.hidden) {
            document.body.classList.remove('christmas-modal-open');
        }
        if (lastModalTrigger && lastModalTrigger.isConnected) lastModalTrigger.focus();
    }

    ornaments.forEach(ornament => {
        ornament.addEventListener('click', () => {
            if (!ornament.classList.contains('is-lit')) {
                ornament.classList.add('is-lit');
                ornament.setAttribute('aria-pressed', 'true');
            }

            const litCount = ornaments.filter(item => item.classList.contains('is-lit')).length;
            progress.textContent = litCount === ornaments.length
                ? '6 de 6 recuerdos encendidos. ¡La estrella ya brilla!'
                : `${litCount} de 6 recuerdos encendidos`;

            if (litCount === ornaments.length) {
                tree.classList.add('is-complete');
                letterButton.disabled = false;
            }

            document.getElementById('memoryModalTitle').textContent = ornament.dataset.title;
            document.getElementById('memoryModalText').textContent = ornament.dataset.message;
            openModal(memoryModal, ornament);
        });
    });

    letterButton.addEventListener('click', () => {
        if (!letterButton.disabled) openModal(letterModal, letterButton);
    });

    document.querySelectorAll('[data-close-memory]').forEach(button => {
        button.addEventListener('click', () => closeModal(memoryModal));
    });
    document.querySelectorAll('[data-close-letter]').forEach(button => {
        button.addEventListener('click', () => closeModal(letterModal));
    });

    document.addEventListener('keydown', event => {
        const activeModal = memoryModal.hidden ? (letterModal.hidden ? null : letterModal) : memoryModal;
        if (!activeModal) return;

        if (event.key === 'Escape') {
            closeModal(activeModal);
            return;
        }

        if (event.key === 'Tab') {
            const focusable = [...activeModal.querySelectorAll('button:not(:disabled)')];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    const lightButtons = [...document.querySelectorAll('.christmas-game-light')];
    const lightGameStatus = document.getElementById('lightGameStatus');
    const startLightGame = document.getElementById('startLightGame');
    const lightGameReward = document.getElementById('lightGameReward');
    const roundProgress = document.getElementById('lightRoundProgress');
    const roundMarkers = [...roundProgress.querySelectorAll('[data-round]')];
    const totalLightRounds = 4;
    const lightSequence = [];
    let isShowingSequence = false;
    let isSequenceReady = false;
    let isLightGameComplete = false;
    let completedLightRounds = 0;
    let nextLightIndex = 0;

    function wait(milliseconds) {
        return new Promise(resolve => window.setTimeout(resolve, milliseconds));
    }

    function createRandomSequence(length) {
        const colors = lightButtons.map(button => button.dataset.light);
        const sequence = [];

        while (sequence.length < length) {
            const previousColor = sequence[sequence.length - 1];
            const availableColors = colors.filter(color => color !== previousColor);
            sequence.push(availableColors[Math.floor(Math.random() * availableColors.length)]);
        }

        return sequence;
    }

    function updateLightRoundProgress() {
        roundMarkers.forEach(marker => {
            marker.classList.toggle('is-complete', Number(marker.dataset.round) <= completedLightRounds);
        });
        roundProgress.setAttribute('aria-label', `Rondas completadas: ${completedLightRounds} de ${totalLightRounds}`);
    }

    async function showLightSequence() {
        if (isShowingSequence || isLightGameComplete) return;

        if (lightSequence.length === 0) {
            lightSequence.push(...createRandomSequence(3 + completedLightRounds));
        }

        isShowingSequence = true;
        isSequenceReady = false;
        startLightGame.disabled = true;
        lightButtons.forEach(button => { button.disabled = true; });
        lightButtons.forEach(button => { button.classList.remove('is-active'); });
        lightGameStatus.textContent = `Ronda ${completedLightRounds + 1} de ${totalLightRounds}: observa la secuencia…`;

        for (const light of lightSequence) {
            const button = lightButtons.find(item => item.dataset.light === light);
            button.classList.add('is-active');
            await wait(430);
            button.classList.remove('is-active');
            await wait(210);
        }

        nextLightIndex = 0;
        isShowingSequence = false;
        isSequenceReady = true;
        startLightGame.disabled = false;
        startLightGame.textContent = `Repetir ronda ${completedLightRounds + 1}`;
        lightButtons.forEach(button => { button.disabled = false; });
        lightGameStatus.textContent = `Ahora repite las ${lightSequence.length} luces en el mismo orden.`;
    }

    startLightGame.addEventListener('click', showLightSequence);

    lightButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!isSequenceReady || isShowingSequence || isLightGameComplete) return;

            if (button.dataset.light !== lightSequence[nextLightIndex]) {
                isSequenceReady = false;
                nextLightIndex = 0;
                lightButtons.forEach(light => { light.disabled = true; });
                startLightGame.disabled = false;
                startLightGame.textContent = 'Volver a ver la secuencia';
                lightGameStatus.textContent = '¡Casi! Mira otra vez la misma secuencia y vuelve a intentarlo.';
                return;
            }

            nextLightIndex += 1;

            if (nextLightIndex === lightSequence.length) {
                isSequenceReady = false;
                completedLightRounds += 1;
                updateLightRoundProgress();
                lightButtons.forEach(light => {
                    light.classList.add('is-active');
                    light.disabled = true;
                });

                if (completedLightRounds === totalLightRounds) {
                    isLightGameComplete = true;
                    startLightGame.disabled = true;
                    startLightGame.textContent = 'Reto superado ✨';
                    lightGameStatus.textContent = '¡Lo lograste! Ya conoces el código secreto de nuestras luces. 🎄';
                    lightGameReward.hidden = false;
                    return;
                }

                lightSequence.length = 0;
                startLightGame.disabled = false;
                startLightGame.textContent = `Comenzar ronda ${completedLightRounds + 1} de ${totalLightRounds}`;
                lightGameStatus.textContent = `¡Ronda ${completedLightRounds} superada! La próxima secuencia tendrá ${3 + completedLightRounds} luces.`;
                window.setTimeout(() => {
                    lightButtons.forEach(light => { light.classList.remove('is-active'); });
                }, 650);
                return;
            }

            button.classList.add('is-active');
            window.setTimeout(() => button.classList.remove('is-active'), 260);
            lightGameStatus.textContent = `¡Bien! Luz ${nextLightIndex} de ${lightSequence.length}. Sigue así.`;
        });
    });

    const wishForm = document.getElementById('christmasWishForm');
    const wishInput = document.getElementById('christmasWishInput');
    const snowglobe = document.getElementById('christmasSnowglobe');
    const snowglobeWish = document.getElementById('snowglobeWish');
    const wishStatus = document.getElementById('christmasWishStatus');

    wishForm.addEventListener('submit', event => {
        event.preventDefault();
        const wish = wishInput.value.trim();
        if (!wish) {
            wishStatus.textContent = 'Escribe un deseo antes de guardarlo en la nieve.';
            wishInput.focus();
            return;
        }

        snowglobeWish.textContent = wish;
        snowglobe.classList.remove('is-shaking');
        void snowglobe.offsetWidth;
        snowglobe.classList.add('is-shaking');
        wishStatus.textContent = 'Tu deseo ya está brillando dentro de nuestra bola de nieve. ✨';
        wishInput.value = '';
    });

    const reactionDisplay = document.getElementById('reactionDisplay');
    const reactionSignal = document.getElementById('reactionSignal');
    const reactionRound = document.getElementById('reactionRound');
    const reactionButton = document.getElementById('reactionButton');
    const reactionStatus = document.getElementById('reactionStatus');
    const totalReactionRounds = 3;
    let reactionPhase = 'idle';
    let reactionRoundNumber = 1;
    let reactionTimes = [];
    let reactionTimeout = null;
    let reactionAnimationFrame = null;
    let reactionStartedAt = 0;

    function updateReactionTimer() {
        if (reactionPhase !== 'ready') {
            reactionAnimationFrame = null;
            return;
        }

        const elapsedSeconds = (performance.now() - reactionStartedAt) / 1000;
        reactionSignal.textContent = `${elapsedSeconds.toFixed(2)} s`;
        reactionAnimationFrame = window.requestAnimationFrame(updateReactionTimer);
    }

    function startReactionRound() {
        reactionPhase = 'waiting';
        reactionDisplay.classList.remove('is-ready', 'is-result');
        reactionDisplay.classList.add('is-waiting');
        reactionSignal.textContent = '🎄';
        reactionButton.textContent = 'Espera la señal…';
        reactionRound.textContent = `Ronda ${reactionRoundNumber} de ${totalReactionRounds}`;
        reactionStatus.textContent = `Ronda ${reactionRoundNumber}: espera a que aparezca la señal verde.`;

        reactionTimeout = window.setTimeout(() => {
            reactionTimeout = null;
            reactionPhase = 'ready';
            reactionDisplay.classList.remove('is-waiting');
            reactionDisplay.classList.add('is-ready');
            reactionSignal.textContent = '¡YA!';
            reactionStartedAt = performance.now();
            reactionAnimationFrame = window.requestAnimationFrame(updateReactionTimer);
            reactionButton.textContent = '¡Pulsa ahora!';
            reactionStatus.textContent = '¡Verde! Pulsa el botón ahora.';
        }, 1500 + Math.random() * 3500);
    }

    reactionButton.addEventListener('click', () => {
        if (reactionPhase === 'waiting') {
            window.clearTimeout(reactionTimeout);
            reactionTimeout = null;
            reactionPhase = 'idle';
            reactionDisplay.classList.remove('is-waiting');
            reactionDisplay.classList.add('is-result');
            reactionSignal.textContent = '⏱️';
            reactionButton.textContent = `Reintentar ronda ${reactionRoundNumber}`;
            reactionStatus.textContent = '¡Te adelantaste! Espera a que aparezca ¡YA! y vuelve a probar.';
            return;
        }

        if (reactionPhase === 'ready') {
            if (reactionAnimationFrame !== null) {
                window.cancelAnimationFrame(reactionAnimationFrame);
                reactionAnimationFrame = null;
            }
            const reactionTime = Math.round(performance.now() - reactionStartedAt);
            reactionTimes.push(reactionTime);
            reactionDisplay.classList.remove('is-ready');
            reactionDisplay.classList.add('is-result');
            reactionSignal.textContent = `${reactionTime} ms`;
            reactionPhase = reactionTimes.length === totalReactionRounds ? 'complete' : 'result';
            reactionRound.textContent = `Ronda ${reactionTimes.length} de ${totalReactionRounds}`;

            if (reactionPhase === 'complete') {
                const averageTime = Math.round(reactionTimes.reduce((total, time) => total + time, 0) / totalReactionRounds);
                reactionButton.textContent = 'Jugar otra vez 🦌';
                reactionStatus.textContent = `¡Reto completado! Tu reflejo promedio fue de ${averageTime} ms. ¿Te animas a mejorar?`;
            } else {
                reactionButton.textContent = `Siguiente ronda (${reactionTimes.length + 1}/${totalReactionRounds})`;
                reactionStatus.textContent = `¡${reactionTime} ms! Pulsa para empezar la siguiente ronda.`;
            }
            return;
        }

        if (reactionPhase === 'complete') {
            reactionRoundNumber = 1;
            reactionTimes = [];
            reactionPhase = 'idle';
            reactionDisplay.classList.remove('is-result');
            reactionSignal.textContent = '🛷';
            reactionRound.textContent = `Ronda 1 de ${totalReactionRounds}`;
            reactionButton.textContent = 'Empezar reto 🦌';
            reactionStatus.textContent = 'Pulsa para empezar; no te adelantes a la señal verde.';
            return;
        }

        if (reactionPhase === 'result') reactionRoundNumber += 1;
        startReactionRound();
    });

    const starHuntArena = document.getElementById('starHuntArena');
    const starHuntTarget = document.getElementById('starHuntTarget');
    const starHuntStart = document.getElementById('startStarHunt');
    const starHuntScore = document.getElementById('starHuntScore');
    const starHuntTime = document.getElementById('starHuntTime');
    const starHuntStatus = document.getElementById('starHuntStatus');
    const starHuntDifficultyButtons = [...document.querySelectorAll('.star-hunt-difficulty')];
    const starHuntModes = {
        paseo: { duration: 20, goal: 5, moveInterval: 1350, minMoveInterval: 800, acceleration: 120, starSize: 48, starFontSize: '2.5rem', transition: 0.55 },
        nieve: { duration: 15, goal: 7, moveInterval: 1050, minMoveInterval: 520, acceleration: 90, starSize: 40, starFontSize: '2.1rem', transition: 0.4 },
        tormenta: { duration: 12, goal: 9, moveInterval: 760, minMoveInterval: 330, acceleration: 75, starSize: 34, starFontSize: '1.8rem', transition: 0.28 }
    };
    let selectedStarDifficulty = 'nieve';
    let activeStarHuntMode = starHuntModes[selectedStarDifficulty];
    let starsCaught = 0;
    let secondsRemaining = activeStarHuntMode.duration;
    let starHuntInterval = null;
    let starMovementInterval = null;
    let lastStarPosition = null;

    function moveStarTarget() {
        const margin = 12;
        const maxLeft = Math.max(margin, starHuntArena.clientWidth - starHuntTarget.offsetWidth - margin);
        const maxTop = Math.max(margin, starHuntArena.clientHeight - starHuntTarget.offsetHeight - margin);
        let left = margin + Math.random() * (maxLeft - margin);
        let top = margin + Math.random() * (maxTop - margin);

        if (lastStarPosition && Math.hypot(left - lastStarPosition.left, top - lastStarPosition.top) < 70) {
            left = lastStarPosition.left > starHuntArena.clientWidth / 2 ? margin : maxLeft;
            top = lastStarPosition.top > starHuntArena.clientHeight / 2 ? margin : maxTop;
        }

        lastStarPosition = { left, top };
        starHuntTarget.style.left = `${left}px`;
        starHuntTarget.style.top = `${top}px`;
        starHuntTarget.style.transform = 'none';
    }

    function scheduleStarMovement() {
        if (starMovementInterval !== null) window.clearInterval(starMovementInterval);
        const delay = Math.max(
            activeStarHuntMode.minMoveInterval,
            activeStarHuntMode.moveInterval - starsCaught * activeStarHuntMode.acceleration
        );
        starMovementInterval = window.setInterval(moveStarTarget, delay);
    }

    function finishStarHunt(won) {
        if (starHuntInterval !== null) {
            window.clearInterval(starHuntInterval);
            starHuntInterval = null;
        }
        if (starMovementInterval !== null) {
            window.clearInterval(starMovementInterval);
            starMovementInterval = null;
        }
        starHuntTarget.disabled = true;
        starHuntArena.classList.remove('is-running');
        starHuntStart.disabled = false;
        starHuntDifficultyButtons.forEach(button => { button.disabled = false; });
        starHuntStart.textContent = won ? 'Jugar otra vez ⭐' : 'Intentarlo otra vez ⭐';
        if (won) starHuntArena.classList.add('is-won');
        starHuntStatus.textContent = won
            ? '¡Lo conseguiste! Atrapaste todas las estrellas de nuestra noche. ✨'
            : '¡Se terminó el tiempo! Las estrellas esperan otra oportunidad.';
    }

    starHuntDifficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (starHuntInterval !== null) return;

            selectedStarDifficulty = button.dataset.starDifficulty;
            activeStarHuntMode = starHuntModes[selectedStarDifficulty];
            starHuntDifficultyButtons.forEach(choice => {
                const isSelected = choice === button;
                choice.classList.toggle('is-selected', isSelected);
                choice.setAttribute('aria-pressed', String(isSelected));
            });
            starHuntScore.textContent = `0 / ${activeStarHuntMode.goal}`;
            starHuntTime.textContent = `${activeStarHuntMode.duration} s`;
            starHuntStatus.textContent = `Dificultad seleccionada: ${button.textContent}.`;
        });
    });

    starHuntStart.addEventListener('click', () => {
        if (starHuntInterval !== null) return;

        starsCaught = 0;
        secondsRemaining = activeStarHuntMode.duration;
        starHuntScore.textContent = `0 / ${activeStarHuntMode.goal}`;
        starHuntTime.textContent = `${secondsRemaining} s`;
        starHuntStatus.textContent = '¡Atrápalas antes de que se acabe el tiempo!';
        starHuntArena.classList.remove('is-won');
        starHuntArena.classList.add('is-running');
        starHuntStart.disabled = true;
        starHuntDifficultyButtons.forEach(button => { button.disabled = true; });
        starHuntTarget.disabled = false;
        starHuntTarget.style.setProperty('--star-size', `${activeStarHuntMode.starSize}px`);
        starHuntTarget.style.setProperty('--star-font-size', activeStarHuntMode.starFontSize);
        starHuntTarget.style.setProperty('--star-transition', `${activeStarHuntMode.transition}s`);
        lastStarPosition = null;
        moveStarTarget();
        scheduleStarMovement();
        starHuntInterval = window.setInterval(() => {
            secondsRemaining -= 1;
            starHuntTime.textContent = `${secondsRemaining} s`;
            if (secondsRemaining <= 0) finishStarHunt(false);
        }, 1000);
    });

    starHuntTarget.addEventListener('click', () => {
        if (starHuntInterval === null) return;

        starsCaught += 1;
        starHuntScore.textContent = `${starsCaught} / ${activeStarHuntMode.goal}`;
        if (starsCaught >= activeStarHuntMode.goal) {
            finishStarHunt(true);
            return;
        }

        const nextSize = Math.max(24, activeStarHuntMode.starSize - starsCaught * 2);
        starHuntTarget.style.setProperty('--star-size', `${nextSize}px`);
        starHuntStatus.textContent = `¡Una más! Llevas ${starsCaught} estrellas.`;
        moveStarTarget();
        scheduleStarMovement();
    });

    const holidayWheel = document.getElementById('holidayWheel');
    const spinHolidayWheel = document.getElementById('spinHolidayWheel');
    const holidayPlanResult = document.getElementById('holidayPlanResult');
    const holidayPlans = [
        'Salir a tumbar puertas con alma y vida',
        'Mirar alumbrados en un momento romantico✨',
        'Terminar de ganarte a mi mamá',
        'Poder casarnos y tener un lindo futuro juntos. 💍',
        'Enseñarte a bailar lo que más te gusta y hacerte feliz. 💃',
        'Inventar una tradición navideña que sea solo nuestra. 🎄',
        'Pasar los ultimos momentos del año juntos y hacer un brindis por nuestro amor. 🥂',
        'S-E-B-A-S-T-I-A-N',
    ];
    let holidayWheelRotation = 0;
    let isHolidayWheelSpinning = false;
    let lastHolidayPlan = -1;

    spinHolidayWheel.addEventListener('click', () => {
        if (isHolidayWheelSpinning) return;

        isHolidayWheelSpinning = true;
        spinHolidayWheel.disabled = true;
        holidayPlanResult.textContent = 'La ruleta está buscando nuestro próximo plan…';
        const availablePlans = holidayPlans
            .map((plan, index) => index)
            .filter(index => index !== lastHolidayPlan);
        const selectedPlan = availablePlans[Math.floor(Math.random() * availablePlans.length)];
        lastHolidayPlan = selectedPlan;
        const sliceAngle = 360 / holidayPlans.length;
        const currentAngle = ((holidayWheelRotation % 360) + 360) % 360;
        const selectedAngle = 360 - (selectedPlan * sliceAngle + sliceAngle / 2);
        holidayWheelRotation += 360 * 4 + ((selectedAngle - currentAngle + 360) % 360);
        holidayWheel.style.transform = `rotate(${holidayWheelRotation}deg)`;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(() => {
            holidayPlanResult.textContent = holidayPlans[selectedPlan];
            spinHolidayWheel.disabled = false;
            isHolidayWheelSpinning = false;
        }, reducedMotion ? 50 : 3600);
    });
})();
