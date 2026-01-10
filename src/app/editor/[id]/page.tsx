"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguageStore } from "@/store/language";
import { translations } from "@/lib/translations";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

type QuestionType = 'open' | 'multiple_choice' | 'true_false';

interface Question {
  id?: string;
  content: string;
  type: QuestionType;
  options?: string[];
  expected_answer: string;
  keywords?: string[];
}

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguageStore();
  const t = translations[language].editor;
  const commonT = translations[language].common;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Quiz Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  
  // Settings & Assignment
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [feedbackMode, setFeedbackMode] = useState("immediate");
  const [timeLimit, setTimeLimit] = useState<number | null>(null); // In seconds
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [availableStudents, setAvailableStudents] = useState<{id: string, name: string}[]>([]);
  const [availableGroups, setAvailableGroups] = useState<{id: string, name: string}[]>([]);

  // Question Creation State (same as new page)
  const [questionType, setQuestionType] = useState<QuestionType>('open');
  
  // Manual Entry State
  const [manualContent, setManualContent] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [manualOptions, setManualOptions] = useState<string[]>(['', '', '', '']);
  const [manualCorrectOption, setManualCorrectOption] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!params || !params.id) return; // Safety check

      try {
        const [quizRes, selectionRes] = await Promise.all([
            api.get(`/quiz/${params.id}`),
            api.get('/quiz/selection-data')
        ]);

        // Set Selection Data
        if (selectionRes.data) {
            setAvailableStudents(selectionRes.data.students || []);
            setAvailableGroups(selectionRes.data.groups || []);
        }

        // Set Quiz Data
        const data = quizRes.data;
        if (!data) throw new Error("No quiz data received");

        setTitle(data.title);
        setDescription(data.description || "");
        setIsPublished(data.is_published);
        setStartAt(data.start_at ? new Date(data.start_at).toISOString().slice(0, 16) : "");
        setEndAt(data.end_at ? new Date(data.end_at).toISOString().slice(0, 16) : "");
        setFeedbackMode(data.feedback_mode || "immediate");
        
        if (data.time_limit) {
            setUseCustomTime(true);
            setTimeLimit(data.time_limit);
        }

        setAssignToAll(data.assign_to_all);
        
        if (data.allowed_students) setSelectedStudents(data.allowed_students.map((s:any) => s.id));
        if (data.allowed_groups) setSelectedGroups(data.allowed_groups.map((g:any) => g.id));
        
        const parsedQuestions = (data.questions || []).map((q: any) => {
            let options: string[] = [];
            let keywords: string[] = [];
            
            if (q.keywords && !Array.isArray(q.keywords) && (q.keywords as any).options) {
                options = (q.keywords as any).options;
                keywords = (q.keywords as any).keywords || [];
            } else if (Array.isArray(q.keywords)) {
                keywords = q.keywords as string[];
            }
            
            return {
                id: q.id,
                content: q.content,
                type: q.type,
                expected_answer: q.expected_answer,
                options: options.length > 0 ? options : undefined,
                keywords: keywords
            };
        });
        
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error(error);
        toast.error(commonT.error);
        // router.push('/dashboard'); // Commented out to debug if needed
      } finally {
        setFetching(false);
      }
    };
    
    if (params.id) {
        fetchData();
    }
  }, [params.id, router, commonT.error]);

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
      if (!manualAnswer) {
        setManualAnswer("True"); 
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
      await api.put(`/quiz/${params.id}`, {
        title,
        description,
        questions,
        is_published: isPublished,
        start_at: startAt || null,
        end_at: endAt || null,
        feedback_mode: feedbackMode,
        time_limit: useCustomTime ? timeLimit : null,
        assign_to_all: assignToAll,
        allowed_students: assignToAll ? [] : selectedStudents,
        allowed_groups: assignToAll ? [] : selectedGroups
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

  if (fetching) return <div className="flex justify-center p-8">{commonT.loading}</div>;

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 dark:bg-gray-950 p-4 pt-8">
      <Card className="w-full max-w-4xl dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl font-bold dark:text-gray-100">{t.editTitle}</CardTitle>
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
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="is_published" 
                  checked={isPublished} 
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="is_published" className="dark:text-gray-300">Active (Published)</Label>
              </div>

              {/* Scheduling & Settings */}
              <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg dark:border-gray-700">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Start Time (Available From)</Label>
                  <Input 
                    type="datetime-local" 
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">End Time (Deadline)</Label>
                  <Input 
                    type="datetime-local" 
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Feedback Mode</Label>
                  <select
                    className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    value={feedbackMode}
                    onChange={(e) => setFeedbackMode(e.target.value)}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="manual">Manual Release</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Time Limit */}
              <div className="p-4 border rounded-lg dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="use_custom_time" 
                    checked={useCustomTime} 
                    onChange={(e) => setUseCustomTime(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="use_custom_time" className="dark:text-gray-300">Set Custom Time Limit</Label>
                </div>

                {useCustomTime ? (
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Time (Minutes)</Label>
                      <Input 
                        type="number"
                        min="1"
                        value={timeLimit ? Math.floor(timeLimit / 60) : 0}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) * 60)}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 w-32"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-6">Total: {timeLimit ? Math.floor(timeLimit / 60) : 0} minutes</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Default: 1 minute 30 seconds per question (Total: {questions.length * 90 / 60} mins)
                  </p>
                )}
              </div>

              {/* Assignment */}
              <div className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
                <h3 className="font-semibold dark:text-gray-200">Assignment</h3>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="assign_all" 
                    checked={assignToAll} 
                    onChange={(e) => setAssignToAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="assign_all" className="dark:text-gray-300">Assign to All Students</Label>
                </div>

                {!assignToAll && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Assign to Groups</Label>
                      <div className="h-32 overflow-y-auto border rounded p-2 dark:bg-gray-800 dark:border-gray-700">
                        {availableGroups.map(group => (
                          <div key={group.id} className="flex items-center space-x-2 mb-1">
                            <input 
                              type="checkbox"
                              checked={selectedGroups.includes(group.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedGroups([...selectedGroups, group.id]);
                                else setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm dark:text-gray-300">{group.name}</span>
                          </div>
                        ))}
                        {availableGroups.length === 0 && <p className="text-xs text-gray-500">No groups available</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Assign to Specific Students</Label>
                      <div className="h-32 overflow-y-auto border rounded p-2 dark:bg-gray-800 dark:border-gray-700">
                        {availableStudents.map(student => (
                          <div key={student.id} className="flex items-center space-x-2 mb-1">
                            <input 
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedStudents([...selectedStudents, student.id]);
                                else setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm dark:text-gray-300">{student.name} ({student.id.slice(0,4)})</span>
                          </div>
                        ))}
                        {availableStudents.length === 0 && <p className="text-xs text-gray-500">No students available</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Creator (Manual Only for Edit to simplify, or could add AI) */}
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
              {loading ? t.updating : t.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}