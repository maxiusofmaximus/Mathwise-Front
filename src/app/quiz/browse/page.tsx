"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";

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
      toast.error(commonT.error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}/take`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen dark:bg-gray-950 dark:text-gray-100">{commonT.loading}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">{t.availableTitle}</h1>
      
      {quizzes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center text-lg">{t.noQuizzes}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{quiz.description || "No description provided."}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded">
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
