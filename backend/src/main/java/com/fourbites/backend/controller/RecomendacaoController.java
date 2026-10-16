package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.RecomendacaoResponse;
import com.fourbites.backend.service.RecomendacaoService;

// Só para contas USUARIO
@RestController
public class RecomendacaoController {

    private final RecomendacaoService recomendacaoService;

    public RecomendacaoController(RecomendacaoService recomendacaoService) {
        this.recomendacaoService = recomendacaoService;
    }

    @GetMapping("/recomendacoes")
    public List<RecomendacaoResponse> recomendar(@AuthenticationPrincipal Integer usuarioId) {
        return recomendacaoService.recomendar(usuarioId);
    }
}