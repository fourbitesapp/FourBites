const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const CHAVE_SESSAO = 'fourbites.sessao'

//Sessão (token + dados do usuário) guardada no navegador 

export function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO))
  } catch {
    return null
  }
}

export function salvarSessao(sessao) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_SESSAO)
}

//Função base

export class ErroApi extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem)
    this.status = status
    this.campos = campos || {}
  }
}

// "corpo" pode ser um objeto (vai como JSON) ou um FormData (envio de arquivo).
async function chamar(metodo, caminho, corpo) {
  const cabecalhos = {}
  const ehArquivo = corpo instanceof FormData
  const sessao = lerSessao()
  if (sessao?.token) {
    cabecalhos.Authorization = `Bearer ${sessao.token}`
  }
  if (corpo !== undefined && !ehArquivo) {
    cabecalhos['Content-Type'] = 'application/json' // no FormData o navegador monta o cabeçalho sozinho
  }

  let resposta
  try {
    resposta = await fetch(API_URL + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : ehArquivo ? corpo : JSON.stringify(corpo),
    })
  } catch {
    throw new ErroApi(0, 'Não foi possível conectar ao servidor. Tente de novo em instantes.')
  }

  if (resposta.status === 204) {
    return null
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    if (resposta.status === 401 && sessao?.token) {
      limparSessao()
      window.dispatchEvent(new Event('fourbites:sessao-encerrada'))
    }
    throw new ErroApi(resposta.status, dados?.mensagem || 'Algo deu errado. Tente de novo.', dados?.campos)
  }
  return dados
}

function montarConsulta(filtros) {
  const parametros = new URLSearchParams()
  Object.entries(filtros).forEach(([nome, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '' && valor !== false) {
      parametros.set(nome, valor)
    }
  })
  const texto = parametros.toString()
  return texto ? `?${texto}` : ''
}

//Autenticação

export const login = (email, senha) => chamar('POST', '/auth/login', { email, senha })
export const cadastrar = (dados) => chamar('POST', '/auth/cadastro', dados)
export const cadastrarResponsavel = (dados) => chamar('POST', '/auth/cadastro-responsavel', dados)
export const esqueciSenha = (email) => chamar('POST', '/auth/esqueci-senha', { email })
export const redefinirSenha = (dados) => chamar('POST', '/auth/redefinir-senha', dados)

//Usuários, perfil e seguir

export const buscarUsuarios = (busca) => chamar('GET', `/usuarios?busca=${encodeURIComponent(busca)}`)
export const buscarPerfil = (username) => chamar('GET', `/usuarios/${encodeURIComponent(username)}`)
export const listarAvaliacoesDoUsuario = (username) =>
  chamar('GET', `/usuarios/${encodeURIComponent(username)}/avaliacoes`)
export const buscarMeusDados = () => chamar('GET', '/usuarios/me')
export const atualizarMeusDados = (dados) => chamar('PUT', '/usuarios/me', dados)
export const listarSeguidores = (username) => chamar('GET', `/usuarios/${encodeURIComponent(username)}/seguidores`)
export const listarSeguindo = (username) => chamar('GET', `/usuarios/${encodeURIComponent(username)}/seguindo`)
export const seguir = (username) => chamar('POST', `/usuarios/${encodeURIComponent(username)}/seguir`)
export const deixarDeSeguir = (username) => chamar('DELETE', `/usuarios/${encodeURIComponent(username)}/seguir`)

function comArquivo(arquivo) {
  const formulario = new FormData()
  formulario.append('arquivo', arquivo)
  return formulario
}
export const atualizarFotoPerfil = (arquivo) => chamar('POST', '/usuarios/me/foto', comArquivo(arquivo))
export const removerFotoPerfil = () => chamar('DELETE', '/usuarios/me/foto')
export const enviarArquivo = (arquivo) => chamar('POST', '/uploads', comArquivo(arquivo)) // devolve { url }

//Favoritos (até 4, cada um numa posição de 1 a 4)

export const listarFavoritosDoUsuario = (username) =>
  chamar('GET', `/usuarios/${encodeURIComponent(username)}/favoritos`)
export const listarMeusFavoritos = () => chamar('GET', '/usuarios/me/favoritos')
export const colocarFavorito = (posicao, restauranteId) =>
  chamar('PUT', `/usuarios/me/favoritos/${posicao}`, { restauranteId })
export const removerFavorito = (posicao) => chamar('DELETE', `/usuarios/me/favoritos/${posicao}`)

//Restaurantes

export const listarCategorias = () => chamar('GET', '/categorias')
export const listarFormasPagamento = () => chamar('GET', '/formas-pagamento')
export const buscarRestaurantes = (filtros) => chamar('GET', '/restaurantes' + montarConsulta(filtros))
export const buscarRestaurante = (id) => chamar('GET', `/restaurantes/${id}`)

//Preferências (só contas USUARIO). 
export const buscarPreferencias = () => chamar('GET', '/usuarios/me/preferencias')
export const salvarPreferencias = (dados) => chamar('PUT', '/usuarios/me/preferencias', dados)

//Início: recomendações (só USUARIO), ranking e feed

export const listarRecomendacoes = () => chamar('GET', '/recomendacoes')
export const buscarRanking = (periodo) => chamar('GET', `/ranking?periodo=${periodo}`)
export const listarFeed = () => chamar('GET', '/feed')

//Avaliações

export const listarAvaliacoesDoRestaurante = (id) => chamar('GET', `/restaurantes/${id}/avaliacoes`)
export const buscarAvaliacao = (id) => chamar('GET', `/avaliacoes/${id}`)
export const criarAvaliacao = (restauranteId, dados) =>
  chamar('POST', `/restaurantes/${restauranteId}/avaliacoes`, dados)
export const editarAvaliacao = (id, dados) => chamar('PUT', `/avaliacoes/${id}`, dados)

//Área do restaurante (conta RESTAURANTE)

export const listarMeusRestaurantes = () => chamar('GET', '/meus-restaurantes')
export const buscarMeuRestaurante = (id) => chamar('GET', `/meus-restaurantes/${id}`)
export const cadastrarMeuRestaurante = (dados) => chamar('POST', '/meus-restaurantes', dados)
export const editarMeuRestaurante = (id, dados) => chamar('PUT', `/meus-restaurantes/${id}`, dados)

//Painel do admin

export const adminListarRestaurantes = (filtros) => chamar('GET', '/admin/restaurantes' + montarConsulta(filtros))
export const adminBuscarRestaurante = (id) => chamar('GET', `/admin/restaurantes/${id}`)
export const adminCadastrarRestaurante = (dados) => chamar('POST', '/admin/restaurantes', dados)
export const adminAlterarAtivo = (id, ativo) => chamar('PATCH', `/admin/restaurantes/${id}/ativo`, { ativo })
// escolha: {} (categoria já existe), { categoriaId } ou { novaCategoria }
export const adminAprovarCadastro = (id, escolha) => chamar('POST', `/admin/restaurantes/${id}/aprovar`, escolha)
export const adminRejeitarCadastro = (id, motivo) => chamar('POST', `/admin/restaurantes/${id}/rejeitar`, { motivo })

export const adminListarAlteracoes = () => chamar('GET', '/admin/alteracoes')
export const adminAprovarAlteracao = (id) => chamar('POST', `/admin/alteracoes/${id}/aprovar`)
export const adminRejeitarAlteracao = (id, motivo) => chamar('POST', `/admin/alteracoes/${id}/rejeitar`, { motivo })

export const adminListarAvaliacoes = (busca) => chamar('GET', '/admin/avaliacoes' + montarConsulta({ busca }))
export const adminExcluirAvaliacao = (id) => chamar('DELETE', `/admin/avaliacoes/${id}`)

export const adminListarCategorias = () => chamar('GET', '/admin/categorias')
export const adminRenomearCategoria = (id, nome) => chamar('PUT', `/admin/categorias/${id}`, { nome })

// Notificações
export const listarNotificacoes = () => chamar('GET', '/notificacoes') // { novas, itens }
export const marcarNotificacoesVistas = () => chamar('POST', '/notificacoes/vistas')
