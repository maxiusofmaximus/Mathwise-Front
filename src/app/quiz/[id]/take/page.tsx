"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;
  const { language } = useLanguageStore();
  const t = translations[language].quiz;
  const commonT = translations[language].common;

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quiz/${quizId}`);
      setQuiz(response.data);
      
      // Calculate Time Limit
      const limit = response.data.time_limit || (response.data.questions.length * 90);
      setTimeLeft(limit);
      
    } catch (error) {
      console.error(error);
      toast.error(commonT.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    if (submitting) return;
    toast.info("Time's up! Submitting automatically...");
    handleSubmit();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const unanswered = quiz.questions.some((q: any) => !answers[q.id]);
    if (unanswered) {
      toast.warning("Please answer all questions before submitting."); // Could be translated too
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/ai/evaluate", {
         quizId,
         answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
           questionId,
           userAnswer
         }))
      });

      toast.success(commonT.success);
      router.push(`/quiz/${quizId}/result?attemptId=${response.data.attemptId || 'new'}`);
    } catch (error) {
      console.error(error);
      toast.error(commonT.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen dark:bg-gray-950 dark:text-gray-100">{commonT.loading}</div>;
  if (!quiz) return <div className="flex justify-center items-center min-h-screen dark:bg-gray-950 dark:text-gray-100">Quiz not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 p-8 items-center">
      
      {/* Timer Header */}
      <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full font-mono font-bold text-xl shadow-lg ${
        (timeLeft || 0) < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
      }`}>
        {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
      </div>

      <div className="w-full max-w-3xl space-y-6 pt-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold dark:text-gray-100">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
        </div>

        {quiz.questions.map((question: any, index: number) => (
          <Card key={question.id} className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg dark:text-gray-200">{commonT.language === 'Idioma' ? 'Pregunta' : 'Question'} {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium text-gray-800 dark:text-gray-300">{question.content}</p>
              
              <div className="space-y-2">
                <Label htmlFor={question.id} className="dark:text-gray-400 mb-2 block">{t.yourAnswer}</Label>
                
                {question.type === 'multiple_choice' && question.options ? (
                  <div className="space-y-3">
                    {question.options.map((option: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 p-3 rounded-md border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleAnswerChange(question.id, option)}>
                        <input
                          type="radio"
                          id={`${question.id}-${idx}`}
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <Label htmlFor={`${question.id}-${idx}`} className="dark:text-gray-300 cursor-pointer flex-grow">{option}</Label>
                      </div>
                    ))}
                  </div>
                ) : question.type === 'true_false' ? (
                  <div className="flex gap-4">
                    <Button
                      variant={answers[question.id] === 'True' ? "default" : "outline"}
                      onClick={() => handleAnswerChange(question.id, 'True')}
                      className="flex-1 dark:text-gray-100 dark:border-gray-600"
                    >
                      True
                    </Button>
                    <Button
                      variant={answers[question.id] === 'False' ? "default" : "outline"}
                      onClick={() => handleAnswerChange(question.id, 'False')}
                      className="flex-1 dark:text-gray-100 dark:border-gray-600"
                    >
                      False
                    </Button>
                  </div>
                ) : (
                  <Input
                    id={question.id}
                    placeholder={t.answerPlaceholder}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button 
          className="w-full text-lg py-6" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? t.submitting : t.submit}
        </Button>
      </div>
    </div>
  );
}
