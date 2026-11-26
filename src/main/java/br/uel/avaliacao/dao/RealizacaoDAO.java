package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.RealizacaoAvaliacao;
import br.uel.avaliacao.model.RespostaItem;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class RealizacaoDAO {

    private final DataSource dataSource;

    public RealizacaoDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void submeterAvaliacao(RealizacaoAvaliacao submissao) {
        String sqlQuestoes = "SELECT qp.numero_questao, qp.valor, q.tipo " +
                "FROM questao_prova qp " +
                "JOIN questao q ON q.numero = qp.numero_questao " +
                "WHERE qp.codigo_avaliacao = ? ORDER BY qp.ordem";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                Map<Integer, RespostaItem> mapaRespostas = new HashMap<>();
                for (RespostaItem r : submissao.getRespostas()) {
                    if (r.getNumeroQuestao() != null) {
                        mapaRespostas.put(r.getNumeroQuestao(), r);
                    }
                }

                List<Integer> numeros = new ArrayList<>();
                List<BigDecimal> valores = new ArrayList<>();
                List<String> tipos = new ArrayList<>();
                boolean possuiDissertativa = false;

                try (PreparedStatement psQ = conn.prepareStatement(sqlQuestoes)) {
                    psQ.setString(1, submissao.getCodigoAvaliacao());
                    try (ResultSet rs = psQ.executeQuery()) {
                        while (rs.next()) {
                            numeros.add(rs.getInt("numero_questao"));
                            valores.add(rs.getBigDecimal("valor"));
                            String tipo = rs.getString("tipo");
                            tipos.add(tipo);
                            if ("TEXTO_LIVRE".equals(tipo)) {
                                possuiDissertativa = true;
                            }
                        }
                    }
                }

                if (numeros.isEmpty()) {
                    throw new IllegalArgumentException("A avaliacao nao possui questoes vinculadas.");
                }

                String statusFinal = possuiDissertativa ? "FINALIZADA" : "CORRIGIDA";

                String sqlRealiza = "INSERT INTO realiza (email_aluno, codigo_avaliacao, status, data) " +
                        "VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
                try (PreparedStatement psR = conn.prepareStatement(sqlRealiza)) {
                    psR.setString(1, submissao.getEmailAluno());
                    psR.setString(2, submissao.getCodigoAvaliacao());
                    psR.setString(3, statusFinal);
                    psR.executeUpdate();
                }

                String sqlResp = "INSERT INTO resposta (email_aluno, codigo_avaliacao, numero_questao, nota) " +
                        "VALUES (?, ?, ?, ?)";
                String sqlObj = "INSERT INTO resposta_objetiva (email_aluno, codigo_avaliacao, numero_questao, letra_escolhida) " +
                        "VALUES (?, ?, ?, ?)";
                String sqlLivre = "INSERT INTO resposta_livre (email_aluno, codigo_avaliacao, numero_questao, texto, email_professor) " +
                        "VALUES (?, ?, ?, ?, NULL)";

                try (PreparedStatement psResp = conn.prepareStatement(sqlResp);
                     PreparedStatement psObj = conn.prepareStatement(sqlObj);
                     PreparedStatement psLivre = conn.prepareStatement(sqlLivre)) {

                    for (int i = 0; i < numeros.size(); i++) {
                        int numQ = numeros.get(i);
                        BigDecimal valorQ = valores.get(i);
                        String tipoQ = tipos.get(i);
                        RespostaItem item = mapaRespostas.get(numQ);

                        if (item == null) {
                            throw new IllegalArgumentException("Resposta ausente para a questao " + numQ + ".");
                        }

                        if ("OBJETIVA".equals(tipoQ)) {
                            String letra = item.getLetraEscolhida() != null ? item.getLetraEscolhida().trim().toUpperCase() : "";
                            if (letra.isEmpty()) {
                                throw new IllegalArgumentException("Selecione uma alternativa para a questao " + numQ + ".");
                            }
                            boolean acertou = verificarAlternativaCorreta(conn, numQ, letra);
                            BigDecimal nota = acertou ? valorQ : BigDecimal.ZERO;

                            psResp.setString(1, submissao.getEmailAluno());
                            psResp.setString(2, submissao.getCodigoAvaliacao());
                            psResp.setInt(3, numQ);
                            psResp.setBigDecimal(4, nota);
                            psResp.executeUpdate();

                            psObj.setString(1, submissao.getEmailAluno());
                            psObj.setString(2, submissao.getCodigoAvaliacao());
                            psObj.setInt(3, numQ);
                            psObj.setString(4, letra);
                            psObj.executeUpdate();
                        } else {
                            String texto = item.getTextoResposta() != null ? item.getTextoResposta().trim() : "";
                            if (texto.isEmpty()) {
                                throw new IllegalArgumentException("Preencha o texto da questao dissertativa " + numQ + ".");
                            }

                            psResp.setString(1, submissao.getEmailAluno());
                            psResp.setString(2, submissao.getCodigoAvaliacao());
                            psResp.setInt(3, numQ);
                            psResp.setNull(4, Types.NUMERIC);
                            psResp.executeUpdate();

                            psLivre.setString(1, submissao.getEmailAluno());
                            psLivre.setString(2, submissao.getCodigoAvaliacao());
                            psLivre.setInt(3, numQ);
                            psLivre.setString(4, texto);
                            psLivre.executeUpdate();
                        }
                    }
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw traduzirSqlException("Erro ao registrar realizacao da avaliacao.", e);
            } catch (RuntimeException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DaoException("Erro de conexao ao submeter avaliacao.", e);
        }
    }

    public void corrigirQuestaoLivre(String codigoAvaliacao, String emailAluno, int numeroQuestao, BigDecimal nota, String emailProfessor) {
        String sqlValor = "SELECT valor FROM questao_prova WHERE codigo_avaliacao = ? AND numero_questao = ?";
        String sqlUpdateResp = "UPDATE resposta SET nota = ? WHERE email_aluno = ? AND codigo_avaliacao = ? AND numero_questao = ?";
        String sqlUpdateLivre = "UPDATE resposta_livre SET email_professor = ? WHERE email_aluno = ? AND codigo_avaliacao = ? AND numero_questao = ?";
        String sqlPendentes = "SELECT COUNT(*) FROM resposta WHERE email_aluno = ? AND codigo_avaliacao = ? AND nota IS NULL";
        String sqlStatus = "UPDATE realiza SET status = 'CORRIGIDA' WHERE email_aluno = ? AND codigo_avaliacao = ?";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                BigDecimal valorMaximo;
                try (PreparedStatement psVal = conn.prepareStatement(sqlValor)) {
                    psVal.setString(1, codigoAvaliacao);
                    psVal.setInt(2, numeroQuestao);
                    try (ResultSet rs = psVal.executeQuery()) {
                        if (!rs.next()) {
                            throw new RecursoNaoEncontradoException("Questao nao encontrada nesta avaliacao.");
                        }
                        valorMaximo = rs.getBigDecimal("valor");
                    }
                }

                if (nota.compareTo(BigDecimal.ZERO) < 0 || nota.compareTo(valorMaximo) > 0) {
                    throw new IllegalArgumentException("A nota deve estar entre 0 e " + valorMaximo + ".");
                }

                try (PreparedStatement psLivre = conn.prepareStatement(sqlUpdateLivre)) {
                    psLivre.setString(1, emailProfessor);
                    psLivre.setString(2, emailAluno);
                    psLivre.setString(3, codigoAvaliacao);
                    psLivre.setInt(4, numeroQuestao);
                    if (psLivre.executeUpdate() == 0) {
                        throw new IllegalArgumentException("Resposta dissertativa nao encontrada para correcao.");
                    }
                }

                try (PreparedStatement psResp = conn.prepareStatement(sqlUpdateResp)) {
                    psResp.setBigDecimal(1, nota);
                    psResp.setString(2, emailAluno);
                    psResp.setString(3, codigoAvaliacao);
                    psResp.setInt(4, numeroQuestao);
                    psResp.executeUpdate();
                }

                int pendentes = 0;
                try (PreparedStatement psPend = conn.prepareStatement(sqlPendentes)) {
                    psPend.setString(1, emailAluno);
                    psPend.setString(2, codigoAvaliacao);
                    try (ResultSet rs = psPend.executeQuery()) {
                        if (rs.next()) {
                            pendentes = rs.getInt(1);
                        }
                    }
                }

                if (pendentes == 0) {
                    try (PreparedStatement psSt = conn.prepareStatement(sqlStatus)) {
                        psSt.setString(1, emailAluno);
                        psSt.setString(2, codigoAvaliacao);
                        psSt.executeUpdate();
                    }
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw traduzirSqlException("Erro ao lancar correcao.", e);
            } catch (RuntimeException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DaoException("Erro de conexao ao corrigir questao.", e);
        }
    }

    public List<RealizacaoAvaliacao> listarRealizacoes(String codigoAvaliacao, String emailAluno) {
        StringBuilder sql = new StringBuilder(
                "SELECT r.email_aluno, u.nome AS nome_aluno, a.matricula AS matricula_aluno, " +
                        "r.codigo_avaliacao, av.titulo AS titulo_avaliacao, r.status, r.data, " +
                        "COALESCE((SELECT SUM(resp.nota) FROM resposta resp WHERE resp.email_aluno = r.email_aluno AND resp.codigo_avaliacao = r.codigo_avaliacao), 0) AS nota_total, " +
                        "COALESCE((SELECT SUM(qp.valor) FROM questao_prova qp WHERE qp.codigo_avaliacao = r.codigo_avaliacao), 0) AS valor_total " +
                        "FROM realiza r " +
                        "JOIN aluno a ON a.email_usuario = r.email_aluno " +
                        "JOIN usuario u ON u.email = a.email_usuario " +
                        "JOIN avaliacao av ON av.codigo = r.codigo_avaliacao " +
                        "WHERE 1 = 1"
        );

        List<String> params = new ArrayList<>();
        if (codigoAvaliacao != null && !codigoAvaliacao.isBlank()) {
            sql.append(" AND r.codigo_avaliacao = ?");
            params.add(codigoAvaliacao.trim());
        }
        if (emailAluno != null && !emailAluno.isBlank()) {
            sql.append(" AND r.email_aluno = ?");
            params.add(emailAluno.trim());
        }
        sql.append(" ORDER BY r.data DESC");

        List<RealizacaoAvaliacao> lista = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setString(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    RealizacaoAvaliacao item = new RealizacaoAvaliacao();
                    item.setEmailAluno(rs.getString("email_aluno"));
                    item.setNomeAluno(rs.getString("nome_aluno"));
                    item.setMatriculaAluno(rs.getString("matricula_aluno"));
                    item.setCodigoAvaliacao(rs.getString("codigo_avaliacao"));
                    item.setTituloAvaliacao(rs.getString("titulo_avaliacao"));
                    item.setStatus(rs.getString("status"));
                    Timestamp ts = rs.getTimestamp("data");
                    item.setData(ts != null ? ts.toLocalDateTime() : null);
                    item.setNotaTotal(rs.getBigDecimal("nota_total"));
                    item.setValorTotal(rs.getBigDecimal("valor_total"));
                    lista.add(item);
                }
            }
            return lista;
        } catch (SQLException e) {
            throw new DaoException("Erro ao listar realizacoes de avaliacoes.", e);
        }
    }

    public RealizacaoAvaliacao buscarDetalhe(String codigoAvaliacao, String emailAluno) {
        List<RealizacaoAvaliacao> cabecalhos = listarRealizacoes(codigoAvaliacao, emailAluno);
        if (cabecalhos.isEmpty()) {
            throw new RecursoNaoEncontradoException("Realizacao nao encontrada para este aluno e avaliacao.");
        }
        RealizacaoAvaliacao detalhe = cabecalhos.get(0);

        String sqlItens = "SELECT qp.ordem, qp.numero_questao, q.enunciado, q.tipo, qp.valor, " +
                "resp.nota, ro.letra_escolhida, rl.texto AS texto_resposta, rl.email_professor, " +
                "(SELECT alt.letra FROM alternativa alt WHERE alt.numero_questao = qp.numero_questao AND alt.correta = TRUE LIMIT 1) AS letra_correta " +
                "FROM questao_prova qp " +
                "JOIN questao q ON q.numero = qp.numero_questao " +
                "LEFT JOIN resposta resp ON resp.codigo_avaliacao = qp.codigo_avaliacao AND resp.numero_questao = qp.numero_questao AND resp.email_aluno = ? " +
                "LEFT JOIN resposta_objetiva ro ON ro.codigo_avaliacao = qp.codigo_avaliacao AND ro.numero_questao = qp.numero_questao AND ro.email_aluno = ? " +
                "LEFT JOIN resposta_livre rl ON rl.codigo_avaliacao = qp.codigo_avaliacao AND rl.numero_questao = qp.numero_questao AND rl.email_aluno = ? " +
                "WHERE qp.codigo_avaliacao = ? " +
                "ORDER BY qp.ordem";

        List<RespostaItem> respostas = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sqlItens)) {
            ps.setString(1, emailAluno);
            ps.setString(2, emailAluno);
            ps.setString(3, emailAluno);
            ps.setString(4, codigoAvaliacao);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    RespostaItem item = new RespostaItem();
                    item.setOrdem(rs.getInt("ordem"));
                    item.setNumeroQuestao(rs.getInt("numero_questao"));
                    item.setEnunciado(rs.getString("enunciado"));
                    item.setTipo(rs.getString("tipo"));
                    item.setValorQuestao(rs.getBigDecimal("valor"));
                    item.setNota(rs.getBigDecimal("nota"));
                    item.setLetraEscolhida(rs.getString("letra_escolhida"));
                    item.setLetraCorreta(rs.getString("letra_correta"));
                    item.setTextoResposta(rs.getString("texto_resposta"));
                    item.setEmailProfessorCorretor(rs.getString("email_professor"));
                    respostas.add(item);
                }
            }
            detalhe.setRespostas(respostas);
            return detalhe;
        } catch (SQLException e) {
            throw new DaoException("Erro ao carregar detalhes da avaliacao realizada.", e);
        }
    }

    private boolean verificarAlternativaCorreta(Connection conn, int numeroQuestao, String letra) throws SQLException {
        String sql = "SELECT correta FROM alternativa WHERE numero_questao = ? AND letra = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            ps.setString(2, letra);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException("Alternativa " + letra + " invalida para a questao " + numeroQuestao + ".");
                }
                return rs.getBoolean("correta");
            }
        }
    }

    private RuntimeException traduzirSqlException(String mensagemPadrao, SQLException e) {
        String state = e.getSQLState();
        if ("23505".equals(state)) {
            return new ConflitoDadosException("Este aluno ja realizou e enviou esta avaliacao.", e);
        }
        if ("23503".equals(state)) {
            return new ConflitoDadosException("Aluno, avaliacao, professor ou alternativa inexistente no banco.", e);
        }
        if ("23514".equals(state) || "23502".equals(state)) {
            return new IllegalArgumentException("Dados invalidos para registro da resposta ou nota.");
        }
        return new DaoException(mensagemPadrao, e);
    }
}