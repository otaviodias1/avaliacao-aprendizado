package br.uel.avaliacao.model;

public class Aluno {
    private String email;
    private String nome;
    private String senha;
    private String matricula; // confira se no schema.sql é "matricula", "ra" ou "turma"

    public Aluno() {}

    public Aluno(String email, String nome, String senha, String matricula) {
        this.email = email;
        this.nome = nome;
        this.senha = senha;
        this.matricula = matricula;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
}