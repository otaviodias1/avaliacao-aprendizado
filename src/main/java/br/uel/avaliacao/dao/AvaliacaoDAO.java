package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.Avaliacao;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Time;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class AvaliacaoDAO {

    private final DataSource dataSource;

    public AvaliacaoDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Avaliacao cadastrar(Avaliacao avaliacao) {
        String sql = "INSERT INTO avaliacao (codigo, titulo, descricao, data, h_inicio, h_fim, email_prof) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, avaliacao.getCodigo());
            ps.setString(2, avaliacao.getTitulo());
            if (avaliacao.getDescricao() != null) {
                ps.setString(3, avaliacao.getDescricao());
            } else {
                ps.setNull(3, Types.VARCHAR);
            }
            if (avaliacao.getData() != null) {
                ps.setDate(4, Date.valueOf(avaliacao.getData()));
            } else {
                ps.setNull(4, Types.DATE);
            }
            ps.setTime(5, Time.valueOf(avaliacao.getHoraInicio()));
            ps.setTime(6, Time.valueOf(avaliacao.getHoraFim()));
            ps.setString(7, avaliacao.getEmailProfessor());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw traduzirSqlException("Erro ao cadastrar avaliacao.", e);
        }

        return buscarPorCodigo(avaliacao.getCodigo())
                .orElseThrow(() -> new DaoException("Avaliacao cadastrada nao encontrada."));
    }

    public Optional<Avaliacao> buscarPorCodigo(String codigo) {
        String sql = "SELECT a.codigo, a.titulo, a.descricao, a.data, a.h_inicio, a.h_fim, a.email_prof, u.nome AS nome_professor " +
                "FROM avaliacao a " +
                "JOIN professor p ON p.email_usuario = a.email_prof " +
                "JOIN usuario u ON u.email = p.email_usuario " +
                "WHERE a.codigo = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, codigo);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                return Optional.of(mapearAvaliacao(rs));
            }
        } catch (SQLException e) {
            throw new DaoException("Erro ao buscar avaliacao " + codigo + ".", e);
        }
    }

    public List<Avaliacao> listarTodas(String emailProfessor) {
        StringBuilder sql = new StringBuilder(
                "SELECT a.codigo, a.titulo, a.descricao, a.data, a.h_inicio, a.h_fim, a.email_prof, u.nome AS nome_professor " +
                        "FROM avaliacao a " +
                        "JOIN professor p ON p.email_usuario = a.email_prof " +
                        "JOIN usuario u ON u.email = p.email_usuario " +
                        "WHERE 1 = 1"
        );

        boolean filtrarProfessor = emailProfessor != null && !emailProfessor.isBlank();
        if (filtrarProfessor) {
            sql.append(" AND a.email_prof = ?");
        }
        sql.append(" ORDER BY a.data NULLS LAST, a.h_inicio, a.codigo");

        List<Avaliacao> avaliacoes = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            if (filtrarProfessor) {
                ps.setString(1, emailProfessor.trim());
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    avaliacoes.add(mapearAvaliacao(rs));
                }
            }
            return avaliacoes;
        } catch (SQLException e) {
            throw new DaoException("Erro ao listar avaliacoes.", e);
        }
    }

    public Avaliacao atualizar(Avaliacao avaliacao) {
        String sql = "UPDATE avaliacao SET titulo = ?, descricao = ?, data = ?, h_inicio = ?, h_fim = ?, email_prof = ? " +
                "WHERE codigo = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, avaliacao.getTitulo());
            if (avaliacao.getDescricao() != null) {
                ps.setString(2, avaliacao.getDescricao());
            } else {
                ps.setNull(2, Types.VARCHAR);
            }
            if (avaliacao.getData() != null) {
                ps.setDate(3, Date.valueOf(avaliacao.getData()));
            } else {
                ps.setNull(3, Types.DATE);
            }
            ps.setTime(4, Time.valueOf(avaliacao.getHoraInicio()));
            ps.setTime(5, Time.valueOf(avaliacao.getHoraFim()));
            ps.setString(6, avaliacao.getEmailProfessor());
            ps.setString(7, avaliacao.getCodigo());

            int atualizadas = ps.executeUpdate();
            if (atualizadas == 0) {
                throw new RecursoNaoEncontradoException("Avaliacao " + avaliacao.getCodigo() + " nao encontrada.");
            }
        } catch (SQLException e) {
            throw traduzirSqlException("Erro ao atualizar avaliacao " + avaliacao.getCodigo() + ".", e);
        }

        return buscarPorCodigo(avaliacao.getCodigo())
                .orElseThrow(() -> new DaoException("Avaliacao atualizada nao encontrada."));
    }

    public void excluir(String codigo) {
        String sql = "DELETE FROM avaliacao WHERE codigo = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, codigo);
            int removidas = ps.executeUpdate();
            if (removidas == 0) {
                throw new RecursoNaoEncontradoException("Avaliacao " + codigo + " nao encontrada.");
            }
        } catch (SQLException e) {
            throw traduzirSqlException("Erro ao excluir avaliacao " + codigo + ".", e);
        }
    }

    private Avaliacao mapearAvaliacao(ResultSet rs) throws SQLException {
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setCodigo(rs.getString("codigo"));
        avaliacao.setTitulo(rs.getString("titulo"));
        avaliacao.setDescricao(rs.getString("descricao"));
        Date data = rs.getDate("data");
        avaliacao.setData(data != null ? data.toLocalDate() : null);
        Time hInicio = rs.getTime("h_inicio");
        avaliacao.setHoraInicio(hInicio != null ? hInicio.toLocalTime() : null);
        Time hFim = rs.getTime("h_fim");
        avaliacao.setHoraFim(hFim != null ? hFim.toLocalTime() : null);
        avaliacao.setEmailProfessor(rs.getString("email_prof"));
        avaliacao.setNomeProfessor(rs.getString("nome_professor"));
        return avaliacao;
    }

    private RuntimeException traduzirSqlException(String mensagemPadrao, SQLException e) {
        String state = e.getSQLState();
        if ("23505".equals(state)) {
            return new ConflitoDadosException("Ja existe uma avaliacao com este codigo.", e);
        }
        if ("23503".equals(state)) {
            return new ConflitoDadosException("Operacao viola integridade referencial (professor inexistente ou avaliacao vinculada a questoes/respostas).", e);
        }
        if ("23514".equals(state) || "23502".equals(state)) {
            return new IllegalArgumentException("Dados invalidos para a estrutura do banco de dados.");
        }
        return new DaoException(mensagemPadrao, e);
    }
}
