import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CompletionCertificate({
    studentName,
    scenarioTitle,
    percentage,
    completionDate,
    badgeIcon,
    onClose,
}) {
    const certificateRef = useRef(null);

    const captureCanvas = async () => {
        return await html2canvas(certificateRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0ea5e9',
            onclone: (clonedDoc) => {
                clonedDoc.querySelectorAll('[data-export-color]').forEach((el) => {
                    el.style.backgroundImage = 'none';
                    el.style.webkitBackgroundClip = 'unset';
                    el.style.webkitTextFillColor = el.getAttribute('data-export-color');
                    el.style.color = el.getAttribute('data-export-color');
                });
            },
        });
    };

    const downloadPNG = async () => {
        try {
            const canvas = await captureCanvas();
            const link = document.createElement('a');
            link.download = `Certificate-${scenarioTitle.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const downloadPDF = async () => {
        try {
            const canvas = await captureCanvas();
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-${scenarioTitle.replace(/\s+/g, '-')}.pdf`);
        } catch (e) {
            console.error('Error:', e);
        }
    };

    const formattedDateShort = new Date(completionDate)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        .toUpperCase();

    const agentName = (studentName || 'Student Name').toUpperCase();
    const missionName = (scenarioTitle || 'Classified Mission').toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-auto"
        >
            <div className="max-w-4xl w-full">

                {/* Certificate canvas */}
                <div
                    ref={certificateRef}
                    style={{
                        aspectRatio: '1.414/1',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 40%, #0284c7 70%, #0369a1 100%)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        position: 'relative',
                        fontFamily: "'Space Grotesk', Arial, sans-serif",
                    }}
                >
                    {/* Circuit pattern */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="cert-circuit" width="80" height="80" patternUnits="userSpaceOnUse">
                                    <circle cx="40" cy="40" r="1.5" fill="#ffffff" />
                                    <path
                                        d="M40 0 L40 34 M40 46 L40 80 M0 40 L34 40 M46 40 L80 40"
                                        stroke="#ffffff" strokeWidth="0.5" fill="none"
                                    />
                                    <circle cx="40" cy="40" r="10" stroke="#ffffff" strokeWidth="0.5" fill="none" />
                                    <circle cx="40" cy="40" r="20" stroke="#ffffff" strokeWidth="0.25" fill="none" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#cert-circuit)" />
                        </svg>
                    </div>

                    {/* HUD corner brackets */}
                    <div style={{ position: 'absolute', top: 20, left: 20, width: 32, height: 32, borderTop: '3px solid rgba(255,255,255,0.55)', borderLeft: '3px solid rgba(255,255,255,0.55)' }} />
                    <div style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderTop: '3px solid rgba(255,255,255,0.55)', borderRight: '3px solid rgba(255,255,255,0.55)' }} />
                    <div style={{ position: 'absolute', bottom: 20, left: 20, width: 32, height: 32, borderBottom: '3px solid rgba(255,255,255,0.55)', borderLeft: '3px solid rgba(255,255,255,0.55)' }} />
                    <div style={{ position: 'absolute', bottom: 20, right: 20, width: 32, height: 32, borderBottom: '3px solid rgba(255,255,255,0.55)', borderRight: '3px solid rgba(255,255,255,0.55)' }} />

                    {/* Top-left logo */}
                    <div style={{ position: 'absolute', top: 22, left: 60, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.9)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#0284c7' }}>
                            X
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
                            Perspective X
                        </span>
                    </div>

                    {/* Date badge — top right */}
                    <div style={{ position: 'absolute', top: 22, right: 60, background: 'rgba(251,191,36,0.95)', borderRadius: 4, padding: '4px 10px' }}>
                        <span style={{ color: '#78350f', fontSize: 11, fontWeight: 800, letterSpacing: 1, fontFamily: 'monospace' }}>
                            {formattedDateShort}
                        </span>
                    </div>

                    {/* Main content */}
                    <div style={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 48px 44px',
                        textAlign: 'center',
                        gap: 10,
                    }}>

                        {/* Title */}
                        <h1
                            data-export-color="#e0f2fe"
                            style={{ fontSize: 28, fontWeight: 900, color: '#e0f2fe', letterSpacing: 2, textShadow: '0 0 20px rgba(255,255,255,0.25)', marginBottom: 0 }}
                        >
                            Exit Authorization Certificate
                        </h1>

                        {/* Central badge emblem */}
                        <div style={{ position: 'relative', margin: '4px 0' }}>
                            {/* Outer rings */}
                            <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
                            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.22)' }} />

                            <div style={{
                                width: 110, height: 110, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
                                border: '3px solid rgba(255,255,255,0.45)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 28px rgba(0,0,0,0.3), 0 0 50px rgba(255,255,255,0.08)',
                            }}>
                                <span style={{ fontSize: 34, lineHeight: 1 }}>{badgeIcon || '🗝️'}</span>
                                <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5, marginTop: 4 }}>ROOM CLEARED</span>
                            </div>
                        </div>

                        {/* ACCESS GRANTED banner */}
                        <div style={{
                            background: 'rgba(255,255,255,0.14)',
                            border: '2px solid rgba(255,255,255,0.38)',
                            borderRadius: 4,
                            padding: '5px 22px',
                        }}>
                            <span
                                data-export-color="#ffffff"
                                style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', letterSpacing: 4, textShadow: '0 0 10px rgba(255,255,255,0.45)' }}
                            >
                                ACCESS GRANTED
                            </span>
                        </div>

                        {/* Scenario + score row */}
                        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 2 }}>
                                    SCENARIO COMPLETED:
                                </div>
                                <div data-export-color="#bae6fd" style={{ fontSize: 12, fontWeight: 700, color: '#bae6fd', letterSpacing: 1 }}>
                                    {missionName}
                                </div>
                            </div>
                            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 2 }}>
                                    SCORE ACHIEVED:
                                </div>
                                <div data-export-color="#fde68a" style={{ fontSize: 12, fontWeight: 700, color: '#fde68a', letterSpacing: 1 }}>
                                    {percentage}% VERIFIED
                                </div>
                            </div>
                        </div>

                        {/* Agent name */}
                        <h2
                            data-export-color="#ffffff"
                            style={{ fontSize: 34, fontWeight: 900, color: '#ffffff', letterSpacing: 4, textShadow: '0 0 18px rgba(255,255,255,0.35)', lineHeight: 1.1 }}
                        >
                            AGENT {agentName}
                        </h2>

                        {/* Footer */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 10, width: '100%', marginTop: 2 }}>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: 1 }}>
                                Issued by Perspective X Scientific Learning Platform. Valid for immediate departure.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadPNG}
                        className="liquid-btn-accent flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-bold tracking-widest uppercase"
                    >
                        <Download className="w-3.5 h-3.5" />
                        DOWNLOAD_PNG
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadPDF}
                        className="liquid-btn flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-bold tracking-widest uppercase"
                    >
                        <Download className="w-3.5 h-3.5" />
                        DOWNLOAD_PDF
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="liquid-btn-ghost flex items-center gap-2 px-4 py-2.5 text-[11px] font-mono font-bold tracking-widest uppercase"
                    >
                        <X className="w-3.5 h-3.5" />
                        CLOSE
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
