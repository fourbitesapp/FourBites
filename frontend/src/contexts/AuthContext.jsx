import { createContext, useContext, useEffect, useState } from 'react'

import * as api from '../services/apiReal.js'

// Guarda quem está logado e deixa essa informação disponível para todas as telas.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => api.lerSessao())

  useEffect(() => {
    const encerrar = () => setSessao(null)
    window.addEventListener('fourbites:sessao-encerrada', encerrar)
    return () => window.removeEventListener('fourbites:sessao-encerrada', encerrar)
  }, [])

  async function entrar(email, senha) {
    const resposta = await api.login(email, senha) // { token, usuario }
    api.salvarSessao(resposta)
    setSessao(resposta)
    return resposta.usuario
  }

  // Depois de editar o perfil, atualiza o nome/username/foto guardados na sessão.
  function atualizarUsuario(usuario) {
    const nova = { ...sessao, usuario }
    api.salvarSessao(nova)
    setSessao(nova)
  }

  function sair() {
    api.limparSessao()
    setSessao(null)
  }

  const valor = {
    usuario: sessao?.usuario || null,
    logado: Boolean(sessao?.token),
    entrar,
    sair,
    atualizarUsuario,
  }
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
