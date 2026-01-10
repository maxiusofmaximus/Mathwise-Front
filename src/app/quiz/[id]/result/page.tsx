"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";

export default function QuizResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const { language } = useLanguageStore();
  const t = translations[language].quiz;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 p-8 items-center justify-center">
      <Card className="w-full max-w-xl text-center dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-500">{t.submittedTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t.submittedDesc}
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-300 text-sm">
            <strong>Note:</strong> {t.feedbackNote}
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="dark:text-gray-300 dark:hover:bg-gray-800">
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
