import {type HeroProps} from '../types/types.ts';

export const Hero = ({ title, description, image }: HeroProps) =>{
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <img src={image} alt="Grafika edukacyjna" />
    </section>
  )
}