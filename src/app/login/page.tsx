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
import styles from './Login.module.scss';

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
      const { user } = response.data;
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
          <CardTitle>{t.loginTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loggingIn : t.loginButton}
            </Button>
            <div className={styles.actions}>
              <span>{t.noAccount} </span>
              <Button
                variant="link"
                className={styles.linkButton}
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
