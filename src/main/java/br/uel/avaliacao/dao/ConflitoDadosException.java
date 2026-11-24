package br.uel.avaliacao.dao;

public class ConflitoDadosException extends RuntimeException {

    public ConflitoDadosException(String message, Throwable cause) {
        super(message, cause);
    }

    public ConflitoDadosException(String message) {
        super(message);
    }
}
