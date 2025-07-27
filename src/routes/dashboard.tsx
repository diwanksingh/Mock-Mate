import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Dashboard = (): JSX.Element => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    const interviewQuery = query(
      collection(db, "interviews"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      interviewQuery,
      (snapshot) => {
        const interviewList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
        setInterviews(interviewList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching interviews:", error);
        toast.error("Error loading data", {
          description: "Something went wrong. Please try again later.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return (
   <div className="relative min-h-screen w-full overflow-x-hidden">
  {/* Grid background (entire page) */}
  <div
    className={cn(
      "fixed inset-0 -z-10",
      "min-h-screen w-full",
      "[background-size:70px_70px]",
      "[background-image:linear-gradient(to_right,#e4e4e7_0.5px,transparent_0.8px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
      "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
    )}
  />

  {/* Radial fade effect (optional for visual focus) */}
  <div className="pointer-events-none fixed inset-0 -z-10 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />


      <section className="relative z-20 w-full max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border  p-6 shadow-md dark:border-white">
          <Headings
            title="Your Interviews"
            description="Manage and track your mock interviews to boost your confidence and skills."
          />
          <Link to="/generate/create">
            <Button size="sm" className="gap-2 text-md hover:shadow-xl self-start md:self-auto">
              <Plus className="w-5 h-5" /> Add New
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))
          ) : interviews.length > 0 ? (
            interviews.map((interview) => (
              <InterviewPin key={interview.id} interview={interview} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center py-20">
              <img
                src="/assets/svg/not-found.svg"
                alt="No data illustration"
                className="mb-4 h-40 w-40"
              />
              <h2 className="text-xl font-semibold text-muted-foreground">
                No Interviews Found
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                You haven’t created any mock interviews yet. Start by adding a new one to practice and improve your skills.
              </p>
              <Link to="/generate/create">
                <Button size="sm" className="mt-4 gap-2">
                <Star className="w-4 h-4" />
                Add Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
