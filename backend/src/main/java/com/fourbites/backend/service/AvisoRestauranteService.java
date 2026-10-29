package com.fourbites.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.Usuario;

// E-mail para o responsável quando o admin analisa o cadastro ou uma alteração do restaurante.

@Service
public class AvisoRestauranteService {

    private static final Logger log = LoggerFactory.getLogger(AvisoRestauranteService.class);

    private final EmailService emailService;
    private final String frontendUrl;

    public AvisoRestauranteService(EmailService emailService, @Value("${app.frontend-url}") String frontendUrl) {
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    public void cadastroAprovado(Restaurante restaurante) {
        enviar(restaurante, "Seu restaurante foi aprovado - FourBites",
                "O cadastro de <strong>" + nome(restaurante) + "</strong> foi aprovado e já aparece no FourBites.",
                null);
    }

    public void cadastroRejeitado(Restaurante restaurante, String motivo) {
        enviar(restaurante, "Cadastro não aprovado - FourBites",
                "O cadastro de <strong>" + nome(restaurante) + "</strong> não foi aprovado. "
                        + "Você pode corrigir os dados e enviar de novo.",
                motivo);
    }

    public void alteracaoAprovada(Restaurante restaurante) {
        enviar(restaurante, "Alteração aprovada - FourBites",
                "As alterações de <strong>" + nome(restaurante) + "</strong> foram aprovadas e já estão no ar.",
                null);
    }

    public void alteracaoRejeitada(Restaurante restaurante, String motivo) {
        enviar(restaurante, "Alteração não aprovada - FourBites",
                "As alterações de <strong>" + nome(restaurante) + "</strong> não foram aprovadas. "
                        + "A versão publicada continua a mesma.",
                motivo);
    }

    private void enviar(Restaurante restaurante, String assunto, String mensagem, String motivo) {
        Usuario responsavel = restaurante.getResponsavel();
        if (responsavel == null) {
            return;
        }
        String html = "<p>Olá, " + HtmlUtils.htmlEscape(responsavel.getNome()) + "!</p>"
                + "<p>" + mensagem + "</p>"
                + (motivo == null ? "" : "<p><strong>Motivo:</strong> " + HtmlUtils.htmlEscape(motivo) + "</p>")
                + "<p><a href=\"" + frontendUrl + "/meus-restaurantes\">Ver meus restaurantes</a></p>";
        try {
            emailService.enviar(responsavel.getEmail(), responsavel.getNome(), assunto, html);
        } catch (RuntimeException e) {
            log.error("Não foi possível enviar o aviso \"{}\" para {}", assunto, responsavel.getEmail(), e);
        }
    }

    private String nome(Restaurante restaurante) {
        return HtmlUtils.htmlEscape(restaurante.getNome());
    }
}

