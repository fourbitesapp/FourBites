import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import * as api from '../services/apiReal.js'
import Avatar from './Avatar.jsx'

// Conta de usuário: quem começou a seguir você e as avaliações de quem você segue
// Conta de restaurante: o resultado das análises do admin (cadastro e alterações)

const AVISOS_RESTAURANTE = {
  CADASTRO_APROVADO: { icone: 'bi-check-circle', cor: 'var(--fb-verde)', texto: 'foi aprovado e já está no FourBites' },
  CADASTRO_REJEITADO: { icone: 'bi-x-circle', cor: 'var(--fb-vermelho)', texto: 'não foi aprovado' },
  ALTERACAO_APROVADA: { icone: 'bi-check-circle', cor: 'var(--fb-verde)', texto: 'teve as alterações aprovadas' },
  ALTERACAO_REJEITADA: { icone: 'bi-x-circle', cor: 'var(--fb-vermelho)', texto: 'teve as alterações rejeitadas' },
}

export default function Notificacoes() {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState(null) // { novas, itens }
  const [erro, setErro] = useState(null)
  const caixa = useRef(null)

  function carregar() {
    api.listarNotificacoes()
      .then((resposta) => { setDados(resposta); setErro(null) })
      .catch((falha) => setErro(falha.message))
  }

  useEffect(() => {
    carregar()
    const relogio = setInterval(carregar, 120000)
    return () => clearInterval(relogio)
  }, [])

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

  // Abrir o painel marca tudo como visto no back-end. 
  function alternar() {
    const abrindo = !aberto
    setAberto(abrindo)
    if (abrindo && dados?.novas > 0) {
      api.marcarNotificacoesVistas().catch(() => {})
      setDados({ ...dados, novas: 0 })
    }
    if (!abrindo) {
      carregar()
    }
  }

  const novas = dados?.novas || 0

  return (
    <div className="fb-notificacoes" ref={caixa}>
      <button type="button" className="fb-sino fb-icone-nav" aria-haspopup="true" aria-expanded={aberto} onClick={alternar}
        aria-label={novas > 0 ? `Notificações, ${novas} novas` : 'Notificações'}>
        <i className="bi bi-bell" aria-hidden="true"></i>
        {novas > 0 && <span className="fb-sino-contador">{novas > 9 ? '9+' : novas}</span>}
      </button>

      {aberto && (
        <div className="fb-painel-notificacoes" role="dialog" aria-label="Notificações">
          <div className="d-flex justify-content-between align-items-baseline px-2 mb-2">
            <h2 className="mb-0" style={{ fontSize: '1.35rem' }}>Notificações</h2>
            <span className="fb-cartao-meta">últimos 30 dias</span>
          </div>

          {erro && <p className="fb-erro-campo px-2">{erro}</p>}
          {!erro && !dados && <p className="fb-vazio py-3">Carregando…</p>}
          {dados?.itens.length === 0 && (
            <p className="fb-vazio py-3 px-2 mb-0">Nada por aqui ainda.</p>
          )}

          {dados?.itens.map((n, i) => {
            const aviso = AVISOS_RESTAURANTE[n.tipo]
            return (
              <Link key={`${n.tipo}-${n.restauranteId ?? n.usuario?.id}-${n.data}-${i}`} onClick={() => setAberto(false)}
                to={aviso ? '/meus-restaurantes'
                  : n.tipo === 'SEGUIDOR' ? `/perfil/${n.usuario.username}` : `/restaurantes/${n.restauranteId}`}
                className={`fb-notificacao ${n.nova ? 'nova' : ''}`}>
                {aviso ? (
                  <span className="fb-icone-aviso" style={{ color: aviso.cor }}>
                    <i className={`bi ${aviso.icone}`} aria-hidden="true"></i>
                  </span>
                ) : (
                  <Avatar nome={n.usuario.nome} foto={n.usuario.fotoPerfil} />
                )}
                <span className="flex-grow-1">
                  {aviso && (
                    <>
                      {n.tipo.startsWith('CADASTRO') ? 'O cadastro de ' : ''}
                      <strong>{n.restauranteNome}</strong> {aviso.texto}
                      {n.motivo && <span className="d-block mt-1">Motivo: {n.motivo}</span>}
                    </>
                  )}
                  {n.tipo === 'SEGUIDOR' && <><strong>{n.usuario.nome}</strong> começou a seguir você</>}
                  {n.tipo === 'AVALIACAO' && <><strong>{n.usuario.nome}</strong> avaliou <strong>{n.restauranteNome}</strong></>}
                  {n.tipo === 'CURTIDA' && (
                    <><strong>{n.usuario.nome}</strong> curtiu sua avaliação de <strong>{n.restauranteNome}</strong></>
                  )}
                  <span className="d-block fb-cartao-meta mt-0">{tempoAtras(n.data)}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function tempoAtras(dataIso) {
  const minutos = Math.floor((Date.now() - new Date(dataIso).getTime()) / 60000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}
