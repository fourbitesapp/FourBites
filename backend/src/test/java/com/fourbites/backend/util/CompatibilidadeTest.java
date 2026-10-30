package com.fourbites.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.fourbites.backend.util.Compatibilidade.DadosDoRestaurante;
import com.fourbites.backend.util.Compatibilidade.PerfilDoUsuario;

// Ordem dos extras nos dois records: acessibilidade, pets, crianças, estacionamento, fumantes.
class CompatibilidadeTest {

    private static final int JAPONESA = 3;
    private static final int ITALIANA = 2;

    // Exemplo: prefere Japonesa e $$, precisa de acessibilidade, não marcou os outros extras,
    // já deu nota alta para um japonês. Restaurante japonês, $$$, acessível, média 4,2.
    // 30 + 7,5 + (5 extras x 3 = 15) + 25 + 12,6 = 90,1 -> 90
    @Test
    void exemploDaMonografiaDa90() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(JAPONESA), "$$",
                true, false, false, false, false, Set.of(JAPONESA));
        DadosDoRestaurante restaurante = new DadosDoRestaurante(JAPONESA, "$$$",
                true, false, false, false, false, new BigDecimal("4.2"));

        assertEquals(90, Compatibilidade.calcular(usuario, restaurante));
    }

    @Test
    void combinandoEmTudoComNotaMaximaDa100() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(JAPONESA), "$$",
                true, true, true, true, true, Set.of(JAPONESA));
        DadosDoRestaurante restaurante = new DadosDoRestaurante(JAPONESA, "$$",
                true, true, true, true, true, new BigDecimal("5"));

        assertEquals(100, Compatibilidade.calcular(usuario, restaurante));
    }

    // Outra categoria, preço duas faixas longe, nenhum dos 5 extras que o usuário quer, sem avaliações: 0.
    @Test
    void naoCombinandoEmNadaDa0() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(JAPONESA), "$",
                true, true, true, true, true, Set.of(JAPONESA));
        DadosDoRestaurante restaurante = new DadosDoRestaurante(ITALIANA, "$$$",
                false, false, false, false, false, null);

        assertEquals(0, Compatibilidade.calcular(usuario, restaurante));
    }

    // Quem não marcou nenhuma preferência e ainda não avaliou nada: 30 + 15 + 15 + 0 + 12 = 72.
    @Test
    void usuarioSemPreferenciasNemHistorico() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(), null,
                false, false, false, false, false, Set.of());
        DadosDoRestaurante restaurante = new DadosDoRestaurante(ITALIANA, "$$",
                false, false, false, false, false, new BigDecimal("4.0"));

        assertEquals(72, Compatibilidade.calcular(usuario, restaurante));
    }

    // Vai com crianças e precisa de estacionamento, mas o restaurante não tem nenhum dos dois:
    // perde 2 x 3. 30 + 15 + (15 - 6) + 0 + 15 = 69.
    @Test
    void cadaExtraQueFaltaTira3() {
        PerfilDoUsuario usuario = new PerfilDoUsuario(Set.of(), null,
                false, false, true, true, false, Set.of());
        DadosDoRestaurante restaurante = new DadosDoRestaurante(ITALIANA, "$$",
                false, false, false, false, false, new BigDecimal("5"));

        assertEquals(69, Compatibilidade.calcular(usuario, restaurante));
    }
}