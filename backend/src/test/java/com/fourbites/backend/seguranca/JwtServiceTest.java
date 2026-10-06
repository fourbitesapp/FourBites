package com.fourbites.backend.seguranca;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

class JwtServiceTest {

    private static final String SEGREDO = "segredo-usado-somente-nos-testes-0123456789";

    private final JwtService jwtService = new JwtService(SEGREDO, 24);

    @Test
    void tokenGuardaOIdEOPapelDoUsuario() {
        String token = jwtService.gerarToken(usuario(7, Papel.ADMIN));

        Claims dados = jwtService.lerToken(token);

        assertEquals("7", dados.getSubject());
        assertEquals("ADMIN", dados.get("papel", String.class));
    }

    @Test
    void tokenAdulteradoERecusado() {
        String token = jwtService.gerarToken(usuario(1, Papel.USUARIO));

        assertThrows(JwtException.class, () -> jwtService.lerToken(token + "x"));
    }

    @Test
    void tokenAssinadoComOutroSegredoERecusado() {
        JwtService outroServidor = new JwtService("outro-segredo-qualquer-com-32-caracteres-ou-mais", 24);
        String tokenFalso = outroServidor.gerarToken(usuario(1, Papel.ADMIN));

        assertThrows(JwtException.class, () -> jwtService.lerToken(tokenFalso));
    }

    @Test
    void tokenVencidoERecusado() {
        JwtService validadeNegativa = new JwtService(SEGREDO, -1); 
        String token = validadeNegativa.gerarToken(usuario(1, Papel.USUARIO));

        assertThrows(JwtException.class, () -> jwtService.lerToken(token));
    }

    private Usuario usuario(Integer id, Papel papel) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setPapel(papel);
        return usuario;
    }
}
