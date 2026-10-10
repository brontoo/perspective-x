import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection({ onStart, isLoading = false }) {
  return (
    <section id="home-intro" className="home-hero" aria-labelledby="home-title">
      <span className="home-title-rule" aria-hidden="true" />
      <h1 id="home-title">Perspective X</h1>
      <p className="home-slogan">Real Science. Real Choices. Real Impact.</p>
      <p className="home-description">
        Step into immersive roles, tackle real-world challenges, and shape a
        more sustainable future for the UAE and beyond.
      </p>
      <div className="home-actions">
        <button onClick={onStart} disabled={isLoading}>
          Start Your Mission <ArrowRight size={21} aria-hidden="true" />
        </button>
        <Link to="/Roles">Explore Roles</Link>
      </div>
    </section>
  );
}
