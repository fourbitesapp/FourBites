// Opções de personalização das listas de restaurantes.
import { CORES } from './cozinhas.js'

// Mesmas cores das categorias (tons claros, texto escuro por cima).
export const CORES_DE_LISTA = CORES

export const ICONES_DE_LISTA = [
  { icone: 'bi-heart', rotulo: 'Date' },
  { icone: 'bi-people', rotulo: 'Família' },
  { icone: 'bi-balloon', rotulo: 'Festa' },
  { icone: 'bi-cake2', rotulo: 'Aniversário' },
  { icone: 'bi-cup-hot', rotulo: 'Café' },
  { icone: 'bi-sun', rotulo: 'Brunch' },
  { icone: 'bi-moon-stars', rotulo: 'Noite' },
  { icone: 'bi-briefcase', rotulo: 'Trabalho' },
  { icone: 'bi-star', rotulo: 'Favoritos' },
  { icone: 'bi-geo-alt', rotulo: 'Passeio' },
  { icone: 'bi-piggy-bank', rotulo: 'Barato' },
  { icone: 'bi-bookmark', rotulo: 'Quero ir' },
]

export const COR_PADRAO = '#ffd98a'
export const ICONE_PADRAO = 'bi-bookmark'

export const LISTA_VAZIA = { nome: '', descricao: '', cor: COR_PADRAO, icone: 'bi-heart', publica: true }

export function corDaLista(lista) {
  return lista?.cor || COR_PADRAO
}

export function iconeDaLista(lista) {
  return lista?.icone || ICONE_PADRAO
}

export function textoQuantidade(total) {
  if (total === 0) return 'nenhum restaurante'
  return `${total} ${total === 1 ? 'restaurante' : 'restaurantes'}`
}
