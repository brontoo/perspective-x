import { forwardRef } from "react";
import { ArrowRight, Compass, Mountain, GitFork, Leaf } from "lucide-react";
import "./our-story.css";

const journey = [
  { Icon: Compass, first: "Choose", second: "a Role", tone: "rose" },
  { Icon: Mountain, first: "Enter", second: "a Mission", tone: "lavender" },
  { Icon: GitFork, first: "Make", second: "a Decision", tone: "gold" },
  { Icon: Leaf, first: "See", second: "Your Impact", tone: "mint" },
];

const OurStoryDialog = forwardRef(function OurStoryDialog(_, ref) {
  return (
    <dialog ref={ref} className="home-story-dialog" aria-labelledby="home-story-title" tabIndex={-1}>
      <div className="home-story-panel">
        <div className="home-story-scenery" role="img" aria-label="Dubai’s Museum of the Future beside reflecting water at a peach and rose sunset" />
        <div className="home-story-content">
          <p className="home-story-overline">Our Story<span aria-hidden="true" /></p>
          <h2 id="home-story-title">Real science.<br /><span>Meaningful choices.</span></h2>
          <p className="home-story-copy">Perspective X invites learners to explore immersive scientific roles, tackle real-world challenges, and shape a more sustainable future for the UAE and beyond.</p>
          <p className="home-story-credit">Um Al Emarat School · Riham Saleh — Portal Creator</p>
          <div className="home-story-journey">
            <svg className="home-story-path" viewBox="0 0 900 180" preserveAspectRatio="none" aria-hidden="true">
              <path d="M65 150 C175 -15 215 -15 305 115 S480 215 560 155 S690 -10 775 115 S875 185 898 135" />
            </svg>
            <ol aria-label="Your scientific journey">
              {journey.map(({ Icon, first, second, tone }) => (
                <li className={`home-story-step home-story-step-${tone}`} key={tone}>
                  <Icon aria-hidden="true" strokeWidth={1.5} />
                  <span>{first} <br />{second}</span>
                </li>
              ))}
            </ol>
          </div>
          <form method="dialog">
            <button className="home-story-close">Close<ArrowRight aria-hidden="true" strokeWidth={1.25} /></button>
          </form>
        </div>
      </div>
    </dialog>
  );
});

export default OurStoryDialog;
