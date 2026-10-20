// Cor e ícone de cada cozinha nas telas

const CORES = ['#ffd98a', '#a8e2c2', '#ffb8c8', '#ffc193', '#b5dcf8', '#d9eda3']

// Desenhos simples
const ICONES = {
  brasileira: 'M4 9h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM2 10h2M20 10h2M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2',
  italiana: 'M3 11h18a9 7 0 0 1-18 0ZM7 8c1-2 2 0 3-2s2 0 3-2s2 0 3-2M17 3l2 8',
  japonesa: 'M3 12h18a9 7 0 0 1-18 0ZM13 3l-3 7M19 4l-5 6',
  hamburguer: 'M4 10a8 5 0 0 1 16 0ZM3 13h18M4 16h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z',
  pizzaria: 'M12 21 3 6a15 15 0 0 1 18 0ZM9 9h.01M14 10h.01M12 14h.01',
  vegana: 'M5 19c0-8 6-14 15-14 0 9-6 15-14 15ZM5 19l8-8',
}
const PRATO = 'M3 12h18a9 7 0 0 1-18 0ZM12 5v2M8 6l1 2M16 6l-1 2'

function simplificar(texto) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

export function corDaCozinha(id) {
  return CORES[(Number(id) || 0) % CORES.length]
}

export function iconeDaCozinha(nome) {
  return ICONES[simplificar(nome || '')] || PRATO
}