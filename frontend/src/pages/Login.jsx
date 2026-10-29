import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import TelaAcesso from '../components/TelaAcesso.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { erroDeValidacao, temErros } from '../utils/validacoes.js'

// Tela de entrar
export default function Login() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()

  const [login, setLogin] = useState('') // e-mail ou nome de usuário
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function temPreferencias() {
    try {
      await api.buscarPreferencias()
      return true
    } catch (falha) {
      if (falha.status === 404) {
        return false
      }
      return true
    }
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    const errosNaTela = {
      ...(login.trim() ? {} : { login: 'Informe o e-mail ou o nome de usuário.' }),
      ...(senha ? {} : { senha: 'A senha é obrigatória.' }),
    }
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const usuario = await entrar(login.trim(), senha)
      // Sem página para voltar: restaurante vai para "Meus restaurantes" e admin para o painel.
      const areaDaConta = { RESTAURANTE: '/meus-restaurantes', ADMIN: '/admin' }[usuario.papel] || '/'
      const destino = local.state?.voltarPara || areaDaConta

      // Primeiro acesso: conta USUARIO que ainda não tem preferências vai para a tela de preferências.
      if (usuario.papel === 'USUARIO' && !(await temPreferencias())) {
        navegar('/preferencias', { replace: true, state: { voltarPara: destino } })
      } else {
        navegar(destino, { replace: true })
      }
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TelaAcesso frase="bem-vindo de volta!" titulo="Seu próximo lugar favorito tá aqui.">
      <Link to="/" className="fb-link-discreto"><i className="bi bi-arrow-left" aria-hidden="true"></i> Voltar para o início</Link>

      <div className="fb-abas">
        <span className="fb-aba ativa" aria-current="page">Entrar</span>
        <Link to="/cadastro" className="fb-aba">Criar conta</Link>
      </div>

      <div>
        <h1 className="visually-hidden">Entrar</h1>
        <p className="fb-subtitulo mb-0">O mesmo acesso vale para clientes e restaurantes.</p>
      </div>

      <form onSubmit={aoEnviar} noValidate className="mt-2">
        {!erro && <Aviso tipo="info">{local.state?.aviso}</Aviso>}
        <Aviso>{erro?.message}</Aviso>

        <Campo
          rotulo="E-mail ou nome de usuário" name="login" icone="bi-person" placeholder="seu@email.com ou @usuario"
          autoComplete="username" autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)}
          erro={erro?.campos.login} required
        />

        <div className="mb-2">
          <label htmlFor="senha" className="fb-rotulo">Senha</label>
          <div className={`fb-campo ${erro?.campos.senha ? 'fb-campo-erro' : ''}`}>
            <i className="bi bi-lock" aria-hidden="true"></i>
            <input
              id="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Sua senha"
              autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required
            />
            <button
              type="button" className="fb-campo-acao" onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <i className={mostrarSenha ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true"></i>
            </button>
          </div>
          {erro?.campos.senha && <div className="fb-erro-campo">{erro.campos.senha}</div>}
        </div>
        <div className="text-end">
          <Link to="/esqueci-senha" className="fb-sublinhado-leve small">Esqueci minha senha</Link>
        </div>

        <button type="submit" className="fb-botao fb-botao-principal w-100 mt-4" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="fb-divisor my-2">ou</div>

      <Link to="/explorar" className="fb-botao fb-botao-contorno w-100">Explorar sem entrar</Link>
    </TelaAcesso>
  )
}
