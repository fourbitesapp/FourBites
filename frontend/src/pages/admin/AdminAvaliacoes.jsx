import { useEffect, useState } from 'react'

import AreaRestrita from '../../components/AreaRestrita.jsx'
import Aviso from '../../components/Aviso.jsx'
import CartaoAvaliacao from '../../components/CartaoAvaliacao.jsx'
import PainelAdmin from '../../components/PainelAdmin.jsx'
import * as api from '../../services/apiReal.js'

// Aba "Avaliações": todas as avaliações (mais recentes primeiro), com busca e exclusão.
// A exclusão é simples, sem motivo, e pede confirmação antes.
export default function AdminAvaliacoes() {
  return (
    <AreaRestrita papel="ADMIN">
      <ModeracaoDeAvaliacoes />
    </AreaRestrita>
  )
}

function ModeracaoDeAvaliacoes() {
  const [busca, setBusca] = useState('')
  const [avaliacoes, setAvaliacoes] = useState(null)
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [confirmandoId, setConfirmandoId] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  // Busca no back-end (restaurante ou quem avaliou) um pouco depois de a pessoa parar de digitar.
  useEffect(() => {
    let cancelada = false
    const espera = setTimeout(() => {
      api.adminListarAvaliacoes(busca.trim())
        .then((lista) => !cancelada && setAvaliacoes(lista))
        .catch((falha) => !cancelada && setErro(falha))
    }, 300)
    return () => {
      cancelada = true
      clearTimeout(espera)
    }
  }, [busca])

  async function excluir(avaliacao) {
    setErro(null)
    setExcluindo(true)
    try {
      await api.adminExcluirAvaliacao(avaliacao.id)
      setAvaliacoes((lista) => lista.filter((a) => a.id !== avaliacao.id))
      setAviso(`Avaliação de ${avaliacao.usuario.nome} sobre ${avaliacao.restaurante.nome} excluída.`)
      setConfirmandoId(null)
    } catch (falha) {
      setErro(falha)
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <PainelAdmin>
      <div style={{ maxWidth: '900px' }}>
        <label className="fb-campo mt-4">
          <i className="bi bi-search" aria-hidden="true"></i>
          <input type="search" placeholder="Buscar por restaurante ou por quem avaliou" aria-label="Buscar avaliações"
            value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <p className="fb-apagado mt-3 mb-4 ms-1" style={{ fontSize: '0.95rem' }}>
          Mais recentes primeiro. Exclua só o que foge da proposta de avaliações orgânicas (propaganda, ofensa,
          conteúdo falso).
        </p>

        <Aviso tipo="info">{aviso}</Aviso>
        <Aviso>{erro?.message}</Aviso>

        {!avaliacoes && !erro && <p className="fb-vazio">Carregando…</p>}
        {avaliacoes?.length === 0 && <p className="fb-vazio">Nenhuma avaliação encontrada.</p>}

        {avaliacoes?.map((a) => {
          const confirmando = confirmandoId === a.id
          return (
            <CartaoAvaliacao key={a.id} avaliacao={a} destaque={confirmando}>
              <div className="d-flex justify-content-end mt-3">
                {confirmando ? (
                  <div className="fb-confirmar" role="alert">
                    <strong>Excluir esta avaliação? Não dá para desfazer.</strong>
                    <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                      onClick={() => setConfirmandoId(null)}>Cancelar</button>
                    <button type="button" className="fb-botao fb-botao-principal fb-botao-pequeno" disabled={excluindo}
                      onClick={() => excluir(a)}>{excluindo ? 'Excluindo…' : 'Excluir'}</button>
                  </div>
                ) : (
                  <button type="button" className="fb-botao fb-botao-contorno fb-botao-pequeno"
                    onClick={() => setConfirmandoId(a.id)}>Excluir</button>
                )}
              </div>
            </CartaoAvaliacao>
          )
        })}
      </div>
    </PainelAdmin>
  )
}
