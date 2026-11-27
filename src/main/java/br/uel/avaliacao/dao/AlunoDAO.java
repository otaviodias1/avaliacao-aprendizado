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
        if (aluno == null || aluno.getEmail() == null || aluno.getEmail().isBlank()) {
            throw new IllegalArgumentException("Informe o e-mail do aluno.");
        }
        if (aluno.getNome() == null || aluno.getNome().isBlank()) {
            throw new IllegalArgumentException("Informe o nome do aluno.");
        }
        if (aluno.getSenha() == null || aluno.getSenha().isBlank()) {
            throw new IllegalArgumentException("Informe a senha do aluno.");
        }
        if (aluno.getMatricula() == null || aluno.getMatricula().isBlank()) {
            throw new IllegalArgumentException("Informe a matricula do aluno.");
        }

        String email = aluno.getEmail().trim();
        String nome = aluno.getNome().trim();
        String senha = aluno.getSenha().trim();
        String matricula = aluno.getMatricula().trim();
        aluno.setEmail(email);
        aluno.setNome(nome);
        aluno.setMatricula(matricula);

        String sqlUsuario = "INSERT INTO usuario (email, nome, senha, perfil) VALUES (?, ?, ?, 'ALUNO')";
        String sqlAluno = "INSERT INTO aluno (email_usuario, matricula) VALUES (?, ?)";

        try {
            jdbcTemplate.update(sqlUsuario, email, nome, senha);
            jdbcTemplate.update(sqlAluno, email, matricula);
        } catch (DataIntegrityViolationException e) {
            throw new ConflitoDadosException("Ja existe um usuario ou aluno cadastrado com estes dados.");
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