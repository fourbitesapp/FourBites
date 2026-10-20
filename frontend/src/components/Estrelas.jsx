export default function Estrelas({ valor, aoMudar, rotulo }) {
  const numeros = [1, 2, 3, 4, 5]

  if (!aoMudar) {
    return (
      <span className="fb-estrelas" aria-label={`${valor} de 5`}>
        {numeros.map((n) => (
          <i key={n} className={n <= Math.round(valor) ? 'bi bi-star-fill' : 'bi bi-star'} aria-hidden="true"></i>
        ))}
      </span>
    )
  }

  return (
    <span className="fb-estrelas fb-estrelas-campo" role="radiogroup" aria-label={rotulo}>
      {numeros.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} de 5`}
          className={n <= valor ? 'cheia' : ''}
          onClick={() => aoMudar(n)}
        >
          ★
        </button>
      ))}
    </span>
  )
}