import { Lock, CheckCircle2, Play, Clock } from "lucide-react";
export default function MissionCard({
  scenario,
  index,
  status,
  reason,
  difficulty,
  onOpen,
  onReview,
}) {
  return (
    <article className={`xp-mission-card xp-${status}`}>
      <div className="xp-mission-art">
        <img
          loading="lazy"
          src={`/images/scenarios/${scenario.id}/1.jpeg`}
          alt={`${scenario.title} scientific situation`}
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = "true";
              e.currentTarget.src = `/images/roles/${scenario.roleId}.webp`;
            }
          }}
        />
        <span className="xp-status">
          {status === "locked" ? (
            <Lock size={14} />
          ) : status === "completed" ? (
            <CheckCircle2 size={14} />
          ) : (
            <Play size={14} />
          )}{" "}
          {status === "locked"
            ? "Locked"
            : status === "completed"
              ? "Completed"
              : "Available"}
        </span>
      </div>
      <div className="xp-card-body">
        <p className="px-eyebrow">
          Mission {String(index + 1).padStart(2, "0")} · {scenario.strand}
        </p>
        <h3>{scenario.title}</h3>
        <p>{scenario.simpleContext || scenario.context}</p>
        <div className="xp-meta">
          <span>
            <Clock size={14} /> {scenario.estimatedTime || 15} min
          </span>
          <span>{difficulty || scenario.difficulty}</span>
        </div>
        {reason && <p className="xp-lock-reason">{reason}</p>}
        <div className="xp-actions">
          <button
            className="px-button"
            onClick={onOpen}
            disabled={status === "locked"}
          >
            {status === "locked"
              ? "Mission locked"
              : status === "completed"
                ? "Replay mission"
                : "Start mission"}{" "}
            <span aria-hidden="true">→</span>
          </button>
          {onReview && (
            <button className="px-text-button" onClick={onReview}>
              Review notebook
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
