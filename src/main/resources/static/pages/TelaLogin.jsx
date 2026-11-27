function TelaLogin({ onLogin }) {
    const { useState } = React;
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const handleEntrar = (e) => {
        e.preventDefault();
        setErro('');
        fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), senha }),
        })
            .then(async (res) => {
                const dados = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(dados.erro || 'E-mail ou senha inválidos.');
                return dados;
            })
            .then((usuario) => onLogin(usuario))
            .catch((err) => setErro(err.message));
    };

    const preencher = (e, s) => {
        setEmail(e);
        setSenha(s);
        setErro('');
    };

    return (
        <div className="login-wrapper">
            <div className="card login-card">
                <h1 style={{ textAlign: 'center' }}>Sistema de Avaliações</h1>
                <p className="subtitle" style={{ textAlign: 'center' }}>Entre com sua conta de Professor ou Aluno</p>

                {erro && <div className="erro-msg">{erro}</div>}

                <form onSubmit={handleEntrar}>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            required
                            placeholder="seu.email@uel.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Entrar
                    </button>
                </form>

                <div style={{ marginTop: '18px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '0.85rem', color: '#475569' }}>
                    <p style={{ marginBottom: '8px' }}><strong>Acesso rápido para teste:</strong></p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn-secondary" onClick={() => preencher('carlos.mendes@uel.br', 'prof123')}>
                            Professor (Carlos)
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => preencher('beatriz.santos@uel.br', 'aluno123')}>
                            Aluno (Beatriz)
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => preencher('ana.paula@uel.br', 'aluno123')}>
                            Aluno (Ana Paula)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.TelaLogin = TelaLogin;
