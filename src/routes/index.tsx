import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { markAnswer } from "@/lib/marking.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IGCSE Exam Marker — Literature 0475 & Language 0500" },
      {
        name: "description",
        content:
          "Upload a photo of your IGCSE exam question and handwritten answer to get a strict examiner mark and targeted feedback.",
      },
      { property: "og:title", content: "IGCSE Exam Marker" },
      {
        property: "og:description",
        content:
          "Strict Cambridge-style marking of your own handwritten Literature 0475 and Language 0500 answers.",
      },
    ],
  }),
  component: App,
});

const TEXTS = [
  "The Road",
  "Bus Station",
  "These Are The Times We Live In",
  "The Enemies",
  "Boxes",
  "The Capital",
  "Afternoon Nap",
  "Plaits",
  "Children of Wealth",
  "Touch and Go",
  "Things Fall Apart (Chinua Achebe)",
  "Blues for an Alabama Sky",
  "A Taste of Honey (Shelagh Delaney)",
];

type Result = { valid: boolean; mark: number | null; total: number; feedback: string };

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the image."));
    r.readAsDataURL(file);
  });
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(await readFile(file));
    e.target.value = "";
  };

  return (
    <div className="border border-border p-4">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      {value ? (
        <div className="mt-3">
          <img src={value} alt={label} className="max-h-56 w-full object-contain border border-border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-2 font-mono text-xs uppercase tracking-widest text-ink hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => camera.current?.click()}
            className="flex-1 border border-border py-3 font-mono text-xs uppercase tracking-widest hover:border-ink"
          >
            Camera
          </button>
          <button
            type="button"
            onClick={() => gallery.current?.click()}
            className="flex-1 border border-border py-3 font-mono text-xs uppercase tracking-widest hover:border-ink"
          >
            Upload
          </button>
        </div>
      )}
      <input ref={camera} type="file" accept="image/*" capture="environment" onChange={handle} className="hidden" />
      <input ref={gallery} type="file" accept="image/*" onChange={handle} className="hidden" />
    </div>
  );
}

function App() {
  const [view, setView] = useState<"home" | "lit" | "lang">("home");
  const [text, setText] = useState(TEXTS[0]);
  const [component, setComponent] = useState<"directed" | "composition">("directed");
  const [q, setQ] = useState<string | null>(null);
  const [a, setA] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const reset = () => {
    setQ(null);
    setA(null);
    setResult(null);
    setError(null);
  };

  const go = (v: "home" | "lit" | "lang") => {
    reset();
    setView(v);
  };

  const submit = async () => {
    if (!q || !a) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload =
        view === "lit"
          ? { paper: "literature" as const, context: `Literature 0475 — set text: ${text}`, total: 25 }
          : component === "directed"
            ? { paper: "directed" as const, context: "Language 0500 — Directed Writing", total: 35 }
            : {
                paper: "composition" as const,
                context: "Language 0500 — Composition (narrative/descriptive)",
                total: 40,
              };
      const res = await markAnswer({ data: { ...payload, questionImage: q, answerImage: a } });
      setResult(res as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Marking failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
        <header className="border-b border-border pb-5">
          <h1 className="text-2xl tracking-tight">IGCSE Exam Marker</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Marks your own handwritten work — never writes answers
          </p>
        </header>

        {view === "home" ? (
          <div className="mt-10 grid gap-4">
            <button
              onClick={() => go("lit")}
              className="border border-border p-8 text-left transition-colors hover:border-ink"
            >
              <span className="block text-xl">Literature</span>
              <span className="mt-1 block font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                0475 · out of 25
              </span>
            </button>
            <button
              onClick={() => go("lang")}
              className="border border-border p-8 text-left transition-colors hover:border-ink"
            >
              <span className="block text-xl">Language</span>
              <span className="mt-1 block font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                0500 · out of 35 or 40
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <button
              onClick={() => go("home")}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-ink"
            >
              ← Back
            </button>

            <h2 className="mt-6 text-lg">
              {view === "lit" ? "Literature (0475)" : "Language (0500)"}
            </h2>

            {result ? (
              <div className="mt-8">
                {result.valid && result.mark !== null ? (
                  <p className="font-serif text-6xl text-ink">
                    {result.mark} / {result.total}
                  </p>
                ) : (
                  <p className="font-mono text-sm uppercase tracking-widest text-ink">Not marked</p>
                )}
                <p className="mt-6 whitespace-pre-wrap border-t border-border pt-6 leading-relaxed">
                  {result.feedback}
                </p>
                <button
                  onClick={reset}
                  className="mt-8 w-full border border-ink py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-primary-foreground"
                >
                  Mark another answer
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {view === "lit" ? (
                  <label className="block">
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Set text / poem
                    </span>
                    <select
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="mt-2 w-full border border-border bg-background p-3 font-serif text-foreground"
                    >
                      {TEXTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["directed", "Directed Writing", "/ 35"],
                        ["composition", "Composition", "/ 40"],
                      ] as const
                    ).map(([key, label, out]) => (
                      <button
                        key={key}
                        onClick={() => setComponent(key)}
                        className={`border p-4 text-left ${
                          component === key ? "border-ink text-ink" : "border-border text-muted-foreground"
                        }`}
                      >
                        <span className="block text-sm">{label}</span>
                        <span className="font-mono text-xs tracking-widest">{out}</span>
                      </button>
                    ))}
                  </div>
                )}

                <ImageField label="Question photo" value={q} onChange={setQ} />
                <ImageField label="Your handwritten answer" value={a} onChange={setA} />

                {error && <p className="font-mono text-xs text-ink">{error}</p>}

                <button
                  onClick={submit}
                  disabled={!q || !a || loading}
                  className="w-full border border-ink py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
                >
                  {loading ? "Marking…" : "Mark my answer"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-5 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Saiinaav Gupta · 10 A
      </footer>
    </div>
  );
}
