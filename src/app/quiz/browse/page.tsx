"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notify } from '@/lib/notify';
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import styles from './QuizBrowse.module.scss';

export default function BrowseQuizzesPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].quiz;
  const commonT = translations[language].common;

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/quiz");
      setQuizzes(response.data);
    } catch (error) {
      console.error(error);
      notify.error(commonT.error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}/take`);
  };

  if (loading) {
    return <div className={`${styles.page} ${styles.loading}`}>{commonT.loading}</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.availableTitle}</h1>
      
      {quizzes.length === 0 ? (
        <p>{t.noQuizzes}</p>
      ) : (
        <div className={styles.grid}>
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{quiz.description || "No description provided."}</p>
                {quiz.end_at && (
                  <p className={styles.deadline}>
                    Deadline: {new Date(quiz.end_at).toLocaleString()}
                  </p>
                )}
                <div className={styles.cardActions}>
                  <span className={styles.levelBadge}>
                    {quiz.difficulty || "Medium"}
                  </span>
                  <Button onClick={() => handleTakeQuiz(quiz.id)}>{t.takeQuiz}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
