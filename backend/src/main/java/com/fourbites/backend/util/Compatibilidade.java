package com.fourbites.backend.util;

import java.math.BigDecimal;
import java.util.Set;

// Calcula o quanto um restaurante combina com um usuário, de 0 a 100
// Parte 1 - preferências marcadas no primeiro acesso (60 pontos):
// categoria preferida = 30
// faixa de preço igual (uma faixa de diferença: 7,5) = 15
// extras, 3 cada (os 15 pontos divididos entre os 5):
//   acessibilidade (se o usuário precisa), aceita pets (se leva), área para crianças (se vai com crianças),
//   estacionamento (se precisa), área para fumantes (se fuma)
//  Critério que o usuário não marcou não atrapalha: vale os pontos inteiros.

// Parte 2 - histórico do usuário na plataforma (40 pontos):
//   categoria de um restaurante que ele avaliou bem (nota geral 4 ou mais) ou favoritou = 25
//   nota média do restaurante no FourBites (média / 5 x 15) = até 15

public final class Compatibilidade {

    private static final double EXTRA = 3;

    private Compatibilidade() {
    }

    public record PerfilDoUsuario(
            Set<Integer> categoriasPreferidas,
            String faixaPrecoPreferida,
            boolean precisaAcessibilidade,
            boolean levaPets,
            boolean levaCriancas,
            boolean precisaEstacionamento,
            boolean fuma,
            Set<Integer> categoriasDoHistorico
    ) {
    }

    public record DadosDoRestaurante(
            Integer categoriaId,
            String faixaPreco,
            boolean acessivel,
            boolean aceitaPets,
            boolean areaCriancas,
            boolean estacionamento,
            boolean areaFumantes,
            BigDecimal notaMedia
    ) {
    }

    public static int calcular(PerfilDoUsuario usuario, DadosDoRestaurante restaurante) {
        double pontos = 0;

        // Parte 1: preferências (60) 
        boolean semCategoriaPreferida = usuario.categoriasPreferidas().isEmpty();
        if (semCategoriaPreferida || usuario.categoriasPreferidas().contains(restaurante.categoriaId())) {
            pontos += 30;
        }

        pontos += pontosDoPreco(usuario.faixaPrecoPreferida(), restaurante.faixaPreco());

        if (!usuario.precisaAcessibilidade() || restaurante.acessivel()) {
            pontos += EXTRA;
        }
        if (!usuario.levaPets() || restaurante.aceitaPets()) {
            pontos += EXTRA;
        }
        if (!usuario.levaCriancas() || restaurante.areaCriancas()) {
            pontos += EXTRA;
        }
        if (!usuario.precisaEstacionamento() || restaurante.estacionamento()) {
            pontos += EXTRA;
        }
        if (!usuario.fuma() || restaurante.areaFumantes()) {
            pontos += EXTRA;
        }

        // Parte 2: histórico (40) 
        if (restaurante.categoriaId() != null
                && usuario.categoriasDoHistorico().contains(restaurante.categoriaId())) {
            pontos += 25;
        }
        if (restaurante.notaMedia() != null) {
            pontos += restaurante.notaMedia().doubleValue() / 5.0 * 15;
        }

        return (int) Math.round(Math.min(pontos, 100));
    }

    // "$" = 1, "$$" = 2, "$$$" = 3. Igual: 15. Uma faixa de diferença: 7,5. Duas: 0.
    private static double pontosDoPreco(String preferida, String doRestaurante) {
        if (preferida == null || preferida.isBlank()) {
            return 15;
        }
        if (doRestaurante == null) {
            return 0;
        }
        int diferenca = Math.abs(preferida.length() - doRestaurante.length());
        if (diferenca == 0) {
            return 15;
        }
        return diferenca == 1 ? 7.5 : 0;
    }
}

