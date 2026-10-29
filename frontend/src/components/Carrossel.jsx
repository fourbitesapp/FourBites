import { Children, useEffect, useRef, useState } from 'react'

// Fileira que rola para o lado, com as setinhas no topo (como o "Explore por cozinha").
// As setas só aparecem quando os itens não cabem na tela; no computador, com poucos itens, fica igual a uma grade.
// titulo: o <h2> da seção; acoes: links ao lado das setas (ex.: "Gerenciar favoritos");
// className: define a largura dos itens (estilos.css).
export default function Carrossel({ titulo, acoes, nome, className = '', children }) {
  const fileira = useRef(null)
  const [podeVoltar, setPodeVoltar] = useState(false)
  const [podeAvancar, setPodeAvancar] = useState(false)
  const quantidade = Children.count(children)

  function conferirSetas() {
    const el = fileira.current
    if (!el) return
    setPodeVoltar(el.scrollLeft > 4)
    setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  // Confere de novo quando a largura muda (girar o celular, redimensionar a janela) ou chegam itens.
  useEffect(() => {
    conferirSetas()
    const observador = new ResizeObserver(conferirSetas)
    if (fileira.current) observador.observe(fileira.current)
    return () => observador.disconnect()
  }, [quantidade])

  function rolar(direcao) {
    const el = fileira.current
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const temSetas = podeVoltar || podeAvancar

  return (
    <>
      <div className="fb-secao-topo">
        {titulo}
        {(acoes || temSetas) && (
          <div className={`fb-carrossel-acoes d-flex align-items-center gap-3 ${acoes ? '' : 'so-setas'}`}>
            {acoes}
            {temSetas && (
              <div className="d-flex gap-2">
                <button type="button" className="fb-icone-nav" onClick={() => rolar(-1)} disabled={!podeVoltar}
                  aria-label={`${nome}: anteriores`}>
                  <i className="bi bi-chevron-left" aria-hidden="true"></i>
                </button>
                <button type="button" className="fb-icone-nav" onClick={() => rolar(1)} disabled={!podeAvancar}
                  aria-label={`${nome}: próximos`}>
                  <i className="bi bi-chevron-right" aria-hidden="true"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`fb-carrossel ${className}`} ref={fileira} onScroll={conferirSetas}>
        {children}
      </div>
    </>
  )
}

