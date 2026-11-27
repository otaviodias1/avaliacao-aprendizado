function GraficoCanvas({ tipo, labels, datasets, maxEixoY, horizontal, unidade, mostrarLegenda, empilhado, inteiro }) {
    const { useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || labels.length === 0) return;
        if (chartRef.current) chartRef.current.destroy();

        const eixoValor = {
            beginAtZero: true,
            stacked: !!empilhado,
            grid: { color: '#e2e8f0', drawBorder: false },
            ticks: {
                color: '#64748b',
                font: { size: 12 },
                stepSize: inteiro ? 1 : undefined,
                precision: inteiro ? 0 : undefined,
                callback: (val) => (unidade ? `${val}${unidade}` : val),
            },
        };
        if (maxEixoY !== undefined && maxEixoY !== null) {
            eixoValor.max = maxEixoY;
        }

        const eixoCategoria = {
            stacked: !!empilhado,
            grid: { display: false },
            ticks: {
                color: '#334155',
                font: { size: 12 },
                callback: function (value) {
                    const label = this.getLabelForValue(value);
                    return label && label.length > 32 ? `${label.slice(0, 30)}...` : label;
                },
            },
        };

        chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
            type: tipo,
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: horizontal ? 'y' : 'x',
                plugins: {
                    legend: {
                        display: !!mostrarLegenda,
                        position: 'bottom',
                        labels: { usePointStyle: true, boxWidth: 10, padding: 16, color: '#334155' },
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        padding: 10,
                        cornerRadius: 6,
                        callbacks: {
                            label: (ctx) => {
                                const val = horizontal ? ctx.parsed.x : ctx.parsed.y;
                                const sufixo = unidade ? unidade : '';
                                return ` ${ctx.dataset.label}: ${val}${sufixo}`;
                            },
                        },
                    },
                },
                scales: horizontal
                    ? { x: eixoValor, y: eixoCategoria }
                    : { x: eixoCategoria, y: eixoValor },
            },
        });

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [tipo, labels, datasets, maxEixoY, horizontal, unidade, mostrarLegenda, empilhado, inteiro]);

    if (labels.length === 0) {
        return <div className="vazio-box">Sem dados suficientes para gerar o gráfico.</div>;
    }

    return (
        <div className="report-chart-wrap">
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

window.GraficoCanvas = GraficoCanvas;
