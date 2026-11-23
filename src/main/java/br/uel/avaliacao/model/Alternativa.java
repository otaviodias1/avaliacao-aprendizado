package br.uel.avaliacao.model;

public class Alternativa {

    private String letra;
    private String texto;
    private boolean correta;

    public Alternativa() {
    }

    public Alternativa(String letra, String texto, boolean correta) {
        this.letra = letra;
        this.texto = texto;
        this.correta = correta;
    }

    public String getLetra() {
        return letra;
    }

    public void setLetra(String letra) {
        this.letra = letra;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public boolean isCorreta() {
        return correta;
    }

    public void setCorreta(boolean correta) {
        this.correta = correta;
    }
}
