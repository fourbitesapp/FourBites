package com.fourbites.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.RestauranteFormulario;
import com.fourbites.backend.dto.RestauranteGestaoResponse;
import com.fourbites.backend.service.RestauranteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/restaurantes")
public class AdminRestauranteController {

    private final RestauranteService restauranteService;

    public AdminRestauranteController(RestauranteService restauranteService) {
        this.restauranteService = restauranteService;
    }

    @PostMapping 
    public ResponseEntity<RestauranteGestaoResponse> cadastrar(@Valid @RequestBody RestauranteFormulario dados) {
        RestauranteGestaoResponse criado = restauranteService.cadastrarPeloAdmin(dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }
}

