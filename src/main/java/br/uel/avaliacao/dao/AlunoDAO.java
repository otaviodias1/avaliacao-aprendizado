package br.uel.avaliacao.dao;

import br.uel.avaliacao.model.Aluno;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public class AlunoDAO {

    private final JdbcTemplate jdbcTemplate;

    public AlunoDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void cadastrar(Aluno aluno) {
        String sqlUsuario = "INSERT INTO usuario (email, nome, senha) VALUES (?, ?, ?)";
        String sqlAluno = "INSERT INTO aluno (email_usuario, matricula) VALUES (?, ?)";

        try {
            jdbcTemplate.update(sqlUsuario, aluno.getEmail(), aluno.getNome(), aluno.getSenha());
            jdbcTemplate.update(sqlAluno, aluno.getEmail(), aluno.getMatricula());
        } catch (DataIntegrityViolationException e) {
            throw new ConflitoDadosException("Já existe um usuário ou aluno cadastrado com estes dados.");
        }
    }

    public List<Aluno> listarTodos() {
        String sql = """
            SELECT u.email, u.nome, a.matricula
            FROM usuario u
            JOIN aluno a ON u.email = a.email_usuario
            ORDER BY u.nome
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Aluno aluno = new Aluno();
            aluno.setEmail(rs.getString("email"));
            aluno.setNome(rs.getString("nome"));
            aluno.setMatricula(rs.getString("matricula"));
            return aluno;
        });
    }
}