import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Play, Send, RotateCcw, Sparkles, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor, defaultCode } from "@/components/CodeEditor";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIHelpPanel } from "@/components/AIHelpPanel";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
}

interface EditorPanelProps {
  onRun: (code: string, language: string, input: string) => void;
  onSubmit: (code: string, language: string) => void;
  isRunning: boolean;
  problem?: Problem | null;
}

export function EditorPanel({ onRun, onSubmit, isRunning, problem }: EditorPanelProps) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(defaultCode.python);
  const [customInput, setCustomInput] = useState("2 7 11 15\n9");
  const [aiOpen, setAiOpen] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage] || defaultCode.javascript);
  };

  const handleReset = () => {
    setCode(defaultCode[language] || defaultCode.javascript);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <LanguageSelector value={language} onChange={handleLanguageChange} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            id="ai-help-btn"
            variant="ghost"
            size="sm"
            onClick={() => setAiOpen(true)}
            className="text-muted-foreground hover:text-foreground gap-1"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Help</span>
          </Button>
          <Button
            id="run-btn"
            variant="outline"
            size="sm"
            onClick={() => onRun(code, language, customInput)}
            disabled={isRunning}
            className="gap-1"
          >
            <Play className="h-4 w-4" />
            Run
          </Button>
          <Button
            id="submit-btn"
            size="sm"
            onClick={() => onSubmit(code, language)}
            disabled={isRunning}
            className="gap-1 bg-success hover:bg-success/90 text-success-foreground"
          >
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>

      {/* Resizable Code Editor and Test Case */}
      <PanelGroup direction="vertical" className="flex-1 min-h-0">
        {/* Code Editor */}
        <Panel defaultSize={75} minSize={30}>
          <div className="h-full">
            <CodeEditor
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
            />
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="h-1.5 bg-border hover:bg-primary/50 transition-colors flex items-center justify-center group">
          <GripHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </PanelResizeHandle>

        {/* Custom Test Case */}
        <Panel defaultSize={25} minSize={10}>
          <div className="h-full flex flex-col border-t border-border">
            <Tabs defaultValue="testcase" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 px-2 shrink-0">
                <TabsTrigger
                  value="testcase"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Custom Testcase
                </TabsTrigger>
              </TabsList>

              <TabsContent value="testcase" className="flex-1 p-4 m-0">
                <Textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter your custom test case..."
                  className="font-mono text-sm bg-editor-bg border-border resize-none h-full"
                />
              </TabsContent>
            </Tabs>
          </div>
        </Panel>
      </PanelGroup>

      {/* AI Help Sheet */}
      <AIHelpPanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        code={code}
        language={language}
        problemTitle={problem?.title}
        problemDescription={problem?.description}
      />
    </div>
  );
}