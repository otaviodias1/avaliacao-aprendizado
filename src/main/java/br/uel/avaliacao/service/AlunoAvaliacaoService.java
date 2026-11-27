package br.uel.avaliacao.service;

import br.uel.avaliacao.dao.AlunoAvaliacaoDAO;
import br.uel.avaliacao.dao.AvaliacaoDAO;
import br.uel.avaliacao.dao.RecursoNaoEncontradoException;
import br.uel.avaliacao.model.AlunoAvaliacao;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlunoAvaliacaoService {

    private final AlunoAvaliacaoDAO alunoAvaliacaoDAO;
    private final AvaliacaoDAO avaliacaoDAO;

    public AlunoAvaliacaoService(AlunoAvaliacaoDAO alunoAvaliacaoDAO, AvaliacaoDAO avaliacaoDAO) {
        this.alunoAvaliacaoDAO = alunoAvaliacaoDAO;
        this.avaliacaoDAO = avaliacaoDAO;
    }

    public List<AlunoAvaliacao> listarPorAvaliacao(String codigoAvaliacao) {
        verificarAvaliacaoExiste(codigoAvaliacao);
        return alunoAvaliacaoDAO.listarPorAvaliacao(codigoAvaliacao);
    }

    public List<AlunoAvaliacao> atribuirAluno(String codigoAvaliacao, String emailAluno) {
        verificarAvaliacaoExiste(codigoAvaliacao);
        if (emailAluno == null || emailAluno.isBlank()) {
            throw new IllegalArgumentException("Informe o e-mail do aluno.");
        }
        alunoAvaliacaoDAO.atribuirAluno(codigoAvaliacao, emailAluno.trim());
        return alunoAvaliacaoDAO.listarPorAvaliacao(codigoAvaliacao);
    }

    public List<AlunoAvaliacao> atribuirTodosAlunos(String codigoAvaliacao) {
        verificarAvaliacaoExiste(codigoAvaliacao);
        alunoAvaliacaoDAO.atribuirTodosAlunos(codigoAvaliacao);
        return alunoAvaliacaoDAO.listarPorAvaliacao(codigoAvaliacao);
    }

    public void removerAluno(String codigoAvaliacao, String emailAluno) {
        verificarAvaliacaoExiste(codigoAvaliacao);
        alunoAvaliacaoDAO.removerAluno(codigoAvaliacao, emailAluno);
    }

    private void verificarAvaliacaoExiste(String codigoAvaliacao) {
        if (avaliacaoDAO.buscarPorCodigo(codigoAvaliacao).isEmpty()) {
            throw new RecursoNaoEncontradoException("Avaliacao " + codigoAvaliacao + " nao encontrada.");
        }
    }
}
