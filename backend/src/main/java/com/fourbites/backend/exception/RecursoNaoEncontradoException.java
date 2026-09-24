package com.fourbites.backend.exception;

// Lançada quando algo procurado não existe.
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
