import { Link } from "react-router-dom"
import {type GameCardProps} from '../types/types.ts';

export const GameCard = ({ title, desc, link }: GameCardProps) => {
  return (
    <div className="card">
      <img src="https://picsum.photos/374/320" alt="" />

      <div className="card-content">
        <h3>{title}</h3>
        <p>{desc}</p>

        <Link to={link}>
          <button>Otwórz</button>
        </Link>
      </div>
    </div>
  )
}

export default GameCard