package com.fourbites.backend.util;

import java.util.Set;

// Capas do perfil: as cores e as frases que o usuário pode escolher
public final class Capas {

    public static final String COR_PADRAO = "vermelha";
    public static final String FRASE_PADRAO = "come-bem";

    public static final Set<String> CORES = Set.of("vermelha", "amarela", "verde", "azul", "rosa", "chocolate");

    public static final Set<String> FRASES = Set.of("come-bem", "sempre-fome", "lugar-novo", "sobremesa", "critico", "mais-um");

    private Capas() {
    }
}