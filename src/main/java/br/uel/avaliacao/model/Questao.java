package br.uel.avaliacao.model;

import java.util.ArrayList;
import java.util.List;

public class Questao {

    private Integer numero;
    private String enunciado;
    private TipoQuestao tipo;
    private String emailProfessor;
    private String nomeProfessor;
    private List<Alternativa> alternativas = new ArrayList<>();

    public Questao() {
    }

    public Questao(Integer numero, String enunciado, TipoQuestao tipo, String emailProfessor) {
        this.numero = numero;
        this.enunciado = enunciado;
        this.tipo = tipo;
        this.emailProfessor = emailProfessor;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public TipoQuestao getTipo() {
        return tipo;
    }

    public void setTipo(TipoQuestao tipo) {
        this.tipo = tipo;
    }

    public String getEmailProfessor() {
        return emailProfessor;
    }

    public void setEmailProfessor(String emailProfessor) {
        this.emailProfessor = emailProfessor;
    }

    public String getNomeProfessor() {
        return nomeProfessor;
    }

    public void setNomeProfessor(String nomeProfessor) {
        this.nomeProfessor = nomeProfessor;
    }

    public List<Alternativa> getAlternativas() {
        return alternativas;
    }

    public void setAlternativas(List<Alternativa> alternativas) {
        this.alternativas = alternativas != null ? alternativas : new ArrayList<>();
    }
}
