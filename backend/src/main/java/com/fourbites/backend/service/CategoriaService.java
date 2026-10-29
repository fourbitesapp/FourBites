package com.fourbites.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.CategoriaAdminResponse;
import com.fourbites.backend.dto.CategoriaRequest;
import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.repository.CategoriaRepository;
import com.fourbites.backend.repository.RestauranteRepository;

// Categorias no painel admin: listar com a quantidade de restaurantes, criar, editar (nome, cor e ícone) e excluir
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
                .map(c -> CategoriaAdminResponse.de(c, restauranteRepository.countByCategoriaId(c.getId())))
                .toList();
    }

    @Transactional
    public CategoriaAdminResponse criar(CategoriaRequest dados) {
        String nome = dados.nome().trim();
        if (categoriaRepository.findByNomeIgnoreCase(nome).isPresent()) {
            throw new ConflitoException("Já existe uma categoria com este nome.");
        }
        Categoria categoria = new Categoria();
        preencher(categoria, nome, dados);
        categoriaRepository.save(categoria);
        return CategoriaAdminResponse.de(categoria, 0);
    }

    @Transactional
    public CategoriaAdminResponse atualizar(Integer id, CategoriaRequest dados) {
        Categoria categoria = buscar(id);
        String nome = dados.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new ConflitoException("Já existe uma categoria com este nome.");
        }
        preencher(categoria, nome, dados);
        return CategoriaAdminResponse.de(categoria, restauranteRepository.countByCategoriaId(id));
    }

    // Só exclui categoria sem restaurantes
    @Transactional
    public void excluir(Integer id) {
        Categoria categoria = buscar(id);
        long emUso = restauranteRepository.countByCategoriaId(id);
        if (emUso > 0) {
            throw new ConflitoException("Esta categoria tem " + emUso + (emUso == 1 ? " restaurante" : " restaurantes")
                    + ". Troque a categoria deles antes de excluir.");
        }
        categoriaRepository.delete(categoria);
    }

    // cor e ícone vazios voltam ao padrão do front
    private void preencher(Categoria categoria, String nome, CategoriaRequest dados) {
        categoria.setNome(nome);
        categoria.setCor(vazioParaNulo(dados.cor()));
        categoria.setIcone(vazioParaNulo(dados.icone()));
    }

    private String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private Categoria buscar(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada."));
    }
}
