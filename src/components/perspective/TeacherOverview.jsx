import { BookOpen, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SCENARIOS } from "@/components/scenarios/scenarioData";
import { LEARNING_PATHS_LIST } from "@/data/learningPaths";
import { formatDate, isAssessed } from "@/lib/perspective/progress.mjs";
import { Avatar, Empty, Panel } from "./Portal";

export default function TeacherOverview({ students, progress, onReview }) {
  const latest = progress
    .filter(row => isAssessed(row) && SCENARIOS[row.scenario_id])
    .sort((a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at))
    .slice(0, 5);
  return (
    <div className="teacher-overview-grid">
      <Panel title="Latest submitted work" eyebrow="Recent activity">
        {latest.length ? latest.map(row => {
          const student = students.find(item => item.id === row.student_id);
          return (
            <div className="teacher-submission" key={row.id}>
              <Avatar name={student?.full_name || "Student"} />
              <div>
                <strong>{student?.full_name || "Student"}</strong>
                <span>{SCENARIOS[row.scenario_id].title}</span>
                <small>{formatDate(row.completed_at)} · {row.score}%</small>
              </div>
              {student && <button className="px-text-button" onClick={() => onReview(student)}>Review work →</button>}
            </div>
          );
        }) : <Empty>No assessed submissions yet. Submitted work will appear here.</Empty>}
      </Panel>
      <Panel title="Learning resources" eyebrow="Prepare your lessons">
        <p className="teacher-resource-intro">Explore the scientific missions within each learning path.</p>
        <div className="teacher-resource-grid">
          {LEARNING_PATHS_LIST.map(path => (
            <Link key={path.id} to={`/LearningPath?path=${path.id}`}>
              <BookOpen size={19} aria-hidden="true" />
              <span>{path.title}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
