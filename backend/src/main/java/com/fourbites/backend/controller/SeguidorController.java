package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.UsuarioResumoResponse;
import com.fourbites.backend.service.SeguidorService;

// Seguir, deixar de seguir e as listas de seguidores / seguindo do perfil
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

    @GetMapping("/usuarios/{username}/seguidores")
    public List<UsuarioResumoResponse> seguidores(@PathVariable String username) {
        return seguidorService.listarSeguidores(username);
    }

    @GetMapping("/usuarios/{username}/seguindo")
    public List<UsuarioResumoResponse> seguindo(@PathVariable String username) {
        return seguidorService.listarSeguindo(username);
    }
}
