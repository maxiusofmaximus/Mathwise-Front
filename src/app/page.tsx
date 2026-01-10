import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-white">
      <h1 className="text-4xl font-bold text-blue-900">AI Math Quiz Platform</h1>
      <p className="text-lg text-gray-600">Create and solve advanced math quizzes with AI.</p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}
