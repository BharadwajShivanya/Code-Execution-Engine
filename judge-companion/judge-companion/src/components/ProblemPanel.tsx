import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, Tag, Building2, GripHorizontal, AlertCircle, Play } from "lucide-react";

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  output: string;
  verdict?: string;
  stderr?: string;
  runtime?: string;
}

interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  examples: ProblemExample[];
}

interface ProblemPanelProps {
  problem?: Problem | null;
  testResults: TestResult[] | null;
  isRunning: boolean;
  consoleOutput?: string;
}

function VerdictBadge({ verdict }: { verdict?: string }) {
  if (!verdict) return null;
  const v = verdict.toLowerCase();
  if (v === "accepted")
    return <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">Accepted</Badge>;
  if (v === "executed")
    return <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">Executed</Badge>;
  if (v === "time limit exceeded")
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">Time Limit Exceeded</Badge>;
  if (v === "wrong answer")
    return <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">Wrong Answer</Badge>;
  if (v === "runtime error")
    return <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">Runtime Error</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">{verdict}</Badge>;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const d = difficulty.toLowerCase();
  if (d === "easy") return <Badge className="bg-green-500/20 text-green-400 border-0">Easy</Badge>;
  if (d === "medium") return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Medium</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-0">Hard</Badge>;
}

export function ProblemPanel({ problem, testResults, isRunning, consoleOutput }: ProblemPanelProps) {
  const title = problem?.title ?? "Two Sum";
  const difficulty = problem?.difficulty ?? "Easy";
  const description =
    problem?.description ??
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.";
  const examples =
    problem?.examples ?? [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
      },
    ];

  return (
    <PanelGroup direction="vertical" className="h-full">
      {/* Problem Content */}
      <Panel defaultSize={65} minSize={30}>
        <div className="h-full overflow-auto p-6 editor-scrollbar">
          <div className="space-y-6">
            {/* Title & Difficulty */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                <DifficultyBadge difficulty={difficulty} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Solved</span>
                <span className="mx-2">•</span>
                <span>Acceptance: 52.4%</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed">{description}</p>
            </div>

            {/* Examples */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Examples</h3>
              {examples.map((ex, idx) => (
                <div key={idx} className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Example {idx + 1}:</div>
                  <div className="font-mono text-sm space-y-1">
                    <div>
                      <span className="text-muted-foreground">Input: </span>
                      <span className="text-foreground">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output: </span>
                      <span className="text-green-400">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div>
                        <span className="text-muted-foreground">Explanation: </span>
                        <span className="text-foreground">{ex.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Constraints</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                <li><code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">2 ≤ nums.length ≤ 10⁴</code></li>
                <li><code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">-10⁹ ≤ nums[i] ≤ 10⁹</code></li>
                <li><code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">-10⁹ ≤ target ≤ 10⁹</code></li>
                <li>Only one valid answer exists.</li>
              </ul>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Array</Badge>
                <Badge variant="outline" className="text-xs">Hash Table</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Companies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Google</Badge>
                <Badge variant="outline" className="text-xs">Amazon</Badge>
                <Badge variant="outline" className="text-xs">Meta</Badge>
                <Badge variant="outline" className="text-xs">Apple</Badge>
                <Badge variant="outline" className="text-xs">Microsoft</Badge>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="h-1.5 bg-border hover:bg-primary/50 transition-colors flex items-center justify-center group">
        <GripHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </PanelResizeHandle>

      {/* Test Results */}
      <Panel defaultSize={35} minSize={15}>
        <div className="h-full flex flex-col border-t border-border">
          <Tabs defaultValue="testcases" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 px-2 shrink-0">
              <TabsTrigger
                value="testcases"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Test Results
                {testResults && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({testResults.filter((r) => r.passed).length}/{testResults.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="console"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Console
              </TabsTrigger>
            </TabsList>

            <TabsContent value="testcases" className="flex-1 p-4 overflow-auto editor-scrollbar m-0">
              {isRunning ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Running test cases…</span>
                </div>
              ) : testResults ? (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-3 space-y-2 ${
                        result.verdict?.toLowerCase() === "executed"
                          ? "border-blue-500/30 bg-blue-500/5"
                          : result.passed
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      {/* Case header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.verdict?.toLowerCase() === "executed" ? (
                            <Play className="h-4 w-4 text-blue-400 shrink-0" />
                          ) : result.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                          ) : result.verdict?.toLowerCase() === "time limit exceeded" ? (
                            <Clock className="h-4 w-4 text-yellow-400 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                          )}
                          <span className="text-sm font-medium">
                            Case {index + 1}:{" "}
                            {result.verdict?.toLowerCase() === "executed"
                              ? "Output"
                              : result.passed
                              ? "Passed"
                              : "Failed"}
                          </span>
                        </div>
                        <VerdictBadge verdict={result.verdict} />
                      </div>

                      {/* Details */}
                      <div className="font-mono text-xs space-y-1.5 bg-background/60 rounded p-2">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground w-20 shrink-0">Input:</span>
                          <span className="text-foreground break-all whitespace-pre-wrap">{result.input || "—"}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground w-20 shrink-0">Expected:</span>
                          <span className={result.verdict?.toLowerCase() === "executed" ? "text-muted-foreground break-all whitespace-pre-wrap" : "text-green-400 break-all whitespace-pre-wrap"}>
                            {result.expected || "(not checked)"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground w-20 shrink-0">Output:</span>
                          <span
                            className={
                              result.verdict?.toLowerCase() === "executed"
                                ? "text-foreground break-all whitespace-pre-wrap"
                                : result.passed
                                ? "text-green-400 break-all whitespace-pre-wrap"
                                : "text-red-400 break-all whitespace-pre-wrap"
                            }
                          >
                            {result.output?.trim() || "(empty)"}
                          </span>
                        </div>

                        {/* Stderr shown when runtime error */}
                        {result.stderr && result.stderr.trim() && (
                          <div className="mt-2 border-t border-border/50 pt-2">
                            <div className="flex items-center gap-1 text-red-400 mb-1">
                              <AlertCircle className="h-3 w-3" />
                              <span className="font-medium">Error output:</span>
                            </div>
                            <pre className="text-red-300 text-xs whitespace-pre-wrap break-all">
                              {result.stderr.trim()}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Click <span className="text-foreground font-medium">Run</span> to test with custom input,
                  or <span className="text-foreground font-medium">Submit</span> to run all test cases.
                </div>
              )}
            </TabsContent>

            <TabsContent value="console" className="flex-1 p-4 overflow-auto editor-scrollbar m-0">
              <div className="font-mono text-sm text-muted-foreground">
                {consoleOutput ? (
                  <pre className="whitespace-pre-wrap text-foreground">{consoleOutput}</pre>
                ) : testResults ? (
                  <pre className="whitespace-pre-wrap">
                    {`> Running solution...\n> ${testResults.length} test case(s) executed.\n> Passed: ${testResults.filter((r) => r.passed).length}/${testResults.length}`}
                  </pre>
                ) : (
                  "Console output will appear here..."
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Panel>
    </PanelGroup>
  );
}