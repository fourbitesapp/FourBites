import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Ao trocar de tela, começa do topo
export default function VoltarAoTopo() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}