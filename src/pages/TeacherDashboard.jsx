import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, SKILLS } from '@/components/scenarios/scenarioData';
import StudentAnswersModal from '@/components/scenario/StudentAnswersModal';
import { getBadgeLevel } from '@/components/scenario/scenarioHelpers';
import {
    Users, BookOpen, Settings, Lock, Unlock,
    Loader2, LogOut, GraduationCap, CheckCircle2,
    Target, Home, Eye, MessageSquare, Send, Trash2,
    Trophy, Brain, BarChart3, ChevronDown, ChevronUp,
    UserCircle, Maximize2, Minimize2, Presentation,
    AlertTriangle
} from 'lucide-react';

const SCENARIO_METADATA = {
    water_contamination: {
        topic: 'Water Quality & Chemical Contamination',
        learningObjective: 'Identify nitrate contamination risks and evaluate chemical filtration strategies to protect municipal drinking water.',
        priorKnowledge: 'Understanding concentration units (ppm, ppb) and basic safety limits for drinking water.',
        studentOutput: 'A choice and detailed evidence-based justification for drinking water filtration remediation.',
        discussionQuestion: 'Which chemical filtration choice is most scientifically and ethically justified for long-term safety?',
        skillsDeveloped: ['Data Interpretation', 'Scientific Reasoning', 'Risk Assessment', 'Ethical Reasoning']
    },
    reaction_gone_wrong: {
        topic: 'Exothermic Reactions & Thermal Runaway',
        learningObjective: 'Analyze reactor temperature and pressure data to choose correct cooling mitigations and prevent reactor explosion.',
        priorKnowledge: 'Understanding exothermic reactions, thermal energy transfer, and safety valve operations.',
        studentOutput: 'Reactor stabilization cooling selection and safety shutdown justification.',
        discussionQuestion: 'How do engineers balance operational yield with human safety thresholds during chemical anomalies?',
        skillsDeveloped: ['Data Interpretation', 'Scientific Reasoning', 'Risk Assessment', 'Decision Making']
    },
    acid_rain: {
        topic: 'pH Scale & Acid Deposition Remediation',
        learningObjective: 'Assess environmental pH levels and recommend neutralizing soil treatments to mitigate acid deposition.',
        priorKnowledge: 'Familiarity with the pH scale, acid-base neutralization reactions, and ecosystem effects of SO2.',
        studentOutput: 'Ecosystem limestone treatment selection and neutralization justification.',
        discussionQuestion: 'What are the environmental and economic tradeoffs of direct chemical neutralizing agents in nature?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Risk Assessment', 'Ethical Reasoning']
    },
    mutation_dilemma: {
        topic: 'Genetics & Autosomal Dominant/Recessive Inheritance',
        learningObjective: 'Calculate genetic mutation probabilities using Punnett squares and provide empathetic patient counseling.',
        priorKnowledge: 'Knowledge of genes, alleles, genotypes (heterozygous, homozygous), and basic probability.',
        studentOutput: 'Punnett square probability calculation and genetic counseling script choice.',
        discussionQuestion: 'How should a researcher counsel patients on genetic probabilities without causing unnecessary panic?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Ethical Reasoning', 'Communication']
    },
    reaction_time: {
        topic: 'Neurophysiology & Stimulant Dosage Safety',
        learningObjective: 'Analyze neural stimulant mechanisms and calculate correct dosing to optimize reaction time safely.',
        priorKnowledge: 'Understanding synapse transmissions, nerve impulses, and stimulant effects on heart rate.',
        studentOutput: 'Synapse dosing selection and neurophysiological safety justification.',
        discussionQuestion: 'What ethical guidelines should govern the use of cognitive enhancers in high-stress work environments?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Risk Assessment']
    },
    unstable_slope: {
        topic: 'Soil Mechanics & Geotechnical Slope Stability',
        learningObjective: 'Evaluate landslide indicators and select structural stabilization solutions to protect nearby roads.',
        priorKnowledge: 'Understanding shear stress, soil saturation, slope gradients, and landslide mechanics.',
        studentOutput: 'Slope stabilization solution selection and geotechnical evidence justification.',
        discussionQuestion: 'Which geotechnical factor (water content vs. slope angle) is most critical to prevent catastrophic failure?',
        skillsDeveloped: ['Data Interpretation', 'Scientific Reasoning', 'Risk Assessment', 'Decision Making']
    },
    invasive_species: {
        topic: 'Ecology & Biodiversity Mitigation',
        learningObjective: 'Analyze food webs and select targeted eradication methods to control invasive species with minimal collateral damage.',
        priorKnowledge: 'Understanding food chains, trophic cascades, ecological niches, and bio-control risks.',
        studentOutput: 'Invasive eradication plan selection and ecological impact justification.',
        discussionQuestion: 'How do conservationists determine whether biological or chemical eradication is safer for local biodiversity?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Risk Assessment', 'Decision Making']
    },
    power_grid: {
        topic: 'Electrical Impedance & Grid Load Management',
        learningObjective: 'Manage regional electricity supply and load shedding to prevent total blackout during peak demand.',
        priorKnowledge: 'Understanding electricity concepts, load balancing (MW), and basic generator operations.',
        studentOutput: 'Grid load allocation selection and infrastructure priority justification.',
        discussionQuestion: 'How should grid operators ethically prioritize power distribution during critical energy deficits?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Decision Making']
    },
    heat_loss: {
        topic: 'Thermodynamics & Thermal Insulation Design',
        learningObjective: 'Evaluate conduction, convection, and radiation pathways to optimize home insulation and minimize energy bills.',
        priorKnowledge: 'Understanding heat transfer mechanisms, R-value ratings, and thermal insulation materials.',
        studentOutput: 'Insulation material configuration and thermodynamic efficiency justification.',
        discussionQuestion: 'Which heat transfer mechanism contributes most to residential heat loss, and how do we prevent it?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Risk Assessment']
    },
    aspirin_production: {
        topic: 'Stoichiometry & Limiting Reactant Calculations',
        learningObjective: 'Determine the limiting reactant in acetylsalicylic acid synthesis to maximize product yield.',
        priorKnowledge: 'Balancing chemical equations, calculating molar masses, and mass-to-mole conversions.',
        studentOutput: 'Limiting reactant stoichiometric calculations and synthesis efficiency justification.',
        discussionQuestion: 'Why is stoichiometric precision critical in pharmaceutical synthesis compared to general manufacturing?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Stoichiometric Calculations']
    },
    fuelproduction: {
        topic: 'Biofuel Esterification & Catalyst Optimization',
        learningObjective: 'Optimize esterification reaction parameters to maximize biofuel purity and synthesis yield.',
        priorKnowledge: 'Familiarity with organic catalysts, molar ratios, and temperature influence on reaction rates.',
        studentOutput: 'Catalyst formulation selection and chemical kinetics justification.',
        discussionQuestion: 'How does catalyst selection influence both chemical production rate and final product purity?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Decision Making']
    },
    aspirin_percent_yield: {
        topic: 'Chemical Synthesis Yield & Filtration Losses',
        learningObjective: 'Calculate the theoretical and percent yield of aspirin synthesis and identify points of product loss.',
        priorKnowledge: 'Understanding theoretical vs. actual yields and typical purification/filtration steps.',
        studentOutput: 'Yield calculations and chemical purification loss justification.',
        discussionQuestion: 'What chemical or physical processes during vacuum filtration contribute most to product loss?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Stoichiometric Calculations']
    },
    gas_boyle_adnoc: {
        topic: "Boyle's Law & Gas Volume Compression",
        learningObjective: 'Predict gas volume changes under extreme compression in industrial refining tanks to prevent rupture.',
        priorKnowledge: "Knowledge of Boyle's Law (P1V1 = P2V2) and inverse volume-pressure relationship.",
        studentOutput: 'Refining compressor calculations and gas storage pressure justification.',
        discussionQuestion: 'How do changes in volume impact molecular collisions and pressure in a closed industrial vessel?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Risk Assessment']
    },
    gas_charles_aviation: {
        topic: "Charles's Law & Thermal Volume Expansion",
        learningObjective: 'Calculate volume changes of gas-filled aviation balloons under severe altitude temperature drops.',
        priorKnowledge: "Knowledge of Charles's Law (V1/T1 = V2/T2) and absolute temperature in Kelvin.",
        studentOutput: 'High-altitude thermal expansion calculations and flight safety justification.',
        discussionQuestion: 'Why must flight safety calculations convert temperature to Kelvin to ensure balloon integrity?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Risk Assessment']
    },
    gas_gaylussac_cylinder: {
        topic: "Gay-Lussac's Law & Pressure-Temperature Dynamics",
        learningObjective: 'Calculate internal pressure changes of heated sealed tanks to determine fire explosion thresholds.',
        priorKnowledge: "Knowledge of Gay-Lussac's Law (P1/T1 = P2/T2) and rigid volume boundaries.",
        studentOutput: 'Gas cylinder heat calculations and safety zone storage justification.',
        discussionQuestion: 'What are the main molecular differences between a rigid cylinder and an elastic balloon when heated?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Risk Assessment']
    },
    oxygen_failure: {
        topic: 'Gas Chemistry & Life Support Stoichiometry',
        learningObjective: 'Calculate molar ratios for chemical scrubbers to remove toxic carbon dioxide and restore spacecraft oxygen levels.',
        priorKnowledge: 'Understanding of chemical equations, molar gas volumes, and carbon dioxide absorption mechanisms.',
        studentOutput: 'Scrubber chemical replacement calculations and crew survival justification.',
        discussionQuestion: 'How do mechanical weight and space limitations on space crafts affect chemical system selection?',
        skillsDeveloped: ['Concept Application', 'Scientific Reasoning', 'Decision Making']
    }
};


export default function TeacherDashboard() {
    const [feedbackFilter, setFeedbackFilter] = useState('all');
    const [feedbackSearch, setFeedbackSearch] = useState('');
    const [showAnswersModal, setShowAnswersModal] = useState(false);
    const [selectedStudentForAnswers, setSelectedStudentForAnswers] = useState(null);

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scenarioSettings, setScenarioSettings] = useState({});
    const [students, setStudents] = useState([]);
    const [studentProgress, setStudentProgress] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({
        student_email: '', message: '', type: 'general', scenario_id: ''
    });
    const [sendingFeedback, setSendingFeedback] = useState(false);
    const [expandedPreviews, setExpandedPreviews] = useState({});
    const [selectedDebateScenario, setSelectedDebateScenario] = useState(Object.keys(SCENARIOS)[0] || '');
    const [selectedDebateScene, setSelectedDebateScene] = useState(1);
    const [isDebateFullscreen, setIsDebateFullscreen] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            const { data: profileData } = await supabase
                .from('profiles').select('*').eq('id', currentUser.id).single();
            setProfile(profileData);

            const { data: settings } = await supabase.from('scenario_settings').select('*');
            const settingsMap = {};
            (settings || []).forEach(s => { settingsMap[s.scenario_id] = s; });
            setScenarioSettings(settingsMap);

            const { data: studentList } = await supabase
                .from('profiles').select('*').eq('role', 'student');
            setStudents(studentList || []);

            const { data: progress } = await supabase
                .from('student_progress').select('*');
            setStudentProgress(progress || []);

            const { data: feedbackList } = await supabase
                .from('teacher_feedback').select('*').order('created_at', { ascending: false });
            setFeedbacks(feedbackList || []);

        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    };

    const getStudentProgress = (studentId) => {
        const allRows = studentProgress.filter(p => p.student_id === studentId);
        if (allRows.length === 0) return null;

        // Group by scenario_id and pick the BEST score for each
        const scenarioGroups = {};
        allRows.forEach(row => {
            if (!row.scenario_id) return; // Skip general progress if it exists
            const existing = scenarioGroups[row.scenario_id];
            if (!existing || (row.score || 0) > (existing.score || 0)) {
                scenarioGroups[row.scenario_id] = row;
            }
        });
        const uniqueRows = Object.values(scenarioGroups);

        const completedScenarios = uniqueRows.map(r => r.scenario_id);
        const badges = uniqueRows
            .filter(r => (r.score || 0) >= 80)
            .map(r => SCENARIOS[r.scenario_id]?.badge)
            .filter(Boolean);

        const skillsMap = {};
        const skillKeys = Object.keys(SKILLS);

        // Initialize all skills to 0
        skillKeys.forEach(key => {
            skillsMap[key] = 0;
        });

        // Compute progress for each skill: average of best passing scores of mapped scenarios
        skillKeys.forEach(skillKey => {
            const mappedScenarioIds = Object.keys(SCENARIOS).filter(scenarioId => {
                const sData = SCENARIOS[scenarioId];
                return sData && sData.skills && sData.skills.includes(skillKey);
            });

            if (mappedScenarioIds.length === 0) return;

            let totalScoreGained = 0;
            mappedScenarioIds.forEach(scenarioId => {
                const matchingRows = uniqueRows.filter(r => r.scenario_id === scenarioId && r.score >= 80);
                if (matchingRows.length > 0) {
                    const bestScore = Math.max(...matchingRows.map(r => r.score || 0));
                    totalScoreGained += bestScore;
                }
            });

            skillsMap[skillKey] = Math.round(totalScoreGained / mappedScenarioIds.length);
        });

        return {
            completed_scenarios: completedScenarios,
            badges: [...new Set(badges)],
            skills: skillsMap,
            rows: uniqueRows // Use deduplicated rows for display and scoring
        };
    };

    const updateScenarioSetting = async (scenarioId, field, value) => {
        console.log('Updating:', scenarioId, field, value);
        const existing = scenarioSettings[scenarioId];
        try {
            if (existing?.id) {
                const { error } = await supabase
                    .from('scenario_settings')
                    .update({ [field]: value })
                    .eq('id', existing.id);
                if (error) console.error('Update error:', error);
                else setScenarioSettings({ ...scenarioSettings, [scenarioId]: { ...existing, [field]: value } });
            } else {
                const { data: newSetting, error } = await supabase
                    .from('scenario_settings')
                    .insert({ scenario_id: scenarioId, [field]: value })
                    .select().single();
                if (error) console.error('Insert error:', error);
                else if (newSetting) setScenarioSettings({ ...scenarioSettings, [scenarioId]: newSetting });
            }
        } catch (e) {
            console.error('Error:', e);
        }
    };


    const sendFeedback = async () => {
        if (!feedbackForm.student_email || !feedbackForm.message) return;
        setSendingFeedback(true);
        const { data: newFb } = await supabase.from('teacher_feedback').insert({
            ...feedbackForm,
            teacher_id: user?.id,
            teacher_name: profile?.full_name || 'Teacher'
        }).select().single();
        if (newFb) setFeedbacks([newFb, ...feedbacks]);
        setFeedbackForm({ student_email: '', message: '', type: 'general', scenario_id: '' });
        setSendingFeedback(false);
    };

    const updateStudentDifficulty = async (studentEmail, newDifficulty) => {
        try {
            const existingRecord = feedbacks.find(
                f => f.student_email === studentEmail && f.type === 'difficulty_override'
            );

            if (existingRecord) {
                const { data: updatedRecord, error } = await supabase
                    .from('teacher_feedback')
                    .update({ message: newDifficulty })
                    .eq('id', existingRecord.id)
                    .select()
                    .single();

                if (error) throw error;
                setFeedbacks(feedbacks.map(f => f.id === existingRecord.id ? updatedRecord : f));
            } else {
                const { data: newRecord, error } = await supabase
                    .from('teacher_feedback')
                    .insert({
                        student_email: studentEmail,
                        type: 'difficulty_override',
                        message: newDifficulty,
                        scenario_id: 'all',
                        teacher_id: user?.id,
                        teacher_name: profile?.full_name || 'Teacher'
                    })
                    .select()
                    .single();

                if (error) throw error;
                setFeedbacks([newRecord, ...feedbacks]);
            }
        } catch (e) {
            console.error('Error updating student difficulty override:', e);
        }
    };

    const deleteFeedback = async (id) => {
        await supabase.from('teacher_feedback').delete().eq('id', id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
    };
    const exportCSV = () => {
        const rows = [];

        // Header
        rows.push([
            'Student Name',
            'Email',
            'Scenario Title',
            'Score',
            'Passed',
            'Completed At'
        ].join(','));

        // Data rows
        students.forEach(student => {
            const studentName = student.full_name || student.email?.split('@')[0] || 'Unknown';
            const progressRows = studentProgress.filter(p =>
                p.student_id === student.id && p.scenario_id
            );

            if (progressRows.length === 0) {
                rows.push([
                    `"${studentName}"`,
                    `"${student.email}"`,
                    '"No scenarios completed"',
                    '0',
                    'No',
                    ''
                ].join(','));
            } else {
                progressRows.forEach(row => {
                    const scenarioTitle = SCENARIOS[row.scenario_id]?.title || row.scenario_id;
                    rows.push([
                        `"${studentName}"`,
                        `"${student.email}"`,
                        `"${scenarioTitle}"`,
                        row.score || 0,
                        (row.score || 0) >= 80 ? 'Yes' : 'No',
                        row.completed_at ? new Date(row.completed_at).toLocaleDateString() : ''
                    ].join(','));
                });
            }
        });

        // Download
        const csv = rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-progress-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/SignIn';
    };

    const classSkillsData = React.useMemo(() => {
        return Object.keys(SKILLS).map(skillKey => {
            let total = 0;
            let count = 0;
            students.forEach(student => {
                const progressObj = getStudentProgress(student.id);
                if (progressObj && progressObj.completed_scenarios?.length > 0) {
                    total += (progressObj.skills?.[skillKey] || 0);
                    count++;
                }
            });
            return {
                name: SKILLS[skillKey]?.name || skillKey,
                score: count > 0 ? Math.round(total / count) : 0
            };
        });
    }, [students, studentProgress]);

    const learningInsights = React.useMemo(() => {
        if (!studentProgress || studentProgress.length === 0) {
            return {
                classInsight: "No student attempts have been recorded yet to generate learning insights.",
                misconceptions: [],
                recommendedAction: "Review general scientific inquiry methods and reading data tables.",
                needingSupport: [],
                strongPerformers: []
            };
        }

        const activeProgressRows = studentProgress.filter(p => p.scenario_id);
        const totalAttemptsCount = activeProgressRows.length;
        const avgScore = totalAttemptsCount > 0 
            ? Math.round(activeProgressRows.reduce((a, b) => a + (b.score || 0), 0) / totalAttemptsCount)
            : 0;

        let strongestSkill = { name: '', score: -1 };
        let weakestSkill = { name: '', score: 101 };
        classSkillsData.forEach(sk => {
            if (sk.score > strongestSkill.score) {
                strongestSkill = sk;
            }
            if (sk.score < weakestSkill.score && sk.score >= 0) {
                weakestSkill = sk;
            }
        });

        const strongestSkillName = strongestSkill.name || "Data Interpretation";
        const weakestSkillName = weakestSkill.name || "Scientific Reasoning";

        let classInsightText = `The class shows solid understanding with an average score of ${avgScore}%. `;
        if (strongestSkill.score > 0) {
            classInsightText += `They demonstrated the strongest mastery in ${strongestSkillName} (${strongestSkill.score}%). `;
        }
        if (weakestSkill.score < 100 && weakestSkill.score >= 0) {
            classInsightText += `However, they need additional focus and support in ${weakestSkillName} (${weakestSkill.score}%).`;
        } else {
            classInsightText += `Most students explained their reasoning clearly across all scenes.`;
        }

        const misconceptionCounts = {};
        activeProgressRows.forEach(row => {
            const scId = row.scenario_id;
            const scenario = SCENARIOS[scId];
            if (!scenario) return;

            const answers = row.answers || {};
            Object.entries(answers).forEach(([sceneKey, sceneAns]) => {
                if (!sceneKey.startsWith('scene')) return;
                const sceneNum = parseInt(sceneKey.replace('scene', ''), 10);
                const sceneData = scenario.scenes?.[sceneNum - 1];
                if (!sceneData || !sceneData.options) return;

                const selected = sceneAns.selectedOption || sceneAns.decision_id;
                if (!selected) return;

                const option = sceneData.options.find(o => 
                    o.id.toUpperCase() === selected.toUpperCase() || 
                    o.text.toLowerCase() === selected.toLowerCase()
                );

                if (option && option.misconception) {
                    const key = `${scId}-${sceneKey}-${option.id}`;
                    if (!misconceptionCounts[key]) {
                        misconceptionCounts[key] = {
                            scenarioTitle: scenario.title,
                            sceneTitle: sceneData.title,
                            optionLetter: option.id,
                            optionText: option.text,
                            thought: option.misconception.thought,
                            correction: option.misconception.correction,
                            count: 0
                        };
                    }
                    misconceptionCounts[key].count++;
                }
            });
        });

        const misconceptionsList = Object.values(misconceptionCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        let actionText = "Review general scientific inquiry methods and reading data tables before starting the next mission.";
        if (weakestSkill.name) {
            const skillName = weakestSkill.name.toLowerCase();
            if (skillName.includes('data') || skillName.includes('interpretation')) {
                actionText = "Schedule a class review on interpreting measurements, reading standard reference tables, and identifying outliers in data sets.";
            } else if (skillName.includes('reasoning') || skillName.includes('scientific')) {
                actionText = "Encourage students to frame their justifications by referencing specific evidence values (e.g. ppm levels, pH readings) and linking them to outcomes.";
            } else if (skillName.includes('decision') || skillName.includes('making')) {
                actionText = "Hold a brief class discussion regarding safety vs. economic tradeoffs, focusing on immediate remediation versus long-term plans.";
            } else if (skillName.includes('risk') || skillName.includes('analysis')) {
                actionText = "Re-teach risk evaluation: compare measured concentrations directly against safety thresholds to determine urgency.";
            } else if (skillName.includes('ethical') || skillName.includes('reasoning')) {
                actionText = "Review the social and environmental implications of chemical regulations, emphasizing patient and public safety.";
            } else if (skillName.includes('concept') || skillName.includes('application')) {
                actionText = "Review core concepts such as solubility, chemical formulas, and stoichiometric ratios before students proceed to advanced modules.";
            }
        }

        const needsSupportList = [];
        const strongPerformersList = [];

        students.forEach(student => {
            const progressObj = getStudentProgress(student.id);
            if (!progressObj || progressObj.completed_scenarios?.length === 0) return;

            const name = student.full_name || student.email?.split('@')[0] || "Unknown Student";
            const email = student.email;

            const studentRows = progressObj.rows || [];
            const totalScore = studentRows.reduce((a, b) => a + (b.score || 0), 0);
            const avgStudScore = studentRows.length > 0 ? Math.round(totalScore / studentRows.length) : 0;

            let totalJustificationLength = 0;
            let justificationCount = 0;
            studentRows.forEach(row => {
                const answers = row.answers || {};
                Object.values(answers).forEach(ans => {
                    const reason = ans?.justification || ans?.reasoning;
                    if (reason) {
                        totalJustificationLength += reason.trim().length;
                        justificationCount++;
                    }
                });
            });

            const avgJustificationLen = justificationCount > 0 ? Math.round(totalJustificationLength / justificationCount) : 0;

            const reasonsSupport = [];
            if (avgStudScore < 80) {
                reasonsSupport.push(`Low Score (${avgStudScore}%)`);
            }
            if (avgJustificationLen > 0 && avgJustificationLen < 30) {
                reasonsSupport.push(`Short Justifications`);
            }
            const studentAttemptsCount = studentProgress.filter(p => p.student_id === student.id).length;
            if (studentAttemptsCount >= 3) {
                reasonsSupport.push(`Multi-Attempt (${studentAttemptsCount} tries)`);
            }

            if (reasonsSupport.length > 0) {
                needsSupportList.push({ name, email, reasons: reasonsSupport });
            }

            const reasonsStrong = [];
            if (avgStudScore >= 90) {
                reasonsStrong.push(`High Score (${avgStudScore}%)`);
            }
            if (avgJustificationLen >= 75) {
                reasonsStrong.push(`Detailed Reasoning`);
            }
            const hasPlatinum = studentRows.some(row => {
                const badgeLvl = getBadgeLevel(row.score, row.answers, row.answers?.exitTicket?.difficultyMode || 'on-level');
                return badgeLvl === 'platinum';
            });
            if (hasPlatinum) {
                reasonsStrong.push("Platinum Badge");
            }

            if (reasonsStrong.length > 0 && reasonsSupport.length === 0) {
                strongPerformersList.push({ name, email, reasons: reasonsStrong });
            }
        });

        return {
            classInsight: classInsightText,
            misconceptions: misconceptionsList,
            recommendedAction: actionText,
            needingSupport: needsSupportList.slice(0, 5),
            strongPerformers: strongPerformersList.slice(0, 5)
        };
    }, [studentProgress, students, classSkillsData]);

    if (loading) {
        return (
            <div className="min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="glass-card p-5 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[var(--lx-accent)] animate-spin" />
                    <span className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest">LOADING...</span>
                </div>
            </div>
        );
    }

    const totalScenarios = Object.keys(SCENARIOS).length;

    const studentsWithProgress = students.filter(s => {
        const rows = studentProgress.filter(p => p.student_id === s.id);
        return rows.length > 0;
    });

    const avgProgress = students.length > 0
        ? Math.round(
            students.reduce((acc, s) => {
                const p = getStudentProgress(s.id);
                return acc + (p?.completed_scenarios?.length || 0);
            }, 0) / students.length / totalScenarios * 100
        )
        : 0;

    const stats = [
        { label: 'Students', value: students.length, Icon: Users, from: 'from-purple-500/10', to: 'to-pink-500/10', border: 'border-purple-500/30', bg: 'bg-purple-500/20', text: 'text-purple-400' },
        { label: 'Scenarios', value: totalScenarios, Icon: BookOpen, from: 'from-teal-500/10', to: 'to-emerald-500/10', border: 'border-teal-500/30', bg: 'bg-teal-500/20', text: 'text-teal-400' },
        { label: 'Completed Missions', value: studentsWithProgress.length, Icon: CheckCircle2, from: 'from-amber-500/10', to: 'to-orange-500/10', border: 'border-amber-500/30', bg: 'bg-amber-500/20', text: 'text-amber-400' },
        { label: 'Average Progress', value: `${avgProgress}%`, Icon: Target, from: 'from-blue-500/10', to: 'to-cyan-500/10', border: 'border-blue-500/30', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    ];

    const tabs = [
        { key: 'overview', label: 'Class Overview', Icon: BarChart3 },
        { key: 'scenarios', label: 'Manage Scenarios', Icon: Settings },
        { key: 'students', label: 'Student Progress', Icon: Users },
        { key: 'feedback', label: 'Feedback', Icon: MessageSquare },
        { key: 'debate', label: 'Class Debate', Icon: Presentation },
    ];
    // ── Analytics Data ──
    const scenarioCompletionData = Object.entries(SCENARIOS).map(([id, scenario]) => {
        const completions = studentProgress.filter(p => p.scenario_id === id);
        const avgScore = completions.length > 0
            ? Math.round(completions.reduce((a, b) => a + (b.score || 0), 0) / completions.length)
            : 0;
        return {
            name: scenario.title?.split(' ').slice(0, 3).join(' ') || id,
            completions: completions.length,
            avgScore
        };
    });

    const BAR_COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];

    const studentPerformanceData = students.map(student => {
        const rows = studentProgress.filter(p => p.student_id === student.id && p.scenario_id);
        const avgScore = rows.length > 0
            ? Math.round(rows.reduce((a, b) => a + (b.score || 0), 0) / rows.length)
            : 0;
        return {
            name: student.full_name || student.email?.split('@')[0] || 'Unknown',
            scenarios: rows.length,
            avgScore,
            passed: rows.filter(r => (r.score || 0) >= 80).length
        };
    });

    const passFailData = [
        { name: 'Passed ✅', value: studentProgress.filter(p => (p.score || 0) >= 80 && p.scenario_id).length },
        { name: 'Failed ❌', value: studentProgress.filter(p => (p.score || 0) < 80 && p.scenario_id).length }
    ];

    const PIE_COLORS = ['#14b8a6', '#f43f5e'];


    return (
        <div className="min-h-screen lx-bg-ambient">
            {/* Header */}
            <header className="glass-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-[var(--lx-text)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--lx-text)]">Teacher Dashboard</h1>
                            <p className="text-sm text-[var(--lx-text-muted)]">Welcome, {profile?.full_name || 'Teacher'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* 🏆 Leaderboard — New */}
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition text-sm px-3 py-2 rounded-lg hover:bg-amber-500/10">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:block">Leaderboard</span>
                        </button>

                        {/* ⚙️ Account Settings */}
                        <button
                            onClick={() => navigate('/ProfileSettings')}
                            className="flex items-center gap-1.5 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition text-sm px-3 py-2 rounded-lg hover:bg-[var(--lx-accent-soft)]">
                            <UserCircle className="w-4 h-4" />
                            <span className="hidden sm:block">Account</span>
                        </button>

                        {/* 🏠 Home */}
                        <button onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-3 py-2 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition rounded-lg hover:bg-[var(--lx-accent-soft)] text-sm">
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:block">Home</span>
                        </button>

                        {/* 🚪 Sign Out */}
                        <button onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition rounded-lg hover:bg-[var(--lx-accent-soft)] text-sm">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:block">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 glass-panel border border-[var(--lx-glass-border-sub)] flex items-center justify-center" style={{ borderRadius: '12px' }}>
                                    <stat.Icon className="w-6 h-6 text-[var(--lx-accent)]" />
                                </div>
                                <div>
                                    <p className="text-[var(--lx-text-muted)] text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold text-[var(--lx-text)]">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <div /> {/* spacer */}
                        <button
                            onClick={exportCSV}
                            className="liquid-btn flex items-center gap-2 px-4 py-2 text-sm font-medium"
                        >
                            Export CSV
                        </button>
                    </div>

                    <div className="glass-tabs p-1 w-fit">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`glass-tab flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'active' : ''}`}>
                                <tab.Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Scenarios Tab ── */}
                    {activeTab === 'scenarios' && (
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Scenario Controls</h2>
                            <div className="space-y-4">
                                {Object.entries(SCENARIOS).map(([id, scenario]) => {
                                    const settings = scenarioSettings[id] || {};
                                    const difficulty = settings.difficulty_override || 'on-level';
                                    const meta = SCENARIO_METADATA[id] || {};
                                    const misconceptions = [];
                                    (scenario.scenes || []).forEach(scene => {
                                        (scene.options || []).forEach(opt => {
                                            if (opt.misconception) {
                                                misconceptions.push({
                                                    sceneNum: scene.id,
                                                    sceneTitle: scene.title,
                                                    optionId: opt.id,
                                                    thought: opt.misconception.thought,
                                                    correction: opt.misconception.correction
                                                });
                                            }
                                        });
                                    });

                                    return (
                                        <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className="glass-card p-4">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-2xl">{scenario.badgeIcon}</span>
                                                        <div>
                                                            <h3 className="text-[var(--lx-text)] font-semibold">{scenario.title}</h3>
                                                            <p className="text-[var(--lx-text-muted)] text-sm">{scenario.strand} • {scenario.estimatedTime} min</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                        difficulty === 'on-level' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                            'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                                                        {difficulty === 'beginner' ? '🟢 Guided Mode' :
                                                            difficulty === 'on-level' ? '🟡 Standard Mode' : '🔴 Challenge Mode'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <button onClick={() => setExpandedPreviews(prev => ({ ...prev, [id]: !prev[id] }))}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10 text-sm font-semibold transition">
                                                        <Brain className="w-4 h-4 text-cyan-500" /> {expandedPreviews[id] ? 'Hide Preview' : 'Teacher Preview'}
                                                    </button>
                                                    <button onClick={() => navigate(`/ScenarioPlayer?scenario=${id}`)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-500/50 text-purple-600 hover:bg-purple-500/10 text-sm font-semibold transition">
                                                        <Eye className="w-4 h-4 text-purple-500" /> Preview as Student
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[var(--lx-text-muted)] text-sm">Level:</span>
                                                        <select value={difficulty}
                                                            onChange={e => updateScenarioSetting(id, 'difficulty_override', e.target.value)}
                                                            className="glass-input text-sm px-2 py-1.5">
                                                            <option value="beginner">Guided Mode</option>
                                                            <option value="on-level">Standard Mode</option>
                                                            <option value="high-achievers">Challenge Mode</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[var(--lx-text-muted)] text-sm">Mandatory:</span>
                                                        <button onClick={() => updateScenarioSetting(id, 'is_mandatory', !settings.is_mandatory)}
                                                            className={`w-10 h-6 rounded-full transition-colors ${settings.is_mandatory ? 'bg-teal-500' : 'bg-slate-600'}`}>
                                                            <span className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${settings.is_mandatory ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {settings.is_locked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                                                        <button onClick={() => updateScenarioSetting(id, 'is_locked', !settings.is_locked)}
                                                            className={`w-10 h-6 rounded-full transition-colors ${!settings.is_locked ? 'bg-teal-500' : 'bg-slate-600'}`}>
                                                            <span className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${!settings.is_locked ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Collapsible pedagogical preview card */}
                                            <AnimatePresence>
                                                {expandedPreviews[id] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 pt-4 border-t border-slate-200/60">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-800 leading-relaxed">
                                                                {/* Column 1: Mission Parameters */}
                                                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                                                                    <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-600 font-mono flex items-center gap-1.5">
                                                                        <Target className="w-4 h-4" /> Mission Objective
                                                                    </h4>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">Topic</p>
                                                                        <p className="text-slate-700">{meta.topic || 'General Science'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">Learning Objective</p>
                                                                        <p className="text-slate-700">{meta.learningObjective || 'Analyze evidence-based scenarios.'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">Estimated Time & Mode</p>
                                                                        <p className="text-slate-700">{scenario.estimatedTime} minutes • Current active mode: <span className="font-bold uppercase text-purple-600">{difficulty === 'beginner' ? 'Guided' : difficulty === 'on-level' ? 'Standard' : 'Challenge'}</span></p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">Skills Developed</p>
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {(meta.skillsDeveloped || []).map((sk, idx) => (
                                                                                <span key={idx} className="bg-cyan-50 border border-cyan-100 text-cyan-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                                                                                    {sk}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Column 2: Prior Knowledge & Output */}
                                                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                                                                    <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600 font-mono flex items-center gap-1.5">
                                                                        <Brain className="w-4 h-4" /> Pedagogical Info
                                                                    </h4>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">Required Prior Knowledge</p>
                                                                        <p className="text-slate-700">{meta.priorKnowledge || 'General high school science principles.'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">Student Deliverable / Output</p>
                                                                        <p className="text-slate-700">{meta.studentOutput || 'Completed decision-making matrix and justification.'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900">Suggested Debate Question</p>
                                                                        <p className="text-slate-700 font-medium italic">"{meta.discussionQuestion || 'Which choice is most scientifically justified?'}"</p>
                                                                    </div>
                                                                </div>

                                                                {/* Column 3: Common Misconceptions */}
                                                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                                                                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600 font-mono flex items-center gap-1.5">
                                                                        <AlertTriangle className="w-4 h-4" /> Misconceptions to Address
                                                                    </h4>
                                                                    {misconceptions.length === 0 ? (
                                                                        <p className="text-slate-500 italic text-xs">No specific misconceptions pre-mapped for this mission.</p>
                                                                    ) : (
                                                                        <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                                                                            {misconceptions.map((mis, idx) => (
                                                                                <div key={idx} className="text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                                                                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
                                                                                        Scene {mis.sceneNum} • Option {mis.optionId}
                                                                                    </div>
                                                                                    <p className="text-slate-800 font-semibold italic mt-0.5">"{mis.thought}"</p>
                                                                                    <p className="text-amber-700 font-bold mt-1">💡 Correction: <span className="font-medium text-slate-700">{mis.correction}</span></p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Students Tab ── */}
                    {activeTab === 'students' && (
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Student Progress</h2>
                            <p className="text-[var(--lx-text-muted)] text-sm mb-6">{students.length} student{students.length !== 1 ? 's' : ''} registered</p>

                            {students.length === 0 ? (
                                <div className="text-center py-12 text-[var(--lx-text-muted)]">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No students registered yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {students.map((student, index) => {
                                        const progress = getStudentProgress(student.id);
                                        const completedCount = progress?.completed_scenarios?.length || 0;
                                        const percentage = Math.round((completedCount / totalScenarios) * 100);
                                        const badges = progress?.badges?.length || 0;
                                        const isExpanded = expandedStudent === student.id;
                                        const studentName = student.full_name || student.email?.split('@')[0] || `Student ${index + 1}`;
                                        const studentDiffRecord = feedbacks.find(f => f.student_email === student.email && f.type === 'difficulty_override');
                                        const studentDiff = studentDiffRecord?.message || 'on-level';

                                        return (
                                            <motion.div key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="glass-card overflow-hidden">

                                                <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-700/30 transition"
                                                    onClick={() => setExpandedStudent(isExpanded ? null : student.id)}>
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-[var(--lx-text)] font-bold text-lg flex-shrink-0">
                                                        {studentName[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[var(--lx-text)] font-semibold truncate">{studentName}</p>
                                                        <p className="text-[var(--lx-text-muted)] text-xs truncate">{student.email}</p>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-3">
                                                        <div className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                                                            studentDiff === 'beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            studentDiff === 'on-level' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                            {studentDiff === 'beginner' ? 'Guided' :
                                                             studentDiff === 'on-level' ? 'Standard' : 'Challenge'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-1.5">
                                                            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                                                            <span className="text-teal-400 text-xs font-semibold">{completedCount}/{totalScenarios}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                                                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                                            <span className="text-amber-400 text-xs font-semibold">{badges}</span>
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${percentage >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            percentage >= 30 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                'bg-slate-700/50 text-[var(--lx-text-muted)] border-slate-600/30'}`}>
                                                            {percentage}%
                                                        </div>
                                                    </div>
                                                    <div className="text-[var(--lx-text-muted)]">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </div>
                                                </div>

                                                <div className="px-4 pb-3">
                                                    <div className="glass-progress h-1.5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${percentage >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                                            percentage >= 30 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                                                'bg-slate-600'}`}
                                                            style={{ width: `${percentage}%` }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="glass-panel border-t border-[var(--lx-glass-border-sub)] p-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h4 className="text-[var(--lx-text-muted)] text-sm font-semibold mb-3 flex items-center gap-2">
                                                                    <Brain className="w-4 h-4" /> Skills
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {Object.entries(SKILLS).map(([key, skill]) => {
                                                                        const val = progress?.skills?.[key] || 0;
                                                                        return (
                                                                            <div key={key}>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-[var(--lx-text-muted)] text-xs">{skill.icon} {skill.name}</span>
                                                                                    <span className={`text-xs font-semibold ${val >= 70 ? 'text-emerald-400' : val >= 40 ? 'text-amber-400' : 'text-[var(--lx-text-muted)]'}`}>{val}%</span>
                                                                                </div>
                                                                                <div className="glass-progress h-1.5 rounded-full overflow-hidden">
                                                                                    <div className={`h-full rounded-full ${val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-slate-600'}`}
                                                                                        style={{ width: `${val}%` }} />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-[var(--lx-text-muted)] text-sm font-semibold mb-3 flex items-center gap-2">
                                                                        <CheckCircle2 className="w-4 h-4" /> Completed Scenarios
                                                                    </h4>
                                                                    {completedCount === 0 ? (
                                                                        <p className="text-[var(--lx-text-muted)] text-xs">No scenarios completed yet</p>
                                                                    ) : (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {(progress?.completed_scenarios || []).map(sid => (
                                                                                <span key={sid} className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg px-2 py-1">
                                                                                    {SCENARIOS[sid]?.title || sid}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-[var(--lx-text-muted)] text-sm font-semibold mb-3 flex items-center gap-2">
                                                                        <Trophy className="w-4 h-4" /> Badges
                                                                    </h4>
                                                                    {badges === 0 ? (
                                                                        <p className="text-[var(--lx-text-muted)] text-xs">No badges earned yet</p>
                                                                    ) : (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {(progress?.badges || []).map(b => (
                                                                                <span key={b} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg px-2 py-1">
                                                                                    🏆 {b}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-[var(--lx-text-muted)] text-sm font-semibold mb-3 flex items-center gap-2">
                                                                        <Target className="w-4 h-4" /> Scores
                                                                    </h4>
                                                                    <div className="space-y-1">
                                                                        {(progress?.rows || []).map(row => (
                                                                            <div key={row.id} className="flex justify-between items-center group/item hover:bg-[var(--lx-glass-border-sub)]/80 p-1 rounded-lg transition-colors">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <span className="text-[var(--lx-text-muted)] text-xs truncate max-w-[120px]">
                                                                                        {SCENARIOS[row.scenario_id]?.title || row.scenario_id}
                                                                                    </span>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedStudentForAnswers({
                                                                                                name: studentName,
                                                                                                attempts: [row]
                                                                                            });
                                                                                            setShowAnswersModal(true);
                                                                                        }}
                                                                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-teal-400 transition"
                                                                                        title="View Detailed Answers"
                                                                                    >
                                                                                        <Eye className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </div>
                                                                                <span className={`text-xs font-bold ${row.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                                                    {row.score}%
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-[var(--lx-text-muted)] text-sm font-semibold mb-3 flex items-center gap-2">
                                                                        <Settings className="w-4 h-4 text-purple-400" /> Student Difficulty Mode
                                                                    </h4>
                                                                    <div className="flex items-center gap-3">
                                                                        <select
                                                                            value={studentDiff}
                                                                            onChange={e => updateStudentDifficulty(student.email, e.target.value)}
                                                                            className="glass-input text-xs px-3 py-2 bg-[var(--lx-glass-bg)] border border-[var(--lx-glass-border-sub)] rounded-lg text-[var(--lx-text)] focus:outline-none focus:border-[var(--lx-accent)] transition w-full sm:w-auto"
                                                                        >
                                                                            <option value="beginner">Guided Mode</option>
                                                                            <option value="on-level">Standard Mode</option>
                                                                            <option value="high-achievers">Challenge Mode</option>
                                                                        </select>
                                                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                                                                            studentDiff === 'beginner' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                                            studentDiff === 'on-level' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                                            'bg-red-500/20 text-red-400 border-red-500/30'
                                                                        }`}>
                                                                            {studentDiff === 'beginner' ? '🟢 Guided' :
                                                                             studentDiff === 'on-level' ? '🟡 Standard' : '🔴 Challenge'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col sm:flex-row gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedStudentForAnswers({
                                                                                name: studentName,
                                                                                attempts: progress?.rows || []
                                                                            });
                                                                            setShowAnswersModal(true);
                                                                        }}
                                                                        className="flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition">
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        View Answers
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setFeedbackForm(f => ({ ...f, student_email: student.email }));
                                                                            setActiveTab('feedback');
                                                                        }}
                                                                        className="flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition">
                                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                                        Send Feedback
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}{/* ── Feedback Tab ── */}
                    {activeTab === 'feedback' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Teacher Feedback</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-teal-400" /> Send Feedback
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">Student</label>
                                        <select value={feedbackForm.student_email}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, student_email: e.target.value })}
                                            className="glass-input w-full">
                                            <option value="">Select a student...</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.email}>
                                                    {s.full_name || s.email?.split('@')[0]} — {s.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">Type</label>
                                        <select value={feedbackForm.type}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                                            className="glass-input w-full">
                                            <option value="general">💬 General</option>
                                            <option value="praise">🌟 Praise</option>
                                            <option value="improvement">💡 Needs Improvement</option>
                                            <option value="assignment">📋 Assignment Note</option>
                                        </select>
                                    </div>

                                    {/* Quick Reply Templates */}
                                    <div>
                                        <label className="text-[var(--lx-text-muted)] text-sm mb-2 block">Quick Templates</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: '🌟 Great job!', text: 'Great job on completing this scenario! Your answers showed excellent understanding.' },
                                                { label: '💡 Try again', text: 'Good effort! Please review the scenario concepts and try again to improve your score.' },
                                                { label: '📋 Assignment', text: 'Please complete the assigned scenario before the deadline. Let me know if you need help.' },
                                                { label: '🎯 Almost there', text: "You're almost there! Focus on the Final Check questions to boost your score above 80%." },
                                            ].map((t, i) => (
                                                <button key={i}
                                                    onClick={() => setFeedbackForm(f => ({ ...f, message: t.text }))}
                                                    className="glass-badge text-xs px-3 py-1.5 hover:border-[var(--lx-accent)]/50 transition cursor-pointer">
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">Scenario (optional)</label>
                                        <select value={feedbackForm.scenario_id}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, scenario_id: e.target.value })}
                                            className="glass-input w-full">
                                            <option value="">All Scenarios</option>
                                            {Object.entries(SCENARIOS).map(([id, s]) => (
                                                <option key={id} value={id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[var(--lx-text-muted)] text-sm mb-1 block">Message</label>
                                        <textarea rows={4} placeholder="Write your feedback here..."
                                            value={feedbackForm.message}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                            className="glass-input w-full resize-none" />
                                    </div>
                                    <button onClick={sendFeedback}
                                        disabled={sendingFeedback || !feedbackForm.student_email || !feedbackForm.message}
                                        className="liquid-btn-accent w-full flex items-center justify-center gap-2 font-bold py-3 disabled:opacity-50">
                                        {sendingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Send Feedback
                                    </button>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                        Sent Feedback ({feedbacks.filter(fb => fb.type !== 'difficulty_override').length})
                                    </h2>
                                    {/* Filter */}
                                    <select
                                        value={feedbackFilter}
                                        onChange={e => setFeedbackFilter(e.target.value)}
                                        className="glass-input text-xs px-3 py-1.5">
                                        <option value="all">All Types</option>
                                        <option value="praise">🌟 Praise</option>
                                        <option value="improvement">💡 Improvement</option>
                                        <option value="assignment">📋 Assignment</option>
                                        <option value="general">💬 General</option>
                                    </select>
                                </div>

                                {/* Search */}
                                <input
                                    type="text"
                                    placeholder="Search feedback..."
                                    value={feedbackSearch}
                                    onChange={e => setFeedbackSearch(e.target.value)}
                                    className="glass-input w-full mb-4"
                                />

                                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                    {feedbacks
                                        .filter(fb =>
                                            fb.type !== 'difficulty_override' &&
                                            (feedbackFilter === 'all' || fb.type === feedbackFilter) &&
                                            (fb.message?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                                                fb.student_email?.toLowerCase().includes(feedbackSearch.toLowerCase()))
                                        )
                                        .length === 0 ? (
                                        <div className="text-center py-12 text-[var(--lx-text-muted)]">
                                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No feedback found</p>
                                        </div>
                                    ) : (
                                        feedbacks
                                            .filter(fb =>
                                                fb.type !== 'difficulty_override' &&
                                                (feedbackFilter === 'all' || fb.type === feedbackFilter) &&
                                                (fb.message?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                                                    fb.student_email?.toLowerCase().includes(feedbackSearch.toLowerCase()))
                                            )
                                            .map(fb => {
                                                const typeColor = {
                                                    praise: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                                                    improvement: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                                                    assignment: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                                                    general: 'text-[var(--lx-text-muted)] bg-slate-700/30 border-slate-600/30',
                                                }[fb.type] || 'text-[var(--lx-text-muted)] bg-slate-700/30 border-slate-600/30';
                                                return (
                                                    <div key={fb.id} className="glass-card p-4 group">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div>
                                                                <p className="text-[var(--lx-text)] text-sm font-medium">{fb.student_email}</p>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor} capitalize`}>{fb.type}</span>
                                                            </div>
                                                            <button onClick={() => deleteFeedback(fb.id)}
                                                                className="opacity-0 group-hover:opacity-100 text-[var(--lx-text-muted)] hover:text-red-400 transition-all">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <p className="text-[var(--lx-text-muted)] text-sm mt-2 leading-relaxed">{fb.message}</p>
                                                        {fb.scenario_id && (
                                                            <p className="text-[var(--lx-text-muted)] text-xs mt-2">Re: {SCENARIOS[fb.scenario_id]?.title || fb.scenario_id}</p>
                                                        )}
                                                        <p className="text-[var(--lx-text-muted)] text-xs mt-1">
                                                            {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* ── Class Overview Tab ── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Class Summary */}
                            <div className="space-y-4">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    Class Summary
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Attempts', value: studentProgress.filter(p => p.scenario_id).length },
                                        {
                                            label: 'Pass Rate',
                                            value: `${studentProgress.filter(p => p.scenario_id).length > 0
                                                ? Math.round(studentProgress.filter(p => (p.score || 0) >= 80 && p.scenario_id).length
                                                    / studentProgress.filter(p => p.scenario_id).length * 100)
                                                : 0}%`
                                        },
                                        {
                                            label: 'Avg Score',
                                            value: `${studentProgress.filter(p => p.scenario_id).length > 0
                                                ? Math.round(studentProgress.filter(p => p.scenario_id)
                                                    .reduce((a, b) => a + (b.score || 0), 0)
                                                    / studentProgress.filter(p => p.scenario_id).length)
                                                : 0}%`
                                        },
                                        {
                                            label: 'Active Students',
                                            value: [...new Set(studentProgress.filter(p => p.scenario_id).map(p => p.student_id))].length
                                        },
                                    ].map((card, i) => (
                                        <div key={i} className="glass-card p-4 text-center border-slate-200 bg-white shadow-sm">
                                            <p className="text-[var(--lx-accent)] text-2xl font-bold">{card.value}</p>
                                            <p className="text-slate-600 text-xs mt-1 font-semibold">{card.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Class Insights */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    Class Insights
                                </h3>
                                <div className="glass-card p-6 border-slate-200 bg-white shadow-sm space-y-6 rounded-2xl">
                                    <div className="border-b border-slate-100 pb-4">
                                        <h3 className="text-lg font-bold text-slate-850 flex items-center gap-2">
                                            💡 Classroom Insights
                                        </h3>
                                        <p className="text-slate-500 text-xs mt-1">
                                            Automatically calculated pedagogical insights based on student choice decisions and reasoning justifications.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Class Insight Card */}
                                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                                            <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider font-mono">
                                                <Brain className="w-4.5 h-4.5" />
                                                Class Progress
                                            </div>
                                            <p className="text-slate-800 text-sm leading-relaxed font-semibold">
                                                {learningInsights.classInsight}
                                            </p>
                                        </div>

                                        {/* Misconception Alert Card */}
                                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                                            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider font-mono">
                                                <AlertTriangle className="w-4.5 h-4.5" />
                                                Misconception Alert
                                            </div>
                                            {learningInsights.misconceptions.length === 0 ? (
                                                <p className="text-slate-600 text-xs italic">
                                                    No class-wide misconceptions detected so far.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {learningInsights.misconceptions.map((m, idx) => (
                                                        <div key={idx} className="text-xs space-y-1">
                                                            <div className="flex justify-between font-bold text-slate-850">
                                                                <span className="truncate max-w-[80%] font-semibold">{m.scenarioTitle} ({m.optionLetter})</span>
                                                                <span className="text-amber-600 shrink-0 font-mono font-bold">{m.count} student{m.count > 1 ? 's' : ''}</span>
                                                            </div>
                                                            <p className="text-slate-550 italic">"{m.thought}"</p>
                                                            <p className="text-slate-700 font-bold">💡 {m.correction}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Recommended Action Card */}
                                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                                            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider font-mono">
                                                <Target className="w-4.5 h-4.5" />
                                                Recommended Action
                                            </div>
                                            <p className="text-slate-800 text-sm leading-relaxed font-semibold">
                                                {learningInsights.recommendedAction}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        {/* Students Needing Support */}
                                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                                <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                                    ⚠️ Students Needing Support
                                                </span>
                                                <span className="text-[10px] font-mono font-bold bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 rounded">
                                                    {learningInsights.needingSupport.length} flagged
                                                </span>
                                            </div>
                                            {learningInsights.needingSupport.length === 0 ? (
                                                <p className="text-slate-500 text-xs italic">
                                                    All students are performing well above thresholds!
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {learningInsights.needingSupport.map((student, sIdx) => (
                                                        <div key={sIdx} className="flex justify-between items-center gap-4 text-xs">
                                                            <div>
                                                                <p className="font-bold text-slate-800">{student.name}</p>
                                                                <p className="text-[10px] text-slate-500">{student.email}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 justify-end max-w-[60%] font-semibold">
                                                                {student.reasons.map((r, rIdx) => (
                                                                    <span key={rIdx} className="bg-amber-100 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                                        {r}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Strong Performers */}
                                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                                <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                                    ⭐ Strong Performers
                                                </span>
                                                <span className="text-[10px] font-mono font-bold bg-teal-100 border border-teal-200 text-teal-700 px-2 py-0.5 rounded">
                                                    {learningInsights.strongPerformers.length} student{learningInsights.strongPerformers.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {learningInsights.strongPerformers.length === 0 ? (
                                                <p className="text-slate-500 text-xs italic">
                                                    Complete scenarios to identify top class performers.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {learningInsights.strongPerformers.map((student, sIdx) => (
                                                        <div key={sIdx} className="flex justify-between items-center gap-4 text-xs">
                                                            <div>
                                                                <p className="font-bold text-slate-800">{student.name}</p>
                                                                <p className="text-[10px] text-slate-500">{student.email}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 justify-end max-w-[60%] font-semibold">
                                                                {student.reasons.map((r, rIdx) => (
                                                                    <span key={rIdx} className="bg-teal-100 border border-teal-200 text-teal-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                                        {r}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skill Analytics */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    Skill Analytics
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* completions chart */}
                                    <div className="glass-card p-6 border-slate-200 bg-white shadow-sm rounded-2xl">
                                        <h3 className="text-[var(--lx-text)] font-bold mb-6 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-teal-550" />
                                            Completions & Avg Score per Scenario
                                        </h3>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={scenarioCompletionData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }}
                                                    angle={-35} textAnchor="end" interval={0} />
                                                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                    labelStyle={{ color: '#1e293b', fontWeight: 'bold' }} itemStyle={{ color: '#475569' }} />
                                                <Legend wrapperStyle={{ color: '#475569', paddingTop: '20px' }} />
                                                <Bar dataKey="completions" fill="#0d9488" name="Completions" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="avgScore" fill="#7c3aed" name="Avg Score %" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* skill distribution chart */}
                                    <div className="glass-card p-6 border-slate-200 bg-white shadow-sm rounded-2xl">
                                        <h3 className="text-[var(--lx-text)] font-bold mb-6 flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-emerald-550" />
                                            Class Skill Distribution (Average Mastery %)
                                        </h3>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={classSkillsData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                                                <YAxis tick={{ fill: '#475569', fontSize: 11 }} domain={[0, 100]} />
                                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                    labelStyle={{ color: '#1e293b', fontWeight: 'bold' }} itemStyle={{ color: '#475569' }} />
                                                <Bar dataKey="score" name="Average Mastery %" radius={[4, 4, 0, 0]}>
                                                    {classSkillsData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* student performance chart */}
                                    <div className="glass-card p-6 border-slate-200 bg-white shadow-sm rounded-2xl">
                                        <h3 className="text-[var(--lx-text)] font-bold mb-6 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-purple-550" />
                                            Student Performance
                                        </h3>
                                        {studentPerformanceData.length === 0 ? (
                                            <div className="flex items-center justify-center h-48 text-[var(--lx-text-muted)] text-sm">No student data yet</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={studentPerformanceData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                                                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }} itemStyle={{ color: '#475569' }} />
                                                    <Legend wrapperStyle={{ color: '#475569' }} />
                                                    <Bar dataKey="scenarios" fill="#0d9488" name="Scenarios Done" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="passed" fill="#059669" name="Passed" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="avgScore" fill="#7c3aed" name="Avg Score %" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>

                                    {/* pass vs fail chart */}
                                    <div className="glass-card p-6 border-slate-200 bg-white shadow-sm rounded-2xl">
                                        <h3 className="text-[var(--lx-text)] font-bold mb-6 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-emerald-555" />
                                            Pass vs Fail Rate
                                        </h3>
                                        {passFailData[0].value + passFailData[1].value === 0 ? (
                                            <div className="flex items-center justify-center h-48 text-[var(--lx-text-muted)] text-sm">No attempts yet</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie data={passFailData} cx="50%" cy="50%"
                                                        innerRadius={60} outerRadius={90}
                                                        paddingAngle={4} dataKey="value">
                                                        {passFailData.map((_, i) => (
                                                            <Cell key={i} fill={PIE_COLORS[i]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                        itemStyle={{ color: '#475569' }} />
                                                    <Legend wrapperStyle={{ color: '#475569' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Class Debate Tab ── */}
                    {activeTab === 'debate' && (
                        <div className="space-y-6">
                            <div className="glass-card p-6">
                                <div className="border-b border-slate-100 pb-4 mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <Presentation className="w-5 h-5 text-purple-500" />
                                        Class Debate Mode
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Facilitate scientific debates by displaying anonymous choice distributions and key reasoning themes.
                                    </p>
                                </div>

                                {/* Scenario + Scene selectors */}
                                <div className="flex flex-wrap items-end gap-4 mb-6">
                                    <div>
                                        <label className="text-slate-600 text-xs font-semibold block mb-1">Scenario</label>
                                        <select
                                            value={selectedDebateScenario}
                                            onChange={e => setSelectedDebateScenario(e.target.value)}
                                            className="glass-input text-sm px-3 py-2"
                                        >
                                            {Object.entries(SCENARIOS).map(([id, s]) => (
                                                <option key={id} value={id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-600 text-xs font-semibold block mb-1">Scene</label>
                                        <select
                                            value={selectedDebateScene}
                                            onChange={e => setSelectedDebateScene(Number(e.target.value))}
                                            className="glass-input text-sm px-3 py-2"
                                        >
                                            {(SCENARIOS[selectedDebateScenario]?.scenes || []).map((scene, idx) => (
                                                <option key={idx} value={idx + 1}>Scene {idx + 1}: {scene.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1" />
                                    <button
                                        onClick={() => setIsDebateFullscreen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition shadow-sm"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                        Present Fullscreen
                                    </button>
                                </div>

                                <DebateView
                                    scenarioId={selectedDebateScenario}
                                    sceneId={selectedDebateScene}
                                    studentProgress={studentProgress}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {/* Student Answers Modal */}
            <StudentAnswersModal
                isOpen={showAnswersModal}
                onClose={() => {
                    setShowAnswersModal(false);
                    setSelectedStudentForAnswers(null);
                }}
                attempts={selectedStudentForAnswers?.attempts || []}
                studentName={selectedStudentForAnswers?.name}
            />
            <DebatePresentationOverlay
                isOpen={isDebateFullscreen}
                onClose={() => setIsDebateFullscreen(false)}
                scenarioId={selectedDebateScenario}
                sceneId={selectedDebateScene}
                studentProgress={studentProgress}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Helper: extract reasoning themes from student justifications
// ─────────────────────────────────────────────────────────────
const DEBATE_THEMES = [
    { name: 'Safety & Risk',        icon: '⚠️', keywords: ['safe', 'risk', 'danger', 'hazard', 'protect', 'harm', 'injury', 'threat', 'toxin', 'toxic'] },
    { name: 'Scientific Evidence',  icon: '🔬', keywords: ['data', 'evidence', 'study', 'research', 'test', 'experiment', 'measurement', 'reading', 'analysis', 'result'] },
    { name: 'Environmental Impact', icon: '🌿', keywords: ['environment', 'ecosystem', 'nature', 'species', 'habitat', 'pollution', 'contamination', 'ecology', 'biodiversity', 'soil'] },
    { name: 'Cost & Efficiency',    icon: '💰', keywords: ['cost', 'cheap', 'expensive', 'efficient', 'afford', 'budget', 'economic', 'resource', 'yield', 'output'] },
    { name: 'Ethical Reasoning',    icon: '⚖️', keywords: ['ethic', 'moral', 'fair', 'right', 'responsib', 'justice', 'value', 'equity', 'community', 'patient'] },
    { name: 'Chemical/Physical',    icon: '⚗️', keywords: ['chemical', 'reaction', 'compound', 'element', 'molecule', 'acid', 'base', 'ph', 'concentration', 'temperature', 'pressure'] },
    { name: 'Long-term Planning',   icon: '📅', keywords: ['long-term', 'future', 'sustainable', 'permanent', 'lasting', 'prevention', 'decades', 'monitor'] },
];

function getThemesForScene(scenarioId, justifications) {
    if (!justifications || justifications.length === 0) return [];
    const found = [];
    DEBATE_THEMES.forEach(theme => {
        const matches = justifications.filter(j =>
            theme.keywords.some(kw => j.toLowerCase().includes(kw))
        );
        if (matches.length > 0) {
            found.push({ ...theme, count: matches.length, matches: matches.slice(0, 3) });
        }
    });
    return found.sort((a, b) => b.count - a.count).slice(0, 5);
}

// ─────────────────────────────────────────────────────────────
// DebateView — inline panel shown inside the Class Debate tab
// ─────────────────────────────────────────────────────────────
function DebateView({ scenarioId, sceneId, studentProgress }) {
    const selectedScenario = SCENARIOS[scenarioId];
    const scene = selectedScenario?.scenes?.[sceneId - 1];

    if (!scene) return (
        <div className="text-center py-16 text-slate-500 text-sm">Select a scenario and scene to begin.</div>
    );

    const options = scene.options || [];
    const attempts = studentProgress.filter(p => p.scenario_id === scenarioId && p.answers);
    const totalAttempts = attempts.length;

    const counts = {};
    options.forEach(o => { counts[o.id] = 0; });
    const justificationList = [];

    attempts.forEach(attempt => {
        const sceneAns = attempt.answers[`scene${sceneId}`];
        if (sceneAns) {
            const choice = sceneAns.selectedOption || sceneAns.decision_id;
            if (choice) {
                const matchedOption = options.find(o =>
                    o.id.toUpperCase() === choice.toUpperCase() ||
                    o.text.toLowerCase() === choice.toLowerCase()
                );
                if (matchedOption) {
                    counts[matchedOption.id]++;
                } else {
                    const firstChar = choice.trim()[0]?.toUpperCase();
                    if (firstChar && counts[firstChar] !== undefined) counts[firstChar]++;
                }
            }
            const reason = sceneAns.justification || sceneAns.reasoning;
            if (reason && reason.trim()) justificationList.push(reason.trim());
        }
    });

    const themes = getThemesForScene(scenarioId, justificationList);

    return (
        <div className="space-y-6">
            {/* Scene Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                    <Presentation className="w-3.5 h-3.5" />
                    Scene {sceneId} — {scene.title}
                </div>
                <p className="text-slate-900 font-extrabold text-lg leading-snug">{scene.question}</p>
            </div>

            {/* Suggested Prompt */}
            <div className="border border-purple-200 bg-purple-50 p-4 rounded-xl flex items-center gap-3">
                <span className="text-2xl shrink-0">💬</span>
                <div>
                    <span className="text-[10px] font-mono text-purple-600 uppercase tracking-widest font-bold block">Suggested Discussion Prompt</span>
                    <p className="text-purple-900 text-base font-extrabold">"Which choice is most scientifically justified?"</p>
                </div>
            </div>

            {/* Choice Distribution + Reasoning Themes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Choice Distribution */}
                <div className="glass-card p-6 border-slate-200 bg-white shadow-sm rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                        📊 Class Choice Distribution
                        <span className="ml-auto text-xs font-mono text-slate-500">{totalAttempts} submission{totalAttempts !== 1 ? 's' : ''}</span>
                    </h3>
                    {totalAttempts === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-xs">No submissions yet for this scenario.</div>
                    ) : (
                        <div className="space-y-4">
                            {options.map(opt => {
                                const count = counts[opt.id] || 0;
                                const pct = totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0;
                                return (
                                    <div key={opt.id} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-800 truncate max-w-[75%] font-semibold">Option {opt.id}: {opt.text}</span>
                                            <span className="text-teal-600 font-mono font-bold shrink-0 ml-2">{pct}% ({count})</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Reasoning Themes */}
                <div className="glass-card p-6 border-slate-200 bg-white shadow-sm rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                        🧠 Key Reasoning Themes
                    </h3>
                    {themes.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs font-medium">
                            No student justifications analyzed yet, or justifications are too short.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                            {themes.map((theme, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            <span>{theme.icon}</span> {theme.name}
                                        </span>
                                        <span className="text-[10px] font-mono bg-purple-100 border border-purple-200 text-purple-700 px-2 py-0.5 rounded font-bold">
                                            {theme.count} student{theme.count > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {theme.matches.map((quote, qIdx) => (
                                            <p key={qIdx} className="text-[11px] text-slate-700 italic pl-2.5 border-l-2 border-purple-400 leading-relaxed font-medium">
                                                "{quote.length > 100 ? quote.slice(0, 100) + '...' : quote}"
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* All Justifications */}
            <div className="glass-card p-6 border-slate-200 bg-white shadow-sm rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    📋 All Student Reasoning (Anonymous)
                </h3>
                {justificationList.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs font-medium">
                        No submissions recorded for this scenario yet.
                    </div>
                ) : (
                    <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                        {justificationList
                            .filter(j => !j.toLowerCase().includes('skipped') && !j.toLowerCase().includes('skip'))
                            .map((reason, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs leading-relaxed text-slate-800 font-semibold shadow-sm">
                                    {reason}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// DebatePresentationOverlay — fullscreen classroom projector view
// ─────────────────────────────────────────────────────────────
function DebatePresentationOverlay({ isOpen, onClose, scenarioId, sceneId, studentProgress }) {
    if (!isOpen) return null;

    const selectedScenario = SCENARIOS[scenarioId];
    const scene = selectedScenario?.scenes?.[sceneId - 1];
    if (!scene) return null;

    const options = scene.options || [];
    const attempts = studentProgress.filter(p => p.scenario_id === scenarioId && p.answers);
    const totalAttempts = attempts.length;

    const counts = {};
    options.forEach(o => { counts[o.id] = 0; });
    const justificationList = [];

    attempts.forEach(attempt => {
        const sceneAns = attempt.answers[`scene${sceneId}`];
        if (sceneAns) {
            const choice = sceneAns.selectedOption || sceneAns.decision_id;
            if (choice) {
                const matchedOption = options.find(o =>
                    o.id.toUpperCase() === choice.toUpperCase() ||
                    o.text.toLowerCase() === choice.toLowerCase()
                );
                if (matchedOption) {
                    counts[matchedOption.id]++;
                } else {
                    const firstChar = choice.trim()[0]?.toUpperCase();
                    if (firstChar && counts[firstChar] !== undefined) counts[firstChar]++;
                }
            }
            const reason = sceneAns.justification || sceneAns.reasoning;
            if (reason && reason.trim()) justificationList.push(reason.trim());
        }
    });

    const themes = getThemesForScene(scenarioId, justificationList);

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)' }}
        >
            {/* Overlay Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                        <Presentation className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Class Debate Mode — Projector View</p>
                        <h2 className="text-xl font-extrabold text-slate-900">{selectedScenario?.title}</h2>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
                >
                    <Minimize2 className="w-4 h-4" /> Exit Fullscreen
                </button>
            </div>

            {/* Main Projector Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {/* Scene Question */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Scene {sceneId} — {scene.title}</p>
                    <p className="text-2xl font-extrabold text-slate-900 leading-snug">{scene.question}</p>
                </div>

                {/* Prompt */}
                <div className="border-2 border-purple-300 bg-purple-50 p-5 rounded-2xl flex items-center gap-4">
                    <span className="text-3xl shrink-0">💬</span>
                    <div>
                        <span className="text-[10px] font-mono text-purple-600 uppercase tracking-widest font-bold block">Discussion Prompt</span>
                        <p className="text-purple-900 text-xl font-extrabold mt-1">"Which choice is most scientifically justified?"</p>
                    </div>
                </div>

                {/* Choice Distribution */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        📊 Class Choice Distribution
                        <span className="ml-auto text-sm font-mono text-slate-500">{totalAttempts} submission{totalAttempts !== 1 ? 's' : ''}</span>
                    </h3>
                    {totalAttempts === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">No submissions yet for this scenario.</div>
                    ) : (
                        <div className="space-y-5">
                            {options.map(opt => {
                                const count = counts[opt.id] || 0;
                                const pct = totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0;
                                return (
                                    <div key={opt.id} className="space-y-2">
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-slate-800 truncate max-w-[80%]">Option {opt.id}: {opt.text}</span>
                                            <span className="text-teal-600 font-mono shrink-0 ml-4">{pct}% <span className="text-slate-500 font-normal">({count} votes)</span></span>
                                        </div>
                                        <div className="h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Reasoning Themes */}
                {themes.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-slate-800 mb-4">🧠 Key Reasoning Themes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {themes.map((theme, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <span className="text-lg">{theme.icon}</span> {theme.name}
                                        </span>
                                        <span className="text-xs font-mono bg-purple-100 border border-purple-200 text-purple-700 px-2 py-0.5 rounded font-bold">
                                            {theme.count}
                                        </span>
                                    </div>
                                    {theme.matches[0] && (
                                        <p className="text-xs text-slate-600 italic border-l-2 border-purple-400 pl-2.5 leading-relaxed">
                                            "{theme.matches[0].length > 80 ? theme.matches[0].slice(0, 80) + '...' : theme.matches[0]}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Anonymous Justifications */}
                {justificationList.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-slate-800 mb-4">📋 Student Reasoning (Anonymous)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {justificationList
                                .filter(j => !j.toLowerCase().includes('skipped') && !j.toLowerCase().includes('skip'))
                                .map((reason, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-sm leading-relaxed text-slate-800 font-semibold shadow-sm">
                                        {reason}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
