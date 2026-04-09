"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notify } from '@/lib/notify';
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import { Plus, Trash2 } from "lucide-react";
import styles from "./EditorNew.module.scss";

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
  const [generateMode, setGenerateMode] = useState<'single' | 'exam'>('single');
  const [topic, setTopic] = useState(""); // For AI
  
  // Manual Entry State
  const [manualContent, setManualContent] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [manualOptions, setManualOptions] = useState<string[]>(['', '', '', '']);
  const [manualCorrectOption, setManualCorrectOption] = useState<number>(0);

  const handleGenerateAI = async () => {
    if (!topic) {
      notify.error(commonT.error);
      return;
    }

    setAiLoading(true);
    try {
      const count = generateMode === 'exam' ? 5 : 1;
      const response = await api.post("/ai/generate", {
        topic,
        difficulty: "medium",
        question_type: questionType,
        count,
      });

      const data = response.data;
      let newQuestions: Question[] = [];

      if (Array.isArray(data)) {
        newQuestions = data.map((q: any) => ({
          content: q.content,
          expected_answer: q.expected_answer,
          type: questionType,
          keywords: q.keywords || [],
          options: q.options || []
        }));
      } else {
        newQuestions = [{
          content: data.content,
          expected_answer: data.expected_answer,
          type: questionType, 
          keywords: data.keywords || [],
          options: data.options || [] 
        }];
      }

      setQuestions([...questions, ...newQuestions]);
      notify.success(commonT.success);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 500) {
        notify.error("AI Generation failed. Try a simpler topic or specific concept.");
      } else {
        notify.error(commonT.error);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddManual = () => {
    if (!manualContent) {
      notify.error("Question content is required");
      return;
    }

    let newQuestion: Question = {
      content: manualContent,
      type: questionType,
      expected_answer: "",
    };

    if (questionType === 'open') {
      if (!manualAnswer) {
        notify.error("Expected answer is required");
        return;
      }
      newQuestion.expected_answer = manualAnswer;
    } else if (questionType === 'multiple_choice') {
      if (manualOptions.some(opt => !opt)) {
        notify.error("All 4 options are required");
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
    notify.success(t.addQuestion);
  };

  const removeQuestion = (idx: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(idx, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || questions.length === 0) {
      notify.error(commonT.error);
      return;
    }

    setLoading(true);
    try {
      await api.post("/quiz/create", {
        title,
        description,
        questions,
        is_published: true,
      });
      notify.success(commonT.success);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      notify.error(commonT.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>{t.createTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Basic Info */}
            <div className={styles.section}>
              <div className={styles.section}>
                <Label htmlFor="title">{t.titleLabel}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  required
                />
              </div>
              <div className={styles.section}>
                <Label htmlFor="description">{t.descLabel}</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                />
              </div>
            </div>

            {/* Question Creator */}
            <div className={`${styles.panel} ${styles.section}`}>
              <div className={styles.row}>
                <h3>{t.addQuestion}</h3>
                <div className={styles.row}>
                  <select 
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
              <div className={`${styles.panel} ${styles.section}`}>
                <div className={styles.row}>
                  <Label>{t.aiAssistant}</Label>
                  <div className={styles.row}>
                    <button
                      type="button"
                      onClick={() => setGenerateMode('single')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${generateMode === 'single' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerateMode('exam')}
                      className={`text-xs px-2 py-1 rounded transition-colors ${generateMode === 'exam' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                      Full Exam (5)
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {generateMode === 'single' 
                    ? 'Generates one question focused on the topic.' 
                    : 'Generates 5 distinct questions to create a full quiz.'}
                </p>
                <div className={styles.row}>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t.topicPlaceholder}
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
            <div className={styles.section}>
              <h3>{t.questions} ({questions.length})</h3>
              {questions.length === 0 ? (
                <p>{t.noQuestions}</p>
              ) : (
                <div className={styles.questions}>
                  {questions.map((q, idx) => (
                    <div key={idx} className={`${styles.questionItem} group`}>
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

            <Button type="submit" className={styles.submit} disabled={loading}>
              {loading ? t.creating : t.createQuizBtn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
