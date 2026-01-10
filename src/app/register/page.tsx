'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'editor'>('student');
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { email, password, name, role });
      login(res.data.user, res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center dark:text-gray-100">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={role === 'student' ? 'default' : 'outline'}
                  onClick={() => setRole('student')}
                  className={role === 'student' ? '' : 'dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'}
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={role === 'editor' ? 'default' : 'outline'}
                  onClick={() => setRole('editor')}
                  className={role === 'editor' ? '' : 'dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'}
                >
                  Editor (Professor)
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
