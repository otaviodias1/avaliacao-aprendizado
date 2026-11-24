package br.uel.avaliacao.service;

import br.uel.avaliacao.dao.ProfessorDAO;
import br.uel.avaliacao.dao.QuestaoDAO;
import br.uel.avaliacao.dao.RecursoNaoEncontradoException;
import br.uel.avaliacao.model.Alternativa;
import br.uel.avaliacao.model.Questao;
import br.uel.avaliacao.model.TipoQuestao;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class QuestaoService {

    private final QuestaoDAO questaoDAO;
    private final ProfessorDAO professorDAO;

    public QuestaoService(QuestaoDAO questaoDAO, ProfessorDAO professorDAO) {
        this.questaoDAO = questaoDAO;
        this.professorDAO = professorDAO;
    }

    public Questao cadastrar(Questao questao) {
        validarENormalizar(questao, false);
        return questaoDAO.cadastrar(questao);
    }

    public Questao buscarPorNumero(int numero) {
        return questaoDAO.buscarPorNumero(numero)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Questao " + numero + " nao encontrada."));
    }

    public List<Questao> listarTodas(TipoQuestao tipo, String emailProfessor) {
        return questaoDAO.listarTodas(tipo, emailProfessor);
    }

    public Questao atualizar(int numero, Questao questao) {
        questao.setNumero(numero);
        validarENormalizar(questao, true);
        return questaoDAO.atualizar(questao);
    }

    public void excluir(int numero) {
        questaoDAO.excluir(numero);
    }

    private void validarENormalizar(Questao questao, boolean numeroObrigatorio) {
        if (questao == null) {
            throw new IllegalArgumentException("Dados da questao sao obrigatorios.");
        }

        if (numeroObrigatorio && questao.getNumero() == null) {
            throw new IllegalArgumentException("Numero da questao e obrigatorio.");
        }

        if (questao.getNumero() != null && questao.getNumero() <= 0) {
            throw new IllegalArgumentException("Numero da questao deve ser maior que zero.");
        }

        if (questao.getEnunciado() == null || questao.getEnunciado().isBlank()) {
            throw new IllegalArgumentException("Enunciado da questao e obrigatorio.");
        }
        questao.setEnunciado(questao.getEnunciado().trim());

        if (questao.getTipo() == null) {
            throw new IllegalArgumentException("Tipo da questao e obrigatorio (OBJETIVA ou TEXTO_LIVRE).");
        }

        if (questao.getEmailProfessor() == null || questao.getEmailProfessor().isBlank()) {
            throw new IllegalArgumentException("Email do professor e obrigatorio.");
        }
        String emailProfessor = questao.getEmailProfessor().trim();
        questao.setEmailProfessor(emailProfessor);

        if (!professorDAO.existePorEmail(emailProfessor)) {
            throw new IllegalArgumentException("Professor nao encontrado: " + emailProfessor);
        }

        if (questao.getTipo() == TipoQuestao.OBJETIVA) {
            validarAlternativas(questao);
        } else {
            questao.setAlternativas(new ArrayList<>());
        }
    }

    private void validarAlternativas(Questao questao) {
        List<Alternativa> alternativas = questao.getAlternativas();
        if (alternativas == null || alternativas.size() < 2) {
            throw new IllegalArgumentException("Questao objetiva deve possuir pelo menos duas alternativas.");
        }

        Set<String> letrasUsadas = new HashSet<>();
        int quantidadeCorretas = 0;
        List<Alternativa> normalizadas = new ArrayList<>();

        for (Alternativa alt : alternativas) {
            if (alt == null) {
                throw new IllegalArgumentException("Alternativa invalida.");
            }
            String letra = alt.getLetra() == null ? "" : alt.getLetra().trim().toUpperCase(Locale.ROOT);
            if (letra.length() != 1 || !Character.isLetter(letra.charAt(0))) {
                throw new IllegalArgumentException("Cada alternativa deve possuir exatamente uma letra (A-Z).");
            }
            if (!letrasUsadas.add(letra)) {
                throw new IllegalArgumentException("Letra duplicada nas alternativas: " + letra);
            }
            if (alt.getTexto() == null || alt.getTexto().isBlank()) {
                throw new IllegalArgumentException("Texto da alternativa " + letra + " e obrigatorio.");
            }
            if (alt.isCorreta()) {
                quantidadeCorretas++;
            }
            normalizadas.add(new Alternativa(letra, alt.getTexto().trim(), alt.isCorreta()));
        }

        if (quantidadeCorretas > 1) {
            throw new IllegalArgumentException("Informe no maximo uma alternativa correta.");
        }

        questao.setAlternativas(normalizadas);
    }
}
