import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, X, ShieldCheck, Calendar, BookOpen } from 'lucide-react';

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
    const certLevelMeta = {
        Bronze: {
            color: '#d97706',
            bgColor: 'rgba(217, 119, 6, 0.12)',
            borderColor: 'rgba(217, 119, 6, 0.35)',
            glow: '0 0 8px rgba(217, 119, 6, 0.15)'
        },
        Silver: {
            color: '#cbd5e1',
            bgColor: 'rgba(203, 213, 225, 0.12)',
            borderColor: 'rgba(203, 213, 225, 0.35)',
            glow: '0 0 8px rgba(203, 213, 225, 0.15)'
        },
        Gold: {
            color: '#fbbf24',
            bgColor: 'rgba(251, 191, 36, 0.12)',
            borderColor: 'rgba(251, 191, 36, 0.35)',
            glow: '0 0 12px rgba(251, 191, 36, 0.25)'
        },
        Platinum: {
            color: '#22d3ee',
            bgColor: 'rgba(34, 211, 238, 0.12)',
            borderColor: 'rgba(34, 211, 238, 0.35)',
            glow: '0 0 16px rgba(34, 211, 238, 0.35)'
        }
    };

    const levelMeta = badgeLevel ? certLevelMeta[badgeLevel] : null;
    const certificateRef = useRef(null);

    const captureCanvas = async () => {
        const html2canvas = (await import('html2canvas')).default;
        return await html2canvas(certificateRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0e17',
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
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-${scenarioTitle.replace(/\s+/g, '-')}.pdf`);
        } catch (e) {
            console.error('Error:', e);
        }
    };

    let formattedDate = '';
    try {
        formattedDate = new Date(completionDate || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        formattedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const agentName = studentName || 'Student Name';
    const missionName = scenarioTitle || 'Scientific Case Study';
    const badgeName = badge || 'Science Investigator';
    const scoreVal = percentage !== undefined && percentage !== null ? Math.round(Number(percentage)) : 100;

    // Responsive font scaling to prevent overflow on long names/titles
    const nameFontSize = agentName.length > 25 ? '24px' : agentName.length > 18 ? '28px' : '34px';
    const missionFontSize = missionName.length > 30 ? '11px' : '13px';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-auto animate-fade-in"
        >
            <div className="max-w-4xl w-full">

                {/* Certificate Canvas */}
                <div
                    ref={certificateRef}
                    style={{
                        aspectRatio: '1.414/1',
                        background: 'linear-gradient(135deg, #090d16 0%, #0d1527 50%, #080f1e 100%)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '3px solid #14b8a6',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Subtle grid pattern */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.03 }}>
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="cert-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#cert-grid)" />
                        </svg>
                    </div>

                    {/* Elegant Borders */}
                    <div style={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, border: '1px solid rgba(20, 184, 166, 0.25)', borderRadius: '12px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, border: '1px dashed rgba(245, 158, 11, 0.2)', borderRadius: '10px', pointerEvents: 'none' }} />

                    {/* Corner accents */}
                    <div style={{ position: 'absolute', top: 32, left: 32, width: 24, height: 24, borderTop: '2px solid #14b8a6', borderLeft: '2px solid #14b8a6' }} />
                    <div style={{ position: 'absolute', top: 32, right: 32, width: 24, height: 24, borderTop: '2px solid #14b8a6', borderRight: '2px solid #14b8a6' }} />
                    <div style={{ position: 'absolute', bottom: 32, left: 32, width: 24, height: 24, borderBottom: '2px solid #14b8a6', borderLeft: '2px solid #14b8a6' }} />
                    <div style={{ position: 'absolute', bottom: 32, right: 32, width: 24, height: 24, borderBottom: '2px solid #14b8a6', borderRight: '2px solid #14b8a6' }} />

                    {/* Main Content Layout */}
                    <div style={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '54px 60px 44px',
                        textAlign: 'center'
                    }}>
                        
                        {/* Header logo/title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: '2px solid #14b8a6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: '#14b8a6',
                                    boxShadow: '0 0 6px #14b8a6',
                                }} />
                            </div>
                            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                Perspective X Science Academy
                            </span>
                        </div>

                        {/* Title of Achievement */}
                        <div style={{ marginTop: 8 }}>
                            <h1
                                data-export-color="#ffffff"
                                style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            >
                                Certificate of Completion
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                Awarded for outstanding performance in scientific exploration and reasoning.
                            </p>
                        </div>

                        {/* Student Name */}
                        <div style={{ margin: '12px 0' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#14b8a6', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                Presented To
                            </span>
                            <h2
                                data-export-color="#f59e0b"
                                style={{ fontSize: nameFontSize, fontWeight: 900, color: '#f59e0b', letterSpacing: 1.5, margin: '4px 0 0 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            >
                                {agentName}
                            </h2>
                        </div>

                        {/* Details Grid */}
                        <div style={{ 
                            display: 'flex', 
                            gap: 40, 
                            alignItems: 'center', 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            border: '1px solid rgba(255, 255, 255, 0.05)', 
                            borderRadius: 12, 
                            padding: '16px 28px', 
                            margin: '8px 0',
                            boxShadow: 'inset 0 0 12px rgba(20, 184, 166, 0.05)'
                        }}>
                            
                            {/* Mission Title */}
                            <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <BookOpen style={{ width: 20, height: 20, color: '#14b8a6' }} />
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        Mission
                                    </div>
                                    <div data-export-color="#ffffff" style={{ fontSize: missionFontSize, fontWeight: 700, color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {missionName}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
                            
                            {/* Score */}
                            <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ShieldCheck style={{ width: 20, height: 20, color: '#10b981' }} />
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        Score
                                    </div>
                                    <div data-export-color="#10b981" style={{ fontSize: 13, fontWeight: 800, color: '#10b981', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {scoreVal}%
                                    </div>
                                </div>
                            </div>

                            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
                            
                            {/* Completion Date */}
                            <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Calendar style={{ width: 20, height: 20, color: '#f59e0b' }} />
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        Date
                                    </div>
                                    <div data-export-color="#ffffff" style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {formattedDate}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Certificate Badge and Seal */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: levelMeta ? levelMeta.bgColor : 'rgba(20, 184, 166, 0.1)',
                                border: `2px solid ${levelMeta ? levelMeta.color : '#14b8a6'}`,
                                boxShadow: levelMeta ? levelMeta.glow : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 22
                            }}>
                                {badgeIcon || '🏆'}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Badge Earned</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'white', display: 'block', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    {badgeLevel ? `${badgeLevel} ${badgeName}` : badgeName}
                                </span>
                                {badgeLevel && levelMeta && (
                                    <span style={{
                                        fontSize: 8,
                                        fontWeight: 800,
                                        color: levelMeta.color,
                                        background: levelMeta.bgColor,
                                        border: `1px solid ${levelMeta.borderColor}`,
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        display: 'inline-block',
                                        marginTop: 2,
                                        textTransform: 'uppercase',
                                        fontFamily: 'monospace'
                                    }}>
                                        {badgeLevel} Level
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Footer text */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, width: '100%', marginTop: 10 }}>
                            <p style={{ color: '#64748b', fontSize: 10, letterSpacing: '0.5px', margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                Recognizing outstanding achievement, scientific reasoning, and core critical thinking skills.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        onClick={downloadPNG}
                        className="bg-[#14b8a6] hover:bg-[#0f766e] text-white flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest uppercase transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download PNG
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="bg-[#0f172a] hover:bg-[#1e293b] text-white border border-[#334155] flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest uppercase transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-[#1e293b] hover:bg-[#334155] text-white flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest uppercase transition-colors cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                        Close
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
