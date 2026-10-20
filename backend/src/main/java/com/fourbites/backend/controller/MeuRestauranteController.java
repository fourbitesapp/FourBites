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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.RestauranteFormulario;
import com.fourbites.backend.dto.RestauranteGestaoResponse;
import com.fourbites.backend.service.MeuRestauranteService;

import jakarta.validation.Valid;

// Área do responsável (RESTAURANTE)
@RestController
@RequestMapping("/meus-restaurantes")
public class MeuRestauranteController {

    private final MeuRestauranteService meuRestauranteService;

    public MeuRestauranteController(MeuRestauranteService meuRestauranteService) {
        this.meuRestauranteService = meuRestauranteService;
    }

    @GetMapping
    public List<RestauranteGestaoResponse> listar(@AuthenticationPrincipal Integer usuarioId) {
        return meuRestauranteService.listar(usuarioId);
    }

    @GetMapping("/{id}")
    public RestauranteGestaoResponse buscar(@AuthenticationPrincipal Integer usuarioId, @PathVariable Integer id) {
        return meuRestauranteService.buscar(usuarioId, id);
    }

    @PostMapping
    public ResponseEntity<RestauranteGestaoResponse> cadastrar(@AuthenticationPrincipal Integer usuarioId,
                                                               @Valid @RequestBody RestauranteFormulario dados) {
        RestauranteGestaoResponse criado = meuRestauranteService.cadastrar(usuarioId, dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public RestauranteGestaoResponse editar(@AuthenticationPrincipal Integer usuarioId, @PathVariable Integer id,
                                            @Valid @RequestBody RestauranteFormulario dados) {
        return meuRestauranteService.editar(usuarioId, id, dados);
    }
}
