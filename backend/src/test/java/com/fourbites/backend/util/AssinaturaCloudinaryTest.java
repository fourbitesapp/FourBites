package com.fourbites.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;

import org.junit.jupiter.api.Test;

class AssinaturaCloudinaryTest {

    @Test
    void geraAMesmaAssinaturaDoExemploDaDocumentacao() {
        Map<String, String> parametros = Map.of(
                "timestamp", "1315060510",
                "public_id", "sample_image",
                "eager", "w_400,h_300,c_pad|w_260,h_200,c_crop");

        assertEquals("bfd09f95f331f558cbd1320e67aa8d488770583e",
                AssinaturaCloudinary.assinar(parametros, "abcd"));
    }
}
