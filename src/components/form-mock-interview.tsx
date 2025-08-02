import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Interview } from "@/types";
import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Headings } from "./headings";
import { Button } from "./ui/button";
import {  Loader, RefreshCcw, Trash2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { chatSession } from "@/scripts";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z.string().min(1, "Position is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  experience: z.coerce.number().min(0, "Experience must be 0 or greater"),
  techStack: z.string().min(1, "Tech stack is required"),
  questionTypes: z
    .array(z.enum(["theory", "dsa"]))
    .min(1, "Select at least one question type"),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: initialData || {
      position: "",
      description: "",
      experience: 0,
      techStack: "",
      questionTypes: ["theory"],
    },
  });

  const { isValid, isSubmitting } = form.formState;
  const navigate = useNavigate();
  const { userId } = useAuth();

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
        questionTypes:["theory", "dsa"],
      });
    }
  }, [initialData?.id]);

  const title = initialData
    ? initialData.position
    : "Create a new mock interview";

  const breadCrumbPage = initialData ? initialData.position : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated..!", description: "Changes saved successfully..." }
    : { title: "Created..!", description: "New Mock Interview created..." };

  const cleanAiResponse = (responseText: string) => {
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/(json|```|`)/g, "");
    const match = cleanText.match(/\[.*\]/s);
    if (!match) throw new Error("No JSON array found in response");
    return JSON.parse(match[0]);
  };

  const generateAiResponse = async (data: FormData) => {
    const wantsTheory = data.questionTypes.includes("theory");
    const wantsDSA = data.questionTypes.includes("dsa");

    let instructions = "";

    if (wantsTheory) {
      instructions += "- Include theory questions related to the tech stack\n";
    }
    if (wantsDSA) {
      instructions += "- Include DSA questions (e.g. algorithms, time complexity, problem-solving)\n";
    }

    const prompt = `
Generate a JSON array of 5 interview questions and answers based on the job info.

Job Info:
- Role: ${data.position}
- Description: ${data.description}
- Experience: ${data.experience}
- Tech Stack: ${data.techStack}

Requirements:
${instructions}
Format as:
[
  { "question": "...", "answer": "..." },
  ...
]
Return only the JSON array. No extra text, formatting, or code blocks.
`;

    const aiResult = await chatSession.sendMessage(prompt);
    const responseText = await aiResult.response.text();
    return cleanAiResponse(responseText);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!userId) {
        toast("Auth error", { description: "User not authenticated" });
        return;
      }

      const aiQuestions = await generateAiResponse(data);

      if (initialData) {
        await updateDoc(doc(db, "interviews", initialData.id), {
          ...data,
          questions: aiQuestions,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "interviews"), {
          ...data,
          userId,
          questions: aiQuestions,
          createdAt: serverTimestamp(),
        });
      }

      toast(toastMessage.title, { description: toastMessage.description });
      navigate("/generate", { replace: true });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast("Error..", {
        description: "Something went wrong. Please try again later",
        style: { color: "red" },
      });
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${initialData.position}"?`
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "interviews", initialData.id));
      toast("Deleted..!", {
        description: "Mock interview deleted successfully.",
      });
      navigate("/generate", { replace: true });
    } catch (error) {
      console.error("Delete failed:", error);
      toast("Error deleting", {
        description: "Could not delete this interview. Please try again.",
        style: { color: "red" },
      });
    }
  };

  return (
    <div className="w-full flex-col space-y-4">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumbPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />
        {initialData && (
          <Button size="icon" variant="ghost" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        )}
      </div>

      <div className="my-6" />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-8 rounded-lg flex flex-col gap-6 shadow-md"
        >
          {/* Position */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <FormLabel>Job Role / Job Position</FormLabel>
                <FormControl>
                  <Input
                    className="h-12 disabled:bg-muted bg-background"
                    disabled={isSubmitting}
                    placeholder="e.g., Full Stack Developer"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px]"
                    disabled={isSubmitting}
                    placeholder="Describe the job role..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Experience */}
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12"
                    disabled={isSubmitting}
                    placeholder="e.g., 5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tech Stack */}
          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <FormLabel>Tech Stack</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[60px]"
                    disabled={isSubmitting}
                    placeholder="e.g., React, TypeScript, Node.js..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question Types */}
          <FormField
            control={form.control}
            name="questionTypes"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <FormLabel>Type of Questions</FormLabel>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="theory"
                      checked={field.value.includes("theory")}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const newValue = checked
                          ? [...field.value, "theory"]
                          : field.value.filter((v) => v !== "theory");
                        field.onChange(newValue);
                      }}
                    />
                    Theory
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="dsa"
                      checked={field.value.includes("dsa")}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const newValue = checked
                          ? [...field.value, "dsa"]
                          : field.value.filter((v) => v !== "dsa");
                        field.onChange(newValue);
                      }}
                    />
                    Data Structures & Algorithms (DSA)
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="w-full flex justify-end gap-4">
            <Button type="reset"  size="sm" disabled={isSubmitting}>
             <RefreshCcw/> Reset
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader className="text-white dark:text-black animate-spin" />
              ) : (
                actions
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
