import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Header } from "@/components/Header";
import { ProblemPanel } from "@/components/ProblemPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GripVertical } from "lucide-react";

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
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [progressHint, setProgressHint] = useState<string | undefined>(undefined);

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

          const results: TestResult[] = (data.test_results ?? []).map((r) => ({
            passed: r.passed,
            input: r.input,
            expected: r.expected,
            output: r.stdout?.trim() || r.output?.trim() || "",
            verdict: r.verdict,
            stderr: r.stderr,
          }));

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
    []
  );

  const runCustomTest = useCallback(
    (code: string, language: string, input: string) => {
      executeSubmission(code, language, [{ input, expected: "" }]);
    },
    [executeSubmission]
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
        <Header progressHint={progressHint} />

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
    </ThemeProvider>
  );
};

export default Index;
