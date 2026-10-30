// Cor e ícone de cada cozinha nas telas

// Tons claros, para o texto escuro continuar legível em cima. Também são as opções de cor do admin
export const CORES = [
  '#ffd98a', // amarelo
  '#a8e2c2', // verde
  '#ffb8c8', // rosa
  '#ffc193', // laranja
  '#b5dcf8', // azul
  '#d9eda3', // verde-limão
  '#d8c4f5', // lilás
  '#ffe8a3', // creme
  '#9fe0dd', // turquesa
  '#f6c6a8', // pêssego
]

// Desenhos simples , um por cozinha
const ICONES = {
  // panela com vapor
  brasileira: 'M4 9h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM2 10h2M20 10h2M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2',
  // prato de macarrão com garfo
  italiana: 'M3 11h18a9 7 0 0 1-18 0ZM7 8c1-2 2 0 3-2s2 0 3-2s2 0 3-2M17 3l2 8',
  // sushi enrolado e hashis
  japonesa: 'M5 12a7 3 0 0 1 14 0v4a7 3 0 0 1-14 0ZM5 12a7 3 0 0 0 14 0M10 12a2 1 0 0 0 4 0M14 3l7 4M12 5l7 4',
  // hambúrguer
  hamburguer: 'M4 10a8 5 0 0 1 16 0ZM3 13h18M4 16h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z',
  // fatia de pizza
  pizzaria: 'M12 21 3 6a15 15 0 0 1 18 0ZM9 9h.01M14 10h.01M12 14h.01',
  // esfiha aberta (triângulo com recheio)
  arabe: 'M12 4 3 19h18ZM12 10l-3.5 6h7Z',
  // taco
  mexicana: 'M3 18a9 9 0 0 1 18 0ZM6 13c1-1.5 2 0 3-1.5s2 0 3-1.5 2 0 3 1.5 2 0 3 1.5',
  // caixinha de comida chinesa
  chinesa: 'M5 9h14l-2 11H7ZM5 9l2-4h10l2 4M9 5l1 4M15 5l-1 4',
  // folha
  'vegana e vegetariana': 'M5 19c0-8 6-14 15-14 0 9-6 15-14 15ZM5 19l8-8',
  // peixe
  'frutos do mar': 'M3 12c3-4 7-5 11-3l5-3v12l-5-3c-4 2-8 1-11-3ZM8 11h.01',
  // espeto de churrasco
  churrascaria: 'M3 21 21 3M6 12l6 6M9 9l6 6M12 6l6 6',
  // xícara de café
  cafeteria: 'M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5ZM16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3',
  // cupcake
  doceria: 'M6 13h12l-2 7H8ZM5 13a7 5 0 0 1 14 0M12 5v3M12 4h.01',
  // cachorro-quente
  lanchonete: 'M3 14h18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3ZM4 13a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3M6 12c2-1.5 4 1.5 6 0s4 1.5 6 0',
  // tigela de ceviche com limão
  peruana: 'M3 13h18a9 7 0 0 1-18 0ZM9 10a3 3 0 0 1 6 0M12 7v3',
  // caneca de chope com espuma
  bar: 'M6 8h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2ZM15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M6 8a2.5 2.5 0 0 1 3-3 3 3 0 0 1 5 0 2 2 0 0 1 1 3M9.5 12v6M12 12v6',
}

// Categorias criadas depois pelo admin: tenta achar o desenho por uma palavra do nome.
const PALAVRAS = [
  ['pizza', 'pizzaria'], ['sushi', 'japonesa'], ['japon', 'japonesa'], ['burger', 'hamburguer'],
  ['lanche', 'lanchonete'], ['cafe', 'cafeteria'], ['doce', 'doceria'], ['sorvete', 'doceria'],
  ['vegan', 'vegana e vegetariana'], ['vegetar', 'vegana e vegetariana'], ['peixe', 'frutos do mar'],
  ['mar', 'frutos do mar'], ['churras', 'churrascaria'], ['carne', 'churrascaria'], ['massa', 'italiana'],
  ['boteco', 'bar'], ['choperia', 'bar'], ['pub', 'bar'], ['cervej', 'bar'],
]

// Prato com talheres: quando nada combina.
const PRATO = 'M3 12h18a9 7 0 0 1-18 0ZM12 5v2M8 6l1 2M16 6l-1 2'

function simplificar(texto) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

// Opções de desenho para o admin escolher 
export const OPCOES_DE_ICONE = [
  ...Object.keys(ICONES).map((chave) => ({ chave, rotulo: chave.charAt(0).toUpperCase() + chave.slice(1) })),
  { chave: 'prato', rotulo: 'Prato' },
]

// Recebe a categoria ({ id, nome, cor, icone }) ou só o id.
// Com cor escolhida pelo admin, usa ela; senão, a paleta pelo id.
export function corDaCozinha(categoria) {
  if (categoria && typeof categoria === 'object') {
    return categoria.cor || CORES[(Number(categoria.id) || 0) % CORES.length]
  }
  return CORES[(Number(categoria) || 0) % CORES.length]
}

// icone = desenho escolhido pelo admin (pode vir vazio); sem ele, procura pelo nome da cozinha.
export function iconeDaCozinha(nome, icone) {
  if (icone === 'prato') return PRATO
  if (icone && ICONES[icone]) return ICONES[icone]
  const chave = simplificar(nome || '')
  if (ICONES[chave]) return ICONES[chave]
  const parecida = PALAVRAS.find(([palavra]) => chave.includes(palavra))
  return parecida ? ICONES[parecida[1]] : PRATO
}
