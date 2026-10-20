package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.AlteracaoResponse;
import com.fourbites.backend.dto.RejeitarRequest;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.service.AnaliseRestauranteService;

import jakarta.validation.Valid;

// Fila de alterações de restaurantes já aprovados 
@RestController
@RequestMapping("/admin/alteracoes")
public class AdminAlteracaoController {

    private final AnaliseRestauranteService analiseService;

    public AdminAlteracaoController(AnaliseRestauranteService analiseService) {
        this.analiseService = analiseService;
    }

    // Sem status = só as pendentes
    @GetMapping
    public List<AlteracaoResponse> listar(@RequestParam(required = false) StatusAnalise status) {
        return analiseService.listarAlteracoes(status);
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<Void> aprovar(@PathVariable Integer id) {
        analiseService.aprovarAlteracao(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/rejeitar")
    public ResponseEntity<Void> rejeitar(@PathVariable Integer id, @Valid @RequestBody RejeitarRequest dados) {
        analiseService.rejeitarAlteracao(id, dados.motivo());
        return ResponseEntity.noContent().build();
    }
}
