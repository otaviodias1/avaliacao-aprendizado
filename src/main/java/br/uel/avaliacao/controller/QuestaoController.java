package br.uel.avaliacao.controller;

import br.uel.avaliacao.model.Questao;
import br.uel.avaliacao.model.TipoQuestao;
import br.uel.avaliacao.service.QuestaoService;
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
@RequestMapping("/api/questoes")
public class QuestaoController {

    private final QuestaoService questaoService;

    public QuestaoController(QuestaoService questaoService) {
        this.questaoService = questaoService;
    }

    @GetMapping
    public List<Questao> listarTodas(
            @RequestParam(required = false) TipoQuestao tipo,
            @RequestParam(required = false) String emailProfessor) {
        return questaoService.listarTodas(tipo, emailProfessor);
    }

    @GetMapping("/{numero}")
    public Questao buscarPorNumero(@PathVariable int numero) {
        return questaoService.buscarPorNumero(numero);
    }

    @PostMapping
    public ResponseEntity<Questao> cadastrar(@RequestBody Questao questao) {
        Questao criada = questaoService.cadastrar(questao);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{numero}")
    public Questao atualizar(@PathVariable int numero, @RequestBody Questao questao) {
        return questaoService.atualizar(numero, questao);
    }

    @DeleteMapping("/{numero}")
    public ResponseEntity<Void> excluir(@PathVariable int numero) {
        questaoService.excluir(numero);
        return ResponseEntity.noContent().build();
    }
}
