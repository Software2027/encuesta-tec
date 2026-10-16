document.addEventListener('DOMContentLoaded', () => {
    const dashboardContainer = document.getElementById('dashboard-app');
    if (!dashboardContainer) return;

    fetchEstadisticas();

    async function fetchEstadisticas() {
        try {
            const response = await fetch('/api/estadisticas/');
            const data = await response.json();

            if (data.success) {
                renderKPIs(data);
                renderCharts(data);
            }
        } catch (err) {
            console.error('Error cargando estadísticas:', err);
        }
    }

    function renderKPIs(data) {
        const totalElem = document.getElementById('kpi-total');
        const avgElem = document.getElementById('kpi-promedio');
        const textElem = document.getElementById('kpi-comentarios');

        if (totalElem) totalElem.textContent = data.total_respuestas;
        if (avgElem) avgElem.textContent = `${data.promedio_general.toFixed(1)} / 5`;
        if (textElem) textElem.textContent = data.total_comentarios;
    }

    function renderCharts(data) {
        // 1. Gráfico de Caritas de Satisfacción (Dona / Pie)
        const ctxSatisfaccion = document.getElementById('chart-satisfaccion')?.getContext('2d');
        if (ctxSatisfaccion && data.satisfaccion_distribucion) {
            new Chart(ctxSatisfaccion, {
                type: 'doughnut',
                data: {
                    labels: ['Muy Insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy Satisfecho'],
                    datasets: [{
                        data: [
                            data.satisfaccion_distribucion[1] || 0,
                            data.satisfaccion_distribucion[2] || 0,
                            data.satisfaccion_distribucion[3] || 0,
                            data.satisfaccion_distribucion[4] || 0,
                            data.satisfaccion_distribucion[5] || 0,
                        ],
                        backgroundColor: [
                            '#ef4444', // Rojo
                            '#f97316', // Naranja
                            '#eab308', // Amarillo
                            '#06b6d4', // Cyan
                            '#0d9488'  // Teal
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    cutout: '70%'
                }
            });
        }

        // 2. Gráfico de Promedio por Pregunta Numérica (Barras)
        const ctxPreguntas = document.getElementById('chart-preguntas')?.getContext('2d');
        if (ctxPreguntas && data.promedios_preguntas) {
            const labels = data.promedios_preguntas.map(p => p.enunciado);
            const values = data.promedios_preguntas.map(p => p.promedio);

            new Chart(ctxPreguntas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Promedio (1 a 5)',
                        data: values,
                        backgroundColor: '#0d9488',
                        borderRadius: 8,
                        hoverBackgroundColor: '#06b6d4'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            min: 0,
                            max: 5,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
});
