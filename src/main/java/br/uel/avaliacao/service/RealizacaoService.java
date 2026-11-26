package br.uel.avaliacao.service;

import br.uel.avaliacao.dao.RealizacaoDAO;
import br.uel.avaliacao.model.CorrecaoRequest;
import br.uel.avaliacao.model.RealizacaoAvaliacao;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RealizacaoService {

    private final RealizacaoDAO realizacaoDAO;

    public RealizacaoService(RealizacaoDAO realizacaoDAO) {
        this.realizacaoDAO = realizacaoDAO;
    }

    public RealizacaoAvaliacao submeter(RealizacaoAvaliacao submissao) {
        if (submissao == null || submissao.getEmailAluno() == null || submissao.getEmailAluno().isBlank()) {
            throw new IllegalArgumentException("Informe o e-mail do aluno.");
        }
        if (submissao.getCodigoAvaliacao() == null || submissao.getCodigoAvaliacao().isBlank()) {
            throw new IllegalArgumentException("Informe o codigo da avaliacao.");
        }
        submissao.setEmailAluno(submissao.getEmailAluno().trim());
        submissao.setCodigoAvaliacao(submissao.getCodigoAvaliacao().trim());
        realizacaoDAO.submeterAvaliacao(submissao);
        return realizacaoDAO.buscarDetalhe(submissao.getCodigoAvaliacao(), submissao.getEmailAluno());
    }

    public RealizacaoAvaliacao corrigir(String codigoAvaliacao, String emailAluno, int numeroQuestao, CorrecaoRequest correcao) {
        if (correcao == null || correcao.getNota() == null) {
            throw new IllegalArgumentException("Informe a nota atribuida.");
        }
        if (correcao.getEmailProfessor() == null || correcao.getEmailProfessor().isBlank()) {
            throw new IllegalArgumentException("Informe o e-mail do professor corretor.");
        }
        realizacaoDAO.corrigirQuestaoLivre(
                codigoAvaliacao,
                emailAluno,
                numeroQuestao,
                correcao.getNota(),
                correcao.getEmailProfessor().trim()
        );
        return realizacaoDAO.buscarDetalhe(codigoAvaliacao, emailAluno);
    }

    public List<RealizacaoAvaliacao> listar(String codigoAvaliacao, String emailAluno) {
        return realizacaoDAO.listarRealizacoes(codigoAvaliacao, emailAluno);
    }

    public RealizacaoAvaliacao buscarDetalhe(String codigoAvaliacao, String emailAluno) {
        return realizacaoDAO.buscarDetalhe(codigoAvaliacao, emailAluno);
    }
}