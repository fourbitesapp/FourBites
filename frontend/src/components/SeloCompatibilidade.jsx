// Selo calculado pelo back-end (0 a 100).
// Ao passar o mouse (ou focar com o teclado), um balão explica o cálculo de util/Compatibilidade.java.

export default function SeloCompatibilidade({ valor, dentroDeLink = false }) {
  return (
    <span className="fb-compatibilidade" tabIndex={dentroDeLink ? undefined : 0}
      aria-describedby={dentroDeLink ? undefined : 'explicacao-compatibilidade'}>
      <span className="fb-selo-compatibilidade">
        <i className="bi bi-heart-fill" aria-hidden="true"></i> {valor}% compatível com você
      </span>
      <span className="fb-balao" role="tooltip" id={dentroDeLink ? undefined : 'explicacao-compatibilidade'}>
        <strong className="d-block mb-1">Como calculamos</strong>
        <span className="d-block">
          <strong>Até 60 pontos</strong> pelas suas preferências: cozinha (30), faixa de preço (15) e
          acessibilidade, pets, crianças, estacionamento, área para fumantes e LGBT+ friendly (2,5 cada).
        </span>
        <span className="d-block mt-1">
          <strong>Até 40 pontos</strong> pelo seu histórico: cozinhas que você avaliou bem ou favoritou (25) e a
          nota do restaurante no FourBites (até 15).
        </span>
      </span>
    </span>
  )
}
