package br.uel.avaliacao.service;

import br.uel.avaliacao.dao.QuestaoAvaliacaoDAO;
import br.uel.avaliacao.model.QuestaoAvaliacao;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class QuestaoAvaliacaoService {

    private final QuestaoAvaliacaoDAO questaoAvaliacaoDAO;

    public QuestaoAvaliacaoService(QuestaoAvaliacaoDAO questaoAvaliacaoDAO) {
        this.questaoAvaliacaoDAO = questaoAvaliacaoDAO;
    }

    public List<QuestaoAvaliacao> listarPorAvaliacao(String codigoAvaliacao) {
        return questaoAvaliacaoDAO.listarPorAvaliacao(codigoAvaliacao);
    }

    public void adicionarQuestao(String codigoAvaliacao, QuestaoAvaliacao item) {
        if (item == null || item.getNumeroQuestao() == null) {
            throw new IllegalArgumentException("Informe o numero da questao.");
        }
        if (item.getValor() == null || item.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor da questao deve ser maior que zero.");
        }
        if (item.getOrdem() == null || item.getOrdem() <= 0) {
            throw new IllegalArgumentException("A ordem da questao deve ser maior que zero.");
        }
        item.setCodigoAvaliacao(codigoAvaliacao);
        questaoAvaliacaoDAO.adicionarQuestao(item);
    }

    public void removerQuestao(String codigoAvaliacao, int numeroQuestao) {
        questaoAvaliacaoDAO.removerQuestao(codigoAvaliacao, numeroQuestao);
    }
}