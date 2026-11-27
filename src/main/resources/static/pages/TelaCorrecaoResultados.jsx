function TelaCorrecaoResultados({ usuario }) {
    const { useState, useEffect } = React;
    const isProfessor = usuario?.perfil === 'PROFESSOR';
    const [realizacoes, setRealizacoes] = useState([]);
    const [filtroAvaliacao, setFiltroAvaliacao] = useState('');
    const [filtroAluno, setFiltroAluno] = useState('');
    const [detalhe, setDetalhe] = useState(null);
    const [emailProfessor, setEmailProfessor] = useState(usuario?.email || 'carlos.mendes@uel.br');
    const [notasEdicao, setNotasEdicao] = useState({});

    const carregarRealizacoes = () => {
        const params = new URLSearchParams();
        if (isProfessor) {
            if (filtroAvaliacao.trim()) params.append('codigoAvaliacao', filtroAvaliacao.trim());
            if (filtroAluno.trim()) params.append('emailAluno', filtroAluno.trim());
        }

        fetch(`${API_BASE}/realizacoes?${params.toString()}`)
            .then((r) => r.json())
            .then((dados) => setRealizacoes(Array.isArray(dados) ? dados : []))
            .catch(() => setRealizacoes([]));
    };

    useEffect(() => {
        carregarRealizacoes();
    }, [usuario?.email]);

    const abrirDetalhe = (codigoAvaliacao, emailAluno) => {
        fetch(`${API_BASE}/realizacoes/${encodeURIComponent(codigoAvaliacao)}/${encodeURIComponent(emailAluno)}`)
            .then(async (r) => {
                if (!r.ok) throw new Error(await r.text());
                return r.json();
            })
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
            <h1>{isProfessor ? 'Correção e Notas' : 'Minhas Provas e Notas'}</h1>

            {isProfessor && (
                <div className="card">
                    <h3>Filtrar Avaliações Realizadas</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Código da Avaliação (opcional)</label>
                            <input
                                type="text"
                                placeholder="Ex: BD1-P1"
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
            )}

            <div className="card">
                <h3>{isProfessor ? 'Entregas Registradas' : 'Suas Avaliações'}</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Avaliação</th>
                        {isProfessor && <th>Aluno</th>}
                        <th>Status</th>
                        <th>Nota</th>
                        <th>{isProfessor ? 'Detalhes / Corrigir' : 'Detalhes'}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {realizacoes.map((r) => (
                        <tr key={`${r.codigoAvaliacao}_${r.emailAluno}`}>
                            <td>{r.codigoAvaliacao} - {r.tituloAvaliacao}</td>
                            {isProfessor && <td>{r.nomeAluno} ({r.emailAluno})</td>}
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

                    {isProfessor && (
                        <div className="form-group">
                            <label>E-mail do Professor Corretor (para questões dissertativas)</label>
                            <input
                                type="email"
                                value={emailProfessor}
                                onChange={(e) => setEmailProfessor(e.target.value)}
                            />
                        </div>
                    )}

                    {detalhe.respostas.map((resp) => (
                        <div key={resp.numeroQuestao} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                            <p>
                                <strong>{resp.ordem}. [Q{resp.numeroQuestao}]</strong> {resp.enunciado}
                            </p>

                            {resp.tipo === 'OBJETIVA' ? (
                                <p>
                                    Resposta do aluno: <strong>{resp.letraEscolhida || '-'}</strong>
                                    {(isProfessor || detalhe.status !== 'EM_ANDAMENTO') && (
                                        <> | Gabarito: <strong>{resp.letraCorreta || '-'}</strong></>
                                    )}
                                    {' '}| Nota: <strong>{resp.nota !== null ? Number(resp.nota).toFixed(2) : 'Pendente'} / {Number(resp.valorQuestao).toFixed(2)}</strong>
                                </p>
                            ) : (
                                <div>
                                    <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', margin: '8px 0' }}>
                                        <strong>Texto do aluno:</strong> {resp.textoResposta || '(sem resposta)'}
                                    </p>
                                    {isProfessor ? (
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
                                    ) : (
                                        <p>
                                            Nota: <strong>{resp.nota !== null ? Number(resp.nota).toFixed(2) : 'Aguardando correção'} / {Number(resp.valorQuestao).toFixed(2)}</strong>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

window.TelaCorrecaoResultados = TelaCorrecaoResultados;
