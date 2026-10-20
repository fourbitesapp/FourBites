// Capas do perfil. O back-end guarda só o código 

export const CORES_DE_CAPA = [
  { codigo: 'vermelha', nome: 'Vermelha', fundo: '#d9232c', texto: '#ffffff', bolhas: ['#ffbe3b', '#ff8fa9', '#7fd1a3'] },
  { codigo: 'amarela', nome: 'Amarela', fundo: '#ffbe3b', texto: '#241612', bolhas: ['#d9232c', '#fff4e6', '#ff8fa9'] },
  { codigo: 'verde', nome: 'Verde', fundo: '#2e9e66', texto: '#ffffff', bolhas: ['#ffbe3b', '#ddf3e6', '#ff8fa9'] },
  { codigo: 'azul', nome: 'Azul', fundo: '#3b7db5', texto: '#ffffff', bolhas: ['#ffbe3b', '#b5dcf8', '#ff8fa9'] },
  { codigo: 'rosa', nome: 'Rosa', fundo: '#f2668b', texto: '#ffffff', bolhas: ['#ffbe3b', '#ffe3e1', '#7fd1a3'] },
  { codigo: 'chocolate', nome: 'Chocolate', fundo: '#5a3324', texto: '#ffffff', bolhas: ['#ffbe3b', '#d9232c', '#ffc193'] },
]

export const FRASES_DE_CAPA = [
  { codigo: 'come-bem', texto: 'perfil de quem come bem' },
  { codigo: 'sempre-fome', texto: 'sempre com fome' },
  { codigo: 'lugar-novo', texto: 'caçando lugar novo pra comer' },
  { codigo: 'sobremesa', texto: 'sobremesa primeiro, sempre' },
  { codigo: 'critico', texto: 'crítico gastronômico de sofá' },
  { codigo: 'mais-um', texto: 'só mais um pedacinho' },
]

// Se o código não existir (ou vier vazio), usa a primeira opção.
export function corDaCapa(codigo) {
  return CORES_DE_CAPA.find((c) => c.codigo === codigo) || CORES_DE_CAPA[0]
}

export function fraseDaCapa(codigo) {
  return (FRASES_DE_CAPA.find((f) => f.codigo === codigo) || FRASES_DE_CAPA[0]).texto
}