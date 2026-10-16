document.addEventListener('DOMContentLoaded', () => {
    const modalTotem = document.getElementById('modal-totem');
    const btnModalClose = document.getElementById('btn-modal-close');
    const totemForm = document.getElementById('totem-form');
    const selectedValorInput = document.getElementById('selected-valor-numerico');
    const preguntaIdInput = document.getElementById('selected-pregunta-id');
    const modalTitle = document.getElementById('modal-title-text');
    const modalSubtitle = document.getElementById('modal-subtitle-text');
    const thanksOverlay = document.getElementById('thanks-overlay');
    const resetCounter = document.getElementById('reset-counter');

    let selectedOpciones = new Set();
    let autoResetTimer = null;

    // Web Audio API para Feedback Sonoro Tech Suave (Sin archivos de audio pesados)
    let audioCtx = null;

    function playTechSound(type = 'click') {
        try {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) audioCtx = new AudioContextClass();
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === 'pop') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(580, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        } catch (e) {
            // Silencioso si el navegador bloquea audio
        }
    }

    // 1. Generador Dinámico de Partículas Tech
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const particleCount = 18;
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';

            const size = Math.random() * 6 + 3; // 3px a 9px
            const left = Math.random() * 100; // 0% a 100%
            const duration = Math.random() * 14 + 12; // 12s a 26s
            const delay = Math.random() * 15; // 0s a 15s

            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${left}%`;
            p.style.animationDuration = `${duration}s`;
            p.style.animationDelay = `${delay}s`;

            if (Math.random() > 0.5) {
                p.style.background = 'rgba(57, 169, 53, 0.7)';
                p.style.boxShadow = '0 0 12px rgba(57, 169, 53, 0.9)';
            }

            particlesContainer.appendChild(p);
        }
    }

    // 2. Click / Touch en Tarjetas de Caritas
    document.querySelectorAll('.totem-carita-card').forEach(card => {
        card.addEventListener('click', (e) => {
            playTechSound('pop');
            createRipple(e, card);

            const valor = parseInt(card.dataset.valor);
            if (selectedValorInput) selectedValorInput.value = valor;

            // Marcar visualmente la tarjeta como seleccionada
            document.querySelectorAll('.totem-carita-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            // Personalizar títulos del Pop-up según la carita presionada
            if (valor === 3) {
                if (modalTitle) modalTitle.textContent = '¡Excelente! ¿Qué fue lo que más disfrutaste?';
                if (modalSubtitle) modalSubtitle.textContent = 'Selecciona los aspectos destacados de tu visita:';
            } else if (valor === 2) {
                if (modalTitle) modalTitle.textContent = '¡Muchas gracias! ¿Qué fue lo que más te gustó?';
                if (modalSubtitle) modalSubtitle.textContent = 'Tu opinión nos ayuda a seguir mejorando:';
            } else {
                if (modalTitle) modalTitle.textContent = '¡Gracias por tu sinceridad! ¿Qué podemos mejorar?';
                if (modalSubtitle) modalSubtitle.textContent = 'Cuéntanos en qué aspectos debemos enfocar nuestra atención:';
            }

            setTimeout(() => {
                openModal();
            }, 200);
        });
    });

    // 3. Efecto Ripple (Onda Expansiva Táctil)
    function createRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${(event.clientX || (rect.left + rect.width / 2)) - rect.left - radius}px`;
        circle.style.top = `${(event.clientY || (rect.top + rect.height / 2)) - rect.top - radius}px`;
        circle.classList.add('touch-ripple');

        const existingRipple = element.querySelector('.touch-ripple');
        if (existingRipple) existingRipple.remove();

        element.appendChild(circle);

        setTimeout(() => {
            circle.remove();
        }, 600);
    }

    // 4. Selección de Pills Táctiles
    document.querySelectorAll('.touch-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            playTechSound('pop');

            const opId = parseInt(pill.dataset.opcionId);

            if (selectedOpciones.has(opId)) {
                selectedOpciones.delete(opId);
                pill.classList.remove('selected');
            } else {
                selectedOpciones.add(opId);
                pill.classList.add('selected');
            }
        });
    });

    function openModal() {
        if (modalTotem) modalTotem.classList.add('active');
    }

    function closeModal() {
        if (modalTotem) modalTotem.classList.remove('active');
        selectedOpciones.clear();
        document.querySelectorAll('.touch-pill').forEach(p => p.classList.remove('selected'));
        document.querySelectorAll('.totem-carita-card').forEach(c => c.classList.remove('selected'));
    }

    if (btnModalClose) {
        btnModalClose.addEventListener('click', closeModal);
    }

    // 5. Confirmar y Enviar Encuesta
    if (totemForm) {
        totemForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnConfirm = document.getElementById('btn-confirm-survey');
            if (btnConfirm) btnConfirm.disabled = true;

            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
            const pregId = preguntaIdInput?.value || 1;
            const valorNum = parseInt(selectedValorInput?.value || 3);

            const payload = {
                pregunta_id: pregId,
                valor_numerico: valorNum,
                opciones: Array.from(selectedOpciones)
            };

            try {
                const response = await fetch('/api/guardar/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                closeModal();

                if (response.ok && result.success) {
                    playTechSound('success');
                    showThanksOverlay();
                } else {
                    alert(result.error || 'Ocurrió un error al guardar la encuesta.');
                    if (btnConfirm) btnConfirm.disabled = false;
                }
            } catch (err) {
                console.error('Error de red:', err);
                closeModal();
                playTechSound('success');
                showThanksOverlay();
            }
        });
    }

    // 6. Overlay Agradecimiento y Auto-Reset en 4s
    function showThanksOverlay() {
        if (!thanksOverlay) return;

        thanksOverlay.classList.add('active');
        let secondsLeft = 4;
        if (resetCounter) resetCounter.textContent = secondsLeft;

        if (autoResetTimer) clearInterval(autoResetTimer);

        autoResetTimer = setInterval(() => {
            secondsLeft--;
            if (resetCounter) resetCounter.textContent = secondsLeft;

            if (secondsLeft <= 0) {
                clearInterval(autoResetTimer);
                resetTotemScreen();
            }
        }, 1000);
    }

    function resetTotemScreen() {
        if (thanksOverlay) thanksOverlay.classList.remove('active');
        closeModal();
        const btnConfirm = document.getElementById('btn-confirm-survey');
        if (btnConfirm) btnConfirm.disabled = false;
    }
});
