package com.fourbites.backend.dto;

import java.time.OffsetDateTime;

// tipo: SEGUIDOR, AVALIACAO e CURTIDA (conta USUARIO);
// CADASTRO_APROVADO, CADASTRO_REJEITADO, ALTERACAO_APROVADA e ALTERACAO_REJEITADA (conta RESTAURANTE).
// usuario vem null nos avisos de restaurante; motivo só vem nas rejeições.
public record NotificacaoResponse(
        String tipo,
        OffsetDateTime data,
        UsuarioResumoResponse usuario,
        Integer restauranteId,
        String restauranteNome,
        boolean nova,
        String motivo
) {
}
