package com.fourbites.backend.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

// Envia e-mails pela API do Brevo
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient brevo = RestClient.create("https://api.brevo.com/v3");

    private final String apiKey;
    private final String remetente;

    public EmailService(@Value("${app.brevo.api-key}") String apiKey,
                        @Value("${app.email.remetente}") String remetente) {
        this.apiKey = apiKey;
        this.remetente = remetente;
    }

    public void enviarRecuperacaoSenha(String emailDestino, String nomeDestino, String link) {
        if (apiKey.isBlank() || remetente.isBlank()) {
            log.warn("Brevo não configurado. Link de redefinição para {}: {}", emailDestino, link);
            return;
        }

        String html = "<p>Olá, " + nomeDestino + "!</p>"
                + "<p>Recebemos um pedido para redefinir a sua senha no FourBites.</p>"
                + "<p><a href=\"" + link + "\">Clique aqui para criar uma nova senha</a></p>"
                + "<p>Se você não fez esse pedido, ignore este e-mail. A sua senha continua a mesma.</p>";

        Map<String, Object> corpo = Map.of(
                "sender", Map.of("name", "FourBites", "email", remetente),
                "to", List.of(Map.of("email", emailDestino, "name", nomeDestino)),
                "subject", "Redefinição de senha - FourBites",
                "htmlContent", html);

        brevo.post()
                .uri("/smtp/email")
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(corpo)
                .retrieve()
                .toBodilessEntity();
    }
}
