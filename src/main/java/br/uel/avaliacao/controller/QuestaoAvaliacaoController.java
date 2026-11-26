package br.uel.avaliacao.controller;

import br.uel.avaliacao.model.QuestaoAvaliacao;
import br.uel.avaliacao.service.QuestaoAvaliacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes/{codigo}/questoes")
public class QuestaoAvaliacaoController {

    private final QuestaoAvaliacaoService questaoAvaliacaoService;

    public QuestaoAvaliacaoController(QuestaoAvaliacaoService questaoAvaliacaoService) {
        this.questaoAvaliacaoService = questaoAvaliacaoService;
    }

    @GetMapping
    public List<QuestaoAvaliacao> listar(@PathVariable String codigo) {
        return questaoAvaliacaoService.listarPorAvaliacao(codigo);
    }

    @PostMapping
    public ResponseEntity<List<QuestaoAvaliacao>> adicionar(@PathVariable String codigo, @RequestBody QuestaoAvaliacao item) {
        questaoAvaliacaoService.adicionarQuestao(codigo, item);
        return ResponseEntity.status(HttpStatus.CREATED).body(questaoAvaliacaoService.listarPorAvaliacao(codigo));
    }

    @DeleteMapping("/{numeroQuestao}")
    public ResponseEntity<Void> remover(@PathVariable String codigo, @PathVariable int numeroQuestao) {
        questaoAvaliacaoService.removerQuestao(codigo, numeroQuestao);
        return ResponseEntity.noContent().build();
    }
}