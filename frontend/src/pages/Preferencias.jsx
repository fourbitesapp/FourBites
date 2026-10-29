import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import CamposPreferencias, { PREFERENCIAS_VAZIAS } from '../components/CamposPreferencias.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'

// Preferências da recomendação. Abre sozinha no primeiro acesso e pelo botão "Ajustar preferências" do perfil.
export default function Preferencias() {
  const { usuario, logado } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()
  const destino = local.state?.voltarPara || '/'

  const [categorias, setCategorias] = useState([])
  const [dados, setDados] = useState(PREFERENCIAS_VAZIAS)
  const [primeiroAcesso, setPrimeiroAcesso] = useState(true)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  const podeUsar = logado && usuario?.papel === 'USUARIO'

  // Ao abrir: carrega as categorias e, se o usuário já tiver preferências, preenche a tela com elas.
  useEffect(() => {
    if (!podeUsar) {
      return
    }
    async function carregar() {
      try {
        setCategorias(await api.listarCategorias())
        try {
          setDados(await api.buscarPreferencias())
          setPrimeiroAcesso(false)
        } catch (falha) {
          if (falha.status !== 404) throw falha
        }
      } catch (falha) {
        setErro(falha)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [podeUsar])

  // Visitante vai para o login; restaurante e admin não têm preferências.
  if (!logado) {
    return <Navigate to="/login" replace state={{ voltarPara: '/preferencias' }} />
  }
  if (!podeUsar) {
    return <Navigate to="/" replace />
  }

  async function salvar(preferencias) {
    setErro(null)
    setEnviando(true)
    try {
      await api.salvarPreferencias(preferencias)
      navegar(destino, { replace: true })
    } catch (falha) {
      setErro(falha)
      setEnviando(false)
    }
  }

  return (
    <>
      <BarraNavegacao />
      <main className="fb-pagina-media">
        <div className="mb-5">
          <span className="fb-mao">só leva um minutinho</span>
          <h1 className="mt-1">Do que você gosta de comer?</h1>
          <p className="fb-subtitulo mb-0" style={{ maxWidth: '40em' }}>
            Usamos isso para calcular a compatibilidade e recomendar restaurantes. Você pode mudar quando quiser.
          </p>
        </div>

        <Aviso>{erro?.message}</Aviso>

        {carregando ? (
          <p className="fb-vazio">Carregando…</p>
        ) : (
          <>
            <CamposPreferencias categorias={categorias} dados={dados} aoMudar={setDados} />

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-3 mt-5">
              {primeiroAcesso && (
                <button type="button" className="fb-botao fb-botao-claro" disabled={enviando}
                  onClick={() => salvar(PREFERENCIAS_VAZIAS)}>
                  Pular por enquanto
                </button>
              )}
              <button type="button" className="fb-botao fb-botao-principal" disabled={enviando}
                onClick={() => salvar(dados)}>
                {enviando ? 'Salvando…' : primeiroAcesso ? 'Salvar e começar' : 'Salvar preferências'}
                {!enviando && <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>}
              </button>
            </div>

            {primeiroAcesso && (
              <p className="fb-ajuda text-end mt-3">
                Se pular, mostramos os restaurantes mais bem avaliados até você ter preferências ou avaliações.
              </p>
            )}
          </>
        )}
      </main>
      <Rodape />
    </>
  )
}

