package com.fourbites.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fourbites.backend.dto.AtualizarUsuarioRequest;
import com.fourbites.backend.dto.CadastroResponsavelRequest;
import com.fourbites.backend.dto.CadastroUsuarioRequest;
import com.fourbites.backend.dto.UsuarioPublicoResponse;
import com.fourbites.backend.dto.UsuarioResponse;
import com.fourbites.backend.dto.UsuarioResumoResponse;
import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.CampoInvalidoException;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.repository.AvaliacaoRepository;
import com.fourbites.backend.repository.SeguidorRepository;
import com.fourbites.backend.repository.UsuarioRepository;
import com.fourbites.backend.util.Capas;

@Service
public class UsuarioService {

    private static final int MAXIMO_NA_BUSCA = 12;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AvaliacaoRepository avaliacaoRepository;
    private final SeguidorRepository seguidorRepository;
    private final UploadService uploadService;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                          AvaliacaoRepository avaliacaoRepository, SeguidorRepository seguidorRepository,
                          UploadService uploadService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.avaliacaoRepository = avaliacaoRepository;
        this.seguidorRepository = seguidorRepository;
        this.uploadService = uploadService;
    }

    //Cadastrar usuário comum (papel USUARIO)
    @Transactional
    public UsuarioResponse cadastrar(CadastroUsuarioRequest dados) {
        return criarConta(dados.nome(), dados.username(), dados.email(), dados.telefone(),
                dados.senha(), dados.confirmacaoSenha(), dados.dataNascimento(), Papel.USUARIO);
    }

    //Cadastrar responsável por restaurante (papel RESTAURANTE, sem data de nascimento)
    @Transactional
    public UsuarioResponse cadastrarResponsavel(CadastroResponsavelRequest dados) {
        return criarConta(dados.nome(), dados.username(), dados.email(), dados.telefone(),
                dados.senha(), dados.confirmacaoSenha(), null, Papel.RESTAURANTE);
    }

    //Regras comuns aos dois cadastros
    private UsuarioResponse criarConta(String nome, String usernameInformado, String emailInformado,
                                       String telefone, String senha, String confirmacaoSenha,
                                       LocalDate dataNascimento, Papel papel) {
        if (!senha.equals(confirmacaoSenha)) {
            throw new RegraNegocioException("A senha e a confirmação de senha não coincidem.");
        }

        String email = normalizarEmail(emailInformado);
        String username = usernameInformado.trim();

        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflitoException("Este e-mail já está em uso.");
        }
        if (usuarioRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflitoException("Este nome de usuário já está em uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome.trim());
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setTelefone(telefone.trim());
        usuario.setDataNascimento(dataNascimento);
        usuario.setPapel(papel);
        usuario.setSenha(passwordEncoder.encode(senha));

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponse.de(salvo);
    }

    @Transactional(readOnly = true)
    public UsuarioPublicoResponse buscarPerfilPublico(String username, Integer usuarioLogadoId) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        Integer id = usuario.getId();

        boolean seguidoPorMim = usuarioLogadoId != null
                && seguidorRepository.existsBySeguidorIdAndSeguidoId(usuarioLogadoId, id);

        return UsuarioPublicoResponse.de(usuario,
                avaliacaoRepository.countByUsuarioId(id),
                seguidorRepository.countBySeguidoId(id),
                seguidorRepository.countBySeguidorId(id),
                seguidoPorMim);
    }

    // Busca de pessoas (só contas USUARIO). Menos de 2 letras devolve lista vazia.
    @Transactional(readOnly = true)
    public List<UsuarioResumoResponse> buscar(String busca) {
        String termo = busca == null ? "" : busca.trim().toLowerCase();
        if (termo.startsWith("@")) {
            termo = termo.substring(1);
        }
        if (termo.length() < 2) {
            return List.of();
        }
        return usuarioRepository
                .buscarPorNomeOuUsername(Papel.USUARIO, "%" + termo + "%", PageRequest.of(0, MAXIMO_NA_BUSCA))
                .stream()
                .map(UsuarioResumoResponse::de)
                .toList();
    }

    //Foto de perfil: envia a imagem ao Cloudinary e guarda o endereço.
    @Transactional
    public UsuarioResponse atualizarFoto(Integer id, MultipartFile arquivo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        usuario.setFotoPerfil(uploadService.enviarImagem(arquivo));
        return UsuarioResponse.de(usuario);
    }

    // Remover a foto: o perfil volta a mostrar as iniciais.
    @Transactional
    public UsuarioResponse removerFoto(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        usuario.setFotoPerfil(null);
        return UsuarioResponse.de(usuario);
    }

    //Dados da própria conta (usuário logado)
    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return UsuarioResponse.de(usuario);
    }

    //Editar perfil
    @Transactional
    public UsuarioResponse atualizar(Integer id, AtualizarUsuarioRequest dados) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));

        String username = dados.username().trim();

        if (usuarioRepository.existsByUsernameIgnoreCaseAndIdNot(username, id)) {
            throw new ConflitoException("Este nome de usuário não está disponível.");
        }

        usuario.setNome(dados.nome().trim());
        usuario.setUsername(username);
        usuario.setTelefone(dados.telefone().trim());
        usuario.setBio(textoOuNulo(dados.bio()));

        // Capa: só aceita os códigos da lista (util/Capas.java).
        if (dados.capaCor() != null) {
            if (!Capas.CORES.contains(dados.capaCor())) {
                throw new CampoInvalidoException("capaCor", "Escolha uma das cores de capa.");
            }
            usuario.setCapaCor(dados.capaCor());
        }
        if (dados.capaFrase() != null) {
            if (!Capas.FRASES.contains(dados.capaFrase())) {
                throw new CampoInvalidoException("capaFrase", "Escolha uma das frases de capa.");
            }
            usuario.setCapaFrase(dados.capaFrase());
        }

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponse.de(salvo);
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String textoOuNulo(String texto) { //Bio!
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }
}
