import { Interview } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, CheckCircle, Smile } from "lucide-react";
import { QuestionSection } from "@/components/question-section";
import { Button } from "@/components/ui/button";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchInterview = async () => {
      if (interviewId) {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({
              id: interviewDoc.id,
              ...interviewDoc.data(),
            } as Interview);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchInterview();
  }, [interviewId]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };
    startCamera();
  }, []);

  const handleComplete = () => {
    const confirmed = window.confirm("Are you sure you want to complete the test?");
    if (confirmed) {
      setIsCompleted(true);
    }
  };

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;
  if (!interviewId || !interview) {
    navigate("/generate", { replace: true });
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-black px-4 md:px-10 py-8 flex flex-col gap-8">
      {/* Breadcrumb */}
      <CustomBreadCrumb
        breadCrumbPage="Start"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/generate" },
          {
            label: interview?.position || "",
            link: `/generate/interview/${interview?.id}`,
          },
        ]}
      />

      {/* Info Banner */}
      <Alert className="bg-sky-100 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 p-5 rounded-xl flex gap-4 items-start shadow-sm">
        <Lightbulb className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-1" />
        <div>
          <AlertTitle className="text-sky-800 dark:text-sky-300 font-semibold text-base">
            Interview Guide
          </AlertTitle>
          <AlertDescription className="text-sm text-sky-700 dark:text-sky-300 mt-1 leading-relaxed">
            Click <strong>"Record Answer"</strong> to begin. Once complete, click <strong>"Complete Test"</strong> to receive feedback.
            <br /><br />
            <strong>Privacy:</strong> <span className="font-medium">Your video is never saved</span>. You can disable your webcam at any time.
          </AlertDescription>
        </div>
      </Alert>

      {/* Hidden Webcam */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Interview Section */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Interview Questions
        </h2>

        {interview.questions?.length > 0 ? (
          <QuestionSection questions={interview.questions} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No questions available.</p>
        )}

        {!isCompleted && (
          <div className="pt-4 text-right">
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white transition-all"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Test
            </Button>
          </div>
        )}
      </div>

      {/* Feedback */}
      {isCompleted && (
        <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <Smile className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Feedback Ready!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                Based on your answers, you will receive a personalized report with insights and suggestions for improvement.
              </p>
            </div>
          </div>

          <div className="text-right pt-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => navigate("/generate")}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
