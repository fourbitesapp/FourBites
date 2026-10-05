package com.fourbites.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.PreferenciasDTO;
import com.fourbites.backend.service.PreferenciaService;

import jakarta.validation.Valid;

// Só contas USUARIO chegam aqui
@RestController
@RequestMapping("/usuarios/me/preferencias")
public class PreferenciaController {

    private final PreferenciaService preferenciaService;

    public PreferenciaController(PreferenciaService preferenciaService) {
        this.preferenciaService = preferenciaService;
    }

    @GetMapping
    public PreferenciasDTO buscar(@AuthenticationPrincipal Integer usuarioId) {
        return preferenciaService.buscar(usuarioId);
    }

    @PutMapping
    public PreferenciasDTO salvar(@AuthenticationPrincipal Integer usuarioId,
                                  @Valid @RequestBody PreferenciasDTO dados) {
        return preferenciaService.salvar(usuarioId, dados);
    }
}
