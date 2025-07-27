import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CircleCheck, Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }
  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        if (interviewId) {
          try {
            const interviewDoc = await getDoc(
              doc(db, "interviews", interviewId)
            );
            if (interviewDoc.exists()) {
              setInterview({
                id: interviewDoc.id,
                ...interviewDoc.data(),
              } as Interview);
            }
          } catch (error) {
            console.log(error);
          }
        }
      };

      const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
          const querSanpRef = query(
            collection(db, "userAnswers"),
            where("userId", "==", userId),
            where("mockIdRef", "==", interviewId)
          );

          const querySnap = await getDocs(querSanpRef);

          const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as UserAnswer;
          });

          setFeedbacks(interviewData);
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchInterview();
      fetchFeedbacks();
    }
  }, [interviewId, navigate, userId]);

  //   calculate the ratings out of 10

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";

    const totalRatings = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );

    return (totalRatings / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
  <div className="flex flex-col w-full gap-10 py-6 px-4 sm:px-6 lg:px-8">
    {/* Header Breadcrumb */}
    <div className="flex items-center justify-between w-full">
      <CustomBreadCrumb
        breadCrumbPage="Feedback"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/generate" },
          {
            label: `${interview?.position}`,
            link: `/generate/interview/${interview?.id}`,
          },
        ]}
      />
    </div>

    {/* Headline */}
    <div className="space-y-2">
      <Headings
        title="🎉 Congratulations!"
        description="Your personalized feedback is ready. Review your strengths, growth areas, and tips to shine in your next interview."
      />

      <p className="text-base text-muted-foreground">
        Your overall interview rating:
        <span className="text-emerald-600 font-bold text-2xl ml-2">
          {overAllRating} / 10
        </span>
      </p>
    </div>

    {/* Interview Pin Summary */}
    {interview && <InterviewPin interview={interview} onMockPage />}

    {/* Feedback Section */}
    <div className="space-y-4">
      <Headings title="📋 Interview Feedback" isSubHeading />

      {feedbacks && (
        <Accordion
          type="single"
          collapsible
          className="space-y-4 rounded-xl"
        >
          {feedbacks.map((feed) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className="rounded-lg border border-gray-200 dark:text-black shadow-sm overflow-hidden"
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className={cn(
                  "px-5 py-4 text-base font-medium transition-all flex justify-between items-center bg-white hover:bg-gray-50",
                  activeFeed === feed.id &&
                    "bg-gradient-to-r from-purple-50 to-blue-50"
                )}
              >
                <span>{feed.question}</span>
              </AccordionTrigger>

              <AccordionContent className="px-6 py-6 bg-gray-50 space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                  <Star className="text-yellow-500" />
                  Rating: {feed.rating}
                </div>

                {/* Expected Answer */}
                <Card className="bg-green-50/80 p-5 border-none rounded-xl shadow-sm space-y-3">
                  <CardTitle className="flex items-center text-lg text-green-700">
                    <CircleCheck className="mr-2" />
                    Expected Answer
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-800">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                {/* Your Answer */}
                <Card className="bg-yellow-50/80 p-5 border-none rounded-xl shadow-sm space-y-3">
                  <CardTitle className="flex items-center text-lg text-yellow-700">
                    <CircleCheck className="mr-2" />
                    Your Answer
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-800">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                {/* Feedback */}
                <Card className="bg-red-50/80 p-5 border-none rounded-xl shadow-sm space-y-3">
                  <CardTitle className="flex items-center text-lg text-red-700">
                    <CircleCheck className="mr-2" />
                    Feedback
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-800">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  </div>
);
}