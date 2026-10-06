package com.fourbites.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ValidadorCnpjTest {

    @Test
    void aceitaCnpjValidoComOuSemPontuacao() {
        assertTrue(ValidadorCnpj.valido("11222333000181"));
        assertTrue(ValidadorCnpj.valido("11.222.333/0001-81"));
        assertTrue(ValidadorCnpj.valido("12345678000195"));
    }

    @Test
    void recusaDigitoVerificadorErrado() {
        assertFalse(ValidadorCnpj.valido("11222333000180"));
        assertFalse(ValidadorCnpj.valido("11222333000191"));
    }

    @Test
    void recusaTamanhoErradoEVazio() {
        assertFalse(ValidadorCnpj.valido("1122233300018"));
        assertFalse(ValidadorCnpj.valido(""));
        assertFalse(ValidadorCnpj.valido(null));
    }

    @Test
    void recusaNumerosTodosIguais() {
        assertFalse(ValidadorCnpj.valido("00000000000000"));
        assertFalse(ValidadorCnpj.valido("11111111111111"));
    }

    @Test
    void somenteDigitosRemoveAPontuacao() {
        assertEquals("11222333000181", ValidadorCnpj.somenteDigitos("11.222.333/0001-81"));
    }
}

