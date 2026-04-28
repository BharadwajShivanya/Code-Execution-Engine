import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] h-8 bg-secondary border-border text-sm">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value} className="cursor-pointer">
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
