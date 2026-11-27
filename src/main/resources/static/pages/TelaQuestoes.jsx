function TelaQuestoes({ usuario }) {
    const { useState, useEffect } = React;
    const [questoes, setQuestoes] = useState([]);
    const [editandoNumero, setEditandoNumero] = useState(null);
    const [enunciado, setEnunciado] = useState('');
    const [tipo, setTipo] = useState('OBJETIVA');
    const [emailProfessor, setEmailProfessor] = useState(usuario?.email || 'carlos.mendes@uel.br');
    const [alternativas, setAlternativas] = useState([
        { letra: 'A', texto: '', correta: true },
        { letra: 'B', texto: '', correta: false },
        { letra: 'C', texto: '', correta: false },
        { letra: 'D', texto: '', correta: false },
    ]);

    const limparForm = () => {
        setEditandoNumero(null);
        setEnunciado('');
        setTipo('OBJETIVA');
        setEmailProfessor(usuario?.email || 'carlos.mendes@uel.br');
        setAlternativas([
            { letra: 'A', texto: '', correta: true },
            { letra: 'B', texto: '', correta: false },
            { letra: 'C', texto: '', correta: false },
            { letra: 'D', texto: '', correta: false },
        ]);
    };

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

    const handleEditar = (q) => {
        setEditandoNumero(q.numero);
        setEnunciado(q.enunciado);
        setTipo(q.tipo);
        setEmailProfessor(q.emailProfessor);
        const letras = ['A', 'B', 'C', 'D'];
        if (q.tipo === 'OBJETIVA' && q.alternativas && q.alternativas.length > 0) {
            const lista = letras.map((letra) => {
                const existente = q.alternativas.find((a) => a.letra === letra);
                return existente
                    ? { letra: existente.letra, texto: existente.texto, correta: existente.correta }
                    : { letra, texto: '', correta: false };
            });
            setAlternativas(lista);
        } else {
            setAlternativas(letras.map((letra, i) => ({ letra, texto: '', correta: i === 0 })));
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExcluir = (numero) => {
        if (!confirm(`Excluir a questão #${numero}?`)) return;
        fetch(`${API_BASE}/questoes/${numero}`, { method: 'DELETE' })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                if (editandoNumero === numero) limparForm();
                carregarQuestoes();
            })
            .catch((err) => alert(`Erro ao excluir questão: ${err.message}`));
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

        const url = editandoNumero ? `${API_BASE}/questoes/${editandoNumero}` : `${API_BASE}/questoes`;
        const method = editandoNumero ? 'PUT' : 'POST';

        fetch(url, {
            method,
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
                alert(editandoNumero ? 'Questão atualizada com sucesso!' : 'Questão cadastrada com sucesso!');
                limparForm();
                carregarQuestoes();
            })
            .catch((err) => alert(`Erro ao salvar questão: ${err.message}`));
    };

    return (
        <div>
            <h1>Banco de Questões</h1>
            <div className="card">
                <h3>{editandoNumero ? `Editar Questão #${editandoNumero}` : 'Cadastrar Nova Questão'}</h3>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ margin: 0 }}>Alternativas (marque a correta, se houver)</label>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, fontWeight: 400, cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="correta"
                                        style={{ width: 'auto' }}
                                        checked={!alternativas.some((a) => a.correta)}
                                        onChange={() => marcarCorreta(-1)}
                                    />
                                    Sem correta
                                </label>
                            </div>
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

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn">
                            {editandoNumero ? 'Salvar Alterações' : 'Salvar Questão'}
                        </button>
                        {editandoNumero && (
                            <button type="button" className="btn-secondary" onClick={limparForm}>
                                Cancelar
                            </button>
                        )}
                    </div>
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
                        <th>Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {questoes.map((q) => (
                        <tr key={q.numero}>
                            <td>{q.numero}</td>
                            <td>{q.enunciado}</td>
                            <td>{q.tipo}</td>
                            <td>{q.nomeProfessor || q.emailProfessor}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                                <button type="button" className="btn-secondary" onClick={() => handleEditar(q)} style={{ marginRight: '6px' }}>
                                    Editar
                                </button>
                                <button type="button" className="btn-danger" onClick={() => handleExcluir(q.numero)}>
                                    Excluir
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

window.TelaQuestoes = TelaQuestoes;
