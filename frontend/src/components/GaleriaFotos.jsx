import { useEffect, useState } from 'react'

// Fotos do restaurante no topo da página.
// Mostra até 5 na grade (a primeira grande); se tiver mais, a última ganha um "+N".
// Clicar numa foto abre a foto inteira (sem corte), com setas para passar as outras.

const NA_GRADE = 5

export default function GaleriaFotos({ fotos, nome }) {
  const [aberta, setAberta] = useState(null) // índice da foto aberta, ou null

  const visiveis = fotos.slice(0, NA_GRADE)
  const restantes = fotos.length - visiveis.length

  return (
    <>
      <div className={`fb-galeria fb-galeria-${visiveis.length}`}>
        {visiveis.map((url, i) => (
          <button key={url} type="button" className="fb-galeria-foto" onClick={() => setAberta(i)}
            aria-label={`Ver foto ${i + 1} de ${fotos.length}${nome ? ` de ${nome}` : ''}`}>
            <img src={url} alt="" />
            {restantes > 0 && i === visiveis.length - 1 && (
              <span className="fb-galeria-mais">+{restantes}</span>
            )}
          </button>
        ))}
      </div>

      {aberta !== null && (
        <VisorFotos fotos={fotos} inicio={aberta} aoFechar={() => setAberta(null)} />
      )}
    </>
  )
}

function VisorFotos({ fotos, inicio, aoFechar }) {
  const [atual, setAtual] = useState(inicio)
  const total = fotos.length
  const anterior = () => setAtual((i) => (i - 1 + total) % total)
  const proxima = () => setAtual((i) => (i + 1) % total)

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') aoFechar()
      if (evento.key === 'ArrowLeft') anterior()
      if (evento.key === 'ArrowRight') proxima()
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [aoFechar])

  return (
    <div className="fb-janela-fundo fb-visor" role="dialog" aria-modal="true" aria-label="Fotos do restaurante" onClick={aoFechar}>
      <button type="button" className="fb-visor-fechar" onClick={aoFechar} aria-label="Fechar">
        <i className="bi bi-x-lg" aria-hidden="true"></i>
      </button>

      <img src={fotos[atual]} alt={`Foto ${atual + 1} de ${total}`} className="fb-visor-foto" onClick={(e) => e.stopPropagation()} />

      {total > 1 && (
        <>
          <button type="button" className="fb-visor-seta fb-visor-anterior" aria-label="Foto anterior"
            onClick={(e) => { e.stopPropagation(); anterior() }}>
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          <button type="button" className="fb-visor-seta fb-visor-proxima" aria-label="Próxima foto"
            onClick={(e) => { e.stopPropagation(); proxima() }}>
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
          <span className="fb-visor-contador">{atual + 1} / {total}</span>
        </>
      )}
    </div>
  )
}
