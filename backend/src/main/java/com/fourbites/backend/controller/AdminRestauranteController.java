package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.AprovarCadastroRequest;
import com.fourbites.backend.dto.AtivoRequest;
import com.fourbites.backend.dto.RejeitarRequest;
import com.fourbites.backend.dto.RestauranteFormulario;
import com.fourbites.backend.dto.RestauranteGestaoResponse;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.service.AnaliseRestauranteService;
import com.fourbites.backend.service.RestauranteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/restaurantes")
public class AdminRestauranteController {

    private final RestauranteService restauranteService;
    private final AnaliseRestauranteService analiseService;

    public AdminRestauranteController(RestauranteService restauranteService, AnaliseRestauranteService analiseService) {
        this.restauranteService = restauranteService;
        this.analiseService = analiseService;
    }

    // Lista do painel: PENDENTE (fila, do mais antigo ao mais novo), APROVADO, REJEITADO ou vazio (todos).
    @GetMapping
    public List<RestauranteGestaoResponse> listar(@RequestParam(required = false) StatusAnalise status,
                                                  @RequestParam(required = false) String busca) {
        return analiseService.listar(status, busca);
    }

    @GetMapping("/{id}")
    public RestauranteGestaoResponse buscar(@PathVariable Integer id) {
        return analiseService.buscar(id);
    }

    @PostMapping("/{id}/aprovar")
    public RestauranteGestaoResponse aprovar(@PathVariable Integer id,
                                             @Valid @RequestBody(required = false) AprovarCadastroRequest dados) {
        return analiseService.aprovarCadastro(id, dados);
    }

    @PostMapping("/{id}/rejeitar")
    public RestauranteGestaoResponse rejeitar(@PathVariable Integer id, @Valid @RequestBody RejeitarRequest dados) {
        return analiseService.rejeitarCadastro(id, dados.motivo());
    }

    @PostMapping 
    public ResponseEntity<RestauranteGestaoResponse> cadastrar(@Valid @RequestBody RestauranteFormulario dados) {
        RestauranteGestaoResponse criado = restauranteService.cadastrarPeloAdmin(dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // Editar um restaurante aprovado (vale na hora)
    @PutMapping("/{id}")
    public RestauranteGestaoResponse editar(@PathVariable Integer id, @Valid @RequestBody RestauranteFormulario dados) {
        return restauranteService.editarPeloAdmin(id, dados);
    }

    // Ativar ou desativar um restaurante
    @PatchMapping("/{id}/ativo")
    public RestauranteGestaoResponse alterarAtivo(@PathVariable Integer id, @Valid @RequestBody AtivoRequest dados) {
        return restauranteService.alterarAtivo(id, dados.ativo());
    }
}