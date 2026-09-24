package com.fourbites.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.AtualizarUsuarioRequest;
import com.fourbites.backend.dto.UsuarioPublicoResponse;
import com.fourbites.backend.dto.UsuarioResponse;
import com.fourbites.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{username}") /*busca o perfil público de um usuário pelo username*/
    public UsuarioPublicoResponse buscarPerfilPublico(@PathVariable String username) {
        return usuarioService.buscarPerfilPublico(username);
    }
    
    @PutMapping("/{id}")
    public UsuarioResponse atualizar(@PathVariable Integer id,
                                     @Valid @RequestBody AtualizarUsuarioRequest dados) {
        return usuarioService.atualizar(id, dados);
    }
}
