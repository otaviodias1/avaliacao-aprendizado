function App() {
    const { useState, useEffect } = React;
    const [usuario, setUsuario] = useState(null);
    const [verificandoSessao, setVerificandoSessao] = useState(true);
    const [telaAtual, setTelaAtual] = useState('inicio');

    useEffect(() => {
        fetch(`${API_BASE}/auth/me`)
            .then((res) => (res.ok ? res.json() : null))
            .then((dados) => {
                if (dados) {
                    setUsuario(dados);
                    setTelaAtual(dados.perfil === 'ALUNO' ? 'responder' : 'inicio');
                }
            })
            .catch(() => setUsuario(null))
            .finally(() => setVerificandoSessao(false));
    }, []);

    const handleLogin = (dadosUsuario) => {
        setUsuario(dadosUsuario);
        setTelaAtual(dadosUsuario.perfil === 'ALUNO' ? 'responder' : 'inicio');
    };

    const handleLogout = () => {
        fetch(`${API_BASE}/auth/logout`, { method: 'POST' })
            .finally(() => {
                setUsuario(null);
                setTelaAtual('inicio');
            });
    };

    if (verificandoSessao) {
        return <div className="login-wrapper"><p>Carregando...</p></div>;
    }

    if (!usuario) {
        return <TelaLogin onLogin={handleLogin} />;
    }

    const isProfessor = usuario.perfil === 'PROFESSOR';

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            <Sidebar
                usuario={usuario}
                telaAtual={telaAtual}
                setTelaAtual={setTelaAtual}
                onLogout={handleLogout}
            />

            <main className="content">
                {isProfessor && telaAtual === 'inicio' && <TelaInicio navegar={setTelaAtual} />}
                {isProfessor && telaAtual === 'questoes' && <TelaQuestoes usuario={usuario} />}
                {isProfessor && telaAtual === 'avaliacoes' && <TelaAvaliacoes usuario={usuario} />}
                {isProfessor && telaAtual === 'composicao' && <TelaComposicao />}
                {isProfessor && telaAtual === 'atribuicao' && <TelaAtribuicao />}
                {!isProfessor && telaAtual === 'responder' && <TelaResponder usuario={usuario} />}
                {telaAtual === 'resultados' && <TelaCorrecaoResultados usuario={usuario} />}
                {telaAtual === 'relatorios' && <TelaRelatorios />}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
