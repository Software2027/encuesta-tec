document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('survey-form');
    if (!surveyForm) return;

    const cards = document.querySelectorAll('.question-card');
    const totalSteps = cards.length;
    let currentStep = 0;

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const validationToast = document.getElementById('validation-toast');

    // Estado global de respuestas
    const respuestasData = {};

    function updateStepVisibility() {
        cards.forEach((card, idx) => {
            if (idx === currentStep) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Actualizar barra de progreso
        const percent = Math.round(((currentStep + 1) / totalSteps) * 100);
        if (progressBarFill) progressBarFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;

        // Botones
        if (btnPrev) {
            btnPrev.style.display = currentStep === 0 ? 'none' : 'inline-flex';
        }
        if (btnNext) {
            btnNext.style.display = currentStep === totalSteps - 1 ? 'none' : 'inline-flex';
        }
        if (btnSubmit) {
            btnSubmit.style.display = currentStep === totalSteps - 1 ? 'inline-flex' : 'none';
        }

        // Ocultar mensaje de validación al cambiar de paso
        hideValidationError();
    }

    function showValidationError(msg) {
        if (validationToast) {
            validationToast.textContent = msg;
            validationToast.style.display = 'block';
        }
    }

    function hideValidationError() {
        if (validationToast) {
            validationToast.style.display = 'none';
        }
    }

    function validateCurrentStep() {
        const currentCard = cards[currentStep];
        const pregId = currentCard.dataset.preguntaId;
        const isRequired = currentCard.dataset.requerida === 'true';
        const tipo = currentCard.dataset.tipo;

        if (!isRequired) return true; // Si no es requerida, pasa directo

        const data = respuestasData[pregId];

        if (!data) {
            showValidationError('Por favor completa esta pregunta antes de continuar.');
            return false;
        }

        if (tipo === 'CARITAS' || tipo === 'ESTRELLAS') {
            if (!data.valor_numerico) {
                showValidationError('Selecciona una calificación para continuar.');
                return false;
            }
        } else if (tipo === 'OPCION_UNICA') {
            if (!data.opciones || data.opciones.length === 0) {
                showValidationError('Selecciona una opción para continuar.');
                return false;
            }
        } else if (tipo === 'OPCION_MULTIPLE') {
            if (!data.opciones || data.opciones.length === 0) {
                showValidationError('Selecciona al menos una opción para continuar.');
                return false;
            }
        } else if (tipo === 'TEXTO') {
            if (!data.valor_texto || data.valor_texto.trim() === '') {
                showValidationError('Por favor escribe tu respuesta para continuar.');
                return false;
            }
        }

        return true;
    }

    // Handlers para Caritas
    document.querySelectorAll('.caritas-group').forEach(group => {
        const pregId = group.dataset.preguntaId;
        group.querySelectorAll('.carita-item').forEach(item => {
            item.addEventListener('click', () => {
                const valor = parseInt(item.dataset.valor);
                group.querySelectorAll('.carita-item').forEach(c => c.classList.remove('selected'));
                item.classList.add('selected');

                respuestasData[pregId] = {
                    valor_numerico: valor,
                    valor_texto: null,
                    opciones: []
                };
                hideValidationError();
            });
        });
    });

    // Handlers para Estrellas
    document.querySelectorAll('.stars-group').forEach(group => {
        const stars = group.querySelectorAll('.star-item');
        const pregId = group.dataset.preguntaId;

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const valor = parseInt(star.dataset.valor);
                stars.forEach(s => {
                    const v = parseInt(s.dataset.valor);
                    if (v <= valor) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });

                respuestasData[pregId] = {
                    valor_numerico: valor,
                    valor_texto: null,
                    opciones: []
                };
                hideValidationError();
            });
        });
    });

    // Handlers para Opción Única (Radio)
    document.querySelectorAll('.options-list[data-tipo="OPCION_UNICA"]').forEach(group => {
        const pregId = group.dataset.preguntaId;

        group.querySelectorAll('.option-item').forEach(item => {
            const radio = item.querySelector('input[type="radio"]');

            item.addEventListener('click', () => {
                group.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
                item.classList.add('selected');
                if (radio) radio.checked = true;

                respuestasData[pregId] = {
                    valor_numerico: null,
                    valor_texto: null,
                    opciones: [parseInt(radio.value)]
                };
                hideValidationError();
            });
        });
    });

    // Handlers para Opción Múltiple (Checkbox)
    document.querySelectorAll('.options-list[data-tipo="OPCION_MULTIPLE"]').forEach(group => {
        const pregId = group.dataset.preguntaId;

        group.querySelectorAll('.option-item').forEach(item => {
            const chk = item.querySelector('input[type="checkbox"]');

            item.addEventListener('click', (e) => {
                if (e.target !== chk) {
                    chk.checked = !chk.checked;
                }
                item.classList.toggle('selected', chk.checked);

                const selectedIds = [];
                group.querySelectorAll('input[type="checkbox"]:checked').forEach(c => {
                    selectedIds.push(parseInt(c.value));
                });

                respuestasData[pregId] = {
                    valor_numerico: null,
                    valor_texto: null,
                    opciones: selectedIds
                };
                hideValidationError();
            });
        });
    });

    // Handlers para Texto Libre
    document.querySelectorAll('.custom-textarea').forEach(textarea => {
        const pregId = textarea.dataset.preguntaId;

        textarea.addEventListener('input', () => {
            respuestasData[pregId] = {
                valor_numerico: null,
                valor_texto: textarea.value,
                opciones: []
            };
            if (textarea.value.trim() !== '') {
                hideValidationError();
            }
        });
    });

    // Navegación
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < totalSteps - 1) {
                    currentStep++;
                    updateStepVisibility();
                }
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateStepVisibility();
            }
        });
    }

    // Envío del Formulario
    if (surveyForm) {
        surveyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateCurrentStep()) return;

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = 'Enviando...';

            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

            const payload = {
                nombre_participante: 'Anónimo',
                email_participante: '',
                respuestas: respuestasData
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

                if (response.ok && result.success) {
                    window.location.href = '/gracias/';
                } else {
                    showValidationError(result.error || 'Ocurrió un error al guardar las respuestas.');
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = 'Enviar Encuesta';
                }
            } catch (err) {
                console.error('Error de red:', err);
                showValidationError('Error de conexión con el servidor. Inténtalo nuevamente.');
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Enviar Encuesta';
            }
        });
    }

    // Inicializar visualización del paso 0
    updateStepVisibility();
});
