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

function normalizeQuestions(exitTicket) {
  if (Array.isArray(exitTicket?.questions)) {
    return exitTicket.questions.map((question, index) => ({
      id: question.id || `q-${index + 1}`,
      prompt: question.text || question.question || '',
      options: question.options || [],
    }));
  }

  if (Array.isArray(exitTicket?.mcqs)) {
    return exitTicket.mcqs.map((question, index) => ({
      id: question.id || `q-${index + 1}`,
      prompt: question.text || question.question || '',
      options: question.options || [],
    }));
  }

  return [];
}

export default function ExitTicket({ exitTicket, scenarioTitle, onComplete, theme = {} }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [reflection, setReflection] = useState('');
  const [transferAnswer, setTransferAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const accent = theme.accent || 'from-teal-500 to-emerald-500';
  const border = theme.border || 'border-teal-500/30';
  const text = theme.text || 'text-teal-400';
  const questions = normalizeQuestions(exitTicket);
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

  // Calculate score and achievements
  useEffect(() => {
    if (showResults) {
      const earnedAchievements = [];
      if (score >= 90) earnedAchievements.push('Master Scientist');
      if (score >= 70) earnedAchievements.push('Competent Researcher');
      if (answers.every(a => a.isCorrect)) earnedAchievements.push('Perfect Score');
      if (reflection.length > 200) earnedAchievements.push('Deep Thinker');
      
      setAchievements(earnedAchievements);
    }
  }, [showResults, answers, reflection, score]);

  const handleAnswer = (option, isCorrect) => {
    setAnswers((prev) => {
      const nextAnswers = prev.filter((answer) => answer.questionId !== currentQuestion);
      nextAnswers.push({ 
        questionId: currentQuestion,
        option,
        isCorrect,
      });
      return nextAnswers;
    });

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleSubmit = () => {
    onComplete({
      score,
      passed: score >= 70 && reflection.trim().length >= 10 && transferAnswer.trim().length >= 10,
      mcq_answers: answers,
      reflection,
      transfer_answer: transferAnswer,
      achievements
    });
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    if (!question) {
      return null;
    }

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
            Question {currentQuestion + 1} of {questions.length}
          </h3>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">{question.prompt}</h2>

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
                {correctAnswers} / {questions.length}
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
        <p className="text-slate-400 mb-4">{exitTicket?.reflectionPrompt || `What did you learn from ${scenarioTitle || 'this scenario'}?`}</p>
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

      {exitTicket?.transferQuestion && (
        <Card className={`border ${border} bg-slate-900/50 p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className={`w-5 h-5 ${text}`} />
            <h3 className={`text-xs font-bold uppercase tracking-widest ${text}`}>Transfer Question</h3>
          </div>
          <p className="text-slate-400 mb-4">{exitTicket.transferQuestion}</p>
          <Textarea
            value={transferAnswer}
            onChange={(e) => setTransferAnswer(e.target.value)}
            placeholder="Apply this idea to a new situation..."
            className="bg-slate-800/50 border-slate-700 text-white min-h-[120px]"
          />
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        size="lg"
        disabled={reflection.trim().length < 10 || (exitTicket?.transferQuestion && transferAnswer.trim().length < 10)}
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

        {questions.length === 0 && (
          <p className="text-slate-400">No exit ticket questions are configured for this scenario.</p>
        )}

        <AnimatePresence mode="wait">
          {!showResults && questions.length > 0 ? renderQuestion() : renderResults()}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
