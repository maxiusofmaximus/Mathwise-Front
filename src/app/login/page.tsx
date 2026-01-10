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
import { useLanguageStore } from '@/store/language';
import { translations } from '@/lib/translations';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].auth;
  const commonT = translations[language].common;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      login(user, access_token);
      
      toast.success(commonT.success);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || commonT.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center dark:text-gray-100">{t.loginTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">{t.email}</Label>
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
              <Label htmlFor="password" className="dark:text-gray-300">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loggingIn : t.loginButton}
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t.noAccount} </span>
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => router.push('/register')}
              >
                {t.signUp}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
