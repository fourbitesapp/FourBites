package com.fourbites.backend.util;

import java.text.Normalizer;

public final class Texto {

    private Texto() {
    }

    public static String simplificar(String texto) {
        if (texto == null) {
            return "";
        }
        String semAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcentos.toLowerCase().trim();
    }
}
