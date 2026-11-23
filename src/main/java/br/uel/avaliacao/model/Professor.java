package br.uel.avaliacao.model;

public class Professor {

    private String email;
    private String nome;
    private String departamento;

    public Professor() {
    }

    public Professor(String email, String nome, String departamento) {
        this.email = email;
        this.nome = nome;
        this.departamento = departamento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }
}
