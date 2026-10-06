package com.fourbites.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class DistanciaTest {

    @Test
    void mesmoPontoTemDistanciaZero() {
        assertEquals(0.0, Distancia.emKm(-23.9608, -46.3336, -23.9608, -46.3336), 0.0001);
    }

    @Test
    void santosAteSaoPauloFicaPertoDe55Km() {
        double distancia = Distancia.emKm(-23.9608, -46.3336, -23.5505, -46.6333);

        assertEquals(55.0, distancia, 2.0);
    }

    @Test
    void aOrdemDosPontosNaoMudaADistancia() {
        double ida = Distancia.emKm(-23.9608, -46.3336, -23.5505, -46.6333);
        double volta = Distancia.emKm(-23.5505, -46.6333, -23.9608, -46.3336);

        assertEquals(ida, volta, 0.0001);
    }
}
