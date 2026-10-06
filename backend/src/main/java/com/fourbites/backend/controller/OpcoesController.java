package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.OpcaoResponse;
import com.fourbites.backend.repository.CategoriaRepository;
import com.fourbites.backend.repository.FormaPagamentoRepository;

// Listas públicas usadas nos filtros da busca e no formulário de cadastro de restaurante.
@RestController
public class OpcoesController {

    private final CategoriaRepository categoriaRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;

    public OpcoesController(CategoriaRepository categoriaRepository,
                            FormaPagamentoRepository formaPagamentoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.formaPagamentoRepository = formaPagamentoRepository;
    }

    @GetMapping("/categorias")
    public List<OpcaoResponse> listarCategorias() {
        return categoriaRepository.findAll(Sort.by("nome")).stream()
                .map(categoria -> new OpcaoResponse(categoria.getId(), categoria.getNome()))
                .toList();
    }

    @GetMapping("/formas-pagamento")
    public List<OpcaoResponse> listarFormasPagamento() {
        return formaPagamentoRepository.findAll(Sort.by("id")).stream()
                .map(forma -> new OpcaoResponse(forma.getId(), forma.getNome()))
                .toList();
    }
}
