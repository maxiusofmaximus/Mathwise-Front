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

export default function RegisterPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].auth;
  const commonT = translations[language].common;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'editor',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register
      await api.post('/auth/register', formData);
      
      // Auto login after register
      const loginRes = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      
      const { access_token, user } = loginRes.data;
      setToken(access_token);
      setUser(user);
      
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
          <CardTitle className="text-2xl font-bold text-center dark:text-gray-100">{t.registerTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">{t.fullName}</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">{t.role}</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={formData.role === 'student' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={formData.role === 'student' ? '' : 'dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'}
                >
                  {t.student}
                </Button>
                <Button
                  type="button"
                  variant={formData.role === 'editor' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, role: 'editor' })}
                  className={formData.role === 'editor' ? '' : 'dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800'}
                >
                  {t.editor}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.creatingAccount : t.registerButton}
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t.hasAccount} </span>
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => router.push('/login')}
              >
                {t.loginLink}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
