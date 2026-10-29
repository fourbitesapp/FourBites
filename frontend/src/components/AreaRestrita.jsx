import { Link, Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext.jsx'
import Aviso from './Aviso.jsx'
import BarraNavegacao from './BarraNavegacao.jsx'
import Rodape from './Rodape.jsx'

const NOME_DA_AREA = {
  RESTAURANTE: 'contas de restaurante',
  ADMIN: 'a equipe FourBites',
}

// Só mostra a tela para quem tem o papel certo (RESTAURANTE ou ADMIN).
// Sem login: vai para a tela de entrar e volta para cá depois.
// O back-end também confere o papel em cada chamada; isto aqui só evita mostrar uma tela que não vai funcionar.
export default function AreaRestrita({ papel, children }) {
  const { usuario, logado } = useAuth()
  const local = useLocation()

  if (!logado) {
    return (
      <Navigate to="/login" replace
        state={{ voltarPara: local.pathname, aviso: 'Entre com a sua conta para continuar.' }} />
    )
  }

  if (usuario.papel !== papel) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-pagina-media">
          <Aviso tipo="info">Esta área é só para {NOME_DA_AREA[papel]}.</Aviso>
          <Link to="/" className="fb-link">Voltar para o início</Link>
        </main>
        <Rodape />
      </>
    )
  }

  return children
}
