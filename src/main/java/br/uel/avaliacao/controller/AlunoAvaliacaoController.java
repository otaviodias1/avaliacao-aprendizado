package br.uel.avaliacao.controller;

import br.uel.avaliacao.model.AlunoAvaliacao;
import br.uel.avaliacao.service.AlunoAvaliacaoService;
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
@RequestMapping("/api/avaliacoes/{codigo}/alunos")
public class AlunoAvaliacaoController {

    private final AlunoAvaliacaoService alunoAvaliacaoService;

    public AlunoAvaliacaoController(AlunoAvaliacaoService alunoAvaliacaoService) {
        this.alunoAvaliacaoService = alunoAvaliacaoService;
    }

    @GetMapping
    public List<AlunoAvaliacao> listar(@PathVariable String codigo) {
        return alunoAvaliacaoService.listarPorAvaliacao(codigo);
    }

    @PostMapping
    public ResponseEntity<List<AlunoAvaliacao>> atribuir(@PathVariable String codigo, @RequestBody AlunoAvaliacao item) {
        String email = item != null ? item.getEmailAluno() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoAvaliacaoService.atribuirAluno(codigo, email));
    }

    @PostMapping("/todos")
    public List<AlunoAvaliacao> atribuirTodos(@PathVariable String codigo) {
        return alunoAvaliacaoService.atribuirTodosAlunos(codigo);
    }

    @DeleteMapping("/{emailAluno}")
    public ResponseEntity<Void> remover(@PathVariable String codigo, @PathVariable String emailAluno) {
        alunoAvaliacaoService.removerAluno(codigo, emailAluno);
        return ResponseEntity.noContent().build();
    }
}
