"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quiz/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Validate that all questions are answered
    const unanswered = quiz.questions.some((q: any) => !answers[q.id]);
    if (unanswered) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      // We need to implement this endpoint in backend or use existing attempt structure
      // For now, let's assume /quiz/submit exists or we adapt
      // Based on schema, we create an Attempt and AttemptAnswers
      
      const response = await api.post("/ai/evaluate", { // Using AI evaluation directly for now or a dedicated submit endpoint
         // This part needs Backend alignment. Ideally: POST /quiz/:id/submit
         // For MVP, we will simulate submission or assume endpoint creation in next step
         quizId,
         answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
           questionId,
           userAnswer
         }))
      });

      toast.success("Quiz submitted successfully!");
      // Redirect to results page (to be implemented)
      router.push(`/quiz/${quizId}/result?attemptId=${response.data.attemptId || 'new'}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading quiz...</div>;
  if (!quiz) return <div className="flex justify-center items-center min-h-screen">Quiz not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8 items-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
        </div>

        {quiz.questions.map((question: any, index: number) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium text-gray-800">{question.content}</p>
              
              <div className="space-y-2">
                <Label htmlFor={question.id}>Your Answer</Label>
                <Input
                  id={question.id}
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button 
          className="w-full text-lg py-6" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}
