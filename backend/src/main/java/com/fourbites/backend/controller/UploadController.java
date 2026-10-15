package com.fourbites.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fourbites.backend.dto.UploadResponse;
import com.fourbites.backend.service.UploadService;

// Envio de arquivos
@RestController
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> enviar(@RequestParam("arquivo") MultipartFile arquivo) {
        String url = uploadService.enviar(arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(new UploadResponse(url));
    }
}
