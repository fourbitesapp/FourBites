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
import com.fourbites.backend.util.Texto;

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

    // Busca estruturada (rua + cidade) e só aceita um resultado que fique na cidade e no estado informados.
    public Optional<Coordenadas> buscar(String logradouro, String numero, String bairro,
                                        String cidade, String uf) {
        Optional<Coordenadas> resultado = consultar(numero + " " + logradouro, cidade, uf);
        if (resultado.isPresent()) {
            return resultado;
        }
        return consultar(logradouro, cidade, uf);
    }

    private synchronized Optional<Coordenadas> consultar(String rua, String cidade, String uf) {
        esperarIntervalo();
        try {
            List<Map<String, Object>> resposta = nominatim.get()
                    .uri(uri -> uri.path("/search")
                            .queryParam("street", rua)
                            .queryParam("city", cidade)
                            .queryParam("country", "Brasil")
                            .queryParam("format", "jsonv2")
                            .queryParam("addressdetails", 1)
                            .queryParam("limit", 5)
                            .queryParam("countrycodes", "br")
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    });

            if (resposta != null) {
                for (Map<String, Object> lugar : resposta) {
                    if (ficaEm(lugar, cidade, uf)) {
                        return Optional.of(new Coordenadas(
                                arredondar(lugar.get("lat")),
                                arredondar(lugar.get("lon"))));
                    }
                }
            }
            log.warn("Nominatim não achou \"{}\" em {}/{}", rua, cidade, uf);
            return Optional.empty();
        } catch (RestClientException | NumberFormatException e) {
            log.error("Falha ao consultar o Nominatim para: {}, {}/{}", rua, cidade, uf, e);
            return Optional.empty();
        }
    }

    // Confere se o resultado é mesmo na cidade e no estado do cadastro.
    private boolean ficaEm(Map<String, Object> lugar, String cidade, String uf) {
        if (!(lugar.get("address") instanceof Map<?, ?> endereco)) {
            return false;
        }
        if (!("BR-" + uf.toUpperCase()).equals(endereco.get("ISO3166-2-lvl4"))) {
            return false;
        }
        String cidadeProcurada = Texto.simplificar(cidade);
        for (String campo : List.of("city", "town", "village", "municipality")) {
            Object valor = endereco.get(campo);
            if (valor != null && Texto.simplificar(valor.toString()).equals(cidadeProcurada)) {
                return true;
            }
        }
        return false;
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