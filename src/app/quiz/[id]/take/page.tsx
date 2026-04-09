"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from '@/lib/notify';
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import styles from "./QuizTake.module.scss";

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
    if (!quizId) return;
    try {
      const response = await api.get(`/quiz/${quizId}`);
      if (!response.data) throw new Error("Quiz data not found");
      
      setQuiz(response.data);
      
      // Calculate Time Limit
      // Ensure questions exist before accessing length
      const questionsCount = response.data.questions?.length || 0;
      const limit = response.data.time_limit || (questionsCount * 90);
      setTimeLeft(limit);
      
    } catch (error) {
      console.error(error);
      notify.error(commonT.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    if (submitting) return;
    notify.info("Time's up! Submitting automatically...");
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
      notify.warning("Please answer all questions before submitting."); // Could be translated too
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

      notify.success(commonT.success);
      router.push(`/quiz/${quizId}/result?attemptId=${response.data.attemptId || 'new'}`);
    } catch (error) {
      console.error(error);
      notify.error(commonT.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.page}>{commonT.loading}</div>;
  if (!quiz) return <div className={styles.page}>Quiz not found</div>;

  return (
    <div className={styles.page}>
      
      {/* Timer Header */}
      <div className={`${styles.timer} ${(timeLeft || 0) < 60 ? styles.timerDanger : ""}`}>
        {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
      </div>

      <div className={styles.shell}>
        <div className={styles.header}>
          <h1>{quiz.title}</h1>
          <p>{quiz.description}</p>
        </div>

        {quiz.questions.map((question: any, index: number) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle>{language === "es" ? "Pregunta" : "Question"} {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className={styles.questionBody}>
              <p>{question.content}</p>
              
              <div>
                <Label htmlFor={question.id}>{t.yourAnswer}</Label>
                
                {question.type === 'multiple_choice' && question.options ? (
                  <div className={styles.options}>
                    {question.options.map((option: string, idx: number) => (
                      <div key={idx} className={styles.optionItem} onClick={() => handleAnswerChange(question.id, option)}>
                        <input
                          type="radio"
                          id={`${question.id}-${idx}`}
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        />
                        <Label htmlFor={`${question.id}-${idx}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                ) : question.type === 'true_false' ? (
                  <div className={styles.options}>
                    <Button
                      variant={answers[question.id] === 'True' ? "default" : "outline"}
                      onClick={() => handleAnswerChange(question.id, 'True')}
                    >
                      True
                    </Button>
                    <Button
                      variant={answers[question.id] === 'False' ? "default" : "outline"}
                      onClick={() => handleAnswerChange(question.id, 'False')}
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
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? t.submitting : t.submit}
        </Button>
      </div>
    </div>
  );
}
