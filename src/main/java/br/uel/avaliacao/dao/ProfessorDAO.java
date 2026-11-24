package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.Professor;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ProfessorDAO {

    private final DataSource dataSource;

    public ProfessorDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Professor> listarTodos() {
        String sql = "SELECT p.email_usuario, u.nome, p.departamento " +
                "FROM professor p " +
                "JOIN usuario u ON u.email = p.email_usuario " +
                "ORDER BY u.nome";

        List<Professor> professores = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                professores.add(new Professor(
                        rs.getString("email_usuario"),
                        rs.getString("nome"),
                        rs.getString("departamento")
                ));
            }
            return professores;
        } catch (SQLException e) {
            throw new DaoException("Erro ao listar professores.", e);
        }
    }

    public boolean existePorEmail(String email) {
        String sql = "SELECT 1 FROM professor WHERE email_usuario = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            throw new DaoException("Erro ao verificar professor.", e);
        }
    }
}
