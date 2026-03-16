export const Scratch = () => {
  return (
    <div className="content">

      <h1>Zdrapki</h1>

      <div className="grid grid-3">

        <div className="card">
          <h3>Classic</h3>
          <p>Niska wygrana, wysoka częstotliwość.</p>
          <button>Graj</button>
        </div>

        <div className="card">
          <h3>Premium</h3>
          <p>Większe ryzyko, większe emocje.</p>
          <button>Graj</button>
        </div>

        <div className="card">
          <h3>Extreme</h3>
          <p>Mała szansa, wysoka nagroda.</p>
          <button>Graj</button>
        </div>

      </div>

    </div>
  )
}

export default Scratch