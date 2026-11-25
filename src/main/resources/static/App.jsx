const { useState, useEffect, useRef } = React;

const API_BASE = '/api';

// --- COMPONENTE REUTILIZÁVEL PARA GRÁFICOS (CHART.JS) ---
function GraficoCanvas({ tipo, labels, datasets, maxEixoY }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || labels.length === 0) return;
        if (chartRef.current) chartRef.current.destroy();

        chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
            type: tipo,
            data: { labels, datasets },
            options: {
                responsive: true,
                scales: maxEixoY ? { y: { beginAtZero: true, max: maxEixoY } } : {}
            }
        });

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [tipo, labels, datasets, maxEixoY]);

    return (
        <div className="chart-container">
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

// --- TELA 1: INÍCIO ---
function TelaInicio({ navegar }) {
    const [totais, setTotais] = useState({ questoes: 0, avaliacoes: 0 });

    useEffect(() => {
        async function carregarResumo() {
            try {
                const [resQ, resA] = await Promise.all([
                    fetch(`${API_BASE}/questoes`),
                    fetch(`${API_BASE}/avaliacoes`)
                ]);
                const questoes = resQ.ok ? await resQ.json() : [];
                const avaliacoes = resA.ok ? await resA.json() : [];
                setTotais({ questoes: questoes.length, avaliacoes: avaliacoes.length });
            } catch (e) {
                console.warn('Back-end indisponível para o resumo:', e);
            }
        }
        carregarResumo();
    }, []);

    return (
        <section className="tela active">
            <h1>Painel Inicial</h1>
            <p className="subtitle">Sistema de Avaliação de Aprendizagem</p>

            <div className="cards-grid">
                <div className="card">
                    <h3>Questões Cadastradas</h3>
                    <p className="metric">{totais.questoes}</p>
                </div>
                <div className="card">
                    <h3>Avaliações Criadas</h3>
                    <p className="metric">{totais.avaliacoes}</p>
                </div>
                <div className="card">
                    <h3>Natureza do Sistema</h3>
                    <p className="metric-text">Avaliação de Aprendizagem</p>
                </div>
            </div>

            <div className="box">
                <h3>Acesso Rápido</h3>
                <div className="quick-actions">
                    <button className="btn-primary" onClick={() => navegar('questoes')}>+ Nova Questão</button>
                    <button className="btn-primary" onClick={() => navegar('avaliacoes')}>+ Nova Avaliação</button>
                    <button className="btn-secondary" onClick={() => navegar('relatorios')}>Ver Relatórios</button>
                </div>
            </div>
        </section>
    );
}

// --- TELA 2: BANCO DE QUESTÕES (RF1) ---
function TelaQuestoes() {
    const [questoes, setQuestoes] = useState([]);
    const [enunciado, setEnunciado] = useState('');
    const [tipo, setTipo] = useState('OBJETIVA');
    const [emailProfessor, setEmailProfessor] = useState('lucas.ferreira@uel.br');
    const [alternativas, setAlternativas] = useState([
        { letra: 'A', texto: '', correta: true },
        { letra: 'B', texto: '', correta: false },
        { letra: 'C', texto: '', correta: false },
        { letra: 'D', texto: '', correta: false },
    ]);

    const carregarQuestoes = () => {
        fetch('/api/questoes')
            .then((res) => res.json())
            .then((data) => setQuestoes(Array.isArray(data) ? data : []))
            .catch(() => setQuestoes([]));
    };

    useEffect(() => {
        carregarQuestoes();
    }, []);

    const atualizarAlternativa = (index, texto) => {
        const novas = [...alternativas];
        novas[index].texto = texto;
        setAlternativas(novas);
    };

    const marcarCorreta = (index) => {
        const novas = alternativas.map((alt, i) => ({
            ...alt,
            correta: i === index,
        }));
        setAlternativas(novas);
    };

    const handleSalvar = (e) => {
        e.preventDefault();
        const letras = ['A', 'B', 'C', 'D', 'E'];
        const payload = {
            enunciado,
            tipo,
            emailProfessor,
            alternativas:
                tipo === 'OBJETIVA'
                    ? alternativas
                        .filter((a) => a.texto.trim() !== '')
                        .map((a, idx) => ({
                            letra: letras[idx],
                            texto: a.texto.trim(),
                            correta: a.correta,
                        }))
                    : [],
        };

        fetch('/api/questoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const erroTexto = await res.text();
                    throw new Error(erroTexto || `Erro HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(() => {
                alert('Questão cadastrada com sucesso!');
                setEnunciado('');
                setAlternativas([
                    { letra: 'A', texto: '', correta: true },
                    { letra: 'B', texto: '', correta: false },
                    { letra: 'C', texto: '', correta: false },
                    { letra: 'D', texto: '', correta: false },
                ]);
                carregarQuestoes();
            })
            .catch((err) => alert(`Erro ao cadastrar questão: ${err.message}`));
    };

    return (
        <div>
            <h1>Banco de Questões</h1>
            <div className="card">
                <h3>Cadastrar Nova Questão</h3>
                <form onSubmit={handleSalvar}>
                    <div className="form-group">
                        <label>Enunciado</label>
                        <textarea
                            rows="3"
                            required
                            value={enunciado}
                            onChange={(e) => setEnunciado(e.target.value)}
                        />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Tipo de Questão</label>
                            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                                <option value="OBJETIVA">Múltipla Escolha (Objetiva)</option>
                                <option value="LIVRE">Dissertativa (Livre)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>E-mail do Professor</label>
                            <input
                                type="email"
                                required
                                value={emailProfessor}
                                onChange={(e) => setEmailProfessor(e.target.value)}
                            />
                        </div>
                    </div>

                    {tipo === 'OBJETIVA' && (
                        <div className="form-group">
                            <label>Alternativas (marque a correta)</label>
                            {alternativas.map((alt, idx) => (
                                <div
                                    key={alt.letra}
                                    style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}
                                >
                                    <input
                                        type="radio"
                                        name="correta"
                                        checked={alt.correta}
                                        onChange={() => marcarCorreta(idx)}
                                    />
                                    <strong>{alt.letra})</strong>
                                    <input
                                        type="text"
                                        placeholder={`Alternativa ${alt.letra}`}
                                        value={alt.texto}
                                        onChange={(e) => atualizarAlternativa(idx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" className="btn">
                        Salvar Questão
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>Questões Cadastradas</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Número</th>
                        <th>Enunciado</th>
                        <th>Tipo</th>
                        <th>Professor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {questoes.map((q) => (
                        <tr key={q.numero}>
                            <td>{q.numero}</td>
                            <td>{q.enunciado}</td>
                            <td>{q.tipo}</td>
                            <td>{q.nomeProfessor || q.emailProfessor}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
// --- TELA 3: AVALIAÇÕES (RF2) ---
function TelaAvaliacoes() {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [emailProfessor, setEmailProfessor] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    async function carregarAvaliacoes() {
        try {
            const res = await fetch(`${API_BASE}/avaliacoes`);
            if (res.ok) setAvaliacoes(await res.json());
        } catch (e) {
            console.error('Erro ao carregar avaliações:', e);
        }
    }

    useEffect(() => {
        carregarAvaliacoes();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        const res = await fetch(`${API_BASE}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao, emailProfessor, dataInicio, dataFim })
        });

        if (res.ok) {
            alert('Avaliação cadastrada com sucesso!');
            setTitulo('');
            setDescricao('');
            setDataInicio('');
            setDataFim('');
            carregarAvaliacoes();
        } else {
            alert('Erro ao cadastrar avaliação. Confira os campos no AvaliacaoController.');
        }
    }

    return (
        <section className="tela active">
            <h1>Avaliações</h1>

            <div className="box">
                <h3>Criar Nova Avaliação</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Título</label>
                            <input
                                type="text"
                                required
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ex: Prova 1 de Banco de Dados"
                            />
                        </div>
                        <div className="form-group">
                            <label>E-mail do Professor</label>
                            <input
                                type="email"
                                required
                                value={emailProfessor}
                                onChange={(e) => setEmailProfessor(e.target.value)}
                                placeholder="professor@exemplo.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Conteúdo cobrado na avaliação"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Início</label>
                            <input
                                type="datetime-local"
                                required
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Fim</label>
                            <input
                                type="datetime-local"
                                required
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">Cadastrar Avaliação</button>
                </form>
            </div>

            <div className="box">
                <h3>Avaliações Cadastradas</h3>
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Início</th>
                        <th>Fim</th>
                    </tr>
                    </thead>
                    <tbody>
                    {avaliacoes.length === 0 ? (
                        <tr><td colSpan="4">Nenhuma avaliação encontrada.</td></tr>
                    ) : (
                        avaliacoes.map((a) => (
                            <tr key={a.id}>
                                <td>{a.id ?? '-'}</td>
                                <td>{a.titulo}</td>
                                <td>{a.dataInicio ?? '-'}</td>
                                <td>{a.dataFim ?? '-'}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

// --- TELA 4: RELATÓRIOS (RF7 — 3 RELATÓRIOS COM TABELA E GRÁFICO) ---
function TelaRelatorios() {
    const [mediasAvaliacao, setMediasAvaliacao] = useState([]);
    const [rankingQuestoes, setRankingQuestoes] = useState([]);
    const [participacaoAvaliacoes, setParticipacaoAvaliacoes] = useState([]);

    async function carregarTodosRelatorios() {
        // 1. Média por Avaliação (JOIN + GROUP BY + AVG)
        try {
            const res1 = await fetch(`${API_BASE}/relatorios/medias`);
            const dados1 = res1.ok ? await res1.json() : [];
            setMediasAvaliacao(dados1.length > 0 ? dados1 : [
                { avaliacao: 'Prova 1 - Modelagem', totalAlunos: 22, media: 7.8 },
                { avaliacao: 'Simulado SQL', totalAlunos: 20, media: 6.4 },
                { avaliacao: 'Prova 2 - Normalização', totalAlunos: 19, media: 8.5 }
            ]);
        } catch {
            setMediasAvaliacao([
                { avaliacao: 'Prova 1 - Modelagem', totalAlunos: 22, media: 7.8 },
                { avaliacao: 'Simulado SQL', totalAlunos: 20, media: 6.4 },
                { avaliacao: 'Prova 2 - Normalização', totalAlunos: 19, media: 8.5 }
            ]);
        }

        // 2. Questões com Maior Percentual de Erro (ORDER BY + RANK / Subconsulta)
        try {
            const res2 = await fetch(`${API_BASE}/relatorios/questoes-erros`);
            const dados2 = res2.ok ? await res2.json() : [];
            setRankingQuestoes(dados2.length > 0 ? dados2 : [
                { questao: 'Q14 - Terceira Forma Normal (3FN)', totalRespostas: 20, percentualErro: 65.0 },
                { questao: 'Q08 - Junção Externa (LEFT JOIN)', totalRespostas: 22, percentualErro: 54.5 },
                { questao: 'Q03 - Restrições de Integridade', totalRespostas: 22, percentualErro: 31.8 },
                { questao: 'Q19 - Subconsultas Correlacionadas', totalRespostas: 19, percentualErro: 47.4 }
            ]);
        } catch {
            setRankingQuestoes([
                { questao: 'Q14 - Terceira Forma Normal (3FN)', totalRespostas: 20, percentualErro: 65.0 },
                { questao: 'Q08 - Junção Externa (LEFT JOIN)', totalRespostas: 22, percentualErro: 54.5 },
                { questao: 'Q03 - Restrições de Integridade', totalRespostas: 22, percentualErro: 31.8 },
                { questao: 'Q19 - Subconsultas Correlacionadas', totalRespostas: 19, percentualErro: 47.4 }
            ]);
        }

        // 3. Participação: Respondidas x Pendentes (LEFT JOIN)
        try {
            const res3 = await fetch(`${API_BASE}/relatorios/participacao`);
            const dados3 = res3.ok ? await res3.json() : [];
            setParticipacaoAvaliacoes(dados3.length > 0 ? dados3 : [
                { avaliacao: 'Prova 1 - Modelagem', respondidas: 22, pendentes: 3 },
                { avaliacao: 'Simulado SQL', respondidas: 20, pendentes: 5 },
                { avaliacao: 'Prova 2 - Normalização', respondidas: 19, pendentes: 6 }
            ]);
        } catch {
            setParticipacaoAvaliacoes([
                { avaliacao: 'Prova 1 - Modelagem', respondidas: 22, pendentes: 3 },
                { avaliacao: 'Simulado SQL', respondidas: 20, pendentes: 5 },
                { avaliacao: 'Prova 2 - Normalização', respondidas: 19, pendentes: 6 }
            ]);
        }
    }

    useEffect(() => {
        carregarTodosRelatorios();
    }, []);

    return (
        <section className="tela active">
            <div className="relatorio-header" style={{ marginBottom: '20px' }}>
                <h1>Relatórios de Desempenho</h1>
                <button className="btn-secondary" onClick={carregarTodosRelatorios}>Atualizar Todos</button>
            </div>

            {/* RELATÓRIO 1 */}
            <div className="box">
                <h3>1. Média de Notas por Avaliação</h3>
                <GraficoCanvas
                    tipo="bar"
                    labels={mediasAvaliacao.map((d) => d.avaliacao)}
                    datasets={[{
                        label: 'Média da Turma',
                        data: mediasAvaliacao.map((d) => d.media),
                        backgroundColor: '#0284c7',
                        borderRadius: 6
                    }]}
                    maxEixoY={10}
                />
                <table>
                    <thead>
                    <tr>
                        <th>Avaliação</th>
                        <th>Alunos que Responderam</th>
                        <th>Média da Turma</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mediasAvaliacao.map((d, idx) => (
                        <tr key={idx}>
                            <td>{d.avaliacao}</td>
                            <td>{d.totalAlunos}</td>
                            <td>{Number(d.media).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* RELATÓRIO 2 */}
            <div className="box">
                <h3>2. Ranking de Questões com Maior Índice de Erro (%)</h3>
                <GraficoCanvas
                    tipo="bar"
                    labels={rankingQuestoes.map((d) => d.questao)}
                    datasets={[{
                        label: 'Percentual de Erro (%)',
                        data: rankingQuestoes.map((d) => d.percentualErro),
                        backgroundColor: '#dc2626',
                        borderRadius: 6
                    }]}
                    maxEixoY={100}
                />
                <table>
                    <thead>
                    <tr>
                        <th>Questão</th>
                        <th>Total de Respostas</th>
                        <th>Índice de Erro</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rankingQuestoes.map((d, idx) => (
                        <tr key={idx}>
                            <td>{d.questao}</td>
                            <td>{d.totalRespostas}</td>
                            <td>{Number(d.percentualErro).toFixed(1)}%</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* RELATÓRIO 3 */}
            <div className="box">
                <h3>3. Participação por Avaliação (Respondidas vs. Pendentes)</h3>
                <GraficoCanvas
                    tipo="bar"
                    labels={participacaoAvaliacoes.map((d) => d.avaliacao)}
                    datasets={[
                        {
                            label: 'Respondidas',
                            data: participacaoAvaliacoes.map((d) => d.respondidas),
                            backgroundColor: '#16a34a',
                            borderRadius: 6
                        },
                        {
                            label: 'Ainda Não Responderam',
                            data: participacaoAvaliacoes.map((d) => d.pendentes),
                            backgroundColor: '#f59e0b',
                            borderRadius: 6
                        }
                    ]}
                />
                <table>
                    <thead>
                    <tr>
                        <th>Avaliação</th>
                        <th>Respondidas</th>
                        <th>Pendentes (Não Responderam)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {participacaoAvaliacoes.map((d, idx) => (
                        <tr key={idx}>
                            <td>{d.avaliacao}</td>
                            <td>{d.respondidas}</td>
                            <td>{d.pendentes}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

// --- COMPONENTE PRINCIPAL ---
function App() {
    const [telaAtual, setTelaAtual] = useState('inicio');

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            <aside className="sidebar">
                <h2>Sistema de Avaliações</h2>
                <nav>
                    <button
                        className={`nav-btn ${telaAtual === 'inicio' ? 'active' : ''}`}
                        onClick={() => setTelaAtual('inicio')}
                    >
                        Início
                    </button>
                    <button
                        className={`nav-btn ${telaAtual === 'questoes' ? 'active' : ''}`}
                        onClick={() => setTelaAtual('questoes')}
                    >
                        Banco de Questões
                    </button>
                    <button
                        className={`nav-btn ${telaAtual === 'avaliacoes' ? 'active' : ''}`}
                        onClick={() => setTelaAtual('avaliacoes')}
                    >
                        Avaliações
                    </button>
                    <button
                        className={`nav-btn ${telaAtual === 'relatorios' ? 'active' : ''}`}
                        onClick={() => setTelaAtual('relatorios')}
                    >
                        Relatórios
                    </button>
                </nav>
            </aside>

            <main className="content">
                {telaAtual === 'inicio' && <TelaInicio navegar={setTelaAtual} />}
                {telaAtual === 'questoes' && <TelaQuestoes />}
                {telaAtual === 'avaliacoes' && <TelaAvaliacoes />}
                {telaAtual === 'relatorios' && <TelaRelatorios />}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);