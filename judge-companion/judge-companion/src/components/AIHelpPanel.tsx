import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, AlertCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIHelpPanelProps {
  open: boolean;
  onClose: () => void;
  code: string;
  language: string;
  problemTitle?: string;
  problemDescription?: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ─── Built-in smart hints (works without an API key) ──────────────────────────
function generateLocalHint(
  code: string,
  language: string,
  problemTitle: string,
  question: string
): string {
  const lang = language.toLowerCase();
  const q = question.toLowerCase();
  const codeL = code.toLowerCase();

  const lines: string[] = [];

  lines.push(`## 🤖 Smart Hint (offline mode)`);
  lines.push(`\n*Add a free Groq API key to .env.local to enable full AI responses.*\n`);
  lines.push(`---`);

  // Problem-specific hints
  if (problemTitle?.toLowerCase().includes("two sum")) {
    lines.push(`\n### Two Sum — Key Concepts\n`);
    lines.push(`**Optimal approach:** Use a hash map to store each number's index.`);
    lines.push(`For each element \`nums[i]\`, check if \`target - nums[i]\` already exists in the map.`);
    lines.push(`- Time complexity: **O(n)**`);
    lines.push(`- Space complexity: **O(n)**\n`);

    if (!codeL.includes("map") && !codeL.includes("dict") && !codeL.includes("hashmap") && !codeL.includes("{")) {
      lines.push(`⚠️ Your code may be using a brute-force O(n²) approach. Consider using a hash map / dictionary.`);
    }
  }

  // Language-specific common issues
  lines.push(`\n### ${lang.charAt(0).toUpperCase() + lang.slice(1)} — Common Pitfalls\n`);

  if (lang === "python") {
    if (!codeL.includes("sys.stdin") && !codeL.includes("input()")) {
      lines.push(`- **Input reading**: Use \`sys.stdin.readline()\` for fast input, or \`input()\` for simple cases.`);
    }
    if (codeL.includes("print") && !codeL.includes("print(")) {
      lines.push(`- **Syntax**: Make sure you're using Python 3 \`print()\` with parentheses.`);
    }
    lines.push(`- **Output format**: Match the expected format exactly — trailing spaces or newlines can cause Wrong Answer.`);
    lines.push(`- **Edge cases**: Test with negative numbers, duplicates, and single-element arrays.`);
  }

  if (lang === "cpp" || lang === "c") {
    lines.push(`- **Include headers**: Make sure you have \`#include <bits/stdc++.h>\` or specific headers.`);
    lines.push(`- **Integer overflow**: Use \`long long\` if values can exceed 2^31.`);
    lines.push(`- **Input format**: Use \`getline\` for reading space-separated numbers on one line.`);
    if (!codeL.includes("return 0")) {
      lines.push(`- **main()**: Make sure \`main()\` returns 0.`);
    }
  }

  if (lang === "java") {
    if (!codeL.includes("scanner") && !codeL.includes("bufferedreader")) {
      lines.push(`- **Input**: Use \`Scanner\` or \`BufferedReader\` to read input.`);
    }
    lines.push(`- **Class name**: The public class must be named \`Main\`.`);
    lines.push(`- **Output**: Use \`System.out.println()\` — not \`print\` without \`ln\` for newlines.`);
  }

  if (lang === "javascript" || lang === "typescript") {
    if (!codeL.includes("readline") && !codeL.includes("fs.readfilesync")) {
      lines.push(`- **Input**: Use \`fs.readFileSync(0, 'utf-8')\` to read from stdin.`);
    }
    lines.push(`- **Output**: Use \`console.log()\` — JSON.stringify arrays for proper formatting.`);
  }

  if (lang === "go") {
    lines.push(`- **Input**: Use \`bufio.NewScanner\` for reading lines from stdin.`);
    lines.push(`- **Output**: Use \`fmt.Println()\` or \`fmt.Printf()\`.`);
    if (!codeL.includes("package main")) {
      lines.push(`- ⚠️ Missing \`package main\` declaration.`);
    }
  }

  if (lang === "rust") {
    lines.push(`- **Input**: Use \`std::io::BufRead\` with \`stdin().lock().lines()\`.`);
    if (!codeL.includes("fn main")) {
      lines.push(`- ⚠️ Missing \`fn main()\` function.`);
    }
    lines.push(`- **Ownership**: Be careful with borrowing — prefer \`.clone()\` when in doubt.`);
  }

  // Question-specific hints
  if (q.includes("wrong") || q.includes("error") || q.includes("fail")) {
    lines.push(`\n### Debugging Checklist\n`);
    lines.push(`1. ✅ Check that your output format matches exactly (spaces, brackets, newlines)`);
    lines.push(`2. ✅ Test with all provided examples manually`);
    lines.push(`3. ✅ Check for off-by-one errors in loops`);
    lines.push(`4. ✅ Verify input parsing handles all edge cases`);
    lines.push(`5. ✅ Look at the stderr output in the Test Results panel for error details`);
  }

  if (q.includes("time") || q.includes("tle") || q.includes("slow")) {
    lines.push(`\n### Time Limit Exceeded Tips\n`);
    lines.push(`- Switch from O(n²) brute force to O(n) with a hash map`);
    lines.push(`- Avoid repeated string concatenation in loops`);
    lines.push(`- Use early return / break when the answer is found`);
  }

  lines.push(`\n---`);
  lines.push(`\n💡 *To get full AI-powered responses, add your free Groq API key:*`);
  lines.push(`\`\`\`\n# judge-companion/.env.local\nVITE_GROQ_API_KEY=gsk_...\n\`\`\``);
  lines.push(`Get a free key at: https://console.groq.com/keys`);

  return lines.join("\n");
}
// ─────────────────────────────────────────────────────────────────────────────

const isRealKey = (key: string) =>
  key && key !== "YOUR_REAL_API_KEY_GOES_HERE" && key.startsWith("gsk_");

export function AIHelpPanel({
  open,
  onClose,
  code,
  language,
  problemTitle,
  problemDescription,
}: AIHelpPanelProps) {
  const [prompt, setPrompt] = useState(
    "Explain what might be wrong with my code and give a hint (not the full solution)."
  );
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocal, setIsLocal] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setError("");
    setResponse("");
    setIsLocal(false);

    // ── Use local smart hints if no valid API key ───────────────────────────
    if (!isRealKey(GROQ_API_KEY)) {
      await new Promise((r) => setTimeout(r, 600)); // small delay to feel natural
      setResponse(generateLocalHint(code, language, problemTitle ?? "", prompt));
      setIsLocal(true);
      setLoading(false);
      return;
    }

    // ── Real Groq API call ────────────────────────────────────────────────
    const fullPrompt = `You are a helpful coding assistant for a competitive programming platform.

Problem: ${problemTitle || "Unknown"}
Description: ${problemDescription || ""}

User's code (${language}):
\`\`\`${language}
${code}
\`\`\`

User's question: ${prompt}

Give a clear, concise response. If pointing out errors, be specific about which line or concept. Do NOT give the full solution directly — give hints and explanations.`;

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      const text =
        data?.choices?.[0]?.message?.content ||
        "No response generated.";
      setResponse(text);
    } catch (e: unknown) {
      // Fallback to local hints if API fails
      setResponse(generateLocalHint(code, language, problemTitle ?? "", prompt));
      setIsLocal(true);
      setError(
        `Groq API error: ${e instanceof Error ? e.message : "Unknown error"}. Showing local hints instead.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col bg-card border-border p-0"
      >
        <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            AI Help
            <Badge variant="secondary" className="text-xs ml-1">
              {isRealKey(GROQ_API_KEY) ? "Llama 3 (Groq)" : "Smart Hints"}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0 px-6 py-4 gap-4 overflow-hidden">
          {/* Context summary */}
          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground shrink-0">
            <div className="font-medium text-foreground mb-1">Context sent to AI:</div>
            <div>Problem: <span className="text-foreground">{problemTitle || "—"}</span></div>
            <div>Language: <span className="text-foreground capitalize">{language}</span></div>
            <div>Code: <span className="text-foreground">{code.split("\n").length} lines</span></div>
          </div>

          {/* API key notice */}
          {!isRealKey(GROQ_API_KEY) && (
            <div className="flex items-start gap-2 bg-amber-500/10 text-amber-400 rounded-lg p-3 text-xs shrink-0">
              <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Running in <strong>offline mode</strong>. Add a free{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Groq API key
                </a>{" "}
                to <code className="bg-amber-500/20 px-1 rounded">.env.local</code> for full AI responses.
              </span>
            </div>
          )}

          {/* User prompt */}
          <div className="space-y-2 shrink-0">
            <label className="text-sm font-medium text-foreground">Your question</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about your code..."
              rows={3}
              className="bg-background border-border text-sm resize-none"
            />
            <Button
              onClick={handleAsk}
              disabled={loading || !prompt.trim()}
              className="w-full gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Thinking…" : "Ask AI"}
            </Button>
          </div>

          {/* Soft error (API failed, showing fallback) */}
          {error && (
            <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-xs shrink-0">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Response */}
          {(loading || response) && (
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                Response
                {isLocal && (
                  <Badge variant="outline" className="text-xs font-normal">offline</Badge>
                )}
              </div>
              {loading && !response ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating response…
                </div>
              ) : (
                <div className="bg-secondary/40 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed overflow-auto">
                  {response}
                </div>
              )}
            </div>
          )}

          {!loading && !response && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center space-y-2">
                <Sparkles className="h-8 w-8 mx-auto opacity-30" />
                <p>Ask for hints, explanations, or debugging help.</p>
                <p className="text-xs opacity-60">
                  Your code and problem are automatically included.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
