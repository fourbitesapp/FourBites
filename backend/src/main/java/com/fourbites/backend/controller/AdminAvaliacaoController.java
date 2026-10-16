package com.fourbites.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.service.AvaliacaoService;

// Moderação do admin
@RestController
@RequestMapping("/admin/avaliacoes")
public class AdminAvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AdminAvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    // Exclusão simples
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        avaliacaoService.excluirPeloAdmin(id);
        return ResponseEntity.noContent().build();
    }
}