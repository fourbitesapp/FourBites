package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.CategoriaAdminResponse;
import com.fourbites.backend.dto.CategoriaRequest;
import com.fourbites.backend.service.CategoriaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/categorias")
public class AdminCategoriaController {

    private final CategoriaService categoriaService;

    public AdminCategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<CategoriaAdminResponse> listar() {
        return categoriaService.listar();
    }

    @PostMapping
    public ResponseEntity<CategoriaAdminResponse> criar(@Valid @RequestBody CategoriaRequest dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.criar(dados));
    }

    @PutMapping("/{id}")
    public CategoriaAdminResponse atualizar(@PathVariable Integer id, @Valid @RequestBody CategoriaRequest dados) {
        return categoriaService.atualizar(id, dados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        categoriaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}

