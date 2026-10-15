package com.fourbites.backend.exception;

public class ServicoExternoException extends RuntimeException {

    public ServicoExternoException(String mensagem) {
        super(mensagem);
    }
}