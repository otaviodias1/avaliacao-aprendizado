package br.uel.avaliacao.model;

import java.math.BigDecimal;

public class RespostaItem {

    private Integer numeroQuestao;
    private Integer ordem;
    private String enunciado;
    private String tipo;
    private BigDecimal valorQuestao;
    private String letraEscolhida;
    private String letraCorreta;
    private String textoResposta;
    private BigDecimal nota;
    private String emailProfessorCorretor;

    public RespostaItem() {
    }

    public Integer getNumeroQuestao() {
        return numeroQuestao;
    }

    public void setNumeroQuestao(Integer numeroQuestao) {
        this.numeroQuestao = numeroQuestao;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getValorQuestao() {
        return valorQuestao;
    }

    public void setValorQuestao(BigDecimal valorQuestao) {
        this.valorQuestao = valorQuestao;
    }

    public String getLetraEscolhida() {
        return letraEscolhida;
    }

    public void setLetraEscolhida(String letraEscolhida) {
        this.letraEscolhida = letraEscolhida;
    }

    public String getLetraCorreta() {
        return letraCorreta;
    }

    public void setLetraCorreta(String letraCorreta) {
        this.letraCorreta = letraCorreta;
    }

    public String getTextoResposta() {
        return textoResposta;
    }

    public void setTextoResposta(String textoResposta) {
        this.textoResposta = textoResposta;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public String getEmailProfessorCorretor() {
        return emailProfessorCorretor;
    }

    public void setEmailProfessorCorretor(String emailProfessorCorretor) {
        this.emailProfessorCorretor = emailProfessorCorretor;
    }
}