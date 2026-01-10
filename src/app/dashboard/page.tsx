'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

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
          Welcome, {user.name} ({user.role})
        </h1>
        {/* Logout moved to Settings Menu */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user.role === 'editor' ? (
          <>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">Create Quiz</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Create new mathematical quizzes manually or with AI assistance.
              </p>
              <Button onClick={() => router.push('/editor/new')}>Go to Editor</Button>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">Analytics</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">View student performance and quiz statistics.</p>
              <Button variant="secondary">View Analytics</Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">Available Quizzes</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">Browse and solve assigned quizzes.</p>
              <Button onClick={() => router.push('/quiz/browse')}>Browse Quizzes</Button>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow dark:border dark:border-gray-800">
              <h2 className="mb-4 text-xl font-semibold">My History</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">Review your past attempts and feedback.</p>
              <Button variant="secondary">View History</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
