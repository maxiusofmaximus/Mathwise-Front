"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function QuizResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // In a real app, we would fetch the attempt details using this ID
  const attemptId = searchParams.get("attemptId");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 p-8 items-center justify-center">
      <Card className="w-full max-w-xl text-center dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-500">Quiz Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Your answers have been recorded and are being processed by our AI for grading.
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-300 text-sm">
            <strong>Note:</strong> Detailed feedback and scoring will be available in your history shortly.
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="dark:text-gray-300 dark:hover:bg-gray-800">
              Return to Dashboard
            </Button>
            <Button onClick={() => router.push("/quiz/browse")}>
              Take Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
