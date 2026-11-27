package br.uel.avaliacao.model;

public class AlunoAvaliacao {

    private String codigoAvaliacao;
    private String emailAluno;
    private String nomeAluno;
    private String matricula;
    private String status;

    public AlunoAvaliacao() {
    }

    public AlunoAvaliacao(String codigoAvaliacao, String emailAluno, String nomeAluno, String matricula, String status) {
        this.codigoAvaliacao = codigoAvaliacao;
        this.emailAluno = emailAluno;
        this.nomeAluno = nomeAluno;
        this.matricula = matricula;
        this.status = status;
    }

    public String getCodigoAvaliacao() {
        return codigoAvaliacao;
    }

    public void setCodigoAvaliacao(String codigoAvaliacao) {
        this.codigoAvaliacao = codigoAvaliacao;
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

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
