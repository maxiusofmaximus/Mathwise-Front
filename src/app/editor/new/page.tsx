"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);

  const handleGenerateAI = async () => {
    if (!topic) {
      toast.error("Please enter a topic for AI generation");
      return;
    }

    setAiLoading(true);
    try {
      const response = await api.post("/ai/generate", {
        topic,
        difficulty: "medium",
        question_type: "open",
      });

      // AI returns a single question object, we add it to the list
      // If AI returns an array, adapt accordingly. 
      // Assuming backend returns { content: "...", expected_answer: "...", ... }
      const newQuestion = response.data;
      
      setQuestions([...questions, {
        content: newQuestion.content,
        expected_answer: newQuestion.expected_answer,
        type: "open", // Default for now
        keywords: newQuestion.keywords || []
      }]);
      
      toast.success("Question generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate question");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || questions.length === 0) {
      toast.error("Please provide a title and at least one question");
      return;
    }

    setLoading(true);
    try {
      await api.post("/quiz/create", {
        title,
        description,
        questions,
      });
      toast.success("Quiz created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-2xl dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-gray-100">Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="dark:text-gray-300">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Calculus 101"
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the quiz"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="rounded-md border p-4 bg-white dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-lg dark:text-gray-100">AI Assistant</h3>
              <div className="flex gap-2">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic (e.g., 'Integrals of trigonometric functions')"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
                <Button 
                  type="button" 
                  onClick={handleGenerateAI} 
                  disabled={aiLoading}
                  variant="secondary"
                  className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  {aiLoading ? "Generating..." : "Generate Question"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:text-gray-100">Questions ({questions.length})</h3>
              {questions.length === 0 ? (
                <p className="text-sm text-gray-500 italic dark:text-gray-400">No questions added yet. Use AI to generate some!</p>
              ) : (
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-3 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-sm">
                      <p className="font-medium dark:text-gray-200">Q{idx + 1}: {q.content}</p>
                      <p className="text-gray-600 mt-1 dark:text-gray-400">Answer: {q.expected_answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
