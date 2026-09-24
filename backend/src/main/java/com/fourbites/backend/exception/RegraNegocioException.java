package com.fourbites.backend.exception;

// Lançada quando uma regra de negócio é violada (ex.: senhas diferentes).
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
