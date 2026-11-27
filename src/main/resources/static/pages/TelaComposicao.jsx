function TelaComposicao() {
    const { useState, useEffect } = React;
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

window.TelaComposicao = TelaComposicao;
