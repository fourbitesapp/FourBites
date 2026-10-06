package com.fourbites.backend.util;

// Confere os dois dígitos verificadores de um CNPJ
public final class ValidadorCnpj {

    private static final int[] PESOS_PRIMEIRO = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] PESOS_SEGUNDO = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private ValidadorCnpj() {
    }

    public static String somenteDigitos(String cnpj) {
        return cnpj == null ? "" : cnpj.replaceAll("[^0-9]", "");
    }

    public static boolean valido(String cnpjInformado) {
        String cnpj = somenteDigitos(cnpjInformado);

        if (cnpj.length() != 14) {
            return false;
        }

        if (cnpj.chars().distinct().count() == 1) {
            return false;
        }

        int primeiro = calcularDigito(cnpj, PESOS_PRIMEIRO);
        int segundo = calcularDigito(cnpj, PESOS_SEGUNDO);

        return primeiro == cnpj.charAt(12) - '0'
                && segundo == cnpj.charAt(13) - '0';
    }
    
    private static int calcularDigito(String cnpj, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += (cnpj.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
