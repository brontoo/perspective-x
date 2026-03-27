import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  Explorer: { icon: '🔭', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/40', min: 0 },
  Analyst: { icon: '🔬', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40', min: 100 },
  Scientist: { icon: '⚗️', color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/40', min: 250 },
  Expert: { icon: '🏆', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', min: 500 },
};

const RANK_CONFIG = [
  { medal: '🥇', bg: 'from-amber-500/30 to-amber-900/10', border: 'border-amber-500/50', glow: 'shadow-amber-500/20' },
  { medal: '🥈', bg: 'from-slate-400/30 to-slate-700/10', border: 'border-slate-400/50', glow: 'shadow-slate-400/20' },
  { medal: '🥉', bg: 'from-orange-600/30 to-orange-900/10', border: 'border-orange-600/50', glow: 'shadow-orange-600/20' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-green-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-red-500 to-rose-500',
    'from-indigo-500 to-blue-500',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

// ─── Level Progress Bar ───────────────────────────────────────────────────────
function LevelProgress({ points, level }) {
  const levels = [
    { name: 'Explorer', min: 0, max: 100 },
    { name: 'Analyst', min: 100, max: 250 },
    { name: 'Scientist', min: 250, max: 500 },
    { name: 'Expert', min: 500, max: 500 },
  ];
  if (level === 'Expert') return (
    <div className="text-xs text-amber-400 font-semibold">✨ Max Level Reached</div>
  );
  const current = levels.find(l => l.name === level) || levels[0];
  const next = levels[levels.indexOf(current) + 1];
  const pct = Math.min(100, ((points - current.min) / (current.max - current.min)) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{points} pts</span>
        <span>{next?.min} pts → {next?.name}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
        />
      </div>
    </div>
  );
}

// ─── Podium Card (Top 3) ──────────────────────────────────────────────────────
function PodiumCard({ entry, position }) {
  const cfg = RANK_CONFIG[position];
  const lvl = LEVEL_CONFIG[entry.level] || LEVEL_CONFIG['Explorer'];
  const heights = ['h-32', 'h-24', 'h-20'];
  const order = [1, 0, 2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.15 }}
      className="flex flex-col items-center gap-2"
      style={{ order: order[position] }}
    >
      {/* Avatar */}
      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(entry.full_name)} flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold text-lg">{getInitials(entry.full_name)}</span>
        <div className="absolute -top-2 -right-2 text-2xl">{cfg.medal}</div>
      </div>

      {/* Name + Level */}
      <div className="text-center">
        <div className="text-sm font-bold text-white truncate max-w-24">
          {entry.full_name.split(' ')[0]}
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full ${lvl.bg} ${lvl.color} border ${lvl.border}`}>
          {lvl.icon} {entry.level}
        </div>
      </div>

      {/* Podium Base */}
      <div className={`w-24 ${heights[position]} bg-gradient-to-b ${cfg.bg} border ${cfg.border} rounded-t-lg flex flex-col items-center justify-center gap-1 shadow-lg`}>
        <div className="text-xl font-black text-white">#{entry.rank}</div>
        <div className="text-sm font-bold text-amber-300">{entry.total_points}</div>
        <div className="text-xs text-slate-400">points</div>
      </div>
    </motion.div>
  );
}

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function LeaderboardRow({ entry, isCurrentUser, index }) {
  const lvl = LEVEL_CONFIG[entry.level] || LEVEL_CONFIG['Explorer'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isCurrentUser
          ? 'bg-teal-500/10 border-teal-500/40 shadow-lg shadow-teal-500/10'
          : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60'
        }`}
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        <span className={`text-sm font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
        </span>
      </div>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(entry.full_name)} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white font-bold text-sm">{getInitials(entry.full_name)}</span>
      </div>

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-teal-300' : 'text-white'}`}>
            {entry.full_name}
          </span>
          {isCurrentUser && (
            <span className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30 px-1.5 py-0.5 rounded-full">
              You
            </span>
          )}
        </div>
        <div className={`text-xs ${lvl.color} flex items-center gap-1`}>
          {lvl.icon} {entry.level}
        </div>
      </div>

      {/* Scenarios */}
      <div className="text-center hidden sm:block flex-shrink-0">
        <div className="text-sm font-bold text-white">{entry.scenarios_completed}</div>
        <div className="text-xs text-slate-500">scenarios</div>
      </div>

      {/* Badges */}
      <div className="text-center hidden sm:block flex-shrink-0">
        <div className="text-sm font-bold text-white">{entry.badges_count}</div>
        <div className="text-xs text-slate-500">badges</div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-black text-amber-400">{entry.total_points}</div>
        <div className="text-xs text-slate-500">points</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all_time');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    // جيب الـ user الحالي
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Realtime — يتحدث تلقائياً عند تغيير نقاط أي طالب
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      }, () => fetchLeaderboard())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  useEffect(() => {
    if (currentUserId && data.length > 0) {
      const mine = data.find(r => r.id === currentUserId);
      setUserRank(mine || null);
    }
  }, [currentUserId, data]);

  async function fetchLeaderboard() {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .limit(50);

    if (!error && rows) setData(rows);
    setLoading(false);
  }

  const top3 = data.slice(0, 3);
  const filters = [
    { key: 'all_time', label: '🏆 All Time' },
    { key: 'monthly', label: '📅 This Month' },
    { key: 'weekly', label: '⚡ This Week' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white transition text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="text-center">
            <div className="text-4xl mb-1">🏆</div>
            <h1 className="text-2xl font-black text-white">Leaderboard</h1>
            <p className="text-slate-400 text-xs mt-1">Top scientists in Perspective X</p>
          </div>
          <div className="w-12" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 justify-center mb-8">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === f.key
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full"
            />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">🏅</div>
            <p className="text-lg font-semibold text-slate-400">No students yet</p>
            <p className="text-sm mt-1">Complete scenarios to appear on the leaderboard</p>
          </div>
        ) : (
          <>
            {/* Podium — Top 3 */}
            {top3.length === 3 && (
              <div className="flex justify-center items-end gap-4 mb-10">
                {top3.map((entry, i) => (
                  <PodiumCard key={entry.id} entry={entry} position={i} />
                ))}
              </div>
            )}

            {/* Your Position — إذا لم تكن في Top 3 */}
            {userRank && userRank.rank > 3 && (
              <div className="mb-6">
                <div className="text-xs text-teal-400 font-semibold mb-2 px-1 uppercase tracking-wide">
                  📍 Your Position
                </div>
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(userRank.full_name)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold">{getInitials(userRank.full_name)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">{userRank.full_name}</div>
                      <div className="text-teal-400 text-sm">
                        Rank #{userRank.rank} · {userRank.total_points} points
                      </div>
                    </div>
                  </div>
                  <LevelProgress points={userRank.total_points} level={userRank.level} />
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-semibold px-1 mb-3 uppercase tracking-wide">
                All Students
              </div>
              <AnimatePresence>
                {data.map((entry, i) => (
                  <LeaderboardRow
                    key={entry.id}
                    entry={entry}
                    isCurrentUser={entry.id === currentUserId}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}