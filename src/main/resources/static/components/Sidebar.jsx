function Sidebar({ usuario, telaAtual, setTelaAtual, onLogout }) {
    const isProfessor = usuario.perfil === 'PROFESSOR';

    const itensMenu = isProfessor
        ? [
            { id: 'inicio', label: 'Início' },
            { id: 'questoes', label: 'Banco de Questões' },
            { id: 'avaliacoes', label: 'Avaliações' },
            { id: 'composicao', label: 'Montar Prova' },
            { id: 'atribuicao', label: 'Alunos e Atribuição' },
            { id: 'resultados', label: 'Correção e Notas' },
            { id: 'relatorios', label: 'Relatórios' },
        ]
        : [
            { id: 'responder', label: 'Responder Prova' },
            { id: 'resultados', label: 'Minhas Provas e Notas' },
            { id: 'relatorios', label: 'Relatórios' },
        ];

    return (
        <aside className="sidebar">
            <h2>Sistema de Avaliações</h2>

            <div className="user-box">
                <strong>{usuario.nome}</strong>
                <span className="badge-perfil">{usuario.perfil}</span>
                <div style={{ color: '#94a3b8', wordBreak: 'break-all' }}>{usuario.email}</div>
            </div>

            <nav>
                {itensMenu.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-btn ${telaAtual === item.id ? 'active' : ''}`}
                        onClick={() => setTelaAtual(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            <button type="button" className="btn-secondary" style={{ marginTop: 'auto' }} onClick={onLogout}>
                Sair
            </button>
        </aside>
    );
}

window.Sidebar = Sidebar;
