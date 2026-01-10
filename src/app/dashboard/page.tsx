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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Welcome, {user.name} ({user.role})
        </h1>
        <Button onClick={() => { logout(); router.push('/login'); }} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user.role === 'editor' ? (
          <>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Create Quiz</h2>
              <p className="mb-4 text-gray-600">
                Create new mathematical quizzes manually or with AI assistance.
              </p>
              <Button onClick={() => router.push('/editor/new')}>Go to Editor</Button>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Analytics</h2>
              <p className="mb-4 text-gray-600">View student performance and quiz statistics.</p>
              <Button variant="secondary">View Analytics</Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Available Quizzes</h2>
              <p className="mb-4 text-gray-600">Browse and solve assigned quizzes.</p>
              <Button>Browse Quizzes</Button>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">My History</h2>
              <p className="mb-4 text-gray-600">Review your past attempts and feedback.</p>
              <Button variant="secondary">View History</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
