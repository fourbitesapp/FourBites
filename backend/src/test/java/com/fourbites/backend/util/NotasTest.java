package com.fourbites.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class NotasTest {

    @Test
    void notaGeralEAMediaDasQuatroCategorias() {
        assertEquals(new BigDecimal("4.25"), Notas.notaGeral(5, 4, 5, 3));
        assertEquals(new BigDecimal("5.00"), Notas.notaGeral(5, 5, 5, 5));
        assertEquals(new BigDecimal("1.00"), Notas.notaGeral(1, 1, 1, 1));
        assertEquals(new BigDecimal("2.75"), Notas.notaGeral(3, 3, 3, 2));
    }

    @Test
    void arredondaMediasVindasDoBanco() {
        assertEquals(new BigDecimal("4.37"), Notas.arredondar(4.3667, 2));
        assertEquals(new BigDecimal("4.5"), Notas.arredondar(4.45, 1));
        assertNull(Notas.arredondar(null, 2));
    }
}

