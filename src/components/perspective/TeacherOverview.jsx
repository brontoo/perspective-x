import {
  BookOpen,
  FileCheck,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SCENARIOS } from "@/components/scenarios/scenarioData";
import { LEARNING_PATHS_LIST } from "@/data/learningPaths";
import {
  formatDate,
  isAssessed,
  passedIds,
} from "@/lib/perspective/progress.mjs";
import { Avatar, Empty, Panel } from "./Portal";
export function TeachingJourney() {
  return (
    <Panel
      className="px-journey"
      title="Guide. Support. Make an impact."
      eyebrow="Teaching journey"
    >
      <ol className="px-steps">
        {[
          ["Plan", "Prepare engaging lessons"],
          ["Teach", "Deliver and inspire"],
          ["Assess", "Review progress and feedback"],
          ["Support", "Identify needs and guide growth"],
          ["Celebrate", "Recognize achievements"],
        ].map(([label, description], index) => (
          <li key={label}>
            <span className="px-step-icon">{index + 1}</span>
            <div>
              <strong>{label}</strong>
              <small>{description}</small>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
export default function TeacherOverview({
  students,
  progress,
  feedback,
  onTab,
  onReview,
}) {
  const assessed = progress.filter(
    (row) => isAssessed(row) && SCENARIOS[row.scenario_id],
  );
  const completion = students.length
    ? Math.round(
        (students.reduce(
          (sum, student) =>
            sum +
            passedIds(
              progress.filter((row) => row.student_id === student.id),
              SCENARIOS,
            ).length,
          0,
        ) /
          students.length /
          Object.keys(SCENARIOS).length) *
          100,
      )
    : 0;
  const latest = [...assessed]
    .sort((a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at))
    .slice(0, 4);
  return (
    <>
      <div className="px-teacher-grid">
        <Panel
          title="Your students"
          action={
            <button
              className="px-text-button"
              onClick={() => onTab("students")}
            >
              View all →
            </button>
          }
        >
          {students.length ? (
            students.slice(0, 3).map((student) => {
              const passed = passedIds(
                progress.filter((row) => row.student_id === student.id),
                SCENARIOS,
              );
              return (
                <div className="px-student-summary" key={student.id}>
                  <Avatar name={student.full_name || "Student"} />
                  <div>
                    <strong>{student.full_name || "Student"}</strong>
                    <small>
                      {passed.length} / {Object.keys(SCENARIOS).length} missions
                      passed
                    </small>
                  </div>
                  <button
                    className="px-text-button"
                    onClick={() => onReview(student)}
                  >
                    Review →
                  </button>
                </div>
              );
            })
          ) : (
            <Empty>No students are available in your authorized view.</Empty>
          )}
          <p className="px-muted" style={{ marginTop: 10 }}>
            Class groups and schedules are not available yet.
          </p>
        </Panel>
        <Panel
          title="Student progress overview"
          action={
            <button
              className="px-text-button"
              onClick={() => onTab("overview")}
            >
              Analytics →
            </button>
          }
        >
          <div
            className="px-donut"
            style={{ "--progress": completion }}
            role="img"
            aria-label={`${completion}% average mission completion`}
          >
            <div>
              <strong>{completion}%</strong>
              <small>Average completion</small>
            </div>
          </div>
          <p className="px-muted">
            {students.length} students · {assessed.length} assessments
          </p>
        </Panel>
        <Panel title="Review & support">
          <button className="px-task-button" onClick={() => onTab("students")}>
            <FileCheck size={22} />
            <span>
              <strong>{assessed.length}</strong> assessed submissions
              <br />
              Open student records
            </span>
          </button>
          <button className="px-task-button" onClick={() => onTab("feedback")}>
            <MessageSquare size={22} />
            <span>
              Provide feedback
              <br />
              <small>
                {
                  feedback.filter((f) => f.type !== "difficulty_override")
                    .length
                }{" "}
                saved messages
              </small>
            </span>
          </button>
          <button className="px-task-button" onClick={() => onTab("scenarios")}>
            <Settings size={22} />
            Manage mission access
          </button>
        </Panel>
        <Panel
          title="Recent submissions"
          action={
            <button
              className="px-text-button"
              onClick={() => onTab("students")}
            >
              View all →
            </button>
          }
        >
          {latest.length ? (
            latest.map((row) => {
              const student = students.find((s) => s.id === row.student_id);
              return (
                <div className="px-student-summary" key={row.id}>
                  <Avatar name={student?.full_name || "Student"} />
                  <div>
                    <strong>{student?.full_name || "Student"}</strong>
                    <small>
                      {SCENARIOS[row.scenario_id]?.title}
                      <br />
                      {formatDate(row.completed_at)} · {row.score}%
                    </small>
                  </div>
                  {student && (
                    <button
                      className="px-text-button"
                      onClick={() => onReview(student)}
                    >
                      View →
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <Empty>No assessed submissions yet.</Empty>
          )}
        </Panel>
      </div>
      <div className="px-teacher-lower">
        <Panel
          title="Messages & feedback"
          action={
            <button
              className="px-text-button"
              onClick={() => onTab("feedback")}
            >
              View all →
            </button>
          }
        >
          {feedback
            .filter((f) => f.type !== "difficulty_override")
            .slice(0, 2)
            .map((item) => (
              <article className="px-feedback" key={item.id}>
                <strong>{item.teacher_name || "Teacher feedback"}</strong>
                <small>{formatDate(item.created_at)}</small>
                <p>{item.message}</p>
              </article>
            ))}
          {!feedback.some((f) => f.type !== "difficulty_override") && (
            <Empty>
              No saved messages yet. Send feedback from your teaching tools.
            </Empty>
          )}
        </Panel>
        <Panel title="Quick actions">
          <div className="px-quick-actions">
            {[
              ["scenarios", "Mission controls", Settings],
              ["students", "Review students", Users],
              ["feedback", "Send feedback", MessageSquare],
              ["debate", "Class debate", BookOpen],
            ].map(([tab, label, Icon]) => (
              <button key={tab} onClick={() => onTab(tab)}>
                <Icon size={24} />
                {label}
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Learning resources">
          <div className="px-explore-roles">
            {LEARNING_PATHS_LIST.slice(0, 3).map((path) => (
              <Link
                className="px-role-link"
                key={path.id}
                to={`/LearningPath?path=${path.id}`}
              >
                <span>{path.icon}</span>
                <div>
                  <strong>{path.title}</strong>
                  <small>Explore the learning path →</small>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
