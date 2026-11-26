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
                    <button className="btn-secondary" onClick={() => navegar('composicao')}>Montar Prova</button>
                    <button className="btn-secondary" onClick={() => navegar('responder')}>Responder Prova</button>
                    <button className="btn-secondary" onClick={() => navegar('resultados')}>Notas e Correção</button>
                    <button className="btn-secondary" onClick={() => navegar('relatorios')}>Relatórios</button>
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
    const [emailProfessor, setEmailProfessor] = useState('carlos.mendes@uel.br');
    const [alternativas, setAlternativas] = useState([
        { letra: 'A', texto: '', correta: true },
        { letra: 'B', texto: '', correta: false },
        { letra: 'C', texto: '', correta: false },
        { letra: 'D', texto: '', correta: false },
    ]);

    const carregarQuestoes = () => {
        fetch(`${API_BASE}/questoes`)
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

        fetch(`${API_BASE}/questoes`, {
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
                                <option value="TEXTO_LIVRE">Dissertativa (Texto Livre)</option>
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
                                        style={{ width: 'auto' }}
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
    const [codigo, setCodigo] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [emailProfessor, setEmailProfessor] = useState('carlos.mendes@uel.br');

    const carregarAvaliacoes = () => {
        fetch(`${API_BASE}/avaliacoes`)
            .then((res) => res.json())
            .then((dados) => setAvaliacoes(Array.isArray(dados) ? dados : []))
            .catch(() => setAvaliacoes([]));
    };

    useEffect(() => {
        carregarAvaliacoes();
    }, []);

    const handleSalvar = (e) => {
        e.preventDefault();
        const payload = {
            codigo: codigo.trim(),
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            data: data || null,
            horaInicio,
            horaFim,
            emailProfessor: emailProfessor.trim(),
        };

        fetch(`${API_BASE}/avaliacoes`, {
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
                alert('Avaliação cadastrada com sucesso!');
                setCodigo('');
                setTitulo('');
                setDescricao('');
                setData('');
                setHoraInicio('');
                setHoraFim('');
                carregarAvaliacoes();
            })
            .catch((err) => alert(`Erro ao cadastrar avaliação: ${err.message}`));
    };

    return (
        <div>
            <h1>Avaliações</h1>
            <div className="card">
                <h3>Criar Nova Avaliação</h3>
                <form onSubmit={handleSalvar}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Código da Avaliação</label>
                            <input
                                type="text"
                                placeholder="Ex: AV04"
                                required
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                            />
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

                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            required
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <input
                            type="text"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Data</label>
                            <input
                                type="date"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label>Hora Início</label>
                                <input
                                    type="time"
                                    required
                                    value={horaInicio}
                                    onChange={(e) => setHoraInicio(e.target.value)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Hora Fim</label>
                                <input
                                    type="time"
                                    required
                                    value={horaFim}
                                    onChange={(e) => setHoraFim(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn">
                        Cadastrar Avaliação
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>Avaliações Cadastradas</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Código</th>
                        <th>Título</th>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Professor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {avaliacoes.map((av) => (
                        <tr key={av.codigo}>
                            <td>{av.codigo}</td>
                            <td>{av.titulo}</td>
                            <td>{av.data || '-'}</td>
                            <td>
                                {av.horaInicio && av.horaFim ? `${av.horaInicio} - ${av.horaFim}` : '-'}
                            </td>
                            <td>{av.nomeProfessor || av.emailProfessor}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- TELA 4: MONTAR PROVA / COMPOSIÇÃO (RF3) ---
function TelaComposicao() {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [todasQuestoes, setTodasQuestoes] = useState([]);
    const [codigoSelecionado, setCodigoSelecionado] = useState('');
    const [itensProva, setItensProva] = useState([]);
    const [numeroQuestao, setNumeroQuestao] = useState('');
    const [valor, setValor] = useState('2.50');
    const [ordem, setOrdem] = useState('1');

    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/avaliacoes`).then((r) => r.json()),
            fetch(`${API_BASE}/questoes`).then((r) => r.json()),
        ]).then(([avs, qs]) => {
            const listaAv = Array.isArray(avs) ? avs : [];
            const listaQ = Array.isArray(qs) ? qs : [];
            setAvaliacoes(listaAv);
            setTodasQuestoes(listaQ);
            if (listaAv.length > 0) setCodigoSelecionado(listaAv[0].codigo);
            if (listaQ.length > 0) setNumeroQuestao(String(listaQ[0].numero));
        });
    }, []);

    const carregarItensProva = (codigo) => {
        if (!codigo) return;
        fetch(`${API_BASE}/avaliacoes/${codigo}/questoes`)
            .then((r) => r.json())
            .then((dados) => {
                const lista = Array.isArray(dados) ? dados : [];
                setItensProva(lista);
                setOrdem(String(lista.length + 1));
            })
            .catch(() => setItensProva([]));
    };

    useEffect(() => {
        carregarItensProva(codigoSelecionado);
    }, [codigoSelecionado]);

    const handleAdicionar = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/avaliacoes/${codigoSelecionado}/questoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                numeroQuestao: Number(numeroQuestao),
                valor: Number(valor),
                ordem: Number(ordem),
            }),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then(() => {
                carregarItensProva(codigoSelecionado);
            })
            .catch((err) => alert(`Erro ao vincular questão: ${err.message}`));
    };

    const handleRemover = (numQ) => {
        fetch(`${API_BASE}/avaliacoes/${codigoSelecionado}/questoes/${numQ}`, {
            method: 'DELETE',
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                carregarItensProva(codigoSelecionado);
            })
            .catch((err) => alert(`Erro ao remover questão: ${err.message}`));
    };

    const somaPontos = itensProva.reduce((acc, item) => acc + Number(item.valor || 0), 0);

    return (
        <div>
            <h1>Montar Avaliação (Composição)</h1>

            <div className="card">
                <h3>Vincular Questão à Avaliação</h3>
                <form onSubmit={handleAdicionar}>
                    <div className="form-group">
                        <label>Selecione a Avaliação</label>
                        <select value={codigoSelecionado} onChange={(e) => setCodigoSelecionado(e.target.value)}>
                            {avaliacoes.map((av) => (
                                <option key={av.codigo} value={av.codigo}>
                                    {av.codigo} - {av.titulo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Questão do Banco</label>
                        <select value={numeroQuestao} onChange={(e) => setNumeroQuestao(e.target.value)}>
                            {todasQuestoes.map((q) => (
                                <option key={q.numero} value={q.numero}>
                                    Q{q.numero} ({q.tipo}) - {q.enunciado.slice(0, 75)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Ordem na Prova</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={ordem}
                                onChange={(e) => setOrdem(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor (Pontos)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                required
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn">Adicionar Questão na Prova</button>
                </form>
            </div>

            <div className="card">
                <h3>Questões da Avaliação {codigoSelecionado} (Total: {somaPontos.toFixed(2)} pts)</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Ordem</th>
                        <th>Questão</th>
                        <th>Enunciado</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Ação</th>
                    </tr>
                    </thead>
                    <tbody>
                    {itensProva.map((item) => (
                        <tr key={item.numeroQuestao}>
                            <td>{item.ordem}</td>
                            <td>Q{item.numeroQuestao}</td>
                            <td>{item.enunciado}</td>
                            <td>{item.tipo}</td>
                            <td>{Number(item.valor).toFixed(2)}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => handleRemover(item.numeroQuestao)}
                                >
                                    Remover
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- TELA 5: REALIZAR AVALIAÇÃO / VISÃO DO ALUNO (RF4) ---
function TelaResponder() {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [codigoAvaliacao, setCodigoAvaliacao] = useState('');
    const [emailAluno, setEmailAluno] = useState('lucas.ferreira@uel.br');
    const [questoes, setQuestoes] = useState([]);
    const [respostas, setRespostas] = useState({});

    useEffect(() => {
        fetch(`${API_BASE}/avaliacoes`)
            .then((r) => r.json())
            .then((dados) => {
                const lista = Array.isArray(dados) ? dados : [];
                setAvaliacoes(lista);
                if (lista.length > 0) setCodigoAvaliacao(lista[0].codigo);
            });
    }, []);

    useEffect(() => {
        if (!codigoAvaliacao) return;
        fetch(`${API_BASE}/avaliacoes/${codigoAvaliacao}/questoes`)
            .then((r) => r.json())
            .then((dados) => {
                setQuestoes(Array.isArray(dados) ? dados : []);
                setRespostas({});
            })
            .catch(() => setQuestoes([]));
    }, [codigoAvaliacao]);

    const atualizarResposta = (numeroQuestao, campo, valor) => {
        setRespostas((prev) => ({
            ...prev,
            [numeroQuestao]: {
                ...(prev[numeroQuestao] || { numeroQuestao }),
                numeroQuestao,
                [campo]: valor,
            },
        }));
    };

    const handleEnviar = (e) => {
        e.preventDefault();
        const payload = {
            emailAluno: emailAluno.trim(),
            codigoAvaliacao,
            respostas: Object.values(respostas),
        };

        fetch(`${API_BASE}/realizacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((resultado) => {
                alert(`Avaliação enviada! Status: ${resultado.status} | Nota parcial/final: ${Number(resultado.notaTotal).toFixed(2)}`);
                setRespostas({});
            })
            .catch((err) => alert(`Erro ao enviar avaliação: ${err.message}`));
    };

    return (
        <div>
            <h1>Realizar Avaliação (Aluno)</h1>

            <div className="card">
                <div className="grid-2">
                    <div className="form-group">
                        <label>E-mail do Aluno</label>
                        <input
                            type="email"
                            required
                            value={emailAluno}
                            onChange={(e) => setEmailAluno(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Avaliação</label>
                        <select value={codigoAvaliacao} onChange={(e) => setCodigoAvaliacao(e.target.value)}>
                            {avaliacoes.map((av) => (
                                <option key={av.codigo} value={av.codigo}>
                                    {av.codigo} - {av.titulo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <form onSubmit={handleEnviar}>
                {questoes.length === 0 ? (
                    <div className="card">Esta avaliação ainda não possui questões vinculadas.</div>
                ) : (
                    questoes.map((q) => (
                        <div className="card" key={q.numeroQuestao}>
                            <h3>
                                {q.ordem}. [Q{q.numeroQuestao}] ({Number(q.valor).toFixed(2)} pts)
                            </h3>
                            <p style={{ marginBottom: '12px' }}>{q.enunciado}</p>

                            {q.tipo === 'OBJETIVA' ? (
                                <div>
                                    {q.alternativas.map((alt) => (
                                        <label
                                            key={alt.letra}
                                            style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}
                                        >
                                            <input
                                                type="radio"
                                                name={`questao_${q.numeroQuestao}`}
                                                style={{ width: 'auto' }}
                                                checked={respostas[q.numeroQuestao]?.letraEscolhida === alt.letra}
                                                onChange={() => atualizarResposta(q.numeroQuestao, 'letraEscolhida', alt.letra)}
                                            />
                                            <strong>{alt.letra})</strong> {alt.texto}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="form-group">
                                    <textarea
                                        rows="4"
                                        placeholder="Digite sua resposta dissertativa..."
                                        value={respostas[q.numeroQuestao]?.textoResposta || ''}
                                        onChange={(e) => atualizarResposta(q.numeroQuestao, 'textoResposta', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {questoes.length > 0 && (
                    <button type="submit" className="btn">Finalizar e Enviar Avaliação</button>
                )}
            </form>
        </div>
    );
}

// --- TELA 6: CORREÇÃO (RF5) E CONSULTA DE RESULTADOS (RF6) ---
function TelaCorrecaoResultados() {
    const [realizacoes, setRealizacoes] = useState([]);
    const [filtroAvaliacao, setFiltroAvaliacao] = useState('');
    const [filtroAluno, setFiltroAluno] = useState('');
    const [detalhe, setDetalhe] = useState(null);
    const [emailProfessor, setEmailProfessor] = useState('carlos.mendes@uel.br');
    const [notasEdicao, setNotasEdicao] = useState({});

    const carregarRealizacoes = () => {
        const params = new URLSearchParams();
        if (filtroAvaliacao.trim()) params.append('codigoAvaliacao', filtroAvaliacao.trim());
        if (filtroAluno.trim()) params.append('emailAluno', filtroAluno.trim());

        fetch(`${API_BASE}/realizacoes?${params.toString()}`)
            .then((r) => r.json())
            .then((dados) => setRealizacoes(Array.isArray(dados) ? dados : []))
            .catch(() => setRealizacoes([]));
    };

    useEffect(() => {
        carregarRealizacoes();
    }, []);

    const abrirDetalhe = (codigoAvaliacao, emailAluno) => {
        fetch(`${API_BASE}/realizacoes/${encodeURIComponent(codigoAvaliacao)}/${encodeURIComponent(emailAluno)}`)
            .then((r) => r.json())
            .then((dados) => {
                setDetalhe(dados);
                const mapa = {};
                (dados.respostas || []).forEach((resp) => {
                    if (resp.nota !== null && resp.nota !== undefined) {
                        mapa[resp.numeroQuestao] = String(resp.nota);
                    }
                });
                setNotasEdicao(mapa);
            })
            .catch((err) => alert(`Erro ao abrir detalhes: ${err.message}`));
    };

    const salvarCorrecao = (numeroQuestao) => {
        const nota = notasEdicao[numeroQuestao];
        fetch(
            `${API_BASE}/realizacoes/${encodeURIComponent(detalhe.codigoAvaliacao)}/${encodeURIComponent(detalhe.emailAluno)}/questoes/${numeroQuestao}/correcao`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nota: Number(nota),
                    emailProfessor: emailProfessor.trim(),
                }),
            }
        )
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((atualizado) => {
                alert('Nota lançada com sucesso!');
                setDetalhe(atualizado);
                carregarRealizacoes();
            })
            .catch((err) => alert(`Erro ao corrigir questão: ${err.message}`));
    };

    return (
        <div>
            <h1>Correção (Professor) e Resultados (Aluno)</h1>

            <div className="card">
                <h3>Filtrar Avaliações Realizadas</h3>
                <div className="grid-2">
                    <div className="form-group">
                        <label>Código da Avaliação (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ex: AV01"
                            value={filtroAvaliacao}
                            onChange={(e) => setFiltroAvaliacao(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>E-mail do Aluno (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ex: lucas.ferreira@uel.br"
                            value={filtroAluno}
                            onChange={(e) => setFiltroAluno(e.target.value)}
                        />
                    </div>
                </div>
                <button type="button" className="btn" onClick={carregarRealizacoes}>
                    Buscar Resultados
                </button>
            </div>

            <div className="card">
                <h3>Entregas Registradas</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Avaliação</th>
                        <th>Aluno</th>
                        <th>Status</th>
                        <th>Nota</th>
                        <th>Detalhes / Corrigir</th>
                    </tr>
                    </thead>
                    <tbody>
                    {realizacoes.map((r) => (
                        <tr key={`${r.codigoAvaliacao}_${r.emailAluno}`}>
                            <td>{r.codigoAvaliacao} - {r.tituloAvaliacao}</td>
                            <td>{r.nomeAluno} ({r.emailAluno})</td>
                            <td>{r.status}</td>
                            <td>{Number(r.notaTotal).toFixed(2)} / {Number(r.valorTotal).toFixed(2)}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => abrirDetalhe(r.codigoAvaliacao, r.emailAluno)}
                                >
                                    Abrir Prova
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {detalhe && (
                <div className="card">
                    <h3>
                        Espelho da Prova: {detalhe.tituloAvaliacao} — {detalhe.nomeAluno} ({detalhe.status})
                    </h3>
                    <p style={{ marginBottom: '15px' }}>
                        <strong>Nota Atual:</strong> {Number(detalhe.notaTotal).toFixed(2)} / {Number(detalhe.valorTotal).toFixed(2)}
                    </p>

                    <div className="form-group">
                        <label>E-mail do Professor Corretor (para questões dissertativas)</label>
                        <input
                            type="email"
                            value={emailProfessor}
                            onChange={(e) => setEmailProfessor(e.target.value)}
                        />
                    </div>

                    {detalhe.respostas.map((resp) => (
                        <div key={resp.numeroQuestao} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                            <p>
                                <strong>{resp.ordem}. [Q{resp.numeroQuestao}]</strong> {resp.enunciado}
                            </p>

                            {resp.tipo === 'OBJETIVA' ? (
                                <p>
                                    Resposta do aluno: <strong>{resp.letraEscolhida || '-'}</strong> | Gabarito: <strong>{resp.letraCorreta || '-'}</strong> | Nota: <strong>{resp.nota !== null ? Number(resp.nota).toFixed(2) : 'Pendente'} / {Number(resp.valorQuestao).toFixed(2)}</strong>
                                </p>
                            ) : (
                                <div>
                                    <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', margin: '8px 0' }}>
                                        <strong>Texto do aluno:</strong> {resp.textoResposta || '(sem resposta)'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span>Nota (máx. {Number(resp.valorQuestao).toFixed(2)}):</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max={resp.valorQuestao}
                                            style={{ width: '110px' }}
                                            value={notasEdicao[resp.numeroQuestao] ?? ''}
                                            onChange={(e) =>
                                                setNotasEdicao((prev) => ({
                                                    ...prev,
                                                    [resp.numeroQuestao]: e.target.value,
                                                }))
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => salvarCorrecao(resp.numeroQuestao)}
                                        >
                                            Lançar Nota
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- TELA 7: RELATÓRIOS (RF7 — 3 RELATÓRIOS COM TABELA E GRÁFICO) ---
function TelaRelatorios() {
    const [mediasAvaliacao, setMediasAvaliacao] = useState([]);
    const [rankingQuestoes, setRankingQuestoes] = useState([]);
    const [participacaoAvaliacoes, setParticipacaoAvaliacoes] = useState([]);

    async function carregarTodosRelatorios() {
        try {
            const res1 = await fetch(`${API_BASE}/relatorios/medias`);
            const dados1 = res1.ok ? await res1.json() : [];
            setMediasAvaliacao(dados1);
        } catch {
            setMediasAvaliacao([]);
        }

        try {
            const res2 = await fetch(`${API_BASE}/relatorios/questoes-erros`);
            const dados2 = res2.ok ? await res2.json() : [];
            setRankingQuestoes(dados2);
        } catch {
            setRankingQuestoes([]);
        }

        try {
            const res3 = await fetch(`${API_BASE}/relatorios/participacao`);
            const dados3 = res3.ok ? await res3.json() : [];
            setParticipacaoAvaliacoes(dados3);
        } catch {
            setParticipacaoAvaliacoes([]);
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
                    <button className={`nav-btn ${telaAtual === 'inicio' ? 'active' : ''}`} onClick={() => setTelaAtual('inicio')}>
                        Início
                    </button>
                    <button className={`nav-btn ${telaAtual === 'questoes' ? 'active' : ''}`} onClick={() => setTelaAtual('questoes')}>
                        Banco de Questões
                    </button>
                    <button className={`nav-btn ${telaAtual === 'avaliacoes' ? 'active' : ''}`} onClick={() => setTelaAtual('avaliacoes')}>
                        Avaliações
                    </button>
                    <button className={`nav-btn ${telaAtual === 'composicao' ? 'active' : ''}`} onClick={() => setTelaAtual('composicao')}>
                        Montar Prova
                    </button>
                    <button className={`nav-btn ${telaAtual === 'responder' ? 'active' : ''}`} onClick={() => setTelaAtual('responder')}>
                        Responder Prova
                    </button>
                    <button className={`nav-btn ${telaAtual === 'resultados' ? 'active' : ''}`} onClick={() => setTelaAtual('resultados')}>
                        Correção e Notas
                    </button>
                    <button className={`nav-btn ${telaAtual === 'relatorios' ? 'active' : ''}`} onClick={() => setTelaAtual('relatorios')}>
                        Relatórios
                    </button>
                </nav>
            </aside>

            <main className="content">
                {telaAtual === 'inicio' && <TelaInicio navegar={setTelaAtual} />}
                {telaAtual === 'questoes' && <TelaQuestoes />}
                {telaAtual === 'avaliacoes' && <TelaAvaliacoes />}
                {telaAtual === 'composicao' && <TelaComposicao />}
                {telaAtual === 'responder' && <TelaResponder />}
                {telaAtual === 'resultados' && <TelaCorrecaoResultados />}
                {telaAtual === 'relatorios' && <TelaRelatorios />}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);