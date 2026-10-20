package com.fourbites.backend.dto;

import java.util.List;

//quantas notificações são novas e a lista.
public record NotificacoesResponse(
        long novas,
        List<NotificacaoResponse> itens
) {
}