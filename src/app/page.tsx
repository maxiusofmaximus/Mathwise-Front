import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100">AI Math Quiz Platform</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">Create and solve advanced math quizzes with AI.</p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500">Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 bg-transparent">Register</Button>
        </Link>
      </div>
    </div>
  );
}
