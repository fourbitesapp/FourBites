import { useEffect, useState } from 'react'

import Aviso from './Aviso.jsx'

// Janela para o admin escrever o motivo ao pedir ajustes num cadastro ou recusar uma mudança.
// O motivo é obrigatório (o back-end também exige). aoConfirmar(motivo) faz a chamada à API.
export default function JanelaMotivo({ titulo, explicacao, botao, aoConfirmar, aoFechar }) {
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Esc fecha a janela.
  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [aoFechar])

  async function enviar(evento) {
    evento.preventDefault()
    if (!motivo.trim()) {
      setErro('Escreva o que precisa mudar.')
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      await aoConfirmar(motivo.trim())
    } catch (falha) {
      setErro(falha.campos?.motivo || falha.message)
      setEnviando(false)
    }
  }

  return (
    <div className="fb-janela-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <form className="fb-janela d-flex flex-column gap-3" role="dialog" aria-modal="true" aria-labelledby="titulo-motivo"
        onSubmit={enviar}>
        <span className="fb-mao">quase lá…</span>
        <h2 id="titulo-motivo" className="m-0">{titulo}</h2>
        <p className="m-0">{explicacao}</p>
        <label htmlFor="motivo" className="fb-rotulo mb-0">O que precisa mudar?</label>
        <textarea id="motivo" className="fb-area-texto" rows="4" value={motivo} autoFocus
          onChange={(e) => setMotivo(e.target.value)} />
        <Aviso>{erro}</Aviso>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="fb-botao fb-botao-claro" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="fb-botao fb-botao-principal" disabled={enviando}>
            {enviando ? 'Enviando…' : botao}
          </button>
        </div>
      </form>
    </div>
  )
}
