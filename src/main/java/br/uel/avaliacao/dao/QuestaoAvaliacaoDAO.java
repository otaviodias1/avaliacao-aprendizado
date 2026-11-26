package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.Alternativa;
import br.uel.avaliacao.model.QuestaoAvaliacao;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class QuestaoAvaliacaoDAO {

    private final DataSource dataSource;

    public QuestaoAvaliacaoDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void adicionarQuestao(QuestaoAvaliacao item) {
        String sql = "INSERT INTO questao_prova (codigo_avaliacao, numero_questao, valor, ordem) " +
                "VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, item.getCodigoAvaliacao());
            ps.setInt(2, item.getNumeroQuestao());
            ps.setBigDecimal(3, item.getValor());
            ps.setInt(4, item.getOrdem());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw traduzirSqlException("Erro ao vincular questao na avaliacao.", e);
        }
    }

    public List<QuestaoAvaliacao> listarPorAvaliacao(String codigoAvaliacao) {
        String sql = "SELECT qp.codigo_avaliacao, qp.numero_questao, qp.valor, qp.ordem, " +
                "q.enunciado, q.tipo " +
                "FROM questao_prova qp " +
                "JOIN questao q ON q.numero = qp.numero_questao " +
                "WHERE qp.codigo_avaliacao = ? " +
                "ORDER BY qp.ordem";

        List<QuestaoAvaliacao> itens = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, codigoAvaliacao);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    QuestaoAvaliacao item = new QuestaoAvaliacao();
                    item.setCodigoAvaliacao(rs.getString("codigo_avaliacao"));
                    item.setNumeroQuestao(rs.getInt("numero_questao"));
                    item.setValor(rs.getBigDecimal("valor"));
                    item.setOrdem(rs.getInt("ordem"));
                    item.setEnunciado(rs.getString("enunciado"));
                    item.setTipo(rs.getString("tipo"));

                    if ("OBJETIVA".equals(item.getTipo())) {
                        item.setAlternativas(buscarAlternativas(conn, item.getNumeroQuestao()));
                    }
                    itens.add(item);
                }
            }
            return itens;
        } catch (SQLException e) {
            throw new DaoException("Erro ao listar questoes da avaliacao " + codigoAvaliacao + ".", e);
        }
    }

    public void removerQuestao(String codigoAvaliacao, int numeroQuestao) {
        String sql = "DELETE FROM questao_prova WHERE codigo_avaliacao = ? AND numero_questao = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, codigoAvaliacao);
            ps.setInt(2, numeroQuestao);
            int removidas = ps.executeUpdate();
            if (removidas == 0) {
                throw new RecursoNaoEncontradoException("Questao " + numeroQuestao + " nao encontrada na avaliacao " + codigoAvaliacao + ".");
            }
        } catch (SQLException e) {
            throw traduzirSqlException("Erro ao remover questao da avaliacao.", e);
        }
    }

    private List<Alternativa> buscarAlternativas(Connection conn, int numeroQuestao) throws SQLException {
        String sql = "SELECT letra, texto, correta FROM alternativa WHERE numero_questao = ? ORDER BY letra";
        List<Alternativa> alternativas = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    alternativas.add(new Alternativa(
                            rs.getString("letra"),
                            rs.getString("texto"),
                            rs.getBoolean("correta")
                    ));
                }
            }
        }
        return alternativas;
    }

    private RuntimeException traduzirSqlException(String mensagemPadrao, SQLException e) {
        String state = e.getSQLState();
        if ("23505".equals(state)) {
            return new ConflitoDadosException("Esta questao ja esta na avaliacao ou a ordem informada ja esta ocupada.", e);
        }
        if ("23503".equals(state)) {
            return new ConflitoDadosException("Avaliacao/questao inexistente ou questao ja possui respostas de alunos.", e);
        }
        if ("23514".equals(state) || "23502".equals(state)) {
            return new IllegalArgumentException("Valor e ordem da questao devem ser maiores que zero.");
        }
        return new DaoException(mensagemPadrao, e);
    }
}