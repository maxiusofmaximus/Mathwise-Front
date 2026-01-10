'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/language';
import { translations } from '@/lib/translations';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].dashboard;

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-8 text-gray-900 dark:text-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {t.welcome}, {user.name} ({user.role})
        </h1>
        {/* Logout moved to Settings Menu */}
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
