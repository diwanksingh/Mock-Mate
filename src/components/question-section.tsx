import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Volume2, VolumeX } from "lucide-react";
import { RecordAnswer } from "./record-answer";
import Editor from "@monaco-editor/react";

interface QuestionSectionProps {
  questions: { question: string; answer: string }[];
}

export const QuestionSection = ({ questions }: QuestionSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("light");

  useEffect(() => {
    // Detect dark mode and apply theme to Monaco Editor
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setEditorTheme(isDark ? "vs-dark" : "light");
  }, []);

  const handlePlayQuestion = (qst: string) => {
    if (isPlaying && currentSpeech) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech(null);
    } else {
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(qst);
        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
        setCurrentSpeech(speech);
        speech.onend = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };
      }
    }
  };

  const isCodingQuestion = (text: string) =>
    text.toLowerCase().includes("code") ||
    text.toLowerCase().includes("algorithm") ||
    text.toLowerCase().includes("function");

  return (
    <div className="w-full min-h-96 border border-gray-200 dark:border-zinc-700 rounded-md p-4 bg-white dark:bg-zinc-900 transition-colors">
      <Tabs
        defaultValue={questions[0]?.question}
        className="w-full space-y-12"
        orientation="vertical"
      >
        <TabsList className="bg-transparent w-full mb-16 flex flex-wrap items-center justify-start gap-2">
          {questions?.map((tab, i) => (
            <TabsTrigger
              className={cn(
                "data-[state=active]:bg-emerald-200 dark:data-[state=active]:bg-emerald-700/30",
                "data-[state=active]:shadow-md text-xs px-1"
              )}
              key={tab.question}
              value={tab.question}
            >
              {`Question #${i + 1}`}
            </TabsTrigger>
          ))}
        </TabsList>

        {questions?.map((tab, i) => (
          <TabsContent key={i} value={tab.question}>
            <p className="text-base text-left tracking-wide pb-7 text-neutral-700 dark:text-neutral-300">
              {tab.question}
            </p>

            <div className="w-full flex items-center justify-end pb-4">
              <TooltipButton
                content={isPlaying ? "Stop" : "Start"}
                icon={
                  isPlaying ? (
                    <VolumeX className="min-w-5 min-h-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="min-w-5 min-h-5 text-muted-foreground" />
                  )
                }
                onClick={() => handlePlayQuestion(tab.question)}
              />
            </div>

            {/* Record Answer */}
            <RecordAnswer
              question={tab}
              isWebCam={isWebCam}
              setIsWebCam={setIsWebCam}
            />

            {/* Code Editor */}
            {isCodingQuestion(tab.question) && (
              <div className="mb-6 mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Write and explain your solution:
                </label>
                <Editor
                  height="300px"
                  defaultLanguage="javascript"
                  defaultValue="// Your code here"
                  theme={editorTheme}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollbar: {
                      verticalScrollbarSize: 4,
                      horizontalScrollbarSize: 4,
                    },
                  }}
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
