import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Award, CheckCircle2 } from 'lucide-react';
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

    const downloadCertificate = async () => {
        if (!certificateRef.current) return;

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `Certificate-${scenarioTitle.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Error generating certificate:', e);
        }
    };

    const downloadPDF = async () => {
        if (!certificateRef.current) return;

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-${scenarioTitle.replace(/\s+/g, '-')}.pdf`);
        } catch (e) {
            console.error('Error generating PDF:', e);
        }
    };

    const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
                    className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden"
                    style={{ aspectRatio: '1.414/1' }}
                >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="circuit" width="100" height="100" patternUnits="userSpaceOnUse">
                                    <circle cx="50" cy="50" r="1" fill="#14b8a6" />
                                    <path d="M50 0 L50 45 M50 55 L50 100 M0 50 L45 50 M55 50 L100 50" stroke="#14b8a6" strokeWidth="0.5" fill="none" />
                                    <circle cx="50" cy="50" r="8" stroke="#14b8a6" strokeWidth="0.5" fill="none" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#circuit)" />
                        </svg>
                    </div>

                    {/* Holographic borders */}
                    <div className="absolute inset-4 border-2 border-teal-500/30 rounded-2xl" />
                    <div className="absolute inset-6 border border-purple-500/20 rounded-xl" />

                    {/* Corner decorations */}
                    {[['top-4 left-4', 'rotate-0'], ['top-4 right-4', 'rotate-90'], ['bottom-4 left-4', '-rotate-90'], ['bottom-4 right-4', 'rotate-180']].map(([pos, rot], i) => (
                        <div key={i} className={`absolute ${pos} ${rot}`}>
                            <svg width="60" height="60" viewBox="0 0 60 60">
                                <path d="M0 20 L0 0 L20 0" fill="none" stroke="#14b8a6" strokeWidth="2" />
                                <circle cx="5" cy="5" r="3" fill="#14b8a6" />
                            </svg>
                        </div>
                    ))}

                    {/* Glowing orbs */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                        {/* Header badge */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/30">
                                <Award className="w-5 h-5 text-teal-400" />
                                <span className="text-teal-300 text-sm font-semibold tracking-wider">CERTIFICATE OF COMPLETION</span>
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="text-4xl mb-4 font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                            Perspective X
                        </div>

                        {/* Main text */}
                        <p className="text-slate-400 text-lg mb-4">This certifies that</p>

                        <h2 className="text-4xl font-bold text-white mb-4 tracking-wide">
                            {studentName || 'Student Name'}
                        </h2>

                        <p className="text-slate-400 text-lg mb-6">has successfully completed the scientific scenario</p>

                        {/* Scenario badge */}
                        <div className="flex items-center gap-4 mb-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50">
                            <span className="text-4xl">{badgeIcon || '🏆'}</span>
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                                    {scenarioTitle}
                                </h3>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-8 mb-8">
                            <div className="text-center">
                                <p className="text-slate-500 text-sm mb-1">Achievement Score</p>
                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                                    {percentage}%
                                </div>
                            </div>
                            <div className="w-px h-16 bg-slate-700" />
                            <div className="text-center">
                                <p className="text-slate-500 text-sm mb-1">Completion Date</p>
                                <p className="text-xl text-white font-semibold">{formattedDate}</p>
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="mt-auto pt-6 border-t border-slate-700/50 w-full max-w-md">
                            <p className="text-slate-400 text-sm mb-2">Portal Developer</p>
                            <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400 italic">
                                Riham Saleh
                            </p>
                        </div>

                        {/* Verification badge */}
                        <div className="absolute bottom-4 right-8 flex items-center gap-2 text-slate-600 text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verified Achievement</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                        onClick={downloadCertificate}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PNG
                    </Button>
                    <Button
                        onClick={downloadPDF}
                        variant="outline"
                        className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}