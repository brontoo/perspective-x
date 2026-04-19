
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CompletionCertificate({
    studentName,
    scenarioTitle,
    percentage,
    completionDate,
    badgeIcon,
    onClose
}) {
    const certificateRef = useRef(null);

    const captureCanvas = async () => {
        return await html2canvas(certificateRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0f172a',
            onclone: (clonedDoc) => {
                // استبدال كل bg-clip-text بلون ثابت في النسخة المحولة
                clonedDoc.querySelectorAll('[data-export-color]').forEach(el => {
                    el.style.backgroundImage = 'none';
                    el.style.webkitBackgroundClip = 'unset';
                    el.style.webkitTextFillColor = el.getAttribute('data-export-color');
                    el.style.color = el.getAttribute('data-export-color');
                });
            }
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

    const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-auto"
        >
            <div className="max-w-4xl w-full">
                {/* Certificate */}
                <div
                    ref={certificateRef}
                    style={{
                        aspectRatio: '1.414/1',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        position: 'relative',
                        fontFamily: 'Arial, sans-serif'
                    }}
                >
                    {/* Background pattern */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="circuit" width="100" height="100" patternUnits="userSpaceOnUse">
                                    <circle cx="50" cy="50" r="1" fill="#14b8a6" />
                                    <path d="M50 0 L50 45 M50 55 L50 100 M0 50 L45 50 M55 50 L100 50"
                                        stroke="#14b8a6" strokeWidth="0.5" fill="none" />
                                    <circle cx="50" cy="50" r="8" stroke="#14b8a6" strokeWidth="0.5" fill="none" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#circuit)" />
                        </svg>
                    </div>

                    {/* Borders */}
                    <div style={{ position: 'absolute', inset: '16px', border: '2px solid rgba(20,184,166,0.3)', borderRadius: '16px' }} />
                    <div style={{ position: 'absolute', inset: '24px', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px' }} />

                    {/* Glow orbs */}
                    <div style={{ position: 'absolute', top: '25%', left: '25%', width: '256px', height: '256px', borderRadius: '50%', background: 'rgba(20,184,166,0.08)', filter: 'blur(60px)' }} />
                    <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: '192px', height: '192px', borderRadius: '50%', background: 'rgba(168,85,247,0.08)', filter: 'blur(60px)' }} />

                    {/* Content */}
                    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center' }}>

                        {/* Header */}
                        <div style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '999px', background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}>
                            <span style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: '700', letterSpacing: '2px' }}>
                                🏅 CERTIFICATE OF COMPLETION
                            </span>
                        </div>

                        {/* Logo */}
                        <div
                            data-export-color="#2dd4bf"
                            style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', color: '#2dd4bf' }}
                        >
                            Perspective X
                        </div>

                        {/* Sub text */}
                        <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '12px' }}>
                            This certifies that
                        </p>

                        {/* Student Name */}
                        <h2
                            data-export-color="#ffffff"
                            style={{ fontSize: '38px', fontWeight: '800', color: '#ffffff', marginBottom: '12px', letterSpacing: '1px' }}
                        >
                            {studentName || 'Student Name'}
                        </h2>

                        <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '20px' }}>
                            has successfully completed the scientific scenario
                        </p>

                        {/* Scenario badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px 32px', borderRadius: '16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.4)' }}>
                            <span style={{ fontSize: '40px' }}>{badgeIcon || '🏆'}</span>
                            <h3
                                data-export-color="#2dd4bf"
                                style={{ fontSize: '24px', fontWeight: '700', color: '#2dd4bf' }}
                            >
                                {scenarioTitle}
                            </h3>
                        </div>

                        {/* Score & Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginBottom: '32px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Achievement Score</p>
                                <div
                                    data-export-color="#2dd4bf"
                                    style={{ fontSize: '48px', fontWeight: '900', color: '#2dd4bf' }}
                                >
                                    {percentage}%
                                </div>
                            </div>
                            <div style={{ width: '1px', height: '64px', background: '#334155' }} />
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Completion Date</p>
                                <p style={{ fontSize: '20px', color: '#ffffff', fontWeight: '600' }}>{formattedDate}</p>
                            </div>
                        </div>

                        {/* Signature */}
                        <div style={{ borderTop: '1px solid rgba(51,65,85,0.5)', paddingTop: '16px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>Portal Developer</p>
                            <p
                                data-export-color="#2dd4bf"
                                style={{ fontSize: '20px', fontWeight: '600', color: '#2dd4bf', fontStyle: 'italic' }}
                            >
                                Riham Saleh
                            </p>
                        </div>

                        {/* Verified */}
                        <div style={{ position: 'absolute', bottom: '16px', right: '32px', display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
                            <span>✓</span>
                            <span>Verified Achievement</span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <Button onClick={downloadPNG} className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600">
                        <Download className="w-4 h-4 mr-2" />
                        Download PNG
                    </Button>
                    <Button onClick={downloadPDF} variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button onClick={onClose} variant="ghost" className="text-slate-400 hover:text-white">
                        Close
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}