import { useNavigate } from 'react-router-dom'

// Volta para a tela anterior
export default function BotaoVoltar({ destino = '/', className = 'fb-icone-nav' }) {
  const navegar = useNavigate()

  function voltar() {
    if (window.history.state?.idx > 0) {
      navegar(-1)
    } else {
      navegar(destino)
    }
  }

  return (
    <button type="button" className={className} onClick={voltar} aria-label="Voltar" title="Voltar">
      <i className="bi bi-arrow-left" aria-hidden="true"></i>
    </button>
  )
}