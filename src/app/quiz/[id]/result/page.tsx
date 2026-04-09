"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import styles from "./QuizResult.module.scss";

export default function QuizResultPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].quiz;

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <CardHeader>
          <div className={styles.iconWrap}>
            <CheckCircle />
          </div>
          <CardTitle>{t.submittedTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {t.submittedDesc}
          </p>
          
          <div className={styles.note}>
            <strong>Note:</strong> {t.feedbackNote}
          </div>

          <div className={styles.actions}>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              {t.returnDashboard}
            </Button>
            <Button onClick={() => router.push("/quiz/browse")}>
              {t.takeAnother}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
