/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { SaveModal } from "./save-modal";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer?.length < 30) {
        toast.error("Error", {
          description: "Your answer should be more than 30 characters",
        });

        return;
      }

      //   ai result
      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );

      setAiResult(aiResult);
    } else {
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    stopSpeechToText();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      // query the firbase to check if the user answer already exists for this question

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      // if the user already answerd the question dont save it again
      if (!querySnap.empty) {
        console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      } else {
        // save the user answer

        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer,
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          userId,
          createdAt: serverTimestamp(),
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }

      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(!open);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combineTranscripts);
  }, [results]);

  return (
  <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 mt-6 p-4">
    {/* Save Modal */}
    <SaveModal
      isOpen={open}
      onClose={() => setOpen(false)}
      onConfirm={saveUserAnswer}
      loading={loading}
    />

    {/* Section Header */}
    <div className="text-center">
      <h1 className="text-2xl font-bold">Answer the Question</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Speak clearly. Your answer must be <span className="font-medium">of 30 characters</span> to be evaluated, don't forget to save it.
      </p>
    </div>

    {/* Webcam Preview */}
    <div className="w-full h-[250px] md:w-96 rounded-lg border shadow-sm overflow-hidden bg-black relative">
      {isWebCam ? (
        <WebCam
          onUserMedia={() => setIsWebCam(true)}
          onUserMediaError={() => setIsWebCam(false)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <WebcamIcon className="w-12 h-12" />
        </div>
      )}
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-medium shadow">
        {isRecording ? (
          <span className="text-red-600">Recording...</span>
        ) : (
          <span className="text-gray-500">Not Recording</span>
        )}
      </div>
    </div>

    {/* Controls */}
    <div className="flex flex-wrap justify-center gap-4">
      <TooltipButton
        content={isWebCam ? "Turn Off Webcam" : "Turn On Webcam"}
        icon={isWebCam ? <VideoOff /> : <Video />}
        onClick={() => setIsWebCam(!isWebCam)}
      />

      <TooltipButton
        content={isRecording ? "Stop Recording" : "Start Recording"}
        icon={isRecording ? <CircleStop /> : <Mic />}
        onClick={recordUserAnswer}
      />

      <TooltipButton
        content="Record Again"
        icon={<RefreshCw />}
        onClick={recordNewAnswer}
      />

      <TooltipButton
        content="Save Your Answer"
        icon={isAiGenerating ? <Loader className="animate-spin" /> : <Save />}
        onClick={() => setOpen(true)}
        disbaled={!aiResult}
      />
    </div>

    {/* User Answer Display */}
    <div className="w-full p-4 border rounded-lg bg-gray-50 dark:bg-black">
      <h2 className="text-lg font-semibold mb-2">Your Answer:</h2>
      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap min-h-[80px]">
        {userAnswer || "Start recording to see your answer here..."}
      </p>
      {interimResult && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          <strong>Listening:</strong> {interimResult}
        </p>
      )}
      <p className="text-xs text-right text-gray-500 mt-1">
        Characters: {userAnswer.length}
      </p>
    </div>

    {/* Feedback Display */}
    {aiResult && (
      <div className="w-full p-4 border rounded-lg bg-green-50 dark:bg-green-900">
        <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">AI Feedback</h2>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
          <strong>Rating:</strong> {aiResult.ratings} / 10
        </p>
        <p className="text-sm mt-1 text-gray-700 dark:text-gray-200">
          <strong>Feedback:</strong> {aiResult.feedback}
        </p>
      </div>
    )}
  </div>
);
}
