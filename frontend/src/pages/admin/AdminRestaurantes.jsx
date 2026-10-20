import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import AreaRestrita from '../../components/AreaRestrita.jsx'
import Aviso from '../../components/Aviso.jsx'
import Interruptor from '../../components/Interruptor.jsx'
import MiniRestaurante from '../../components/MiniRestaurante.jsx'
import PainelAdmin from '../../components/PainelAdmin.jsx'
import SelosSituacao from '../../components/SelosSituacao.jsx'
import * as api from '../../services/apiReal.js'
import { nomeDaCategoria } from '../../utils/restaurantes.js'

const FILTROS = [
  ['', 'Todos'],
  ['APROVADO', 'Publicados'],
  ['PENDENTE', 'Em análise'],
  ['REJEITADO', 'Precisam de ajustes'],
]

// Aba "Restaurantes": todos os restaurantes, com busca, filtro por situação e o liga/desliga "visível no site".
export default function AdminRestaurantes() {
  return (
    <AreaRestrita papel="ADMIN">
      <TodosOsRestaurantes />
    </AreaRestrita>
  )
}

function TodosOsRestaurantes() {
  const local = useLocation()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('')
  const [restaurantes, setRestaurantes] = useState(null)
  const [erro, setErro] = useState(null)
  const [mudandoId, setMudandoId] = useState(null)

  // Busca no back-end (nome, bairro, categoria) um pouco depois de a pessoa parar de digitar.
  useEffect(() => {
    let cancelada = false
    const espera = setTimeout(() => {
      api.adminListarRestaurantes({ busca: busca.trim() })
        .then((lista) => !cancelada && setRestaurantes(lista))
        .catch((falha) => !cancelada && setErro(falha))
    }, 300)
    return () => {
      cancelada = true
      clearTimeout(espera)
    }
  }, [busca])

  async function alterarVisivel(restaurante, ativo) {
    setErro(null)
    setMudandoId(restaurante.id)
    try {
      const atualizado = await api.adminAlterarAtivo(restaurante.id, ativo)
      setRestaurantes((lista) => lista.map((r) => (r.id === atualizado.id ? { ...r, ativo: atualizado.ativo } : r)))
    } catch (falha) {
      setErro(falha)
    } finally {
      setMudandoId(null)
    }
  }

  const contar = (status) => (restaurantes || []).filter((r) => !status || r.status === status).length
  const visiveis = (restaurantes || []).filter((r) => !filtro || r.status === filtro)

  return (
    <PainelAdmin>
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        <label className="fb-campo flex-grow-1" style={{ flexBasis: '320px' }}>
          <i className="bi bi-search" aria-hidden="true"></i>
          <input type="search" placeholder="Buscar por nome, bairro ou categoria" aria-label="Buscar restaurantes"
            value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <Link to="/admin/restaurantes/novo" className="fb-botao fb-botao-principal">
          <i className="bi bi-plus-lg" aria-hidden="true"></i> Cadastrar restaurante
        </Link>
      </div>

      <div role="group" aria-label="Filtrar por situação" className="d-flex flex-wrap gap-2 mt-3">
        {FILTROS.map(([status, nome]) => (
          <button key={nome} type="button" className="fb-filtro" aria-pressed={filtro === status}
            onClick={() => setFiltro(status)}>
            {nome} · {contar(status)}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <Aviso tipo="info">{local.state?.aviso}</Aviso>
        <Aviso>{erro?.message}</Aviso>
      </div>

      <section className="fb-caixa mt-3" style={{ padding: '0.75rem 1.75rem', overflowX: 'auto' }}>
        {!restaurantes && !erro && <p className="fb-vazio">Carregando…</p>}
        {restaurantes && visiveis.length === 0 && <p className="fb-vazio">Nenhum restaurante encontrado.</p>}
        {visiveis.length > 0 && (
          <table className="fb-tabela" style={{ minWidth: '820px' }}>
            <thead>
              <tr>
                <th scope="col">Restaurante</th>
                <th scope="col">Responsável</th>
                <th scope="col">Situação</th>
                <th scope="col">No site</th>
                <th scope="col"><span className="visually-hidden">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="d-flex align-items-center gap-3">
                      <MiniRestaurante restaurante={r} pequeno />
                      <span>
                        <strong className="d-block fs-6">{r.nome}</strong>
                        <span className="fb-apagado small">{nomeDaCategoria(r)} · {r.bairro}</span>
                      </span>
                    </span>
                  </td>
                  <td>{r.responsavel ? r.responsavel.nome : <span className="fb-apagado">cadastrado pelo admin</span>}</td>
                  <td><span className="d-flex flex-wrap gap-1"><SelosSituacao restaurante={r} visao="admin" /></span></td>
                  <td>
                    {r.status === 'APROVADO' ? (
                      <Interruptor ligado={r.ativo} textoLigado="Visível" textoDesligado="Escondido"
                        rotulo={`${r.nome} visível no site`} desativado={mudandoId === r.id}
                        aoMudar={(ativo) => alterarVisivel(r, ativo)} />
                    ) : (
                      <span className="fb-apagado small">depois da aprovação</span>
                    )}
                  </td>
                  <td className="text-end">
                    {r.status === 'PENDENTE' ? (
                      <Link to={`/admin/cadastros?id=${r.id}`} className="fb-botao fb-botao-claro fb-botao-pequeno">Analisar</Link>
                    ) : (
                      <Link to={`/restaurantes/${r.id}`} className="fb-botao fb-botao-claro fb-botao-pequeno">Ver</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <p className="fb-ajuda ms-1 mt-3">
        “Escondido” tira o restaurante das buscas e da página pública, sem apagar avaliações. Dá para mostrar de novo a
        qualquer hora.
      </p>
    </PainelAdmin>
  )
}
