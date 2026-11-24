package br.uel.avaliacao.controller;

import br.uel.avaliacao.model.Avaliacao;
import br.uel.avaliacao.service.AvaliacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @GetMapping
    public List<Avaliacao> listarTodas(@RequestParam(required = false) String emailProfessor) {
        return avaliacaoService.listarTodas(emailProfessor);
    }

    @GetMapping("/{codigo}")
    public Avaliacao buscarPorCodigo(@PathVariable String codigo) {
        return avaliacaoService.buscarPorCodigo(codigo);
    }

    @PostMapping
    public ResponseEntity<Avaliacao> cadastrar(@RequestBody Avaliacao avaliacao) {
        Avaliacao criada = avaliacaoService.cadastrar(avaliacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{codigo}")
    public Avaliacao atualizar(@PathVariable String codigo, @RequestBody Avaliacao avaliacao) {
        return avaliacaoService.atualizar(codigo, avaliacao);
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> excluir(@PathVariable String codigo) {
        avaliacaoService.excluir(codigo);
        return ResponseEntity.noContent().build();
    }
}
