package br.uel.avaliacao.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RealizacaoAvaliacao {

    private String emailAluno;
    private String nomeAluno;
    private String matriculaAluno;
    private String codigoAvaliacao;
    private String tituloAvaliacao;
    private String status;
    private LocalDateTime data;
    private BigDecimal notaTotal;
    private BigDecimal valorTotal;
    private List<RespostaItem> respostas = new ArrayList<>();

    public RealizacaoAvaliacao() {
    }

    public String getEmailAluno() {
        return emailAluno;
    }

    public void setEmailAluno(String emailAluno) {
        this.emailAluno = emailAluno;
    }

    public String getNomeAluno() {
        return nomeAluno;
    }

    public void setNomeAluno(String nomeAluno) {
        this.nomeAluno = nomeAluno;
    }

    public String getMatriculaAluno() {
        return matriculaAluno;
    }

    public void setMatriculaAluno(String matriculaAluno) {
        this.matriculaAluno = matriculaAluno;
    }

    public String getCodigoAvaliacao() {
        return codigoAvaliacao;
    }

    public void setCodigoAvaliacao(String codigoAvaliacao) {
        this.codigoAvaliacao = codigoAvaliacao;
    }

    public String getTituloAvaliacao() {
        return tituloAvaliacao;
    }

    public void setTituloAvaliacao(String tituloAvaliacao) {
        this.tituloAvaliacao = tituloAvaliacao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public BigDecimal getNotaTotal() {
        return notaTotal;
    }

    public void setNotaTotal(BigDecimal notaTotal) {
        this.notaTotal = notaTotal;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public List<RespostaItem> getRespostas() {
        return respostas;
    }

    public void setRespostas(List<RespostaItem> respostas) {
        this.respostas = respostas != null ? respostas : new ArrayList<>();
    }
}