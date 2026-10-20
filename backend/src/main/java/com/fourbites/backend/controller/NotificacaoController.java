package com.fourbites.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.NotificacoesResponse;
import com.fourbites.backend.service.NotificacaoService;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    public NotificacoesResponse listar(@AuthenticationPrincipal Integer usuarioId) {
        return notificacaoService.listar(usuarioId);
    }

    @PostMapping("/vistas")
    public ResponseEntity<Void> marcarComoVistas(@AuthenticationPrincipal Integer usuarioId) {
        notificacaoService.marcarComoVistas(usuarioId);
        return ResponseEntity.noContent().build();
    }
}