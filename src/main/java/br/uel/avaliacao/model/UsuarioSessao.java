package br.uel.avaliacao.model;

import java.io.Serializable;

public class UsuarioSessao implements Serializable {

    private String email;
    private String nome;
    private String perfil;
    private String departamento;
    private String matricula;

    public UsuarioSessao() {
    }

    public UsuarioSessao(String email, String nome, String perfil, String departamento, String matricula) {
        this.email = email;
        this.nome = nome;
        this.perfil = perfil;
        this.departamento = departamento;
        this.matricula = matricula;
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

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public boolean isProfessor() {
        return "PROFESSOR".equals(perfil);
    }

    public boolean isAluno() {
        return "ALUNO".equals(perfil);
    }
}
