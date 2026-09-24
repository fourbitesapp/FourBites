package com.fourbites.backend.exception;

//Lançada quando o dado já existe
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
