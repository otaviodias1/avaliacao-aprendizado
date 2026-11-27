function TelaResponder({ usuario }) {
    const { useState, useEffect } = React;
    const isAluno = usuario?.perfil === 'ALUNO';
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [codigoAvaliacao, setCodigoAvaliacao] = useState('');
    const [alunosAtribuidos, setAlunosAtribuidos] = useState([]);
    const [emailAluno, setEmailAluno] = useState(isAluno ? usuario.email : '');
    const [questoes, setQuestoes] = useState([]);
    const [respostas, setRespostas] = useState({});

    const carregarAvaliacoesDisponiveis = () => {
        if (isAluno) {
            fetch(`${API_BASE}/realizacoes`)
                .then((r) => r.json())
                .then((dados) => {
                    const pendentes = (Array.isArray(dados) ? dados : [])
                        .filter((r) => r.status === 'EM_ANDAMENTO')
                        .map((r) => ({ codigo: r.codigoAvaliacao, titulo: r.tituloAvaliacao }));
                    setAvaliacoes(pendentes);
                    setCodigoAvaliacao(pendentes.length > 0 ? pendentes[0].codigo : '');
                    if (pendentes.length === 0) setQuestoes([]);
                })
                .catch(() => {
                    setAvaliacoes([]);
                    setCodigoAvaliacao('');
                    setQuestoes([]);
                });
            return;
        }

        fetch(`${API_BASE}/avaliacoes`)
            .then((r) => r.json())
            .then((dados) => {
                const lista = Array.isArray(dados) ? dados : [];
                setAvaliacoes(lista);
                if (lista.length > 0) setCodigoAvaliacao(lista[0].codigo);
            });
    };

    useEffect(() => {
        carregarAvaliacoesDisponiveis();
    }, [usuario?.email]);

    const carregarDadosProva = (codigo) => {
        if (!codigo) {
            setQuestoes([]);
            setAlunosAtribuidos([]);
            return;
        }
        if (isAluno) {
            fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(codigo)}/questoes`)
                .then((r) => r.json())
                .then((qs) => {
                    setQuestoes(Array.isArray(qs) ? qs : []);
                    setRespostas({});
                    setEmailAluno(usuario.email);
                })
                .catch(() => setQuestoes([]));
            return;
        }

        Promise.all([
            fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(codigo)}/questoes`).then((r) => r.json()),
            fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(codigo)}/alunos`).then((r) => r.json()),
        ])
            .then(([qs, als]) => {
                const listaQ = Array.isArray(qs) ? qs : [];
                const listaAl = Array.isArray(als) ? als : [];
                setQuestoes(listaQ);
                setAlunosAtribuidos(listaAl);
                setRespostas({});
                const pendente = listaAl.find((a) => a.status === 'EM_ANDAMENTO');
                setEmailAluno(pendente ? pendente.emailAluno : (listaAl[0]?.emailAluno || ''));
            })
            .catch(() => {
                setQuestoes([]);
                setAlunosAtribuidos([]);
                setEmailAluno('');
            });
    };

    useEffect(() => {
        carregarDadosProva(codigoAvaliacao);
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
        if (!emailAluno) {
            alert('Nenhum aluno atribuído a esta avaliação.');
            return;
        }
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
                if (isAluno) {
                    carregarAvaliacoesDisponiveis();
                } else {
                    carregarDadosProva(codigoAvaliacao);
                }
            })
            .catch((err) => alert(`Erro ao enviar avaliação: ${err.message}`));
    };

    return (
        <div>
            <h1>Realizar Avaliação</h1>

            <div className="card">
                <div className="grid-2">
                    <div className="form-group">
                        <label>Avaliação</label>
                        <select
                            value={codigoAvaliacao}
                            onChange={(e) => setCodigoAvaliacao(e.target.value)}
                            disabled={avaliacoes.length === 0}
                        >
                            {avaliacoes.length === 0 ? (
                                <option value="">Nenhuma avaliação pendente</option>
                            ) : (
                                avaliacoes.map((av) => (
                                    <option key={av.codigo} value={av.codigo}>
                                        {av.codigo} - {av.titulo}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    {isAluno ? (
                        <div className="form-group">
                            <label>Aluno</label>
                            <input type="text" disabled value={`${usuario.nome} (${usuario.email})`} />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Aluno Atribuído</label>
                            <select
                                value={emailAluno}
                                onChange={(e) => setEmailAluno(e.target.value)}
                                disabled={alunosAtribuidos.length === 0}
                            >
                                {alunosAtribuidos.length === 0 ? (
                                    <option value="">Nenhum aluno atribuído</option>
                                ) : (
                                    alunosAtribuidos.map((a) => (
                                        <option key={a.emailAluno} value={a.emailAluno}>
                                            {a.nomeAluno} ({a.emailAluno}) - {a.status}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    )}
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

window.TelaResponder = TelaResponder;
