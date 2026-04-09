'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { notify } from '@/lib/notify';
import { useLanguageStore } from '@/store/language';
import { translations } from '@/lib/translations';
import styles from './Register.module.scss';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
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
      
      const { user } = loginRes.data;
      login(user);
      
      notify.success(commonT.success);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      notify.error(error.response?.data?.message || commonT.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>{t.registerTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <Label htmlFor="name">{t.fullName}</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <Label>{t.role}</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={formData.role === 'student' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                >
                  {t.student}
                </Button>
                <Button
                  type="button"
                  variant={formData.role === 'editor' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, role: 'editor' })}
                >
                  {t.editor}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.creatingAccount : t.registerButton}
            </Button>
            <div className={styles.actions}>
              <span>{t.hasAccount} </span>
              <Button
                variant="link"
                className={styles.linkButton}
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
