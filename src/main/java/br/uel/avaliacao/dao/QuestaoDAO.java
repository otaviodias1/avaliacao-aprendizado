package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.Alternativa;
import br.uel.avaliacao.model.Questao;
import br.uel.avaliacao.model.TipoQuestao;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class QuestaoDAO {

    private final DataSource dataSource;

    public QuestaoDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Questao cadastrar(Questao questao) {
        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                int numero = questao.getNumero() != null
                        ? questao.getNumero()
                        : gerarProximoNumero(conn);
                questao.setNumero(numero);

                inserirQuestaoBase(conn, questao);

                if (questao.getTipo() == TipoQuestao.OBJETIVA) {
                    inserirObjetiva(conn, numero);
                    inserirAlternativas(conn, numero, questao.getAlternativas());
                } else {
                    inserirTextoLivre(conn, numero);
                }

                conn.commit();
            } catch (SQLException e) {
                executarRollback(conn);
                throw traduzirSqlException("Erro ao cadastrar questao.", e);
            } catch (RuntimeException e) {
                executarRollback(conn);
                throw e;
            } finally {
                restaurarAutoCommit(conn);
            }
        } catch (SQLException e) {
            throw new DaoException("Erro ao abrir conexao com o banco.", e);
        }

        return buscarPorNumero(questao.getNumero())
                .orElseThrow(() -> new DaoException("Questao cadastrada nao encontrada."));
    }

    public Optional<Questao> buscarPorNumero(int numero) {
        String sql = "SELECT q.numero, q.enunciado, q.tipo, q.email_professor, u.nome AS nome_professor " +
                "FROM questao q " +
                "JOIN professor p ON p.email_usuario = q.email_professor " +
                "JOIN usuario u ON u.email = p.email_usuario " +
                "WHERE q.numero = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numero);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                Questao questao = mapearQuestao(rs);
                if (questao.getTipo() == TipoQuestao.OBJETIVA) {
                    questao.setAlternativas(listarAlternativasPorQuestao(conn, numero));
                }
                return Optional.of(questao);
            }
        } catch (SQLException e) {
            throw new DaoException("Erro ao buscar questao " + numero + ".", e);
        }
    }

    public List<Questao> listarTodas(TipoQuestao tipo, String emailProfessor) {
        StringBuilder sql = new StringBuilder(
                "SELECT q.numero, q.enunciado, q.tipo, q.email_professor, u.nome AS nome_professor " +
                        "FROM questao q " +
                        "JOIN professor p ON p.email_usuario = q.email_professor " +
                        "JOIN usuario u ON u.email = p.email_usuario " +
                        "WHERE 1 = 1"
        );

        List<Object> parametros = new ArrayList<>();
        if (tipo != null) {
            sql.append(" AND q.tipo = ?");
            parametros.add(tipo.name());
        }
        if (emailProfessor != null && !emailProfessor.isBlank()) {
            sql.append(" AND q.email_professor = ?");
            parametros.add(emailProfessor.trim());
        }
        sql.append(" ORDER BY q.numero");

        Map<Integer, Questao> questoesPorNumero = new LinkedHashMap<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < parametros.size(); i++) {
                ps.setObject(i + 1, parametros.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Questao questao = mapearQuestao(rs);
                    questoesPorNumero.put(questao.getNumero(), questao);
                }
            }

            if (!questoesPorNumero.isEmpty()) {
                carregarAlternativas(conn, questoesPorNumero);
            }

            return new ArrayList<>(questoesPorNumero.values());
        } catch (SQLException e) {
            throw new DaoException("Erro ao listar questoes.", e);
        }
    }

    public Questao atualizar(Questao questao) {
        int numero = questao.getNumero();

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                TipoQuestao tipoAnterior = buscarTipoParaAtualizacao(conn, numero);
                if (tipoAnterior == null) {
                    executarRollback(conn);
                    throw new RecursoNaoEncontradoException("Questao " + numero + " nao encontrada.");
                }

                atualizarQuestaoBase(conn, questao);

                if (tipoAnterior == TipoQuestao.OBJETIVA && questao.getTipo() == TipoQuestao.OBJETIVA) {
                    excluirAlternativas(conn, numero);
                    inserirAlternativas(conn, numero, questao.getAlternativas());
                } else if (tipoAnterior == TipoQuestao.OBJETIVA && questao.getTipo() == TipoQuestao.TEXTO_LIVRE) {
                    excluirAlternativas(conn, numero);
                    excluirObjetiva(conn, numero);
                    inserirTextoLivre(conn, numero);
                } else if (tipoAnterior == TipoQuestao.TEXTO_LIVRE && questao.getTipo() == TipoQuestao.OBJETIVA) {
                    excluirTextoLivre(conn, numero);
                    inserirObjetiva(conn, numero);
                    inserirAlternativas(conn, numero, questao.getAlternativas());
                }

                conn.commit();
            } catch (SQLException e) {
                executarRollback(conn);
                throw traduzirSqlException("Erro ao atualizar questao " + numero + ".", e);
            } catch (RuntimeException e) {
                executarRollback(conn);
                throw e;
            } finally {
                restaurarAutoCommit(conn);
            }
        } catch (SQLException e) {
            throw new DaoException("Erro ao abrir conexao com o banco.", e);
        }

        return buscarPorNumero(numero)
                .orElseThrow(() -> new DaoException("Questao atualizada nao encontrada."));
    }

    public void excluir(int numero) {
        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                TipoQuestao tipo = buscarTipoParaAtualizacao(conn, numero);
                if (tipo == null) {
                    executarRollback(conn);
                    throw new RecursoNaoEncontradoException("Questao " + numero + " nao encontrada.");
                }

                if (tipo == TipoQuestao.OBJETIVA) {
                    excluirAlternativas(conn, numero);
                    excluirObjetiva(conn, numero);
                } else {
                    excluirTextoLivre(conn, numero);
                }

                excluirQuestaoBase(conn, numero);
                conn.commit();
            } catch (SQLException e) {
                executarRollback(conn);
                throw traduzirSqlException("Erro ao excluir questao " + numero + ".", e);
            } catch (RuntimeException e) {
                executarRollback(conn);
                throw e;
            } finally {
                restaurarAutoCommit(conn);
            }
        } catch (SQLException e) {
            throw new DaoException("Erro ao abrir conexao com o banco.", e);
        }
    }

    private int gerarProximoNumero(Connection conn) throws SQLException {
        try (PreparedStatement lockPs = conn.prepareStatement("LOCK TABLE questao IN SHARE ROW EXCLUSIVE MODE")) {
            lockPs.execute();
        }
        try (PreparedStatement ps = conn.prepareStatement("SELECT COALESCE(MAX(numero), 0) + 1 FROM questao");
             ResultSet rs = ps.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private void inserirQuestaoBase(Connection conn, Questao questao) throws SQLException {
        String sql = "INSERT INTO questao (numero, enunciado, tipo, email_professor) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, questao.getNumero());
            ps.setString(2, questao.getEnunciado());
            ps.setString(3, questao.getTipo().name());
            ps.setString(4, questao.getEmailProfessor());
            ps.executeUpdate();
        }
    }

    private void atualizarQuestaoBase(Connection conn, Questao questao) throws SQLException {
        String sql = "UPDATE questao SET enunciado = ?, tipo = ?, email_professor = ? WHERE numero = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, questao.getEnunciado());
            ps.setString(2, questao.getTipo().name());
            ps.setString(3, questao.getEmailProfessor());
            ps.setInt(4, questao.getNumero());
            ps.executeUpdate();
        }
    }

    private void excluirQuestaoBase(Connection conn, int numero) throws SQLException {
        String sql = "DELETE FROM questao WHERE numero = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numero);
            ps.executeUpdate();
        }
    }

    private void inserirObjetiva(Connection conn, int numeroQuestao) throws SQLException {
        String sql = "INSERT INTO objetiva (numero_questao) VALUES (?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            ps.executeUpdate();
        }
    }

    private void excluirObjetiva(Connection conn, int numeroQuestao) throws SQLException {
        String sql = "DELETE FROM objetiva WHERE numero_questao = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            ps.executeUpdate();
        }
    }

    private void inserirTextoLivre(Connection conn, int numeroQuestao) throws SQLException {
        String sql = "INSERT INTO texto_livre (numero_questao) VALUES (?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            ps.executeUpdate();
        }
    }

    private void excluirTextoLivre(Connection conn, int numeroQuestao) throws SQLException {
        String sql = "DELETE FROM texto_livre WHERE numero_questao = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            ps.executeUpdate();
        }
    }

    private void inserirAlternativas(Connection conn, int numeroQuestao, List<Alternativa> alternativas) throws SQLException {
        String sql = "INSERT INTO alternativa (numero_questao, letra, texto, correta) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (Alternativa alternativa : alternativas) {
                ps.setInt(1, numeroQuestao);
                ps.setString(2, alternativa.getLetra());
                ps.setString(3, alternativa.getTexto());
                ps.setBoolean(4, alternativa.isCorreta());
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    private void excluirAlternativas(Connection conn, int numeroQuestao) throws SQLException {
        String sql = "DELETE FROM alternativa WHERE numero_questao = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            ps.executeUpdate();
        }
    }

    private TipoQuestao buscarTipoParaAtualizacao(Connection conn, int numero) throws SQLException {
        String sql = "SELECT tipo FROM questao WHERE numero = ? FOR UPDATE";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numero);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                return TipoQuestao.valueOf(rs.getString("tipo"));
            }
        }
    }

    private List<Alternativa> listarAlternativasPorQuestao(Connection conn, int numeroQuestao) throws SQLException {
        String sql = "SELECT letra, texto, correta FROM alternativa WHERE numero_questao = ? ORDER BY letra";
        List<Alternativa> alternativas = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, numeroQuestao);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    alternativas.add(new Alternativa(
                            rs.getString("letra").trim(),
                            rs.getString("texto"),
                            rs.getBoolean("correta")
                    ));
                }
            }
        }
        return alternativas;
    }

    private void carregarAlternativas(Connection conn, Map<Integer, Questao> questoesPorNumero) throws SQLException {
        String sql = "SELECT numero_questao, letra, texto, correta FROM alternativa ORDER BY numero_questao, letra";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                int numeroQuestao = rs.getInt("numero_questao");
                Questao questao = questoesPorNumero.get(numeroQuestao);
                if (questao != null && questao.getTipo() == TipoQuestao.OBJETIVA) {
                    questao.getAlternativas().add(new Alternativa(
                            rs.getString("letra").trim(),
                            rs.getString("texto"),
                            rs.getBoolean("correta")
                    ));
                }
            }
        }
    }

    private Questao mapearQuestao(ResultSet rs) throws SQLException {
        Questao questao = new Questao();
        questao.setNumero(rs.getInt("numero"));
        questao.setEnunciado(rs.getString("enunciado"));
        questao.setTipo(TipoQuestao.valueOf(rs.getString("tipo")));
        questao.setEmailProfessor(rs.getString("email_professor"));
        questao.setNomeProfessor(rs.getString("nome_professor"));
        return questao;
    }

    private RuntimeException traduzirSqlException(String mensagemPadrao, SQLException e) {
        String state = e.getSQLState();
        if ("23505".equals(state)) {
            return new ConflitoDadosException("Ja existe um registro com a mesma chave primaria.", e);
        }
        if ("23503".equals(state)) {
            return new ConflitoDadosException("Operacao viola integridade referencial (registro inexistente ou vinculado a avaliacoes/respostas).", e);
        }
        if ("23514".equals(state) || "23502".equals(state)) {
            return new IllegalArgumentException("Dados invalidos para a estrutura do banco de dados.");
        }
        return new DaoException(mensagemPadrao, e);
    }

    private void executarRollback(Connection conn) {
        try {
            conn.rollback();
        } catch (SQLException ignored) {
        }
    }

    private void restaurarAutoCommit(Connection conn) {
        try {
            conn.setAutoCommit(true);
        } catch (SQLException ignored) {
        }
    }
}
