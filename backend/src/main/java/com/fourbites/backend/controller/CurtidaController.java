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
import com.fourbites.backend.service.CurtidaService;

// Curtir, descurtir e ver quem curtiu uma avaliação
@RestController
public class CurtidaController {

    private final CurtidaService curtidaService;

    public CurtidaController(CurtidaService curtidaService) {
        this.curtidaService = curtidaService;
    }

    @PostMapping("/avaliacoes/{id}/curtir")
    public ResponseEntity<Void> curtir(@AuthenticationPrincipal Integer usuarioId, @PathVariable Integer id) {
        curtidaService.curtir(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/avaliacoes/{id}/curtir")
    public ResponseEntity<Void> descurtir(@AuthenticationPrincipal Integer usuarioId, @PathVariable Integer id) {
        curtidaService.descurtir(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/avaliacoes/{id}/curtidas")
    public List<UsuarioResumoResponse> quemCurtiu(@PathVariable Integer id) {
        return curtidaService.quemCurtiu(id);
    }
}
