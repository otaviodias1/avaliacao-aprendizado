package br.uel.avaliacao.service;

import br.uel.avaliacao.dao.AvaliacaoDAO;
import br.uel.avaliacao.dao.ProfessorDAO;
import br.uel.avaliacao.dao.RecursoNaoEncontradoException;
import br.uel.avaliacao.model.Avaliacao;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvaliacaoService {

    private final AvaliacaoDAO avaliacaoDAO;
    private final ProfessorDAO professorDAO;

    public AvaliacaoService(AvaliacaoDAO avaliacaoDAO, ProfessorDAO professorDAO) {
        this.avaliacaoDAO = avaliacaoDAO;
        this.professorDAO = professorDAO;
    }

    public Avaliacao cadastrar(Avaliacao avaliacao) {
        validarENormalizar(avaliacao);
        return avaliacaoDAO.cadastrar(avaliacao);
    }

    public Avaliacao buscarPorCodigo(String codigo) {
        return avaliacaoDAO.buscarPorCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Avaliacao " + codigo + " nao encontrada."));
    }

    public List<Avaliacao> listarTodas(String emailProfessor) {
        return avaliacaoDAO.listarTodas(emailProfessor);
    }

    public Avaliacao atualizar(String codigo, Avaliacao avaliacao) {
        avaliacao.setCodigo(codigo);
        validarENormalizar(avaliacao);
        return avaliacaoDAO.atualizar(avaliacao);
    }

    public void excluir(String codigo) {
        avaliacaoDAO.excluir(codigo);
    }

    private void validarENormalizar(Avaliacao avaliacao) {
        if (avaliacao == null) {
            throw new IllegalArgumentException("Dados da avaliacao sao obrigatorios.");
        }

        if (avaliacao.getCodigo() == null || avaliacao.getCodigo().isBlank()) {
            throw new IllegalArgumentException("Codigo da avaliacao e obrigatorio.");
        }
        String codigo = avaliacao.getCodigo().trim();
        if (codigo.length() > 30) {
            throw new IllegalArgumentException("Codigo da avaliacao deve ter no maximo 30 caracteres.");
        }
        avaliacao.setCodigo(codigo);

        if (avaliacao.getTitulo() == null || avaliacao.getTitulo().isBlank()) {
            throw new IllegalArgumentException("Titulo da avaliacao e obrigatorio.");
        }
        String titulo = avaliacao.getTitulo().trim();
        if (titulo.length() > 150) {
            throw new IllegalArgumentException("Titulo da avaliacao deve ter no maximo 150 caracteres.");
        }
        avaliacao.setTitulo(titulo);

        if (avaliacao.getDescricao() != null) {
            String desc = avaliacao.getDescricao().trim();
            avaliacao.setDescricao(desc.isEmpty() ? null : desc);
        }

        if (avaliacao.getHoraInicio() == null || avaliacao.getHoraFim() == null) {
            throw new IllegalArgumentException("Horario de inicio e horario de fim sao obrigatorios.");
        }
        if (!avaliacao.getHoraFim().isAfter(avaliacao.getHoraInicio())) {
            throw new IllegalArgumentException("Horario de fim deve ser maior que o horario de inicio.");
        }

        if (avaliacao.getEmailProfessor() == null || avaliacao.getEmailProfessor().isBlank()) {
            throw new IllegalArgumentException("Email do professor e obrigatorio.");
        }
        String emailProfessor = avaliacao.getEmailProfessor().trim();
        avaliacao.setEmailProfessor(emailProfessor);

        if (!professorDAO.existePorEmail(emailProfessor)) {
            throw new IllegalArgumentException("Professor nao encontrado: " + emailProfessor);
        }
    }
}
