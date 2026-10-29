import { useEffect, useRef, useState } from 'react'

// Igual ao Seletor (lista oval), mas dá para marcar várias opções. A lista fica aberta enquanto a pessoa marca.
// opcoes: [{ valor, rotulo, icone? }]; marcados: lista de valores; aoMudar(novaLista).
export default function SeletorMultiplo({ rotulo, opcoes, marcados, aoMudar }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)

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

  function alternar(valor) {
    aoMudar(marcados.includes(valor) ? marcados.filter((v) => v !== valor) : [...marcados, valor])
  }

  const quantos = marcados.length

  return (
    <div className="fb-seletor-caixa" ref={caixa}>
      <button type="button" className={`fb-seletor ${quantos > 0 ? 'ativo' : ''}`} aria-haspopup="true"
        aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
        {rotulo}{quantos > 0 && <span className="fb-seletor-contador">{quantos}</span>}
        <i className={`bi ${aberto ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true"></i>
      </button>
      {aberto && (
        <div className="fb-lista-opcoes" role="group" aria-label={rotulo}>
          {opcoes.map((opcao) => {
            const marcada = marcados.includes(opcao.valor)
            return (
              <button key={opcao.valor} type="button" role="checkbox" aria-checked={marcada}
                className={`fb-opcao-lista ${marcada ? 'marcada' : ''}`} onClick={() => alternar(opcao.valor)}>
                <span className="d-flex align-items-center gap-2">
                  {opcao.icone && <i className={`bi ${opcao.icone}`} aria-hidden="true"></i>}
                  {opcao.rotulo}
                </span>
                <i className={`bi ${marcada ? 'bi-check-square-fill' : 'bi-square'}`} aria-hidden="true"></i>
              </button>
            )
          })}
          {quantos > 0 && (
            <button type="button" className="fb-opcao-lista fb-opcao-limpar" onClick={() => aoMudar([])}>
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  )
}
