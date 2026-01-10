'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/language';
import { translations } from '@/lib/translations';
import api from '@/lib/api';

interface Quiz {
  id: string;
  title: string;
  description: string;
  _count: { questions: number; attempts: number };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].dashboard;

  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'editor') {
      api.get('/quiz/my')
        .then(res => setMyQuizzes(res.data))
        .catch(console.error);
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-8 text-gray-900 dark:text-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {t.welcome}, {user.name} ({user.role})
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user.role === 'editor' ? (
          <>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">{t.createQuiz}</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {t.createQuizDesc}
              </p>
              <Button onClick={() => router.push('/editor/new')}>{t.goToEditor}</Button>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">{t.analytics}</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{t.analyticsDesc}</p>
              <Button variant="secondary">{t.viewAnalytics}</Button>
            </div>
            
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800 col-span-full md:col-span-2 lg:col-span-3">
              <h2 className="mb-4 text-xl font-semibold">{t.myQuizzes}</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{t.myQuizzesDesc}</p>
              
              <div className="space-y-4">
                  {myQuizzes.map(quiz => (
                      <div key={quiz.id} className="flex items-center justify-between p-4 border rounded dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div>
                              <h3 className="font-bold text-lg">{quiz.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{quiz.description}</p>
                              <div className="flex gap-4 text-xs text-gray-400">
                                <span>Questions: {quiz._count?.questions || 0}</span>
                                <span>Attempts: {quiz._count?.attempts || 0}</span>
                              </div>
                          </div>
                          <Button variant="outline" onClick={() => router.push(`/editor/${quiz.id}`)}>{t.edit}</Button>
                      </div>
                  ))}
                  {myQuizzes.length === 0 && <p className="text-sm italic text-gray-500">No quizzes created yet.</p>}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">{t.availableQuizzes}</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{t.availableQuizzesDesc}</p>
              <Button onClick={() => router.push('/quiz/browse')}>{t.browseQuizzes}</Button>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">{t.myHistory}</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{t.myHistoryDesc}</p>
              <Button variant="secondary">{t.viewHistory}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
