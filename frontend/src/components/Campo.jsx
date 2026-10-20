// Campo de formulário
export default function Campo({ rotulo, icone, erro, ajuda, ...propriedades }) {
  const id = propriedades.id || propriedades.name

  return (
    <div className="mb-4">
      <label htmlFor={id} className="fb-rotulo">{rotulo}</label>
      <div className={`fb-campo ${erro ? 'fb-campo-erro' : ''}`}>
        {icone && <i className={`bi ${icone}`} aria-hidden="true"></i>}
        <input id={id} aria-invalid={Boolean(erro)} {...propriedades} />
      </div>
      {erro ? <div className="fb-erro-campo">{erro}</div> : ajuda && <div className="fb-ajuda">{ajuda}</div>}
    </div>
  )
}