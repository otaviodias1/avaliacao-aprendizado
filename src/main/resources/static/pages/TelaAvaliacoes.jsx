function TelaAvaliacoes({ usuario }) {
    const { useState, useEffect } = React;
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [editandoCodigo, setEditandoCodigo] = useState(null);
    const [codigo, setCodigo] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [emailProfessor, setEmailProfessor] = useState(usuario?.email || 'carlos.mendes@uel.br');

    const limparForm = () => {
        setEditandoCodigo(null);
        setCodigo('');
        setTitulo('');
        setDescricao('');
        setData('');
        setHoraInicio('');
        setHoraFim('');
        setEmailProfessor(usuario?.email || 'carlos.mendes@uel.br');
    };

    const carregarAvaliacoes = () => {
        fetch(`${API_BASE}/avaliacoes`)
            .then((res) => res.json())
            .then((dados) => setAvaliacoes(Array.isArray(dados) ? dados : []))
            .catch(() => setAvaliacoes([]));
    };

    useEffect(() => {
        carregarAvaliacoes();
    }, []);

    const handleEditar = (av) => {
        setEditandoCodigo(av.codigo);
        setCodigo(av.codigo);
        setTitulo(av.titulo);
        setDescricao(av.descricao || '');
        setData(av.data || '');
        setHoraInicio(av.horaInicio ? av.horaInicio.slice(0, 5) : '');
        setHoraFim(av.horaFim ? av.horaFim.slice(0, 5) : '');
        setEmailProfessor(av.emailProfessor);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExcluir = (cod) => {
        if (!confirm(`Excluir a avaliação ${cod}?`)) return;
        fetch(`${API_BASE}/avaliacoes/${encodeURIComponent(cod)}`, { method: 'DELETE' })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                if (editandoCodigo === cod) limparForm();
                carregarAvaliacoes();
            })
            .catch((err) => alert(`Erro ao excluir avaliação: ${err.message}`));
    };

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

        const url = editandoCodigo ? `${API_BASE}/avaliacoes/${encodeURIComponent(editandoCodigo)}` : `${API_BASE}/avaliacoes`;
        const method = editandoCodigo ? 'PUT' : 'POST';

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
                alert(editandoCodigo ? 'Avaliação atualizada com sucesso!' : 'Avaliação cadastrada com sucesso!');
                limparForm();
                carregarAvaliacoes();
            })
            .catch((err) => alert(`Erro ao salvar avaliação: ${err.message}`));
    };

    return (
        <div>
            <h1>Avaliações</h1>
            <div className="card">
                <h3>{editandoCodigo ? `Editar Avaliação ${editandoCodigo}` : 'Criar Nova Avaliação'}</h3>
                <form onSubmit={handleSalvar}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Código da Avaliação</label>
                            <input
                                type="text"
                                placeholder="Ex: AV04"
                                required
                                disabled={!!editandoCodigo}
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

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn">
                            {editandoCodigo ? 'Salvar Alterações' : 'Cadastrar Avaliação'}
                        </button>
                        {editandoCodigo && (
                            <button type="button" className="btn-secondary" onClick={limparForm}>
                                Cancelar
                            </button>
                        )}
                    </div>
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
                        <th>Ações</th>
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
                            <td style={{ whiteSpace: 'nowrap' }}>
                                <button type="button" className="btn-secondary" onClick={() => handleEditar(av)} style={{ marginRight: '6px' }}>
                                    Editar
                                </button>
                                <button type="button" className="btn-danger" onClick={() => handleExcluir(av.codigo)}>
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

window.TelaAvaliacoes = TelaAvaliacoes;
