/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, WebcamIcon } from "lucide-react";
import { InterviewPin } from "@/components/pin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WebCam from "react-webcam";

export const MockLoadPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);

  const navigate = useNavigate();

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
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;
  if (!interviewId || !interview) {
    navigate("/generate", { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-6 px-4 md:px-8 bg-white dark:bg-black min-h-screen transition-colors">
      {/* Header Section */}
      <div className="flex items-center justify-between w-full flex-wrap gap-4">
        <CustomBreadCrumb
          breadCrumbPage={interview?.position || ""}
          breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
        />
        <Link to={`/generate/interview/${interviewId}/start`}>
          <Button size="sm">
            Start <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Interview Info */}
      {interview && <InterviewPin interview={interview} onMockPage />}

      {/* Alert */}
      <Alert className="bg-yellow-100/60 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 p-4 rounded-lg flex items-start gap-3 -mt-3">
        <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-1" />
        <div>
          <AlertTitle className="text-yellow-800 dark:text-yellow-300 font-semibold">
            Important Information
          </AlertTitle>
          <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
            Please check your webcam and microphone to start the AI-generated mock interview.
            The interview consists of five questions. You’ll receive a personalized report based on your responses at the end.
            <br />
            <br />
            <span className="font-medium">Note:</span> Your video is <strong>never recorded</strong>.
            You can disable your webcam at any time.
          </AlertDescription>
        </div>
      </Alert>

      {/* Webcam Preview */}
      <div className="flex flex-col items-center justify-center gap-4 mt-4">
        <div className="w-full max-w-md aspect-video rounded-xl   border-gray-300 dark:border-zinc-700 shadow-sm flex items-center justify-center overflow-hidden transition-all">
          {isWebCamEnabled ? (
            <WebCam
              audio={true}
              onUserMedia={() => setIsWebCamEnabled(true)}
              onUserMediaError={() => setIsWebCamEnabled(false)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <WebcamIcon className="h-20 w-20 mb-2" />
              <p className="text-sm">Webcam is disabled</p>
            </div>
          )}
        </div>

        <Button
          variant={isWebCamEnabled ? "destructive" : "default"}
          onClick={() => setIsWebCamEnabled((prev) => !prev)}
          className="w-48"
        >
          {isWebCamEnabled ? "Disable Webcam" : "Check Webcam"}
        </Button>
      </div>
    </div>
  );
};
