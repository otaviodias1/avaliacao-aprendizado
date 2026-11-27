package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.UsuarioSessao;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

@Repository
public class AuthDAO {

    private final DataSource dataSource;

    public AuthDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Optional<UsuarioSessao> autenticar(String email, String senha) {
        String sql = "SELECT u.email, u.nome, u.perfil, p.departamento, a.matricula " +
                "FROM usuario u " +
                "LEFT JOIN professor p ON p.email_usuario = u.email " +
                "LEFT JOIN aluno a ON a.email_usuario = u.email " +
                "WHERE LOWER(u.email) = LOWER(?) AND u.senha = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.setString(2, senha);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                return Optional.of(new UsuarioSessao(
                        rs.getString("email"),
                        rs.getString("nome"),
                        rs.getString("perfil"),
                        rs.getString("departamento"),
                        rs.getString("matricula")
                ));
            }
        } catch (SQLException e) {
            throw new DaoException("Erro ao autenticar usuario.", e);
        }
    }
}
