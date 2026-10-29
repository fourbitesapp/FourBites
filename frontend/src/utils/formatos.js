// Pequenas funções de apresentação usadas em mais de uma tela.

export function formatarNota(nota, casas = 1) {
  if (nota === null || nota === undefined) {
    return '—'
  }
  return Number(nota).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

export function formatarData(dataIso) {
  return new Date(dataIso).toLocaleDateString('pt-BR')
}

export function iniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] || ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

const NOMES_DOS_DIAS = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export function agruparHorarios(horarios) {
  const linhas = []
  for (let dia = 1; dia <= 7; dia++) {
    const doDia = horarios.filter((h) => h.diaSemana === dia)
    linhas.push({
      dia: NOMES_DOS_DIAS[dia],
      periodos: doDia.length ? doDia.map((h) => `${h.abertura}–${h.fechamento}`).join(' · ') : 'Fechado',
    })
  }
  return linhas
}

function emMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number)
  return horas * 60 + minutos
}

export function estaAberto(horarios, agora = new Date()) {
  const diaJs = agora.getDay() 
  const hoje = diaJs === 0 ? 7 : diaJs
  const ontem = hoje === 1 ? 7 : hoje - 1
  const minutoAtual = agora.getHours() * 60 + agora.getMinutes()

  return horarios.some((h) => {
    const abre = emMinutos(h.abertura)
    const fecha = emMinutos(h.fechamento)
    const viraONoite = fecha <= abre

    if (h.diaSemana === hoje) {
      return viraONoite ? minutoAtual >= abre : minutoAtual >= abre && minutoAtual < fecha
    }
    return h.diaSemana === ontem && viraONoite && minutoAtual < fecha
  })
}

// "enviado hoje", "há 1 dia", "há 5 dias" (filas do admin).
export function haQuantoTempo(dataIso) {
  const dias = Math.floor((Date.now() - new Date(dataIso).getTime()) / 86400000)
  if (dias <= 0) return 'hoje'
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}
