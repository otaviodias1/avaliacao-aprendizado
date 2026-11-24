package br.uel.avaliacao.controller;

import br.uel.avaliacao.dao.ProfessorDAO;
import br.uel.avaliacao.model.Professor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/professores")
public class ProfessorController {

    private final ProfessorDAO professorDAO;

    public ProfessorController(ProfessorDAO professorDAO) {
        this.professorDAO = professorDAO;
    }

    @GetMapping
    public List<Professor> listarTodos() {
        return professorDAO.listarTodos();
    }
}
