import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import AreaRestrita from '../components/AreaRestrita.jsx'
import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import IconeCozinha from '../components/IconeCozinha.jsx'
import Rodape from '../components/Rodape.jsx'
import SelosSituacao from '../components/SelosSituacao.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarData, formatarNota } from '../utils/formatos.js'
import { podeEditar } from '../utils/restaurantes.js'

// Área do responsável: a lista dos seus restaurantes, cada um com a situação da análise.
export default function MeusRestaurantes() {
  return (
    <AreaRestrita papel="RESTAURANTE">
      <ListaDeRestaurantes />
    </AreaRestrita>
  )
}

function ListaDeRestaurantes() {
  const { usuario } = useAuth()
  const local = useLocation()
  const [restaurantes, setRestaurantes] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    api.listarMeusRestaurantes().then(setRestaurantes).catch(setErro)
  }, [])

  const primeiroNome = usuario.nome.trim().split(/\s+/)[0]

  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        <div className="fb-secao-topo">
          <div>
            <span className="fb-mao">oi, {primeiroNome}! sua cozinha, seu cantinho</span>
            <h1 className="mt-1">Meus restaurantes</h1>
            <p className="fb-subtitulo" style={{ maxWidth: '36em' }}>
              Cadastre e acompanhe seus restaurantes. Todo cadastro e toda mudança passam pela análise da equipe
              FourBites antes de aparecer no site.
            </p>
          </div>
          <Link to="/meus-restaurantes/novo" className="fb-botao fb-botao-principal">
            <i className="bi bi-plus-lg" aria-hidden="true"></i> Cadastrar restaurante
          </Link>
        </div>

        <Aviso tipo="info">{local.state?.aviso}</Aviso>
        <Aviso>{erro?.message}</Aviso>

        {!restaurantes && !erro && <p className="fb-vazio">Carregando…</p>}

        {restaurantes?.length === 0 && (
          <div className="fb-caixa text-center">
            <span className="fb-mao">a mesa tá posta!</span>
            <h2 className="mt-2">Nenhum restaurante por aqui ainda</h2>
            <p className="fb-apagado">Cadastre o primeiro. Ele aparece no site depois da aprovação da equipe.</p>
            <Link to="/meus-restaurantes/novo" className="fb-botao fb-botao-principal">Cadastrar restaurante</Link>
          </div>
        )}

        <div className="d-flex flex-column gap-4">
          {restaurantes?.map((r) => <CartaoGestao key={r.id} restaurante={r} />)}
        </div>
      </main>
      <Rodape />
    </>
  )
}

// Um restaurante da lista. Os botões e o recado mudam conforme a situação:
// publicado · publicado com mudança em análise · publicado com mudança recusada · em análise · precisa de ajustes.
function CartaoGestao({ restaurante: r }) {
  const alteracao = r.alteracaoPendente
  const publicado = r.status === 'APROVADO'
  const editavel = podeEditar(r)
  const precisaAtencao = r.status === 'REJEITADO'

  const categoria = r.categoria ? r.categoria.nome : `Categoria sugerida: ${r.categoriaSugerida}`

  let textoEditar = 'Editar'
  if (r.status === 'REJEITADO') textoEditar = 'Corrigir e reenviar'
  else if (alteracao?.status === 'REJEITADO') textoEditar = 'Editar de novo'

  return (
    <article className={`fb-cartao-gestao ${precisaAtencao ? 'atencao' : ''}`}>
      <div className="fb-gestao-foto" style={{ background: corDaCozinha(r.categoria) }} aria-hidden="true">
        {r.fotoCapa ? <img src={r.fotoCapa} alt="" /> : <IconeCozinha nome={r.categoria?.nome} icone={r.categoria?.icone} tamanho={52} />}
      </div>

      <div className="fb-gestao-info">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2>{r.nome}</h2>
          <SelosSituacao restaurante={r} visao="responsavel" />
        </div>
        <span className="fb-apagado">{categoria} · {r.faixaPreco} · {r.bairro}, {r.cidade}</span>

        {publicado && (
          <span className="fb-autor">
            {r.totalAvaliacoes > 0
              ? <><span className="fb-texto-destaque">★ {formatarNota(r.notaMedia)}</span> · {r.totalAvaliacoes} {r.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}</>
              : <span className="fb-apagado">Ainda sem avaliações</span>}
          </span>
        )}

        {r.status === 'PENDENTE' && (
          <p className="fb-recado">
            Enviado em {formatarData(r.dataEnvio)}. Assim que a equipe aprovar, o restaurante aparece no site.
            A edição fica liberada depois da análise.
          </p>
        )}
        {r.status === 'REJEITADO' && (
          <div className="fb-recado fb-recado-vermelho">
            <strong>O que a equipe pediu:</strong>
            {r.motivoRejeicao}
          </div>
        )}
        {publicado && alteracao?.status === 'PENDENTE' && (
          <p className="fb-recado">
            Você enviou mudanças em {formatarData(alteracao.dataEnvio)}. O site continua mostrando a versão antiga até
            a equipe aprovar. Enquanto isso, não dá para editar de novo.
          </p>
        )}
        {publicado && alteracao?.status === 'REJEITADO' && (
          <div className="fb-recado fb-recado-vermelho">
            <strong>Sua última mudança não foi aprovada:</strong>
            {alteracao.motivoRejeicao} O site segue com a versão anterior.
          </div>
        )}
        {publicado && !r.ativo && (
          <p className="fb-recado">A equipe FourBites escondeu este restaurante das buscas por enquanto.</p>
        )}
      </div>

      <div className="fb-gestao-acoes">
        {publicado && <Link to={`/restaurantes/${r.id}`} className="fb-botao fb-botao-claro">Ver página</Link>}
        {editavel ? (
          <Link to={`/meus-restaurantes/${r.id}/editar`} className="fb-botao fb-botao-principal">{textoEditar}</Link>
        ) : (
          <button type="button" className="fb-botao fb-botao-claro" disabled>Editar</button>
        )}
      </div>
    </article>
  )
}
