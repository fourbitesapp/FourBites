package com.fourbites.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fourbites.backend.dto.AtualizarUsuarioRequest;
import com.fourbites.backend.dto.UsuarioPublicoResponse;
import com.fourbites.backend.dto.UsuarioResponse;
import com.fourbites.backend.dto.UsuarioResumoResponse;
import com.fourbites.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Público: busca de pessoas por nome ou @username (GET /usuarios?busca=joao)
    @GetMapping
    public List<UsuarioResumoResponse> buscar(@RequestParam(defaultValue = "") String busca) {
        return usuarioService.buscar(busca);
    }

    // Público
    @GetMapping("/{username}")
    public UsuarioPublicoResponse buscarPerfilPublico(@PathVariable String username, Authentication autenticacao) {
        Integer usuarioLogadoId = autenticacao != null && autenticacao.getPrincipal() instanceof Integer id
                ? id
                : null;
        return usuarioService.buscarPerfilPublico(username, usuarioLogadoId);
    }
    
    @GetMapping("/me")
    public UsuarioResponse buscarMeusDados(@AuthenticationPrincipal Integer usuarioId) {
        return usuarioService.buscarPorId(usuarioId);
    }

    // Foto de perfil
    @PostMapping(value = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UsuarioResponse atualizarFoto(@AuthenticationPrincipal Integer usuarioId,
                                         @RequestParam("arquivo") MultipartFile arquivo) {
        return usuarioService.atualizarFoto(usuarioId, arquivo);
    }

    // Tira a foto e volta para as iniciais
    @DeleteMapping("/me/foto")
    public UsuarioResponse removerFoto(@AuthenticationPrincipal Integer usuarioId) {
        return usuarioService.removerFoto(usuarioId);
    }

    @PutMapping("/me")
    public UsuarioResponse atualizarMeusDados(@AuthenticationPrincipal Integer usuarioId,
                                              @Valid @RequestBody AtualizarUsuarioRequest dados) {
        return usuarioService.atualizar(usuarioId, dados);
    }
}

