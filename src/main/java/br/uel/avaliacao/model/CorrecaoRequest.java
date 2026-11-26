package br.uel.avaliacao.model;

import java.math.BigDecimal;

public class CorrecaoRequest {

    private BigDecimal nota;
    private String emailProfessor;

    public CorrecaoRequest() {
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public String getEmailProfessor() {
        return emailProfessor;
    }

    public void setEmailProfessor(String emailProfessor) {
        this.emailProfessor = emailProfessor;
    }
}