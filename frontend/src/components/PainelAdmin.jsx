import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import * as api from '../services/apiReal.js'
import BarraNavegacao from './BarraNavegacao.jsx'
import Rodape from './Rodape.jsx'

// Molde das telas do admin: título, as cinco abas e o conteúdo da aba.
// As abas Cadastros e Mudanças mostram quantos itens estão esperando.
// "versao" muda quando a página aprova ou recusa algo, para os contadores serem buscados de novo.
// Cada página do admin fica dentro de <AreaRestrita papel="ADMIN">, que confere o login antes.
export default function PainelAdmin({ versao = 0, children }) {
  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        <span className="fb-mao">cuidando da casa</span>
        <h1 className="mt-1">Painel do admin</h1>
        <p className="fb-subtitulo mb-0">Analise cadastros e mudanças e mantenha as avaliações confiáveis.</p>
        <AbasDoPainel versao={versao} />
        {children}
      </main>
      <Rodape />
    </>
  )
}

function AbasDoPainel({ versao }) {
  const [contagem, setContagem] = useState({ cadastros: 0, mudancas: 0 })

  useEffect(() => {
    let cancelada = false
    Promise.all([api.adminListarRestaurantes({ status: 'PENDENTE' }), api.adminListarAlteracoes()])
      .then(([cadastros, mudancas]) => {
        if (!cancelada) setContagem({ cadastros: cadastros.length, mudancas: mudancas.length })
      })
      .catch(() => {}) // os contadores são só um extra; se falhar, as abas aparecem sem número
    return () => {
      cancelada = true
    }
  }, [versao])

  const abas = [
    ['/admin/cadastros', 'Cadastros', contagem.cadastros],
    ['/admin/mudancas', 'Mudanças', contagem.mudancas],
    ['/admin/restaurantes', 'Restaurantes'],
    ['/admin/avaliacoes', 'Avaliações'],
    ['/admin/categorias', 'Categorias'],
  ]

  return (
    <nav className="fb-abas-painel" aria-label="Seções do painel">
      {abas.map(([caminho, nome, numero]) => (
        <NavLink key={caminho} to={caminho} className="fb-aba-painel">
          {nome}
          {numero > 0 && <span className="fb-contador" aria-label={`${numero} esperando`}>{numero}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
