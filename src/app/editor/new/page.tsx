"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import { Plus, Trash2 } from "lucide-react";

type QuestionType = 'open' | 'multiple_choice' | 'true_false';

interface Question {
  content: string;
  type: QuestionType;
  options?: string[];
  expected_answer: string;
  keywords?: string[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].editor;
  const commonT = translations[language].common;

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Quiz Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question Creation State
  const [questionType, setQuestionType] = useState<QuestionType>('open');
  const [topic, setTopic] = useState(""); // For AI
  
  // Manual Entry State
  const [manualContent, setManualContent] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [manualOptions, setManualOptions] = useState<string[]>(['', '', '', '']);
  const [manualCorrectOption, setManualCorrectOption] = useState<number>(0);

  const handleGenerateAI = async () => {
    if (!topic) {
      toast.error(commonT.error);
      return;
    }

    setAiLoading(true);
    try {
      const response = await api.post("/ai/generate", {
        topic,
        difficulty: "medium",
        question_type: questionType,
      });

      const newQuestion = response.data;
      
      // Ensure the AI response matches our structure
      const formattedQuestion: Question = {
        content: newQuestion.content,
        expected_answer: newQuestion.expected_answer,
        type: questionType, 
        keywords: newQuestion.keywords || [],
        options: newQuestion.options || [] // AI should return options for MC
      };

      setQuestions([...questions, formattedQuestion]);
      toast.success(commonT.success);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 500) {
        toast.error("AI Generation failed. Try a simpler topic or specific concept.");
      } else {
        toast.error(commonT.error);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddManual = () => {
    if (!manualContent) {
      toast.error("Question content is required");
      return;
    }

    let newQuestion: Question = {
      content: manualContent,
      type: questionType,
      expected_answer: "",
    };

    if (questionType === 'open') {
      if (!manualAnswer) {
        toast.error("Expected answer is required");
        return;
      }
      newQuestion.expected_answer = manualAnswer;
    } else if (questionType === 'multiple_choice') {
      if (manualOptions.some(opt => !opt)) {
        toast.error("All 4 options are required");
        return;
      }
      newQuestion.options = [...manualOptions];
      newQuestion.expected_answer = manualOptions[manualCorrectOption];
    } else if (questionType === 'true_false') {
      // For T/F, let's assume manualAnswer holds "True" or "False"
      if (!manualAnswer) {
        setManualAnswer("True"); // Default
      }
      newQuestion.expected_answer = manualAnswer || "True";
      newQuestion.options = ["True", "False"];
    }

    setQuestions([...questions, newQuestion]);
    
    // Reset manual fields
    setManualContent("");
    setManualAnswer("");
    setManualOptions(['', '', '', '']);
    setManualCorrectOption(0);
    toast.success(t.addQuestion);
  };

  const removeQuestion = (idx: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(idx, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || questions.length === 0) {
      toast.error(commonT.error);
      return;
    }

    setLoading(true);
    try {
      await api.post("/quiz/create", {
        title,
        description,
        questions,
      });
      toast.success(commonT.success);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(commonT.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 dark:bg-gray-950 p-4 pt-8">
      <Card className="w-full max-w-4xl dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-gray-100">{t.createTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="dark:text-gray-300">{t.titleLabel}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  required
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-300">{t.descLabel}</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Question Creator */}
            <div className="rounded-lg border p-6 bg-white dark:bg-gray-800/40 dark:border-gray-700 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg dark:text-gray-100">{t.addQuestion}</h3>
                <div className="flex gap-2">
                  <select 
                    className="p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  >
                    <option value="open">{t.openQuestion}</option>
                    <option value="multiple_choice">{t.multipleChoice}</option>
                    <option value="true_false">{t.trueFalse}</option>
                  </select>
                </div>
              </div>

              {/* AI Section */}
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <Label className="text-blue-800 dark:text-blue-300 font-semibold">{t.aiAssistant}</Label>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                  Enter a specific math topic (e.g. "Linear equations"). The AI generates one question at a time.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t.topicPlaceholder}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                  <Button 
                    type="button" 
                    onClick={handleGenerateAI} 
                    disabled={aiLoading}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {aiLoading ? t.generating : t.generateBtn}
                  </Button>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR MANUAL ENTRY</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Manual Entry Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">{t.questionContent}</Label>
                  <Input
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Enter your question here..."
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>

                {questionType === 'open' && (
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">{t.correctAnswer}</Label>
                    <Input
                      value={manualAnswer}
                      onChange={(e) => setManualAnswer(e.target.value)}
                      placeholder="Enter expected answer..."
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                )}

                {questionType === 'multiple_choice' && (
                  <div className="space-y-3">
                    <Label className="dark:text-gray-300">{t.option}s</Label>
                    {manualOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="radio" 
                          name="correct_option" 
                          checked={manualCorrectOption === idx}
                          onChange={() => setManualCorrectOption(idx)}
                          className="w-4 h-4"
                        />
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...manualOptions];
                            newOpts[idx] = e.target.value;
                            setManualOptions(newOpts);
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">* Select the radio button for the correct answer</p>
                  </div>
                )}

                {questionType === 'true_false' && (
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">{t.correctAnswer}</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={manualAnswer === "True" ? "default" : "outline"}
                        onClick={() => setManualAnswer("True")}
                      >
                        True
                      </Button>
                      <Button
                        type="button"
                        variant={manualAnswer === "False" ? "default" : "outline"}
                        onClick={() => setManualAnswer("False")}
                      >
                        False
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  type="button" 
                  onClick={handleAddManual}
                  variant="secondary"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addQuestion}
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:text-gray-100">{t.questions} ({questions.length})</h3>
              {questions.length === 0 ? (
                <p className="text-sm text-gray-500 italic dark:text-gray-400">{t.noQuestions}</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 relative group">
                      <div className="pr-8">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold uppercase bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                            {q.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-medium dark:text-gray-200 text-lg mb-2">{q.content}</p>
                        
                        {q.type === 'multiple_choice' && (
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-2 mb-2">
                            {q.options?.map((opt, i) => (
                              <li key={i} className={opt === q.expected_answer ? "text-green-600 dark:text-green-400 font-bold" : ""}>
                                {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">{t.correctAnswer}:</span> {q.expected_answer}
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeQuestion(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
              {loading ? t.creating : t.createQuizBtn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}