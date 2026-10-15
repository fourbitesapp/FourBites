package com.fourbites.backend.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.fourbites.backend.dto.ErroResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public GlobalExceptionHandler() {
    }

    // 400 - falhou alguma validação dos DTOs 
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> tratarValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }
        return ResponseEntity.badRequest()
                .body(new ErroResponse(400, "Existem campos inválidos.", campos));
    }

    //400 - JSON mal formado ou valor em formato errado (ex.: data inválida).
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> tratarCorpoInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(new ErroResponse(400,
                        "Corpo da requisição inválido. Verifique o formato dos dados (datas no formato AAAA-MM-DD)."));
    }

    // 400 - um campo específico foi recusado pelo service (ex.: CNPJ inválido).
    @ExceptionHandler(CampoInvalidoException.class)
    public ResponseEntity<ErroResponse> tratarCampoInvalido(CampoInvalidoException ex) {
        return ResponseEntity.badRequest()
                .body(new ErroResponse(400, "Existem campos inválidos.", Map.of(ex.getCampo(), ex.getMessage())));
    }

    // 400 - regra de negócio violada.
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> tratarRegraNegocio(RegraNegocioException ex) {
        return ResponseEntity.badRequest()
                .body(new ErroResponse(400, ex.getMessage()));
    }

    // 401 - e-mail ou senha errados no login.
    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ErroResponse> tratarCredenciais(CredenciaisInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErroResponse(401, ex.getMessage()));
    }

    // 403 - logado, mas sem permissão para aquele recurso.
    @ExceptionHandler(SemPermissaoException.class)
    public ResponseEntity<ErroResponse> tratarSemPermissao(SemPermissaoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErroResponse(403, ex.getMessage()));
    }

    // 404 - recurso não encontrado.
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> tratarNaoEncontrado(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErroResponse(404, ex.getMessage()));
    }

    // 409 - dado duplicado detectado pelo service.
    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResponse> tratarConflito(ConflitoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErroResponse(409, ex.getMessage()));
    }

    // 400 - arquivo maior que o limite (spring.servlet.multipart.max-file-size).
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErroResponse> tratarArquivoGrande(MaxUploadSizeExceededException ex) {
        return ResponseEntity.badRequest()
                .body(new ErroResponse(400, "Existem campos inválidos.",
                        Map.of("arquivo", "O arquivo deve ter no máximo 5 MB.")));
    }

    // 400 - a requisição de upload veio sem o campo "arquivo".
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErroResponse> tratarArquivoAusente(MissingServletRequestPartException ex) {
        return ResponseEntity.badRequest()
                .body(new ErroResponse(400, "Existem campos inválidos.",
                        Map.of(ex.getRequestPartName(), "Escolha um arquivo para enviar.")));
    }

    // 502 - um serviço de fora (ex.: Cloudinary) falhou.
    @ExceptionHandler(ServicoExternoException.class)
    public ResponseEntity<ErroResponse> tratarServicoExterno(ServicoExternoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErroResponse(502, ex.getMessage()));
    }

    //409 - o próprio banco recusou o dado (UNIQUE, CHECK, FK).
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> tratarIntegridade(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErroResponse(409, "Os dados informados violam uma regra do sistema ou já existem."));
    }
}

