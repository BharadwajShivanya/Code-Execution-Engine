import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Header } from "@/components/Header";
import { ProblemPanel } from "@/components/ProblemPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GripVertical, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  output: string;
  verdict?: string;
  stderr?: string;
  runtime?: string;
}

interface BackendTestResult {
  input: string;
  expected: string;
  output: string;
  passed: boolean;
  verdict: string;
  stdout?: string;
  stderr?: string;
}

interface BackendSubmissionResult {
  id: string;
  status: string;
  verdict?: string;
  stdout?: string;
  stderr?: string;
  test_results?: BackendTestResult[];
}

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  tests: Array<{ input: string; expected: string }>;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8090/api/v1";

const Index = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [problemListOpen, setProblemListOpen] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [progressHint, setProgressHint] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const currentIndex = problem ? allProblems.findIndex(p => p.id === problem.id) : -1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setProblem(allProblems[currentIndex - 1]);
  }, [currentIndex, allProblems]);

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < allProblems.length - 1) {
      setProblem(allProblems[currentIndex + 1]);
    }
  }, [currentIndex, allProblems]);

  const executeSubmission = useCallback(
    async (
      code: string,
      language: string,
      tests: Array<{ input: string; expected: string }>
    ) => {
      setIsRunning(true);
      setProgressHint("Submitting code…");
      setTestResults(null);
      setConsoleOutput("");

      try {
        const resp = await fetch(`${API_BASE}/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem_id: problem?.id,
            language,
            code,
            tests,
            time_ms: 20000,
            memory_mb: 256,
          }),
        });

        const { id } = (await resp.json()) as { id: string };
        setProgressHint(`Queued (id: ${id.slice(0, 8)}…)`);

        const poll = async () => {
          const res = await fetch(`${API_BASE}/submissions/${id}`);
          const data = (await res.json()) as BackendSubmissionResult;

          if (data.status !== "completed") {
            setProgressHint(`Status: ${data.status}`);
            setTimeout(poll, 800);
            return;
          }

          let results: TestResult[] = (data.test_results ?? []).map((r) => ({
            passed: r.passed,
            input: r.input,
            expected: r.expected,
            output: r.stdout?.trim() || r.output?.trim() || "",
            verdict: r.verdict,
            stderr: r.stderr,
          }));

          if (results.length === 0 && data.verdict && data.verdict !== "Executed") {
            results = [{
              passed: false,
              input: "Compilation / System Phase",
              expected: "Successful Compilation",
              output: data.stdout || "N/A",
              verdict: data.verdict,
              stderr: data.stderr || "No compiler output provided.",
            }];
          }

          const passCount = results.filter((r) => r.passed).length;
          const allExecuted = results.every((r) => r.verdict === "Executed");
          const allPassed = !allExecuted && results.length > 0 && passCount === results.length;

          setTestResults(results);

          // Build console output from all stderr/stdout
          const consoleParts: string[] = [];
          results.forEach((r, i) => {
            consoleParts.push(`--- Case ${i + 1} ---`);
            if (r.output) consoleParts.push(`stdout: ${r.output}`);
            if (r.stderr) consoleParts.push(`stderr: ${r.stderr}`);
            consoleParts.push(`verdict: ${r.verdict}`);
          });
          setConsoleOutput(consoleParts.join("\n"));

          if (allExecuted) {
            setProgressHint(`▶ Code executed — see output below`);
          } else if (allPassed) {
            setProgressHint(`✓ All ${results.length} test cases passed`);
          } else {
            setProgressHint(`✗ ${passCount}/${results.length} passed — ${data.verdict || "Failed"}`);
          }
          setIsRunning(false);
        };

        poll();
      } catch {
        setProgressHint("✗ Failed to connect to backend");
        setIsRunning(false);
      }
    },
    [problem]
  );

  const runCustomTest = useCallback(
    (code: string, language: string, input: string) => {
      const cleanInput = input.trim();
      const matchedTest = problem?.tests.find(t => t.input.trim() === cleanInput);
      executeSubmission(code, language, [{ input, expected: matchedTest ? matchedTest.expected : "" }]);
    },
    [executeSubmission, problem]
  );

  const submitAllTests = useCallback(
    (code: string, language: string) => {
      if (!problem) {
        setProgressHint("✗ No problem loaded");
        return;
      }
      executeSubmission(code, language, problem.tests);
    },
    [executeSubmission, problem]
  );

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`${API_BASE}/problems`);
        const problems = (await res.json()) as Problem[];
        setAllProblems(problems);
        setProblem(problems[0] ?? null);
      } catch {
        setProgressHint("✗ Failed to load problems — is the backend running?");
      }
    };
    fetchProblems();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="flex flex-col h-screen bg-background">
        <Header 
          progressHint={progressHint} 
          onOpenProblemList={() => setProblemListOpen(true)}
          onPrevProblem={handlePrev}
          onNextProblem={handleNext}
          hasPrev={currentIndex > 0}
          hasNext={currentIndex >= 0 && currentIndex < allProblems.length - 1}
        />

        <div className="flex-1 min-h-0">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Problem Panel */}
            <Panel defaultSize={45} minSize={30} className="bg-card">
              <ProblemPanel
                problem={problem}
                testResults={testResults}
                isRunning={isRunning}
                consoleOutput={consoleOutput}
              />
            </Panel>

            {/* Resize Handle */}
            <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors flex items-center justify-center group">
              <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </PanelResizeHandle>

            {/* Editor Panel */}
            <Panel defaultSize={55} minSize={30} className="bg-card">
              <EditorPanel
                onRun={runCustomTest}
                onSubmit={submitAllTests}
                isRunning={isRunning}
                problem={problem}
              />
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Problem List Sidebar */}
      <Sheet open={problemListOpen} onOpenChange={setProblemListOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-card p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border space-y-4">
            <SheetTitle className="text-left">Problem List</SheetTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-auto p-4">
            {(() => {
              const numberedProblems = allProblems.map((p, idx) => ({ ...p, number: idx + 1 }));
              const filtered = numberedProblems.filter(p => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return p.title.toLowerCase().includes(q) || p.number.toString() === q;
              });

              const easy = filtered.filter(p => p.difficulty.toLowerCase() === "easy");
              const medium = filtered.filter(p => p.difficulty.toLowerCase() === "medium");
              const hard = filtered.filter(p => p.difficulty.toLowerCase() === "hard");

              const renderGroup = (
                value: string,
                title: string,
                items: typeof numberedProblems,
                badgeClass: string,
                countClass: string
              ) => {
                if (items.length === 0) return null;
                return (
                  <AccordionItem value={value} className="border-border">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/30 px-1 rounded-md">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${countClass}`}>{title}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{items.length}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2">
                      <div className="space-y-1">
                        {items.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setProblem(allProblems[p.number - 1]);
                              setProblemListOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-md border border-transparent hover:bg-muted/50 transition-colors flex items-center justify-between ${
                              problem?.id === p.id ? "bg-muted border-border" : ""
                            }`}
                          >
                            <div>
                              <span className="text-muted-foreground mr-2">{p.number}.</span>
                              <span className="font-medium text-foreground text-sm">{p.title}</span>
                            </div>
                            <Badge className={badgeClass}>{p.difficulty}</Badge>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              };

              return (
                <>
                  {filtered.length === 0 && (
                    <div className="text-center text-muted-foreground mt-8">No problems found.</div>
                  )}
                  <Accordion type="multiple" defaultValue={["easy", "medium", "hard"]} className="w-full">
                    {renderGroup("easy", "Easy", easy, "bg-green-500/20 text-green-400 border-0", "text-green-400")}
                    {renderGroup("medium", "Medium", medium, "bg-yellow-500/20 text-yellow-400 border-0", "text-yellow-400")}
                    {renderGroup("hard", "Hard", hard, "bg-red-500/20 text-red-400 border-0", "text-red-400")}
                  </Accordion>
                </>
              );
            })()}
          </div>
        </SheetContent>
      </Sheet>
    </ThemeProvider>
  );
};

export default Index;
