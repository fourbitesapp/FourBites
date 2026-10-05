package com.fourbites.backend.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.PreferenciasDTO;
import com.fourbites.backend.entity.UsuarioPreferencia;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.repository.CategoriaRepository;
import com.fourbites.backend.repository.UsuarioPreferenciaRepository;

@Service
public class PreferenciaService {

    private final UsuarioPreferenciaRepository preferenciaRepository;
    private final CategoriaRepository categoriaRepository;

    public PreferenciaService(UsuarioPreferenciaRepository preferenciaRepository,
                              CategoriaRepository categoriaRepository) {
        this.preferenciaRepository = preferenciaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public PreferenciasDTO buscar(Integer usuarioId) {
        UsuarioPreferencia preferencia = preferenciaRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Preferências ainda não definidas."));
        return PreferenciasDTO.de(preferencia);
    }

    @Transactional
    public PreferenciasDTO salvar(Integer usuarioId, PreferenciasDTO dados) {
        Set<Integer> categoriaIds = new HashSet<>(dados.categoriaIds()); 
        if (categoriaRepository.findAllById(categoriaIds).size() != categoriaIds.size()) {
            throw new RegraNegocioException("Uma das categorias escolhidas não existe.");
        }

        UsuarioPreferencia preferencia = preferenciaRepository.findById(usuarioId)
                .orElseGet(() -> {
                    UsuarioPreferencia nova = new UsuarioPreferencia();
                    nova.setUsuarioId(usuarioId);
                    return nova;
                });

        preferencia.setFaixaPreco(dados.faixaPreco());
        preferencia.setPrecisaAcessibilidade(dados.precisaAcessibilidade());
        preferencia.setLevaPets(dados.levaPets());
        preferencia.getCategoriaIds().clear();
        preferencia.getCategoriaIds().addAll(categoriaIds);

        UsuarioPreferencia salva = preferenciaRepository.save(preferencia);
        return PreferenciasDTO.de(salva);
    }
}
