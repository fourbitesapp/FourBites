package com.fourbites.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fourbites.backend.dto.Coordenadas;

// Descobre a latitude e a longitude de um endereço usando o Nominatim (OpenStreetMap).
@Service
public class NominatimService {

    private static final Logger log = LoggerFactory.getLogger(NominatimService.class);
    private static final long INTERVALO_MINIMO_MS = 1000;

    private final RestClient nominatim;
    private long ultimaRequisicao = 0;

    public NominatimService(@Value("${app.nominatim.user-agent}") String userAgent) {
        this.nominatim = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", userAgent)
                .build();
    }

    public Optional<Coordenadas> buscar(String logradouro, String numero, String bairro,
                                        String cidade, String uf) {
        String completo = logradouro + ", " + numero + ", " + bairro + ", " + cidade + ", " + uf + ", Brasil";
        Optional<Coordenadas> resultado = consultar(completo);
        if (resultado.isPresent()) {
            return resultado;
        }
        return consultar(logradouro + ", " + cidade + ", " + uf + ", Brasil");
    }

    private synchronized Optional<Coordenadas> consultar(String endereco) {
        esperarIntervalo();
        try {
            List<Map<String, Object>> resposta = nominatim.get()
                    .uri(uri -> uri.path("/search")
                            .queryParam("q", endereco)
                            .queryParam("format", "jsonv2")
                            .queryParam("limit", 1)
                            .queryParam("countrycodes", "br")
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    });

            if (resposta == null || resposta.isEmpty()) {
                return Optional.empty();
            }

            Map<String, Object> primeiro = resposta.get(0);
            return Optional.of(new Coordenadas(
                    arredondar(primeiro.get("lat")),
                    arredondar(primeiro.get("lon"))));
        } catch (RestClientException | NumberFormatException e) {
            log.error("Falha ao consultar o Nominatim para o endereço: {}", endereco, e);
            return Optional.empty();
        }
    }

    private void esperarIntervalo() {
        long espera = ultimaRequisicao + INTERVALO_MINIMO_MS - System.currentTimeMillis();
        if (espera > 0) {
            try {
                Thread.sleep(espera);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        ultimaRequisicao = System.currentTimeMillis();
    }

    private BigDecimal arredondar(Object valor) {
        return new BigDecimal(String.valueOf(valor)).setScale(6, RoundingMode.HALF_UP);
    }
}
