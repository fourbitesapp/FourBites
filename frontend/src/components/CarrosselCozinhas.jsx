import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { corDaCozinha } from '../utils/cozinhas.js'
import IconeCozinha from './IconeCozinha.jsx'

// "Explore por cozinha" do início
export default function CarrosselCozinhas({ categorias }) {
  const fileira = useRef(null)
  const [podeVoltar, setPodeVoltar] = useState(false)
  const [podeAvancar, setPodeAvancar] = useState(false)

  function conferirSetas() {
    const el = fileira.current
    if (!el) return
    setPodeVoltar(el.scrollLeft > 4)
    setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    conferirSetas()
    window.addEventListener('resize', conferirSetas)
    return () => window.removeEventListener('resize', conferirSetas)
  }, [categorias])

  function rolar(direcao) {
    const el = fileira.current
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (categorias.length === 0) return null

  return (
    <section className="fb-conteudo">
      <div className="fb-secao-topo mt-4">
        <h2 className="mb-0">Explore por cozinha</h2>
        <div className="d-flex gap-2">
          <button type="button" className="fb-icone-nav" onClick={() => rolar(-1)} disabled={!podeVoltar}
            aria-label="Cozinhas anteriores">
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          <button type="button" className="fb-icone-nav" onClick={() => rolar(1)} disabled={!podeAvancar}
            aria-label="Mais cozinhas">
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div className="fb-cozinhas" ref={fileira} onScroll={conferirSetas}>
        {categorias.map((c) => (
          <Link key={c.id} to={`/explorar?categoriaId=${c.id}`} className="fb-cozinha"
            style={{ background: corDaCozinha(c.id) }}>
            <IconeCozinha nome={c.nome} tamanho={44} />
            <span className="fb-cozinha-nome">{c.nome}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
