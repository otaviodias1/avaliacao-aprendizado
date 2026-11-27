function TelaAtribuicao() {
    const { useState, useEffect } = React;
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [todosAlunos, setTodosAlunos] = useState([]);
    const [codigoSelecionado, setCodigoSelecionado] = useState('');
    const [alunosAtribuidos, setAlunosAtribuidos] = useState([]);
    const [emailSelecionado, setEmailSelecionado] = useState('');

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');

    const carregarAlunos = () => {
        fetch(`${API_BASE}/alunos`)
            .then((r) => r.json())
            .then((dados) => {
                const lista = Array.isArray(dados) ? dados : [];
                setTodosAlunos(lista);
                if (lista.length > 0 && !emailSelecionado) {
                    setEmailSelecionado(lista[0].email);
                }
            })
            .catch(() => setTodosAlunos([]));
    };

    const carregarAtribuidos = (codigo) => {
        if (!codigo) return;
        fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(codigo)}/alunos`)
            .then((r) => r.json())
            .then((dados) => setAlunosAtribuidos(Array.isArray(dados) ? dados : []))
            .catch(() => setAlunosAtribuidos([]));
    };

    useEffect(() => {
        fetch(`${API_BASE}/avaliacoes`)
            .then((r) => r.json())
            .then((dados) => {
                const lista = Array.isArray(dados) ? dados : [];
                setAvaliacoes(lista);
                if (lista.length > 0) setCodigoSelecionado(lista[0].codigo);
            })
            .catch(() => setAvaliacoes([]));
        carregarAlunos();
    }, []);

    useEffect(() => {
        carregarAtribuidos(codigoSelecionado);
    }, [codigoSelecionado]);

    const handleAtribuir = (e) => {
        e.preventDefault();
        if (!codigoSelecionado || !emailSelecionado) return;
        fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(codigoSelecionado)}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailAluno: emailSelecionado }),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((lista) => setAlunosAtribuidos(Array.isArray(lista) ? lista : []))
            .catch((err) => alert(`Erro ao atribuir aluno: ${err.message}`));
    };

    const handleAtribuirTodos = () => {
        if (!codigoSelecionado) return;
        fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(codigoSelecionado)}/alunos/todos`, {
            method: 'POST',
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((lista) => setAlunosAtribuidos(Array.isArray(lista) ? lista : []))
            .catch((err) => alert(`Erro ao atribuir alunos: ${err.message}`));
    };

    const handleRemover = (emailAluno) => {
        fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(codigoSelecionado)}/alunos/${encodeURIComponent(emailAluno)}`, {
            method: 'DELETE',
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                carregarAtribuidos(codigoSelecionado);
            })
            .catch((err) => alert(`Erro ao remover aluno: ${err.message}`));
    };

    const handleCadastrarAluno = (e) => {
        e.preventDefault();
        fetch(`${API_BASE}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome.trim(),
                email: email.trim(),
                matricula: matricula.trim(),
                senha: senha.trim(),
            }),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((criado) => {
                alert('Aluno cadastrado com sucesso!');
                setNome('');
                setEmail('');
                setMatricula('');
                setSenha('');
                setEmailSelecionado(criado.email);
                carregarAlunos();
            })
            .catch((err) => alert(`Erro ao cadastrar aluno: ${err.message}`));
    };

    const emailsJaAtribuidos = new Set(alunosAtribuidos.map((a) => a.emailAluno));
    const alunosDisponiveis = todosAlunos.filter((a) => !emailsJaAtribuidos.has(a.email));

    useEffect(() => {
        if (alunosDisponiveis.length > 0 && !alunosDisponiveis.some((a) => a.email === emailSelecionado)) {
            setEmailSelecionado(alunosDisponiveis[0].email);
        } else if (alunosDisponiveis.length === 0) {
            setEmailSelecionado('');
        }
    }, [alunosAtribuidos, todosAlunos]);

    return (
        <div>
            <h1>Alunos e Atribuição de Avaliações</h1>

            <div className="card">
                <h3>Indicar Alunos para a Avaliação</h3>
                <form onSubmit={handleAtribuir}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Avaliação</label>
                            <select value={codigoSelecionado} onChange={(e) => setCodigoSelecionado(e.target.value)}>
                                {avaliacoes.map((av) => (
                                    <option key={av.codigo} value={av.codigo}>
                                        {av.codigo} - {av.titulo}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Aluno</label>
                            <select
                                value={emailSelecionado}
                                onChange={(e) => setEmailSelecionado(e.target.value)}
                                disabled={alunosDisponiveis.length === 0}
                            >
                                {alunosDisponiveis.length === 0 ? (
                                    <option value="">Todos os alunos já atribuídos</option>
                                ) : (
                                    alunosDisponiveis.map((al) => (
                                        <option key={al.email} value={al.email}>
                                            {al.nome} ({al.matricula}) - {al.email}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button type="submit" className="btn" disabled={alunosDisponiveis.length === 0}>
                            Atribuir Aluno
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleAtribuirTodos} disabled={!codigoSelecionado}>
                            Atribuir Todos os Alunos
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h3>Alunos Atribuídos à Avaliação {codigoSelecionado} ({alunosAtribuidos.length})</h3>
                {alunosAtribuidos.length === 0 ? (
                    <p>Nenhum aluno atribuído a esta avaliação.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Matrícula</th>
                            <th>E-mail</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                        </thead>
                        <tbody>
                        {alunosAtribuidos.map((a) => (
                            <tr key={a.emailAluno}>
                                <td>{a.nomeAluno}</td>
                                <td>{a.matricula}</td>
                                <td>{a.emailAluno}</td>
                                <td>{a.status}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => handleRemover(a.emailAluno)}
                                    >
                                        Remover
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="card">
                <h3>Cadastrar Novo Aluno</h3>
                <form onSubmit={handleCadastrarAluno}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>E-mail</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Matrícula</label>
                            <input type="text" required value={matricula} onChange={(e) => setMatricula(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Senha</label>
                            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" className="btn">Cadastrar Aluno</button>
                </form>
            </div>
        </div>
    );
}

window.TelaAtribuicao = TelaAtribuicao;
