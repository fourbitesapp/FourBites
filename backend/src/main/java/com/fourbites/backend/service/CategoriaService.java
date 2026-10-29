package com.fourbites.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.CategoriaAdminResponse;
import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.repository.CategoriaRepository;
import com.fourbites.backend.repository.RestauranteRepository;

// Categorias no painel admin: listar com a quantidade de restaurantes, criar, corrigir o nome e excluir
@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final RestauranteRepository restauranteRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, RestauranteRepository restauranteRepository) {
        this.categoriaRepository = categoriaRepository;
        this.restauranteRepository = restauranteRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaAdminResponse> listar() {
        return categoriaRepository.findAll(Sort.by("nome")).stream()
                .map(c -> new CategoriaAdminResponse(c.getId(), c.getNome(),
                        restauranteRepository.countByCategoriaId(c.getId())))
                .toList();
    }

    @Transactional
    public CategoriaAdminResponse renomear(Integer id, String nome) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada."));
        String novoNome = nome.trim();
        if (categoriaRepository.existsByNomeIgnoreCaseAndIdNot(novoNome, id)) {
            throw new ConflitoException("Já existe uma categoria com este nome.");
        }
        categoria.setNome(novoNome);
        return new CategoriaAdminResponse(categoria.getId(), categoria.getNome(),
                restauranteRepository.countByCategoriaId(id));
    }

    @Transactional
    public CategoriaAdminResponse criar(String nome) {
        String novoNome = nome.trim();
        if (categoriaRepository.findByNomeIgnoreCase(novoNome).isPresent()) {
            throw new ConflitoException("Já existe uma categoria com este nome.");
        }
        Categoria categoria = new Categoria();
        categoria.setNome(novoNome);
        categoriaRepository.save(categoria);
        return new CategoriaAdminResponse(categoria.getId(), categoria.getNome(), 0);
    }

    // Só exclui categoria sem restaurantes
    @Transactional
    public void excluir(Integer id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada."));
        long emUso = restauranteRepository.countByCategoriaId(id);
        if (emUso > 0) {
            throw new ConflitoException("Esta categoria tem " + emUso + (emUso == 1 ? " restaurante" : " restaurantes")
                    + ". Troque a categoria deles antes de excluir.");
        }
        categoriaRepository.delete(categoria);
    }
}
