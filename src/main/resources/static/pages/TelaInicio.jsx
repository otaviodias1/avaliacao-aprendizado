function TelaInicio({ navegar }) {
    const { useState, useEffect } = React;
    const [totais, setTotais] = useState({ questoes: 0, avaliacoes: 0 });

    useEffect(() => {
        async function carregarResumo() {
            try {
                const [resQ, resA] = await Promise.all([
                    fetch(`${API_BASE}/questoes`),
                    fetch(`${API_BASE}/avaliacoes`),
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
                    <button className="btn-secondary" onClick={() => navegar('atribuicao')}>Alunos e Atribuição</button>
                    <button className="btn-secondary" onClick={() => navegar('resultados')}>Notas e Correção</button>
                    <button className="btn-secondary" onClick={() => navegar('relatorios')}>Relatórios</button>
                </div>
            </div>
        </section>
    );
}

window.TelaInicio = TelaInicio;
