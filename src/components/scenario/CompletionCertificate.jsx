import { useEffect, useRef, useState } from "react";
import "@/components/expedition/expedition.css";
export default function CompletionCertificate({
  studentName,
  scenarioTitle,
  percentage,
  completionDate,
  badgeIcon,
  badge,
  badgeLevel,
  onClose,
}) {
  const dialog = useRef(null);
  const certificate = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  async function download(kind) {
    setBusy(true);
    setError("");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certificate.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffaf2",
      });
      const filename = `Perspective-X-${scenarioTitle.replace(/[^a-zA-Z0-9]+/g, "-")}`;
      if (kind === "png") {
        const a = document.createElement("a");
        a.download = filename + ".png";
        a.href = canvas.toDataURL("image/png");
        a.click();
      } else {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF("landscape", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          (pdf.internal.pageSize.getHeight() - height) / 2,
          width,
          height,
        );
        pdf.save(filename + ".pdf");
      }
    } catch (e) {
      setError(
        e.message || "Unable to export the certificate. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const date = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "Asia/Dubai",
  }).format(new Date(completionDate));
  return (
    <dialog
      className="px-ui px-expedition xp-certificate-modal"
      ref={dialog}
      onClose={onClose}
    >
      <button
        className="px-icon-button xp-certificate-close"
        aria-label="Close certificate"
        onClick={onClose}
      >
        ×
      </button>
      <div className="xp-certificate" ref={certificate}>
        <div className="xp-certificate-brand">
          <img src="/logo.svg" alt="" />
          <strong>Perspective X</strong>
        </div>
        <p className="xp-certificate-kicker">Science in action</p>
        <h2>Certificate of Completion</h2>
        <p>This recognizes the scientific achievement of</p>
        <h3>{studentName}</h3>
        <p>who successfully completed</p>
        <h4>{scenarioTitle}</h4>
        <div className="xp-certificate-seal">
          <span aria-hidden="true">{badgeIcon}</span>
          <strong>
            {badgeLevel} · {badge}
          </strong>
        </div>
        <p>
          Final assessment result: <strong>{Math.round(percentage)}%</strong>
        </p>
        <div className="xp-certificate-foot">
          <span>{date}</span>
          <span>
            Um Al Emarat School
            <br />
            Riham Saleh — Portal Creator
          </span>
        </div>
        <small>Real Science. Real Choices. Real Impact.</small>
      </div>
      {error && (
        <p className="px-error" role="alert">
          {error}
        </p>
      )}
      <div className="xp-actions">
        <button
          className="px-button"
          disabled={busy}
          onClick={() => download("png")}
        >
          {busy ? "Preparing…" : "Download PNG"}
        </button>
        <button
          className="px-outline-button"
          disabled={busy}
          onClick={() => download("pdf")}
        >
          Download PDF
        </button>
        <button className="px-text-button" onClick={onClose}>
          Return to mission
        </button>
      </div>
    </dialog>
  );
}
