package br.uel.avaliacao.controller;

import br.uel.avaliacao.model.CorrecaoRequest;
import br.uel.avaliacao.model.RealizacaoAvaliacao;
import br.uel.avaliacao.service.RealizacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/realizacoes")
public class RealizacaoController {

    private final RealizacaoService realizacaoService;

    public RealizacaoController(RealizacaoService realizacaoService) {
        this.realizacaoService = realizacaoService;
    }

    @GetMapping
    public List<RealizacaoAvaliacao> listar(
            @RequestParam(required = false) String codigoAvaliacao,
            @RequestParam(required = false) String emailAluno) {
        return realizacaoService.listar(codigoAvaliacao, emailAluno);
    }

    @GetMapping("/{codigoAvaliacao}/{emailAluno}")
    public RealizacaoAvaliacao buscarDetalhe(
            @PathVariable String codigoAvaliacao,
            @PathVariable String emailAluno) {
        return realizacaoService.buscarDetalhe(codigoAvaliacao, emailAluno);
    }

    @PostMapping
    public ResponseEntity<RealizacaoAvaliacao> submeter(@RequestBody RealizacaoAvaliacao submissao) {
        RealizacaoAvaliacao criada = realizacaoService.submeter(submissao);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{codigoAvaliacao}/{emailAluno}/questoes/{numeroQuestao}/correcao")
    public RealizacaoAvaliacao corrigir(
            @PathVariable String codigoAvaliacao,
            @PathVariable String emailAluno,
            @PathVariable int numeroQuestao,
            @RequestBody CorrecaoRequest correcao) {
        return realizacaoService.corrigir(codigoAvaliacao, emailAluno, numeroQuestao, correcao);
    }
}