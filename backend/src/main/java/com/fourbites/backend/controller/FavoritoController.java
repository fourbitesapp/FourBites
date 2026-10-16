package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.FavoritoRequest;
import com.fourbites.backend.dto.FavoritoResponse;
import com.fourbites.backend.service.FavoritoService;

import jakarta.validation.Valid;

@RestController
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    @GetMapping("/usuarios/me/favoritos")
    public List<FavoritoResponse> listarMeus(@AuthenticationPrincipal Integer usuarioId) {
        return favoritoService.listarMeus(usuarioId);
    }

    @PutMapping("/usuarios/me/favoritos/{posicao}")
    public List<FavoritoResponse> colocar(@AuthenticationPrincipal Integer usuarioId,
                                          @PathVariable Integer posicao,
                                          @Valid @RequestBody FavoritoRequest dados) {
        return favoritoService.colocar(usuarioId, posicao, dados.restauranteId());
    }

    @DeleteMapping("/usuarios/me/favoritos/{posicao}")
    public List<FavoritoResponse> remover(@AuthenticationPrincipal Integer usuarioId,
                                          @PathVariable Integer posicao) {
        return favoritoService.remover(usuarioId, posicao);
    }

    @GetMapping("/usuarios/{username}/favoritos")
    public List<FavoritoResponse> listarDoUsuario(@PathVariable String username) {
        return favoritoService.listarDoUsuario(username);
    }
}
