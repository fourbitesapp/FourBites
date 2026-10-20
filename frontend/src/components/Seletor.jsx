import { useEffect, useRef, useState } from 'react'

// Lista de escolha oval, no lugar do <select> do navegador (que não dá para estilizar e fica azul).
// opcoes: [{ valor, rotulo, cor? }]. O primeiro item costuma ser o "todos" (valor '').
export default function Seletor({ rotulo, valor, opcoes, aoMudar }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)
  const escolhida = opcoes.find((o) => String(o.valor) === String(valor)) || opcoes[0]
  const temValor = valor !== '' && valor !== null && valor !== undefined

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!aberto) return
    function fora(evento) {
      if (caixa.current && !caixa.current.contains(evento.target)) setAberto(false)
    }
    function tecla(evento) {
      if (evento.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', tecla)
    }
  }, [aberto])

  function escolher(opcao) {
    aoMudar(opcao.valor)
    setAberto(false)
  }

  return (
    <div className="fb-seletor-caixa" ref={caixa}>
      <button type="button" className={`fb-seletor ${temValor ? 'ativo' : ''}`} aria-haspopup="listbox"
        aria-expanded={aberto} aria-label={rotulo} onClick={() => setAberto(!aberto)}>
        {escolhida.rotulo}
        <i className={`bi ${aberto ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true"></i>
      </button>
      {aberto && (
        <ul className="fb-lista-opcoes" role="listbox" aria-label={rotulo}>
          {opcoes.map((opcao) => {
            const marcada = String(opcao.valor) === String(valor)
            return (
              <li key={String(opcao.valor)}>
                <button type="button" role="option" aria-selected={marcada}
                  className={`fb-opcao-lista ${marcada ? 'marcada' : ''}`} onClick={() => escolher(opcao)}>
                  <span className="d-flex align-items-center gap-2">
                    {opcao.cor && <span className="fb-bolinha" style={{ background: opcao.cor }}></span>}
                    {opcao.rotulo}
                  </span>
                  {marcada && <i className="bi bi-check-lg" aria-hidden="true"></i>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
