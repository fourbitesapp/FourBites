package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.ListaItemRequest;
import com.fourbites.backend.dto.ListaRequest;
import com.fourbites.backend.dto.ListaResponse;
import com.fourbites.backend.service.ListaService;

import jakarta.validation.Valid;

// Listas de restaurantes. Ler é público (as privadas só para o dono); criar e mudar é só para conta USUARIO.
@RestController
public class ListaController {

    private final ListaService listaService;

    public ListaController(ListaService listaService) {
        this.listaService = listaService;
    }

    @GetMapping("/usuarios/me/listas")
    public List<ListaResponse> listarMinhas(@AuthenticationPrincipal Integer usuarioId) {
        return listaService.listarMinhas(usuarioId);
    }

    @PostMapping("/usuarios/me/listas")
    public ResponseEntity<ListaResponse> criar(@AuthenticationPrincipal Integer usuarioId,
                                               @Valid @RequestBody ListaRequest dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(listaService.criar(usuarioId, dados));
    }

    @GetMapping("/usuarios/{username}/listas")
    public List<ListaResponse> listarDoUsuario(@PathVariable String username, Authentication autenticacao) {
        return listaService.listarPublicasDoUsuario(username, idDoLogado(autenticacao));
    }

    // Perfil: listas públicas que o usuário segue
    @GetMapping("/usuarios/{username}/listas-seguidas")
    public List<ListaResponse> listarSeguidas(@PathVariable String username, Authentication autenticacao) {
        return listaService.listarSeguidasPor(username, idDoLogado(autenticacao));
    }

    // Home: "sugestões do autor" (listas públicas do perfil oficial, o Farelo)
    @GetMapping("/listas/oficiais")
    public List<ListaResponse> listarOficiais(Authentication autenticacao) {
        return listaService.listarOficiais(idDoLogado(autenticacao));
    }

    @PostMapping("/listas/{id}/seguir")
    public ResponseEntity<Void> seguir(@PathVariable Integer id, @AuthenticationPrincipal Integer usuarioId) {
        listaService.seguir(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/listas/{id}/seguir")
    public ResponseEntity<Void> deixarDeSeguir(@PathVariable Integer id, @AuthenticationPrincipal Integer usuarioId) {
        listaService.deixarDeSeguir(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listas/{id}")
    public ListaResponse buscar(@PathVariable Integer id, Authentication autenticacao) {
        return listaService.buscar(id, idDoLogado(autenticacao));
    }

    @PutMapping("/listas/{id}")
    public ListaResponse atualizar(@PathVariable Integer id, @AuthenticationPrincipal Integer usuarioId,
                                   @Valid @RequestBody ListaRequest dados) {
        return listaService.atualizar(id, usuarioId, dados);
    }

    @DeleteMapping("/listas/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id, @AuthenticationPrincipal Integer usuarioId) {
        listaService.excluir(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/listas/{id}/restaurantes")
    public ListaResponse adicionar(@PathVariable Integer id, @AuthenticationPrincipal Integer usuarioId,
                                   @Valid @RequestBody ListaItemRequest dados) {
        return listaService.adicionar(id, usuarioId, dados.restauranteId());
    }

    @DeleteMapping("/listas/{id}/restaurantes/{restauranteId}")
    public ListaResponse remover(@PathVariable Integer id, @PathVariable Integer restauranteId,
                                 @AuthenticationPrincipal Integer usuarioId) {
        return listaService.remover(id, usuarioId, restauranteId);
    }

    // Rotas públicas: visitante não tem id (null).
    private Integer idDoLogado(Authentication autenticacao) {
        return autenticacao != null && autenticacao.getPrincipal() instanceof Integer id ? id : null;
    }
}

