package br.uel.avaliacao.controller;

import br.uel.avaliacao.dao.AlunoDAO;
import br.uel.avaliacao.model.Aluno;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoDAO alunoDAO;

    public AlunoController(AlunoDAO alunoDAO) {
        this.alunoDAO = alunoDAO;
    }

    @PostMapping
    public ResponseEntity<Aluno> cadastrar(@RequestBody Aluno aluno) {
        alunoDAO.cadastrar(aluno);
        return ResponseEntity.status(HttpStatus.CREATED).body(aluno);
    }

    @GetMapping
    public ResponseEntity<List<Aluno>> listarTodos() {
        return ResponseEntity.ok(alunoDAO.listarTodos());
    }
}