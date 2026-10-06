package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.AvaliacaoRequest;
import com.fourbites.backend.dto.AvaliacaoResponse;
import com.fourbites.backend.service.AvaliacaoService;

import jakarta.validation.Valid;

@RestController
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping("/restaurantes/{restauranteId}/avaliacoes")
    public ResponseEntity<AvaliacaoResponse> criar(@AuthenticationPrincipal Integer usuarioId,
                                                   @PathVariable Integer restauranteId,
                                                   @Valid @RequestBody AvaliacaoRequest dados) {
        AvaliacaoResponse criada = avaliacaoService.criar(usuarioId, restauranteId, dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/avaliacoes/{id}")
    public AvaliacaoResponse editar(@AuthenticationPrincipal Integer usuarioId,
                                    @PathVariable Integer id,
                                    @Valid @RequestBody AvaliacaoRequest dados) {
        return avaliacaoService.editar(usuarioId, id, dados);
    }

    @GetMapping("/avaliacoes/{id}")
    public AvaliacaoResponse buscarPorId(@PathVariable Integer id) {
        return avaliacaoService.buscarPorId(id);
    }

    @GetMapping("/restaurantes/{restauranteId}/avaliacoes")
    public List<AvaliacaoResponse> listarDoRestaurante(@PathVariable Integer restauranteId) {
        return avaliacaoService.listarDoRestaurante(restauranteId);
    }

    @GetMapping("/usuarios/{username}/avaliacoes")
    public List<AvaliacaoResponse> listarDoUsuario(@PathVariable String username) {
        return avaliacaoService.listarDoUsuario(username);
    }
}
