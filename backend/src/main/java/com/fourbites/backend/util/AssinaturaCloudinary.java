package com.fourbites.backend.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public final class AssinaturaCloudinary {

    private AssinaturaCloudinary() {
    }

    public static String assinar(Map<String, String> parametros, String apiSecret) {
        String texto = new TreeMap<>(parametros).entrySet().stream()
                .map(p -> p.getKey() + "=" + p.getValue())
                .collect(Collectors.joining("&"));
        return sha1(texto + apiSecret);
    }

    private static String sha1(String texto) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-1").digest(texto.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-1 indisponível", e);
        }
    }
}