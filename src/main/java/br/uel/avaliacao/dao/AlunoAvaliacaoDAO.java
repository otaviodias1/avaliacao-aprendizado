package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.AlunoAvaliacao;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AlunoAvaliacaoDAO {

    private final DataSource dataSource;

    public AlunoAvaliacaoDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<AlunoAvaliacao> listarPorAvaliacao(String codigoAvaliacao) {
        String sql = "SELECT r.codigo_avaliacao, r.email_aluno, u.nome AS nome_aluno, a.matricula, r.status " +
                "FROM realiza r " +
                "JOIN aluno a ON a.email_usuario = r.email_aluno " +
                "JOIN usuario u ON u.email = a.email_usuario " +
                "WHERE r.codigo_avaliacao = ? " +
                "ORDER BY u.nome";

        List<AlunoAvaliacao> itens = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, codigoAvaliacao);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    itens.add(new AlunoAvaliacao(
                            rs.getString("codigo_avaliacao"),
                            rs.getString("email_aluno"),
                            rs.getString("nome_aluno"),
                            rs.getString("matricula"),
                            rs.getString("status")
                    ));
                }
            }
            return itens;
        } catch (SQLException e) {
            throw new DaoException("Erro ao listar alunos da avaliacao " + codigoAvaliacao + ".", e);
        }
    }

    public void atribuirAluno(String codigoAvaliacao, String emailAluno) {
        String sql = "INSERT INTO realiza (email_aluno, codigo_avaliacao, status, data) " +
                "VALUES (?, ?, 'EM_ANDAMENTO', CURRENT_TIMESTAMP)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, emailAluno);
            ps.setString(2, codigoAvaliacao);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw traduzirSqlException("Erro ao atribuir aluno a avaliacao.", e);
        }
    }

    public void atribuirTodosAlunos(String codigoAvaliacao) {
        String sql = "INSERT INTO realiza (email_aluno, codigo_avaliacao, status, data) " +
                "SELECT email_usuario, ?, 'EM_ANDAMENTO', CURRENT_TIMESTAMP FROM aluno " +
                "ON CONFLICT (email_aluno, codigo_avaliacao) DO NOTHING";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, codigoAvaliacao);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw traduzirSqlException("Erro ao atribuir alunos a avaliacao.", e);
        }
    }

    public void removerAluno(String codigoAvaliacao, String emailAluno) {
        String sqlStatus = "SELECT status FROM realiza WHERE codigo_avaliacao = ? AND email_aluno = ? FOR UPDATE";
        String sqlRespostas = "SELECT COUNT(*) FROM resposta WHERE codigo_avaliacao = ? AND email_aluno = ?";
        String sqlDelete = "DELETE FROM realiza WHERE codigo_avaliacao = ? AND email_aluno = ?";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                String status;
                try (PreparedStatement ps = conn.prepareStatement(sqlStatus)) {
                    ps.setString(1, codigoAvaliacao);
                    ps.setString(2, emailAluno);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            throw new RecursoNaoEncontradoException("Aluno nao esta vinculado a esta avaliacao.");
                        }
                        status = rs.getString("status");
                    }
                }

                if ("FINALIZADA".equals(status) || "CORRIGIDA".equals(status)) {
                    throw new ConflitoDadosException("Nao e possivel remover um aluno que ja finalizou a avaliacao.");
                }

                try (PreparedStatement ps = conn.prepareStatement(sqlRespostas)) {
                    ps.setString(1, codigoAvaliacao);
                    ps.setString(2, emailAluno);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next() && rs.getInt(1) > 0) {
                            throw new ConflitoDadosException("Nao e possivel remover um aluno que ja possui respostas registradas.");
                        }
                    }
                }

                try (PreparedStatement ps = conn.prepareStatement(sqlDelete)) {
                    ps.setString(1, codigoAvaliacao);
                    ps.setString(2, emailAluno);
                    ps.executeUpdate();
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw traduzirSqlException("Erro ao remover aluno da avaliacao.", e);
            } catch (RuntimeException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DaoException("Erro de conexao ao remover aluno da avaliacao.", e);
        }
    }

    private RuntimeException traduzirSqlException(String mensagemPadrao, SQLException e) {
        String state = e.getSQLState();
        if ("23505".equals(state)) {
            return new ConflitoDadosException("Este aluno ja esta vinculado a esta avaliacao.", e);
        }
        if ("23503".equals(state)) {
            return new ConflitoDadosException("Avaliacao ou aluno inexistente.", e);
        }
        return new DaoException(mensagemPadrao, e);
    }
}
