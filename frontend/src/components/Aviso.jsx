// Faixa de mensagem: erro (padrão) ou informação.
export default function Aviso({ tipo = 'erro', children }) {
  if (!children) {
    return null
  }
  return (
    <div className={`fb-aviso fb-aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}