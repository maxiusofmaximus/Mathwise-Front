import Link from 'next/link';
import { Button } from '@/components/ui/button';
import styles from './page.module.scss';

export default function Home() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>AI Math Quiz Platform</h1>
      <p className={styles.subtitle}>Create and solve advanced math quizzes with AI.</p>
      <div className={styles.actions}>
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
