package com.fourbites.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.fourbites.backend.util.Compatibilidade.DadosDoRestaurante;
import com.fourbites.backend.util.Compatibilidade.PerfilDoUsuario;

class CompatibilidadeTest {

    private static final int JAPONESA = 3;
    private static final int ITALIANA = 2;

    // Exemplo: prefere Japonesa e $$, precisa de acessibilidade, não leva pets,
    // já deu nota alta para um japonês. Restaurante japonês, $$$, acessível, média 4,2.
    // 30 + 7,5 + 7,5 + 7,5 + 25 + 12,6 = 90,1 -> 90
    
    @Test
    void exemploDaMonografiaDa90() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(JAPONESA), "$$", true, false, Set.of(JAPONESA));
        DadosDoRestaurante restaurante = new DadosDoRestaurante(JAPONESA, "$$$", true, false, new BigDecimal("4.2"));

        assertEquals(90, Compatibilidade.calcular(usuario, restaurante));
    }

    @Test
    void combinandoEmTudoComNotaMaximaDa100() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(JAPONESA), "$$", true, true, Set.of(JAPONESA));
        DadosDoRestaurante restaurante = new DadosDoRestaurante(JAPONESA, "$$", true, true, new BigDecimal("5"));

        assertEquals(100, Compatibilidade.calcular(usuario, restaurante));
    }

    // Outra categoria, preço duas faixas longe, sem acessibilidade e sem pets, sem avaliações: 0.
    @Test
    void naoCombinandoEmNadaDa0() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(JAPONESA), "$", true, true, Set.of(JAPONESA));
        DadosDoRestaurante restaurante = new DadosDoRestaurante(ITALIANA, "$$$", false, false, null);

        assertEquals(0, Compatibilidade.calcular(usuario, restaurante));
    }

    // Quem não marcou nenhuma preferência e ainda não avaliou nada.
    @Test
    void usuarioSemPreferenciasNemHistorico() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(), null, false, false, Set.of());
        DadosDoRestaurante restaurante = new DadosDoRestaurante(ITALIANA, "$$", false, false, new BigDecimal("4.0"));

        assertEquals(72, Compatibilidade.calcular(usuario, restaurante));
    }
}
