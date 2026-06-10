import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, t } from '@/lib/motionPresets';
import { z } from '@/lib/designTokens';

/* ── Helpers ─────────────────────────────────────────────────────────── */

function chamberCode(scenarioId = '') {
    // e.g. "gas_boyle_adnoc" → "GAS-001" style short code
    const parts = scenarioId.toUpperCase().split('_');
    const prefix = parts[0]?.slice(0, 3) ?? 'LAB';
    // stable numeric hash from scenario ID
    let hash = 0;
    for (const c of scenarioId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    const num = String(Math.abs(hash % 900) + 100);
    return `${prefix}-${num}`;
}

function truncate(str = '', maxLen = 22) {
    return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

/* ── Sub-components ──────────────────────────────────────────────────── */

const DataRow = memo(function DataRow({ label, value, color }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.1em', color: 'rgba(71,85,105,0.8)' }}>
                {label}
            </span>
            <span style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.06em', color: color || 'rgba(15,23,42,0.9)', fontWeight: 600 }}>
                {value}
            </span>
        </div>
    );
});

function MiniProgressBar({ pct, color = '#06b6d4' }) {
    return (
        <div style={{ height: '3px', background: 'rgba(226,232,240,0.8)', borderRadius: '2px', overflow: 'hidden', marginTop: '1px' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={t.fill}
                style={{ height: '100%', background: color, borderRadius: '2px' }}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   MISSION HUD — Fixed persistent overlay across all scenario phases
   ═══════════════════════════════════════════════════════════════════════ */
const MissionHUD = memo(function MissionHUD({
    scenario,
    scenarioId,
    phase,
    progressPct = 0,
    hudColor = '#06b6d4',
    roleTitle,
}) {
    // Hide only during the cinematic title (CinematicTitle manages its own fullscreen UI)
    const visible = phase !== 'title' && !!scenario;

    // During video phase the HUD is the ONLY context indicator — make it more prominent
    const isVideoPhase = phase === 'video';

    const opacity      = isVideoPhase ? 0.92 : 0.65;
    const bgAlpha      = isVideoPhase ? '0.85'  : '0.75';
    const borderAlpha  = isVideoPhase ? '0.4'   : '0.2';

    const chamber = chamberCode(scenarioId);
    const mission = truncate(scenario?.title ?? 'Mission', 24);
    const role    = truncate(roleTitle || scenario?.role || 'Scientist', 20);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="mission-hud"
                    {...variants.hudReveal}
                    transition={{ ...t.panel, delay: isVideoPhase ? 1.2 : 0.3 }}
                    style={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        zIndex: z.hud,
                        width: '196px',
                        opacity,
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    {/* Outer frame */}
                    <div style={{
                        background: `rgba(255,255,255,${bgAlpha})`,
                        border: `1px solid rgba(148,163,184,${borderAlpha})`,
                        borderRadius: '6px',
                        backdropFilter: 'blur(10px)',
                        overflow: 'hidden',
                        boxShadow: isVideoPhase ? `0 0 16px rgba(6,182,212,0.2)` : 'none',
                    }}>
                        {/* Status bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 8px',
                            background: `rgba(6,182,212,0.08)`,
                            borderBottom: `1px solid rgba(6,182,212,${borderAlpha})`,
                        }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: hudColor, flexShrink: 0 }} />
                            <span style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.14em', color: hudColor, fontWeight: 700 }}>
                                SCENARIO ACTIVE
                            </span>
                        </div>

                        {/* Data rows */}
                        <div style={{ padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <DataRow label="SCENARIO"  value={mission}  color="rgba(15,23,42,0.9)" />
                            <DataRow label="ID"        value={chamber}  color={hudColor} />
                            <DataRow label="ROLE"      value={role}     color="rgba(71,85,105,0.85)" />

                            {/* Progress row with mini bar */}
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <span style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.1em', color: 'rgba(71,85,105,0.8)' }}>
                                        PROGRESS
                                    </span>
                                    <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(15,23,42,0.9)', fontWeight: 600 }}>
                                        {progressPct}%
                                    </span>
                                </div>
                                <MiniProgressBar pct={progressPct} color={hudColor} />
                            </div>

                            <DataRow
                                label="STAGE"
                                value={(
                                    {
                                        video: 'Story',
                                        intro: 'Story',
                                        briefing: 'Your Role',
                                        scene1: 'Evidence',
                                        scene2: 'Choice',
                                        consequence: 'Result',
                                        reflection: 'Reflection',
                                        exit: 'Final Check',
                                        complete: 'Complete'
                                    }[phase] || 'Story'
                                ).toUpperCase()}
                                color={hudColor}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default MissionHUD;
