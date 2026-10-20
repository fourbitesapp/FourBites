export const TAMANHO_MAXIMO_ARQUIVO = 5 * 1024 * 1024 // 5 MB

const FORMATO_USERNAME = /^[A-Za-z0-9._]+$/
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function obrigatorio(valor) {
  return String(valor ?? '').trim() !== ''
}

export function validarEmail(email) {
  if (!obrigatorio(email)) return { email: 'O e-mail é obrigatório.' }
  if (!FORMATO_EMAIL.test(email.trim())) return { email: 'Informe um e-mail válido.' }
  return {}
}

export function validarSenhaNova(senha, confirmacaoSenha) {
  const erros = {}
  if (!obrigatorio(senha)) erros.senha = 'A senha é obrigatória.'
  else if (senha.length < 8 || senha.length > 72) erros.senha = 'A senha deve ter entre 8 e 72 caracteres.'
  if (!obrigatorio(confirmacaoSenha)) erros.confirmacaoSenha = 'A confirmação de senha é obrigatória.'
  else if (senha !== confirmacaoSenha) erros.confirmacaoSenha = 'A senha e a confirmação de senha não coincidem.'
  return erros
}

// Campos que aparecem no cadastro e na edição do perfil.
export function validarDadosPessoais(dados) {
  const erros = {}
  if (!obrigatorio(dados.nome)) erros.nome = 'O nome completo é obrigatório.'
  else if (dados.nome.trim().length > 100) erros.nome = 'O nome completo deve ter no máximo 100 caracteres.'

  if (!obrigatorio(dados.username)) erros.username = 'O nome de usuário é obrigatório.'
  else if (dados.username.trim().length > 50) erros.username = 'O nome de usuário deve ter no máximo 50 caracteres.'
  else if (!FORMATO_USERNAME.test(dados.username.trim()))
    erros.username = 'O nome de usuário só pode ter letras, números, ponto e sublinhado.'

  if (!obrigatorio(dados.telefone)) erros.telefone = 'O telefone é obrigatório.'
  else if (dados.telefone.trim().length > 20) erros.telefone = 'O telefone deve ter no máximo 20 caracteres.'
  return erros
}

export function validarCadastro(dados) {
  const erros = { ...validarDadosPessoais(dados), ...validarEmail(dados.email), ...validarSenhaNova(dados.senha, dados.confirmacaoSenha) }
  if (!dados.dataNascimento) erros.dataNascimento = 'A data de nascimento é obrigatória.'
  else if (new Date(dados.dataNascimento) >= new Date()) erros.dataNascimento = 'A data de nascimento deve estar no passado.'
  return erros
}

// Imagens: só JPG ou PNG de até 5 MB. Devolve a mensagem de erro ou null.
export function conferirImagem(arquivo) {
  if (!['image/jpeg', 'image/png'].includes(arquivo.type)) return 'Envie uma imagem JPG ou PNG.'
  if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) return 'A imagem deve ter no máximo 5 MB.'
  return null
}

export function erroDeValidacao(campos) {
  const erro = new Error('Confira os campos destacados.')
  erro.campos = campos
  return erro
}

export function temErros(campos) {
  return Object.keys(campos).length > 0
}
