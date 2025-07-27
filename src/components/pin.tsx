import { Interview } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Eye, Newspaper, Sparkles } from "lucide-react";

interface InterviewPinProps {
  interview: Interview;
  onMockPage?: boolean;
}

export const InterviewPin = ({
  interview,
  onMockPage = false,
}: InterviewPinProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-5 rounded-2xl border border-border bg-background shadow-md  transition-shadow group cursor-pointer space-y-4">
      
      {/* Title */}
      <div className="space-y-1">
        <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition">
          {interview?.position || "Untitled Role"}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-muted-foreground">
          {interview?.description || "No description provided."}
        </CardDescription>
      </div>

      {/* Tech Stack */}
      {interview?.techStack && (
        <div className="flex flex-wrap gap-2">
          {interview.techStack.split(",").map((word, index) => (
            <Badge
              key={index}
              variant="outline"
              className="rounded-full border-muted hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 transition-all text-xs px-3 py-1"
            >
              {word.trim()}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <CardFooter
        className={cn(
          "flex items-center gap-4 text-xs text-muted-foreground p-0",
          onMockPage ? "justify-end" : "justify-between"
        )}
      >
        {!onMockPage && (
          <div className="flex items-center gap-2">
            <TooltipButton
              content="View"
              buttonVariant="ghost"
              onClick={() =>
                navigate(`/generate/${interview?.id}`, { replace: true })
              }
              disbaled={false}
              buttonClassName="hover:text-sky-500"
              icon={<Eye className="w-4 h-4" />}
              loading={false}
            />

            <TooltipButton
              content="Feedback"
              buttonVariant="ghost"
              onClick={() =>
                navigate(`/generate/feedback/${interview?.id}`, {
                  replace: true,
                })
              }
              disbaled={false}
              buttonClassName="hover:text-yellow-500"
              icon={<Newspaper className="w-4 h-4" />}
              loading={false}
            />

            <TooltipButton
              content="Start"
              buttonVariant="ghost"
              onClick={() =>
                navigate(`/generate/interview/${interview?.id}`, {
                  replace: true,
                })
              }
              disbaled={false}
              buttonClassName="hover:text-green-600"
              icon={<Sparkles className="w-4 h-4" />}
              loading={false}
            />
          </div>
        )}

        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
          {new Date(interview?.createdAt.toDate()).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </CardFooter>
    </Card>
  );
};
