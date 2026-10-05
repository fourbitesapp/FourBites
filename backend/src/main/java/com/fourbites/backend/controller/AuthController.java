package com.fourbites.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fourbites.backend.dto.CadastroResponsavelRequest;
import com.fourbites.backend.dto.CadastroUsuarioRequest;
import com.fourbites.backend.dto.EsqueciSenhaRequest;
import com.fourbites.backend.dto.LoginRequest;
import com.fourbites.backend.dto.LoginResponse;
import com.fourbites.backend.dto.RedefinirSenhaRequest;
import com.fourbites.backend.dto.UsuarioResponse;
import com.fourbites.backend.service.AuthService;
import com.fourbites.backend.service.RecuperacaoSenhaService;
import com.fourbites.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final AuthService authService;
    private final RecuperacaoSenhaService recuperacaoSenhaService;

    public AuthController(UsuarioService usuarioService, AuthService authService,
                          RecuperacaoSenhaService recuperacaoSenhaService) {
        this.usuarioService = usuarioService;
        this.authService = authService;
        this.recuperacaoSenhaService = recuperacaoSenhaService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroUsuarioRequest dados) {
        UsuarioResponse criado = usuarioService.cadastrar(dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PostMapping("/cadastro-responsavel") 
    public ResponseEntity<UsuarioResponse> cadastrarResponsavel(@Valid @RequestBody CadastroResponsavelRequest dados) {
        UsuarioResponse criado = usuarioService.cadastrarResponsavel(dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PostMapping("/login") 
    public LoginResponse login(@Valid @RequestBody LoginRequest dados) {
        return authService.login(dados);
    }

    @PostMapping("/esqueci-senha") 
    public ResponseEntity<Void> esqueciSenha(@Valid @RequestBody EsqueciSenhaRequest dados) {
        recuperacaoSenhaService.solicitar(dados.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/redefinir-senha") 
    public ResponseEntity<Void> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest dados) {
        recuperacaoSenhaService.redefinir(dados);
        return ResponseEntity.noContent().build();
    }
}
