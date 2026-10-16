package com.fourbites.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import com.fourbites.backend.exception.CampoInvalidoException;
import com.fourbites.backend.exception.ServicoExternoException;
import com.fourbites.backend.util.AssinaturaCloudinary;
import com.fourbites.backend.util.TipoArquivo;


@Service
public class UploadService {

    private static final Logger log = LoggerFactory.getLogger(UploadService.class);
    private static final String PASTA = "fourbites";

    private final RestClient cloudinary = RestClient.create("https://api.cloudinary.com/v1_1");

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public UploadService(@Value("${app.cloudinary.url}") String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            log.warn("CLOUDINARY_URL não configurada. O envio de arquivos ficará desativado.");
            this.cloudName = null;
            this.apiKey = null;
            this.apiSecret = null;
            return;
        }
  
        String semPrefixo = cloudinaryUrl.trim().replaceFirst("^cloudinary://", "");
        int arroba = semPrefixo.lastIndexOf('@');
        int doisPontos = semPrefixo.indexOf(':');
        if (arroba < 0 || doisPontos < 0 || doisPontos > arroba) {
            throw new IllegalStateException(
                    "CLOUDINARY_URL inválida. Use o formato cloudinary://API_KEY:API_SECRET@CLOUD_NAME");
        }
        this.apiKey = semPrefixo.substring(0, doisPontos);
        this.apiSecret = semPrefixo.substring(doisPontos + 1, arroba);
        this.cloudName = semPrefixo.substring(arroba + 1);
    }

    public String enviar(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new CampoInvalidoException("arquivo", "Escolha um arquivo para enviar.");
        }
        if (cloudName == null) {
            throw new ServicoExternoException("O envio de arquivos não está configurado no servidor.");
        }

        byte[] bytes = lerBytes(arquivo);
        TipoArquivo tipo = TipoArquivo.detectar(bytes)
                .orElseThrow(() -> new CampoInvalidoException("arquivo",
                        "Formato não aceito. Envie uma imagem JPG ou PNG, ou o cardápio em PDF."));

        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
        String assinatura = AssinaturaCloudinary.assinar(
                Map.of("folder", PASTA, "timestamp", timestamp), apiSecret);

        MultiValueMap<String, Object> corpo = new LinkedMultiValueMap<>();
        corpo.add("file", new ArquivoComNome(bytes, "upload." + tipo.getExtensao()));
        corpo.add("api_key", apiKey);
        corpo.add("folder", PASTA);
        corpo.add("timestamp", timestamp);
        corpo.add("signature", assinatura);

        try {
            Map<String, Object> resposta = cloudinary.post()
                    .uri("/{cloud}/image/upload", cloudName)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(corpo)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Object url = resposta == null ? null : resposta.get("secure_url");
            if (url == null) {
                throw new ServicoExternoException("Não foi possível enviar o arquivo agora. Tente de novo.");
            }
            return url.toString();
        } catch (RestClientException e) {
            log.error("Falha ao enviar arquivo ao Cloudinary", e);
            throw new ServicoExternoException("Não foi possível enviar o arquivo agora. Tente de novo.");
        }
    }

    // Usado na foto de perfil
    public String enviarImagem(MultipartFile arquivo) {
        if (arquivo != null && !arquivo.isEmpty()
                && TipoArquivo.detectar(lerBytes(arquivo)).orElse(null) == TipoArquivo.PDF) {
            throw new CampoInvalidoException("arquivo", "Envie uma imagem JPG ou PNG.");
        }
        return enviar(arquivo);
    }

    public void conferirEnderecos(String campo, List<String> enderecos) {
        if (enderecos == null) {
            return;
        }
        for (String endereco : enderecos) {
            conferirEndereco(campo, endereco);
        }
    }

    public void conferirEndereco(String campo, String endereco) {
        if (endereco == null || endereco.isBlank()) {
            return;
        }
        if (cloudName == null) {
            throw new CampoInvalidoException(campo, "O envio de arquivos não está configurado no servidor.");
        }
        String inicioEsperado = "https://res.cloudinary.com/" + cloudName + "/";
        if (!endereco.trim().startsWith(inicioEsperado)) {
            throw new CampoInvalidoException(campo, "Envie o arquivo pelo FourBites antes de salvar.");
        }
    }

    private byte[] lerBytes(MultipartFile arquivo) {
        try {
            return arquivo.getBytes();
        } catch (IOException e) {
            throw new CampoInvalidoException("arquivo", "Não foi possível ler o arquivo. Tente de novo.");
        }
    }

    private static class ArquivoComNome extends ByteArrayResource {

        private final String nome;

        ArquivoComNome(byte[] bytes, String nome) {
            super(bytes);
            this.nome = nome;
        }

        @Override
        public String getFilename() {
            return nome;
        }
    }
}

