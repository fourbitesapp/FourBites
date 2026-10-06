package com.fourbites.backend.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class Notas {

    private Notas() {
    }

    public static BigDecimal notaGeral(int comida, int ambiente, int atendimento, int custo) {
        int soma = comida + ambiente + atendimento + custo;
        return BigDecimal.valueOf(soma).divide(BigDecimal.valueOf(4), 2, RoundingMode.UNNECESSARY);
    }

    // Arredonda a média
    public static BigDecimal arredondar(Number valor, int casas) {
        if (valor == null) {
            return null;
        }
        return BigDecimal.valueOf(valor.doubleValue()).setScale(casas, RoundingMode.HALF_UP);
    }
}
