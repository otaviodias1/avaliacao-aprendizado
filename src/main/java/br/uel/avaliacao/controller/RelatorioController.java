package br.uel.avaliacao.controller;

import br.uel.avaliacao.dao.RelatorioDAO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioDAO relatorioDAO;

    public RelatorioController(RelatorioDAO relatorioDAO) {
        this.relatorioDAO = relatorioDAO;
    }

    @GetMapping("/medias")
    public ResponseEntity< List< Map< String, Object>>> mediasPorAvaliacao() {
        return ResponseEntity.ok(relatorioDAO.buscarMediasPorAvaliacao());
    }

    @GetMapping("/questoes-erros")
    public ResponseEntity< List< Map< String, Object>>> questoesMaisErradas() {
        return ResponseEntity.ok(relatorioDAO.buscarQuestoesMaisErradas());
    }

    @GetMapping("/participacao")
    public ResponseEntity< List< Map< String, Object>>> participacaoPorAvaliacao() {
        return ResponseEntity.ok(relatorioDAO.buscarParticipacaoPorAvaliacao());
    }
}