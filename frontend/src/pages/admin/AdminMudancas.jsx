import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import AreaRestrita from '../../components/AreaRestrita.jsx'
import Aviso from '../../components/Aviso.jsx'
import JanelaMotivo from '../../components/JanelaMotivo.jsx'
import MiniRestaurante from '../../components/MiniRestaurante.jsx'
import PainelAdmin from '../../components/PainelAdmin.jsx'
import * as api from '../../services/apiReal.js'
import { formatarData, haQuantoTempo } from '../../utils/formatos.js'
import { diferencas } from '../../utils/restaurantes.js'

// Aba "Mudanças": edições de restaurantes já publicados esperando análise.
// Mostra só os campos que mudaram (versão no site × versão proposta). Aprovar publica a proposta.
export default function AdminMudancas() {
  return (
    <AreaRestrita papel="ADMIN">
      <FilaDeMudancas />
    </AreaRestrita>
  )
}

function FilaDeMudancas() {
  const [parametros, setParametros] = useSearchParams()
  const [fila, setFila] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [formas, setFormas] = useState([])
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    // As categorias e formas de pagamento traduzem os ids da versão proposta em nomes.
    Promise.all([api.adminListarAlteracoes(), api.listarCategorias(), api.listarFormasPagamento()])
      .then(([alteracoes, listaCategorias, listaFormas]) => {
        setFila(alteracoes)
        setCategorias(listaCategorias)
        setFormas(listaFormas)
      })
      .catch(setErro)
  }, [])

  const idEscolhido = Number(parametros.get('id'))
  const escolhida = fila?.find((a) => a.id === idEscolhido) || fila?.[0]

  function tirarDaFila(alteracao, mensagem) {
    setFila((atual) => atual.filter((a) => a.id !== alteracao.id))
    setParametros({}, { replace: true })
    setAviso(mensagem)
    setVersao((v) => v + 1)
  }

  return (
    <PainelAdmin versao={versao}>
      <div className="mt-4">
        <Aviso tipo="info">{aviso}</Aviso>
        <Aviso>{erro?.message}</Aviso>
      </div>

      {!fila && !erro && <p className="fb-vazio">Carregando…</p>}
      {fila?.length === 0 && <p className="fb-vazio">Nenhuma mudança esperando análise. Tudo em dia!</p>}

      {escolhida && (
        <div className="fb-analise">
          <aside className="fb-analise-fila">
            <p className="fb-autor mb-1">
              {fila.length} {fila.length === 1 ? 'mudança esperando' : 'mudanças esperando'} · mais antigas primeiro
            </p>
            {fila.map((a) => (
              <button key={a.id} type="button" className={`fb-fila ${a.id === escolhida.id ? 'ativa' : ''}`}
                aria-current={a.id === escolhida.id} onClick={() => setParametros({ id: a.id })}>
                <MiniRestaurante restaurante={a.restaurante} />
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <strong>{a.restaurante.nome}</strong>
                  <span className="fb-fila-meta">{a.restaurante.categoria?.nome} · {a.restaurante.bairro}</span>
                  <small>enviada {haQuantoTempo(a.dataEnvio)}</small>
                </span>
              </button>
            ))}
            <p className="fb-ajuda ms-1 mt-1">
              São restaurantes já publicados. Enquanto a mudança espera, o site mostra a versão atual.
            </p>
          </aside>

          <DetalheDaMudanca key={escolhida.id} alteracao={escolhida} categorias={categorias} formas={formas}
            aoTerminar={tirarDaFila} />
        </div>
      )}
    </PainelAdmin>
  )
}

function DetalheDaMudanca({ alteracao, categorias, formas, aoTerminar }) {
  const r = alteracao.restaurante
  const proposto = alteracao.proposto
  const [erro, setErro] = useState(null)
  const [aprovando, setAprovando] = useState(false)
  const [recusando, setRecusando] = useState(false)

  const linhas = diferencas(r, proposto, categorias, formas)
  const fotosMudaram = linhas.some((l) => l.campo === 'Fotos')

  async function aprovar() {
    setErro(null)
    setAprovando(true)
    try {
      await api.adminAprovarAlteracao(alteracao.id)
      aoTerminar(alteracao, `As mudanças de ${r.nome} foram publicadas.`)
    } catch (falha) {
      setErro(falha)
      setAprovando(false)
    }
  }

  async function recusar(motivo) {
    await api.adminRejeitarAlteracao(alteracao.id, motivo)
    setRecusando(false)
    aoTerminar(alteracao, `Mudança de ${r.nome} recusada. O site segue com a versão atual.`)
  }

  return (
    <section className="fb-caixa fb-analise-detalhe">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div className="d-flex flex-column gap-2">
          <span className="fb-selo fb-selo-amarelo align-self-start">
            <span className="fb-ponto" aria-hidden="true"></span>Mudança enviada em {formatarData(alteracao.dataEnvio)}
          </span>
          <h2 className="m-0">{r.nome}</h2>
          {r.responsavel && (
            <span style={{ color: 'var(--fb-tinta)' }}>
              Responsável: <strong>{r.responsavel.nome}</strong> · {r.responsavel.email}
            </span>
          )}
        </div>
        <Link to={`/restaurantes/${r.id}`} className="fb-botao fb-botao-claro">Ver página atual</Link>
      </div>

      <div>
        <h3 className="mb-1">O que mudou</h3>
        <p className="fb-apagado mb-2" style={{ fontSize: '0.95rem' }}>Só aparecem os campos diferentes do que está no site.</p>
        {linhas.length === 0 ? (
          <p className="fb-aviso fb-aviso-info">Nenhum campo diferente da versão publicada.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="fb-tabela fb-diferencas">
              <thead>
                <tr>
                  <th scope="col">Campo</th>
                  <th scope="col">Hoje no site</th>
                  <th scope="col">Proposto</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr key={linha.campo}>
                    <th scope="row">{linha.campo}</th>
                    <td className="fb-antes">{linha.antes}</td>
                    <td><span className="fb-depois">{linha.depois}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {fotosMudaram && (
        <div>
          <span className="fb-rotulo-dado">Fotos propostas</span>
          <div className="d-flex flex-wrap gap-2">
            {(proposto.fotos || []).map((url) => (
              <img key={url} src={url} alt="" className={`fb-foto-pequena ${r.fotos.includes(url) ? '' : 'nova'}`}
                title={r.fotos.includes(url) ? '' : 'Foto nova'} />
            ))}
          </div>
        </div>
      )}

      <Aviso>{erro?.message}</Aviso>
      <div className="fb-acoes-analise">
        <button type="button" className="fb-botao fb-botao-contorno" onClick={() => setRecusando(true)}>
          Recusar mudança
        </button>
        <button type="button" className="fb-botao fb-botao-principal" onClick={aprovar} disabled={aprovando}>
          {aprovando ? 'Publicando…' : 'Aprovar e publicar mudança'}
        </button>
      </div>

      {recusando && (
        <JanelaMotivo titulo={`Recusar mudança em ${r.nome}`}
          explicacao="O responsável vê o motivo em “Meus restaurantes”. O site continua com a versão atual."
          botao="Recusar mudança" aoConfirmar={recusar} aoFechar={() => setRecusando(false)} />
      )}
    </section>
  )
}
