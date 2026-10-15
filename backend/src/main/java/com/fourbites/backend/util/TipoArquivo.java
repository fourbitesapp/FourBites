package com.fourbites.backend.util;

import java.util.Optional;

// Tipos de arquivo aceitos no upload.

public enum TipoArquivo {

    JPG("jpg"),
    PNG("png"),
    PDF("pdf");

    private final String extensao;

    TipoArquivo(String extensao) {
        this.extensao = extensao;
    }

    public String getExtensao() {
        return extensao;
    }

    public static Optional<TipoArquivo> detectar(byte[] bytes) {
        if (bytes == null) {
            return Optional.empty();
        }
        // JPG começa com FF D8 FF
        if (comecaCom(bytes, 0xFF, 0xD8, 0xFF)) {
            return Optional.of(JPG);
        }
        // PNG começa com 89 50 4E 47 0D 0A 1A 0A ("‰PNG" e quebras de linha)
        if (comecaCom(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return Optional.of(PNG);
        }
        // PDF começa com o texto "%PDF-"
        if (comecaCom(bytes, '%', 'P', 'D', 'F', '-')) {
            return Optional.of(PDF);
        }
        return Optional.empty();
    }

    private static boolean comecaCom(byte[] bytes, int... assinatura) {
        if (bytes.length < assinatura.length) {
            return false;
        }
        for (int i = 0; i < assinatura.length; i++) {
            if ((bytes[i] & 0xFF) != assinatura[i]) {
                return false;
            }
        }
        return true;
    }
}
