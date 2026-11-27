function TelaRelatorios() {
    const { useState, useEffect } = React;
    const [mediasAvaliacao, setMediasAvaliacao] = useState([]);
    const [rankingQuestoes, setRankingQuestoes] = useState([]);
    const [participacaoAvaliacoes, setParticipacaoAvaliacoes] = useState([]);
    const [abaAtiva, setAbaAtiva] = useState('todos');
    const [carregando, setCarregando] = useState(false);

    async function carregarTodosRelatorios() {
        setCarregando(true);
        try {
            const [res1, res2, res3] = await Promise.all([
                fetch(`${API_BASE}/relatorios/medias`),
                fetch(`${API_BASE}/relatorios/questoes-erros`),
                fetch(`${API_BASE}/relatorios/participacao`),
            ]);
            setMediasAvaliacao(res1.ok ? await res1.json() : []);
            setRankingQuestoes(res2.ok ? await res2.json() : []);
            setParticipacaoAvaliacoes(res3.ok ? await res3.json() : []);
        } catch {
            setMediasAvaliacao([]);
            setRankingQuestoes([]);
            setParticipacaoAvaliacoes([]);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarTodosRelatorios();
    }, []);

    const avaliacoesComNotas = mediasAvaliacao.filter((d) => Number(d.totalAlunos) > 0);
    const mediaGeral = avaliacoesComNotas.length > 0
        ? avaliacoesComNotas.reduce((acc, d) => acc + Number(d.media), 0) / avaliacoesComNotas.length
        : 0;
    const totalRespondidas = participacaoAvaliacoes.reduce((acc, d) => acc + Number(d.respondidas), 0);
    const totalPendentes = participacaoAvaliacoes.reduce((acc, d) => acc + Number(d.pendentes), 0);
    const totalAtribuicoes = totalRespondidas + totalPendentes;
    const taxaParticipacao = totalAtribuicoes > 0 ? (totalRespondidas * 100) / totalAtribuicoes : 0;
    const maiorErro = rankingQuestoes.length > 0 ? rankingQuestoes[0] : null;

    const corNota = (nota) => {
        if (nota >= 7) return '#16a34a';
        if (nota >= 5) return '#0284c7';
        return '#f59e0b';
    };

    const classeNota = (nota, total) => {
        if (Number(total) === 0) return 'cinza';
        if (nota >= 7) return 'verde';
        if (nota >= 5) return 'azul';
        return 'amarelo';
    };

    const corErro = (pct) => {
        if (pct >= 60) return '#dc2626';
        if (pct >= 30) return '#f59e0b';
        return '#16a34a';
    };

    const classeErro = (pct) => {
        if (pct >= 60) return 'vermelho';
        if (pct >= 30) return 'amarelo';
        return 'verde';
    };

    const expandido = abaAtiva !== 'todos';

    return (
        <section className="tela active">
            <div className="relatorio-topo">
                <div>
                    <h1>Relatórios de Desempenho</h1>
                    <p className="subtitle" style={{ marginBottom: 0 }}>Indicadores consolidados de notas, erros por questão e participação</p>
                </div>
                <div className="relatorio-acoes">
                    <div className="relatorio-tabs">
                        <button type="button" className={`relatorio-tab ${abaAtiva === 'todos' ? 'active' : ''}`} onClick={() => setAbaAtiva('todos')}>
                            Todos
                        </button>
                        <button type="button" className={`relatorio-tab ${abaAtiva === 'medias' ? 'active' : ''}`} onClick={() => setAbaAtiva('medias')}>
                            Médias
                        </button>
                        <button type="button" className={`relatorio-tab ${abaAtiva === 'erros' ? 'active' : ''}`} onClick={() => setAbaAtiva('erros')}>
                            Erros
                        </button>
                        <button type="button" className={`relatorio-tab ${abaAtiva === 'participacao' ? 'active' : ''}`} onClick={() => setAbaAtiva('participacao')}>
                            Participação
                        </button>
                    </div>
                    <button type="button" className="btn-secondary" style={{ marginTop: 0 }} onClick={carregarTodosRelatorios} disabled={carregando}>
                        {carregando ? 'Atualizando...' : 'Atualizar'}
                    </button>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">Média Geral</div>
                    <div className="kpi-valor">{mediaGeral.toFixed(2)}</div>
                    <div className="kpi-sub">{avaliacoesComNotas.length} avaliação(ões) com entregas</div>
                </div>
                <div className="kpi-card verde">
                    <div className="kpi-label">Participação</div>
                    <div className="kpi-valor">{taxaParticipacao.toFixed(0)}%</div>
                    <div className="kpi-sub">{totalRespondidas} de {totalAtribuicoes} atribuída(s)</div>
                </div>
                <div className="kpi-card amarelo">
                    <div className="kpi-label">Provas Pendentes</div>
                    <div className="kpi-valor">{totalPendentes}</div>
                    <div className="kpi-sub">Aguardando finalização</div>
                </div>
                <div className="kpi-card vermelho">
                    <div className="kpi-label">Maior Índice de Erro</div>
                    <div className="kpi-valor">{maiorErro ? `${Number(maiorErro.percentualErro).toFixed(1)}%` : '0.0%'}</div>
                    <div className="kpi-sub">{maiorErro ? maiorErro.questao.split(' - ')[0] : 'Sem respostas'}</div>
                </div>
            </div>

            {(abaAtiva === 'todos' || abaAtiva === 'medias') && (
                <div className="report-card">
                    <div className="report-card-header">
                        <div className="report-num">01</div>
                        <div>
                            <h3>Média de Notas por Avaliação</h3>
                            <p>Desempenho médio das entregas finalizadas e corrigidas</p>
                        </div>
                    </div>
                    <div className={`report-body ${expandido ? 'expandido' : ''}`}>
                        <GraficoCanvas
                            tipo="bar"
                            labels={mediasAvaliacao.map((d) => d.avaliacao)}
                            datasets={[{
                                label: 'Média da Turma',
                                data: mediasAvaliacao.map((d) => Number(d.media)),
                                backgroundColor: mediasAvaliacao.map((d) => corNota(Number(d.media))),
                                borderRadius: 8,
                                maxBarThickness: 48,
                            }]}
                            maxEixoY={10}
                            unidade=" pts"
                        />
                        <div className="report-table-wrap">
                            {mediasAvaliacao.length === 0 ? (
                                <div className="vazio-box">Nenhuma avaliação cadastrada.</div>
                            ) : (
                                <table className="report-table">
                                    <thead>
                                    <tr>
                                        <th>Avaliação</th>
                                        <th>Entregas</th>
                                        <th>Média</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {mediasAvaliacao.map((d, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{d.avaliacao}</strong></td>
                                            <td>{d.totalAlunos}</td>
                                            <td>
                                                <span className={`pill ${classeNota(Number(d.media), d.totalAlunos)}`}>
                                                    {Number(d.totalAlunos) > 0 ? Number(d.media).toFixed(2) : 'Sem entregas'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(abaAtiva === 'todos' || abaAtiva === 'erros') && (
                <div className="report-card">
                    <div className="report-card-header">
                        <div className="report-num vermelho">02</div>
                        <div>
                            <h3>Ranking de Questões com Maior Índice de Erro</h3>
                            <p>Percentual de respostas com nota inferior ao valor integral da questão</p>
                        </div>
                    </div>
                    <div className={`report-body ${expandido ? 'expandido' : ''}`}>
                        <GraficoCanvas
                            tipo="bar"
                            horizontal={true}
                            labels={rankingQuestoes.map((d) => d.questao)}
                            datasets={[{
                                label: 'Índice de Erro',
                                data: rankingQuestoes.map((d) => Number(d.percentualErro)),
                                backgroundColor: rankingQuestoes.map((d) => corErro(Number(d.percentualErro))),
                                borderRadius: 6,
                                maxBarThickness: 28,
                            }]}
                            maxEixoY={100}
                            unidade="%"
                        />
                        <div className="report-table-wrap">
                            {rankingQuestoes.length === 0 ? (
                                <div className="vazio-box">Nenhuma questão corrigida ainda.</div>
                            ) : (
                                <table className="report-table">
                                    <thead>
                                    <tr>
                                        <th>Questão</th>
                                        <th>Respostas</th>
                                        <th>Índice de Erro</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {rankingQuestoes.map((d, idx) => {
                                        const pct = Number(d.percentualErro);
                                        return (
                                            <tr key={idx}>
                                                <td>{d.questao}</td>
                                                <td>{d.totalRespostas}</td>
                                                <td>
                                                    <div className="barra-cell">
                                                        <div className="barra-track">
                                                            <div
                                                                className="barra-fill"
                                                                style={{ width: `${Math.min(100, pct)}%`, backgroundColor: corErro(pct) }}
                                                            ></div>
                                                        </div>
                                                        <span className={`pill ${classeErro(pct)}`}>{pct.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(abaAtiva === 'todos' || abaAtiva === 'participacao') && (
                <div className="report-card">
                    <div className="report-card-header">
                        <div className="report-num verde">03</div>
                        <div>
                            <h3>Participação por Avaliação</h3>
                            <p>Comparativo entre entregas respondidas e alunos ainda pendentes</p>
                        </div>
                    </div>
                    <div className={`report-body ${expandido ? 'expandido' : ''}`}>
                        <GraficoCanvas
                            tipo="bar"
                            labels={participacaoAvaliacoes.map((d) => d.avaliacao)}
                            datasets={[
                                {
                                    label: 'Respondidas',
                                    data: participacaoAvaliacoes.map((d) => Number(d.respondidas)),
                                    backgroundColor: '#16a34a',
                                    borderRadius: 6,
                                    maxBarThickness: 44,
                                },
                                {
                                    label: 'Pendentes',
                                    data: participacaoAvaliacoes.map((d) => Number(d.pendentes)),
                                    backgroundColor: '#f59e0b',
                                    borderRadius: 6,
                                    maxBarThickness: 44,
                                },
                            ]}
                            mostrarLegenda={true}
                            empilhado={true}
                            inteiro={true}
                        />
                        <div className="report-table-wrap">
                            {participacaoAvaliacoes.length === 0 ? (
                                <div className="vazio-box">Nenhuma avaliação cadastrada.</div>
                            ) : (
                                <table className="report-table">
                                    <thead>
                                    <tr>
                                        <th>Avaliação</th>
                                        <th>Respondidas</th>
                                        <th>Pendentes</th>
                                        <th>Conclusão</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {participacaoAvaliacoes.map((d, idx) => {
                                        const resp = Number(d.respondidas);
                                        const pend = Number(d.pendentes);
                                        const tot = resp + pend;
                                        const pct = tot > 0 ? (resp * 100) / tot : 0;
                                        return (
                                            <tr key={idx}>
                                                <td><strong>{d.avaliacao}</strong></td>
                                                <td><span className="pill verde">{resp}</span></td>
                                                <td><span className={`pill ${pend > 0 ? 'amarelo' : 'cinza'}`}>{pend}</span></td>
                                                <td>
                                                    <div className="barra-cell">
                                                        <div className="barra-track">
                                                            <div
                                                                className="barra-fill"
                                                                style={{ width: `${pct}%`, backgroundColor: '#16a34a' }}
                                                            ></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                                                            {tot > 0 ? `${pct.toFixed(0)}%` : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

window.TelaRelatorios = TelaRelatorios;
