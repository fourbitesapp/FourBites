// Funções da área do restaurante e do painel admin: situação do cadastro,
// conversão entre o formulário da tela e o RestauranteFormulario da API, e a comparação de mudanças.
import { agruparHorarios } from './formatos.js'

export const DIAS_DA_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] // diaSemana 1 a 7

export const FAIXAS_DE_PRECO = [
  { valor: '$', rotulo: 'mais em conta' },
  { valor: '$$', rotulo: 'preço médio' },
  { valor: '$$$', rotulo: 'mais caro' },
]

// Características do restaurante (sim/não). Uma lista só para o formulário, os selos e os filtros do Explorar.
// campo = nome no restaurante (API); filtro = parâmetro do GET /restaurantes.
export const CARACTERISTICAS = [
  { campo: 'aceitaPets', filtro: 'pets', rotulo: 'Pet friendly', icone: 'bi-pata', cor: '#ffc193',
    texto: 'Clientes podem levar seus bichinhos' },
  { campo: 'areaCriancas', filtro: 'areaCriancas', rotulo: 'Área para crianças', icone: 'bi-balloon', cor: '#ffd98a',
    texto: 'Espaço ou brinquedos para os pequenos' },
  { campo: 'estacionamento', filtro: 'estacionamento', rotulo: 'Estacionamento', icone: 'bi-car-front', cor: '#d9eda3',
    texto: 'Lugar para deixar o carro' },
  { campo: 'areaFumantes', filtro: 'areaFumantes', rotulo: 'Área para fumantes', icone: 'bi-wind', cor: '#e6ddd3',
    texto: 'Espaço separado para quem fuma' },
  { campo: 'acessivel', filtro: 'acessivel', rotulo: 'Acessível', icone: 'bi-universal-access', cor: '#b5dcf8',
    texto: 'Espaço acessível para pessoas com deficiência' },
  { campo: 'lgbtFriendly', filtro: 'lgbtFriendly', rotulo: 'LGBT+ friendly', icone: 'bi-rainbow', cor: '#d8c4f5',
    texto: 'Ambiente acolhedor para pessoas LGBT+' },
]

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro',
  'outubro', 'novembro', 'dezembro']

// ---------- Situação ----------

// Selos que aparecem ao lado do nome. "visao" = 'responsavel' ou 'admin'.
// cor: verde, amarelo, vermelho ou cinza (classes fb-selo-<cor>).
export function selosDaSituacao(r, visao) {
  if (r.status === 'PENDENTE') return [{ cor: 'amarelo', texto: 'Em análise' }]
  if (r.status === 'REJEITADO') return [{ cor: 'vermelho', texto: 'Precisa de ajustes' }]

  const selos = [{ cor: 'verde', texto: 'Publicado' }]
  if (!r.ativo) selos.push({ cor: 'cinza', texto: 'Escondido' })
  if (r.alteracaoPendente?.status === 'PENDENTE') {
    selos.push({ cor: 'amarelo', texto: visao === 'admin' ? 'Mudança em análise' : 'Mudanças em análise' })
  }
  if (visao === 'responsavel' && r.alteracaoPendente?.status === 'REJEITADO') {
    selos.push({ cor: 'vermelho', texto: 'Mudança recusada' })
  }
  return selos
}

// O responsável só pode editar quando nada dele está em análise.
export function podeEditar(r) {
  return r.status !== 'PENDENTE' && r.alteracaoPendente?.status !== 'PENDENTE'
}

export function nomeDaCategoria(r) {
  if (r.categoria) return r.categoria.nome
  return r.categoriaSugerida ? `${r.categoriaSugerida} (sugerida)` : 'Sem categoria'
}

// ---------- Formatos ----------

export function formatarCnpj(cnpj) {
  const d = String(cnpj || '').replace(/\D/g, '')
  if (d.length !== 14) return cnpj || ''
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

// "2018-05-01" → "maio de 2018"
export function formatarMesAno(data) {
  if (!data) return '—'
  const [ano, mes] = data.split('-')
  return `${MESES[Number(mes) - 1]} de ${ano}`
}

export function textoEndereco(e) {
  if (!e) return '—'
  const complemento = e.complemento ? ` (${e.complemento})` : ''
  return `${e.logradouro}, ${e.numero}${complemento} · ${e.bairro} · ${e.cidade}/${e.uf}`
}

export function simNao(valor) {
  return valor ? 'Sim' : 'Não'
}

// ---------- Formulário da tela ⇄ RestauranteFormulario ----------

export function formularioVazio() {
  return {
    nome: '', cnpj: '', telefone: '', categoriaId: '', categoriaSugerida: '', abriuEm: '', descricao: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
    dias: DIAS_DA_SEMANA.map(() => ({ aberto: false, periodos: [{ abertura: '', fechamento: '' }] })),
    faixaPreco: '', formasPagamentoIds: [],
    ...Object.fromEntries(CARACTERISTICAS.map((c) => [c.campo, false])),
    fotos: [], cardapioUrl: '', cardapioLink: '',
  }
}

// Monta o formulário a partir do restaurante que veio da API (RestauranteGestao), para editar.
export function formularioDoRestaurante(r) {
  const dias = DIAS_DA_SEMANA.map((_, i) => {
    const doDia = r.horarios.filter((h) => h.diaSemana === i + 1)
    return doDia.length
      ? { aberto: true, periodos: doDia.map((h) => ({ abertura: h.abertura, fechamento: h.fechamento })) }
      : { aberto: false, periodos: [{ abertura: '', fechamento: '' }] }
  })
  return {
    nome: r.nome,
    cnpj: formatarCnpj(r.cnpj),
    telefone: r.telefone,
    categoriaId: r.categoria ? r.categoria.id : r.categoriaSugerida ? 'outra' : '',
    categoriaSugerida: r.categoriaSugerida || '',
    abriuEm: r.dataFundacao ? r.dataFundacao.slice(0, 7) : '',
    descricao: r.descricao,
    endereco: { ...r.endereco, complemento: r.endereco.complemento || '' },
    dias,
    faixaPreco: r.faixaPreco,
    formasPagamentoIds: r.formasPagamento.map((f) => f.id),
    ...Object.fromEntries(CARACTERISTICAS.map((c) => [c.campo, Boolean(r[c.campo])])),
    fotos: r.fotos,
    cardapioUrl: r.cardapioUrl || '',
    cardapioLink: r.cardapioLink || '',
  }
}

const textoOuNulo = (texto) => (texto && texto.trim() ? texto.trim() : null)

// Converte o formulário da tela no corpo que o back-end espera.
export function montarEnvio(f) {
  const outra = f.categoriaId === 'outra'
  return {
    nome: f.nome.trim(),
    cnpj: textoOuNulo(f.cnpj),
    categoriaId: outra || f.categoriaId === '' ? null : Number(f.categoriaId),
    categoriaSugerida: outra ? textoOuNulo(f.categoriaSugerida) : null,
    descricao: f.descricao.trim(),
    telefone: f.telefone.trim(),
    dataFundacao: f.abriuEm ? `${f.abriuEm}-01` : null, // o back-end guarda sempre o dia 1 do mês
    endereco: { ...f.endereco, uf: f.endereco.uf.trim().toUpperCase() },
    faixaPreco: f.faixaPreco,
    formasPagamentoIds: f.formasPagamentoIds,
    horarios: f.dias.flatMap((dia, i) =>
      dia.aberto ? dia.periodos.map((p) => ({ diaSemana: i + 1, abertura: p.abertura, fechamento: p.fechamento })) : []),
    ...Object.fromEntries(CARACTERISTICAS.map((c) => [c.campo, f[c.campo]])),
    fotos: f.fotos,
    cardapioUrl: textoOuNulo(f.cardapioUrl),
    cardapioLink: textoOuNulo(f.cardapioLink),
  }
}

// Conferências simples antes de enviar (o back-end confere tudo de novo).
export function validarFormulario(f, { cnpjObrigatorio }) {
  const erros = {}
  const vazio = (v) => !String(v ?? '').trim()
  if (vazio(f.nome)) erros.nome = 'O nome é obrigatório.'
  if (cnpjObrigatorio && vazio(f.cnpj)) erros.cnpj = 'O CNPJ é obrigatório.'
  if (vazio(f.telefone)) erros.telefone = 'O telefone é obrigatório.'
  if (f.categoriaId === '') erros.categoriaId = 'Escolha uma categoria.'
  if (f.categoriaId === 'outra' && vazio(f.categoriaSugerida)) erros.categoriaSugerida = 'Escreva qual é a categoria.'
  if (vazio(f.descricao)) erros.descricao = 'A descrição é obrigatória.'
  ;['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf'].forEach((campo) => {
    if (vazio(f.endereco[campo])) erros[`endereco.${campo}`] = 'Obrigatório.'
  })
  if (f.dias.some((d) => d.aberto && d.periodos.some((p) => !p.abertura || !p.fechamento))) {
    erros.horarios = 'Preencha a abertura e o fechamento de todos os dias abertos.'
  }
  if (!f.faixaPreco) erros.faixaPreco = 'Escolha a faixa de preço.'
  return erros
}

// ---------- Comparação (fila de mudanças do admin) ----------

// restaurante = versão publicada (RestauranteGestao); proposto = RestauranteFormulario enviado.
// categorias e formas = listas { id, nome } para traduzir os ids do proposto.
// Devolve só as linhas diferentes: [{ campo, antes, depois }].
export function diferencas(restaurante, proposto, categorias, formas) {
  const r = restaurante
  const p = proposto
  const nomeCategoriaProposta = p.categoriaId
    ? categorias.find((c) => c.id === p.categoriaId)?.nome || `categoria ${p.categoriaId}`
    : `${p.categoriaSugerida} (sugerida)`
  const nomesFormas = (ids) => formas.filter((f) => ids.includes(f.id)).map((f) => f.nome).join(', ') || 'Nenhuma'

  const linhas = [
    ['Nome', r.nome, p.nome],
    ['Categoria', nomeDaCategoria(r), nomeCategoriaProposta],
    ['Descrição', r.descricao, p.descricao],
    ['Telefone', r.telefone, p.telefone],
    ['Abriu em', formatarMesAno(r.dataFundacao), formatarMesAno(p.dataFundacao)],
    ['Endereço', textoEndereco(r.endereco), textoEndereco(p.endereco)],
    ['Faixa de preço', r.faixaPreco, p.faixaPreco],
    ['Pagamento', nomesFormas(r.formasPagamento.map((f) => f.id)), nomesFormas(p.formasPagamentoIds)],
  ]

  const horariosAntes = agruparHorarios(r.horarios)
  const horariosDepois = agruparHorarios(p.horarios)
  horariosAntes.forEach((dia, i) => {
    linhas.push([`Horário · ${dia.dia.toLowerCase()}`, dia.periodos, horariosDepois[i].periodos])
  })

  CARACTERISTICAS.forEach((c) => linhas.push([c.rotulo, simNao(r[c.campo]), simNao(p[c.campo])]))

  const fotosPropostas = p.fotos || []
  const novas = fotosPropostas.filter((url) => !r.fotos.includes(url)).length
  const mesmasFotos = r.fotos.length === fotosPropostas.length && r.fotos.every((url, i) => url === fotosPropostas[i])
  if (!mesmasFotos) {
    const extra = novas ? ` (${novas} ${novas === 1 ? 'nova' : 'novas'})` : ' (outra ordem ou menos fotos)'
    linhas.push(['Fotos', `${r.fotos.length} fotos`, `${fotosPropostas.length} fotos${extra}`])
  }

  linhas.push(['Cardápio (arquivo)', r.cardapioUrl ? 'arquivo atual' : 'sem arquivo',
    p.cardapioUrl ? (p.cardapioUrl === r.cardapioUrl ? 'arquivo atual' : 'arquivo novo') : 'sem arquivo'])
  linhas.push(['Link do cardápio', r.cardapioLink || '—', p.cardapioLink || '—'])

  return linhas
    .filter(([, antes, depois]) => String(antes ?? '') !== String(depois ?? ''))
    .map(([campo, antes, depois]) => ({ campo, antes, depois }))
}



