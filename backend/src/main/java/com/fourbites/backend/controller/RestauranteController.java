package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.RestauranteDetalheResponse;
import com.fourbites.backend.dto.RestauranteResumoResponse;
import com.fourbites.backend.service.RestauranteService;

// Rotas públicas: qualquer visitante pode buscar e ver restaurantes, sem login.
@RestController
@RequestMapping("/restaurantes")
public class RestauranteController {

    private final RestauranteService restauranteService;

    public RestauranteController(RestauranteService restauranteService) {
        this.restauranteService = restauranteService;
    }

    @GetMapping
    public List<RestauranteResumoResponse> buscar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Integer categoriaId,
            @RequestParam(required = false) String faixaPreco,
            @RequestParam(required = false) Double notaMin,
            @RequestParam(defaultValue = "false") boolean pets,
            @RequestParam(defaultValue = "false") boolean acessivel,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String ordem) {
        return restauranteService.buscarPublicos(busca, categoriaId, faixaPreco, notaMin, pets, acessivel,
                lat, lng, ordem);
    }

    @GetMapping("/{id}")
    public RestauranteDetalheResponse buscarDetalhe(@PathVariable Integer id, Authentication autenticacao) {
        Integer usuarioLogadoId = null;
        boolean admin = false;

        if (autenticacao != null && autenticacao.getPrincipal() instanceof Integer idDoToken) {
            usuarioLogadoId = idDoToken;
            admin = autenticacao.getAuthorities().stream()
                    .anyMatch(papel -> papel.getAuthority().equals("ROLE_ADMIN"));
        }
        return restauranteService.buscarDetalhe(id, usuarioLogadoId, admin);
    }
}
