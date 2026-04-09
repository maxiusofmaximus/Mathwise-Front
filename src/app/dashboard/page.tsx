'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/language';
import { translations } from '@/lib/translations';
import api from '@/lib/api';
import styles from './Dashboard.module.scss';

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
      api.get('/auth/profile')
        .then((res) => useAuthStore.getState().login(res.data.user))
        .catch(() => router.push('/login'));
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
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>
          {t.welcome}, {user.name} ({user.role})
        </h1>
      </div>

      <div className={styles.grid}>
        {user.role === 'editor' ? (
          <>
            <div className={styles.panel}>
              <h2>{t.createQuiz}</h2>
              <p>
                {t.createQuizDesc}
              </p>
              <Button onClick={() => router.push('/editor/new')}>{t.goToEditor}</Button>
            </div>
            <div className={styles.panel}>
              <h2>{t.analytics}</h2>
              <p>{t.analyticsDesc}</p>
              <Button variant="secondary">{t.viewAnalytics}</Button>
            </div>
            
            <div className={`${styles.panel} ${styles.panelWide}`}>
              <h2>{t.myQuizzes}</h2>
              <p>{t.myQuizzesDesc}</p>
              
              <div className={styles.quizList}>
                  {myQuizzes.map(quiz => (
                      <div key={quiz.id} className={styles.quizListItem}>
                          <div>
                              <h3>{quiz.title}</h3>
                              <p>{quiz.description}</p>
                              <div className={styles.meta}>
                                <span>Questions: {quiz._count?.questions || 0}</span>
                                <span>Attempts: {quiz._count?.attempts || 0}</span>
                              </div>
                          </div>
                          <Button variant="outline" onClick={() => router.push(`/editor/${quiz.id}`)}>{t.edit}</Button>
                      </div>
                  ))}
                  {myQuizzes.length === 0 && <p>No quizzes created yet.</p>}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.panel}>
              <h2>{t.availableQuizzes}</h2>
              <p>{t.availableQuizzesDesc}</p>
              <Button onClick={() => router.push('/quiz/browse')}>{t.browseQuizzes}</Button>
            </div>
            <div className={styles.panel}>
              <h2>{t.myHistory}</h2>
              <p>{t.myHistoryDesc}</p>
              <Button variant="secondary">{t.viewHistory}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
