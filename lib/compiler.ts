export interface FileEntry {
  id: string
  name: string
  content: string
}

export interface LanguageConfig {
  monacoId: string
  jdoodleLang: string
  jdoodleVersion: string
  label: string
  ext: string
  color: string
  template: string
}

export const LANGUAGE_MAP: Record<string, LanguageConfig> = {
  py: {
    monacoId: 'python',
    jdoodleLang: 'python3',
    jdoodleVersion: '4',
    label: 'Python',
    ext: 'py',
    color: '#3b82f6',
    template: `def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n`,
  },
  js: {
    monacoId: 'javascript',
    jdoodleLang: 'nodejs',
    jdoodleVersion: '4',
    label: 'JavaScript',
    ext: 'js',
    color: '#f59e0b',
    template: `function main() {\n  console.log("Hello, World!");\n}\n\nmain();\n`,
  },
  ts: {
    monacoId: 'typescript',
    jdoodleLang: 'typescript',
    jdoodleVersion: '1',
    label: 'TypeScript',
    ext: 'ts',
    color: '#5e6ad2',
    template: `function main(): void {\n  console.log("Hello, World!");\n}\n\nmain();\n`,
  },
  java: {
    monacoId: 'java',
    jdoodleLang: 'java',
    jdoodleVersion: '4',
    label: 'Java',
    ext: 'java',
    color: '#ef4444',
    template: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
  },
  rs: {
    monacoId: 'rust',
    jdoodleLang: 'rust',
    jdoodleVersion: '4',
    label: 'Rust',
    ext: 'rs',
    color: '#f97316',
    template: `fn main() {\n    println!("Hello, World!");\n}\n`,
  },
  go: {
    monacoId: 'go',
    jdoodleLang: 'go',
    jdoodleVersion: '4',
    label: 'Go',
    ext: 'go',
    color: '#22d3ee',
    template: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n`,
  },
}

export function getExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function getLangConfig(filename: string): LanguageConfig | undefined {
  return LANGUAGE_MAP[getExt(filename)]
}

export function getMonacoLang(filename: string): string {
  return getLangConfig(filename)?.monacoId ?? 'plaintext'
}

export const DEFAULT_FILES: FileEntry[] = [
  { id: 'f1', name: 'main.py', content: LANGUAGE_MAP.py.template },
  { id: 'f2', name: 'main.js', content: LANGUAGE_MAP.js.template },
  { id: 'f3', name: 'Main.java', content: LANGUAGE_MAP.java.template },
  { id: 'f4', name: 'main.rs', content: LANGUAGE_MAP.rs.template },
  { id: 'f5', name: 'main.go', content: LANGUAGE_MAP.go.template },
]

export interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
  durationMs: number
}

export async function runCode(filename: string, code: string): Promise<RunResult> {
  const lang = getLangConfig(filename)
  if (!lang) throw new Error(`Unsupported file type: .${getExt(filename)}`)

  const t0 = Date.now()

  const res = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      script: code,
      language: lang.jdoodleLang,
      versionIndex: lang.jdoodleVersion,
    }),
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.error ?? `Execution failed (${res.status})`)

  // JDoodle returns { output, statusCode, memory, cpuTime }
  // output contains stdout + stderr combined; errors appear inline
  const raw: string = data.output ?? ''

  // JDoodle doesn't separate stdout/stderr — put everything in stdout
  return {
    stdout: raw,
    stderr: '',
    exitCode: data.statusCode === 200 ? 0 : 1,
    durationMs: Date.now() - t0,
  }
}
