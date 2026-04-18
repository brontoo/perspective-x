import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Award, 
  BarChart2,
  ClipboardList,
  MessageSquare,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function ExitTicket({ scenario, studentChoice, onComplete, theme = {} }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [reflection, setReflection] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState([]);

  const accent = theme.accent || 'from-teal-500 to-emerald-500';
  const border = theme.border || 'border-teal-500/30';
  const text = theme.text || 'text-teal-400';

  // Calculate score and achievements
  useEffect(() => {
    if (showResults) {
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const newScore = Math.round((correctAnswers / scenario.exitTicket.questions.length) * 100);
      setScore(newScore);

      const earnedAchievements = [];
      if (newScore >= 90) earnedAchievements.push('Master Scientist');
      if (newScore >= 70) earnedAchievements.push('Competent Researcher');
      if (answers.every(a => a.isCorrect)) earnedAchievements.push('Perfect Score');
      if (reflection.length > 200) earnedAchievements.push('Deep Thinker');
      
      setAchievements(earnedAchievements);
    }
  }, [showResults, answers, reflection, scenario]);

  const handleAnswer = (option, isCorrect) => {
    setAnswers([...answers, { 
      questionId: currentQuestion,
      option,
      isCorrect 
    }]);

    if (currentQuestion < scenario.exitTicket.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 1000);
    } else {
      setTimeout(() => setShowResults(true), 1000);
    }
  };

  const handleSubmit = () => {
    onComplete({
      score,
      answers,
      reflection,
      achievements
    });
  };

  const renderQuestion = () => {
    const question = scenario.exitTicket.questions[currentQuestion];
    return (
      <motion.div
        key={`question-${currentQuestion}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg bg-slate-800 ${text}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className={`text-xs font-bold uppercase tracking-widest ${text}`}>
            Question {currentQuestion + 1} of {scenario.exitTicket.questions.length}
          </h3>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAnswer(option.id, option.correct)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                answers.some(a => a.questionId === currentQuestion && a.option === option.id)
                  ? option.correct
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                  : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  answers.some(a => a.questionId === currentQuestion && a.option === option.id)
                    ? option.correct
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {answers.some(a => a.questionId === currentQuestion && a.option === option.id)
                    ? option.correct
                      ? <CheckCircle2 className="w-5 h-5" />
                      : <XCircle className="w-5 h-5" />
                    : String.fromCharCode(65 + question.options.indexOf(option))}
                </div>
                <p className="text-white">{option.text}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            score >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
          } border-2 mb-6`}
        >
          <span className="text-2xl font-bold text-white">{score}%</span>
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {score >= 70 ? 'Great Work!' : 'Good Effort!'}
        </h2>
        <p className="text-slate-400">
          {score >= 70 
            ? 'You demonstrated strong understanding of the concepts.'
            : 'Review the material to improve your understanding.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`border ${border} bg-slate-900/50 p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 className={`w-5 h-5 ${text}`} />
            <h3 className={`text-xs font-bold uppercase tracking-widest ${text}`}>Performance Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Correct Answers:</span>
              <span className="font-bold text-white">
                {answers.filter(a => a.isCorrect).length} / {scenario.exitTicket.questions.length}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </Card>

        {achievements.length > 0 && (
          <Card className={`border ${border} bg-slate-900/50 p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Award className={`w-5 h-5 ${text}`} />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${text}`}>Achievements</h3>
            </div>
            <div className="space-y-2">
              {achievements.map((achievement, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-white">{achievement}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Card className={`border ${border} bg-slate-900/50 p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className={`w-5 h-5 ${text}`} />
          <h3 className={`text-xs font-bold uppercase tracking-widest ${text}`}>Reflection</h3>
        </div>
        <p className="text-slate-400 mb-4">{scenario.exitTicket.reflectionPrompt}</p>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What did you learn from this scenario?"
          className="bg-slate-800/50 border-slate-700 text-white min-h-[120px]"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-500">
            {reflection.length}/500 characters
          </span>
          {reflection.length > 0 && (
            <span className="text-xs text-emerald-400">
              {reflection.length > 200 ? 'Detailed!' : 'Keep going...'}
            </span>
          )}
        </div>
      </Card>

      <Button
        onClick={handleSubmit}
        size="lg"
        className={`w-full bg-gradient-to-r ${accent}`}
      >
        Complete Scenario
      </Button>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      <Card className={`border ${border} bg-slate-900/50 p-8`}>
        <div className="flex items-center gap-3 mb-8">
          <ClipboardList className={`w-6 h-6 ${text}`} />
          <h1 className="text-2xl font-bold text-white">Scenario Reflection</h1>
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? renderQuestion() : renderResults()}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
