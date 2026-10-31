import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import * as api from '../services/apiReal.js'
import Avatar from './Avatar.jsx'
import Carrossel from './Carrossel.jsx'
import SeloOficial from './SeloOficial.jsx'

// "Pessoas para seguir" da home (só conta USUARIO). Por enquanto mostra todos os usuários
// que você ainda não segue; o perfil oficial (Farelo) vem primeiro. O botão segue e desfaz na hora.
export default function PessoasParaSeguir() {
  const [pessoas, setPessoas] = useState(null)
  const [seguindo, setSeguindo] = useState({}) // username -> true/false
  const [ocupado, setOcupado] = useState(null)

  useEffect(() => {
    api.listarSugestoesParaSeguir().then(setPessoas).catch(() => setPessoas([]))
  }, [])

  async function alternar(pessoa) {
    const seguirAgora = !seguindo[pessoa.username]
    setOcupado(pessoa.username)
    try {
      await (seguirAgora ? api.seguir(pessoa.username) : api.deixarDeSeguir(pessoa.username))
      setSeguindo((atual) => ({ ...atual, [pessoa.username]: seguirAgora }))
    } catch {
      // se falhar, o botão só continua como estava
    } finally {
      setOcupado(null)
    }
  }

  // Sem ninguém para sugerir, a seção nem aparece.
  if (!pessoas || pessoas.length === 0) return null

  return (
    <section className="fb-conteudo fb-secao pt-0">
      <Carrossel nome="Pessoas para seguir" className="fb-carrossel-pessoas" titulo={
        <div>
          <h2 className="mb-0">Pessoas para seguir</h2>
          <p>Siga quem você conhece e veja as avaliações delas primeiro no seu feed.</p>
        </div>
      }>
        {pessoas.map((p) => {
          const sigo = Boolean(seguindo[p.username])
          return (
            <div key={p.id} className="fb-pessoa-sugerida">
              <Link to={`/perfil/${p.username}`} className="fb-sugestao-perfil">
                <Avatar nome={p.nome} foto={p.fotoPerfil} tamanho="medio" />
                <strong className="text-truncate w-100">
                  {p.nome} {p.oficial && <SeloOficial compacto />}
                </strong>
                <span className="fb-cartao-meta mt-0 text-truncate w-100">@{p.username}</span>
              </Link>
              <button type="button" disabled={ocupado === p.username} onClick={() => alternar(p)}
                className={`fb-botao fb-botao-pequeno w-100 ${sigo ? 'fb-botao-claro' : 'fb-botao-principal'}`}>
                {sigo ? <><i className="bi bi-check-lg" aria-hidden="true"></i> Seguindo</> : 'Seguir'}
              </button>
            </div>
          )
        })}
      </Carrossel>
    </section>
  )
}

