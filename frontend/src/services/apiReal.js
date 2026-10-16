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

async function chamar(metodo, caminho, corpo) {
  const cabecalhos = {}
  const sessao = lerSessao()
  if (sessao?.token) {
    cabecalhos.Authorization = `Bearer ${sessao.token}`
  }
  if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json'
  }

  let resposta
  try {
    resposta = await fetch(API_URL + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
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

//Restaurantes

export const listarCategorias = () => chamar('GET', '/categorias')
export const buscarRestaurantes = (filtros) => chamar('GET', '/restaurantes' + montarConsulta(filtros))
export const buscarRestaurante = (id) => chamar('GET', `/restaurantes/${id}`)

//Preferências (só contas USUARIO). 
export const buscarPreferencias = () => chamar('GET', '/usuarios/me/preferencias')
export const salvarPreferencias = (dados) => chamar('PUT', '/usuarios/me/preferencias', dados)

//Avaliações

export const listarAvaliacoesDoRestaurante = (id) => chamar('GET', `/restaurantes/${id}/avaliacoes`)
export const buscarAvaliacao = (id) => chamar('GET', `/avaliacoes/${id}`)
export const criarAvaliacao = (restauranteId, dados) =>
  chamar('POST', `/restaurantes/${restauranteId}/avaliacoes`, dados)
export const editarAvaliacao = (id, dados) => chamar('PUT', `/avaliacoes/${id}`, dados)
