import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GlassModal({ open, onClose, title, children, className = '', maxWidth = 'max-w-lg' }) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="glass-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.target === e.currentTarget && onClose?.()}
                >
                    <motion.div
                        className={cn('glass-modal', maxWidth, className)}
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 8 }}
                        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                        {(title || onClose) && (
                            <div className="flex items-center justify-between p-5 pb-0">
                                {title && (
                                    <h2 className="text-base font-bold text-[var(--lx-text)]">
                                        {title}
                                    </h2>
                                )}
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg hover:bg-[var(--lx-glass-border-sub)] text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition-colors ml-auto"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="p-5">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
