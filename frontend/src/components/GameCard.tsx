import { useNavigate } from "react-router-dom"
import { type GameCardProps } from '../types/types.ts';

export const GameCard = ({ title, desc, link, image }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(link)}>
      <img src={image} alt="" />

      <div className="card-content">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  )
}

export default GameCard