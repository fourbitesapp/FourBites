package com.fourbites.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.service.SeguidorService;

// Seguir e deixar de seguir
@RestController
public class SeguidorController {

    private final SeguidorService seguidorService;

    public SeguidorController(SeguidorService seguidorService) {
        this.seguidorService = seguidorService;
    }

    @PostMapping("/usuarios/{username}/seguir")
    public ResponseEntity<Void> seguir(@AuthenticationPrincipal Integer usuarioId, @PathVariable String username) {
        seguidorService.seguir(usuarioId, username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/usuarios/{username}/seguir")
    public ResponseEntity<Void> deixarDeSeguir(@AuthenticationPrincipal Integer usuarioId,
                                               @PathVariable String username) {
        seguidorService.deixarDeSeguir(usuarioId, username);
        return ResponseEntity.noContent().build();
    }
}