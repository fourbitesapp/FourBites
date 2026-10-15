package com.fourbites.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.junit.jupiter.api.Test;

class TipoArquivoTest {

    @Test
    void reconheceJpgPngEPdfPelosPrimeirosBytes() {
        byte[] jpg = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00};
        byte[] png = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00};
        byte[] pdf = "%PDF-1.7 ...".getBytes(StandardCharsets.US_ASCII);

        assertEquals(Optional.of(TipoArquivo.JPG), TipoArquivo.detectar(jpg));
        assertEquals(Optional.of(TipoArquivo.PNG), TipoArquivo.detectar(png));
        assertEquals(Optional.of(TipoArquivo.PDF), TipoArquivo.detectar(pdf));
    }

    @Test
    void recusaOutrosFormatosEArquivoVazio() {
        byte[] gif = "GIF89a".getBytes(StandardCharsets.US_ASCII);
        byte[] texto = "ola, tudo bem?".getBytes(StandardCharsets.UTF_8);

        assertTrue(TipoArquivo.detectar(gif).isEmpty());
        assertTrue(TipoArquivo.detectar(texto).isEmpty());
        assertTrue(TipoArquivo.detectar(new byte[0]).isEmpty());
        assertTrue(TipoArquivo.detectar(null).isEmpty());
    }
}