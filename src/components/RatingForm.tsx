"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  courseCode: z.string().min(4, "Course code is required"),
  citraId: z.string(),
  difficulty: z.number().min(1).max(5),
  mode: z.enum(["Online", "Face-to-Face"]),
  takeAgain: z.enum(["true", "false"]),
  slidesProvided: z.enum(["true", "false"]),
  attendanceMandatory: z.enum(["true", "false"]),
  grade: z.enum(["A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"]),
  keywords: z.array(z.string()).max(3, "You can select up to 3 keywords"),
});

type FormValues = z.infer<typeof formSchema>;

const keywordOptions = [
  "Tough Grader",
  "Group Projects",
  "Assignment Heavy",
  "Easy A",
  "Lots of Reading",
  "Interactive Class",
  "No Attendance Required",
  "Strict Attendance Policy",
];

export default function RatingForm({ course }: { course: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [difficultyValue, setDifficultyValue] = useState(3);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: course.courseCode,
      citraId: course.courseCode,
      difficulty: 3,
      mode: "Online",
      takeAgain: "false",
      slidesProvided: "false",
      attendanceMandatory: "false",
      grade: "A",
      keywords: [],
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/rating/add", {
        ...data,
        citraId: course.courseCode,
        keywords: selectedKeywords,
      });
      if (response.status === 201) {
        router.push("/explore");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormItem>
            <FormLabel>Course</FormLabel>
            <Input value={`${course.name} (${course.courseCode})`} disabled />
          </FormItem>

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty (1 [Easy] - 5 [Hard])</FormLabel>
                <div className="flex items-center gap-2">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(val) => {
                      field.onChange(val[0]);
                      setDifficultyValue(val[0]);
                    }}
                    defaultValue={[field.value]}
                  />
                  <span className="text-sm font-medium">{difficultyValue}</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attendanceMandatory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Was attendance mandatory?</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <RadioGroupItem value="true" id="attendance-yes" />
                    <FormLabel htmlFor="attendance-yes">Yes</FormLabel>
                    <RadioGroupItem value="false" id="attendance-no" />
                    <FormLabel htmlFor="attendance-no">No</FormLabel>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Take Again (Yes / No) */}
          <FormField
            control={form.control}
            name="takeAgain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Would you take this subject again?</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <RadioGroupItem value="true" id="take-again-yes" />
                    <FormLabel htmlFor="take-again-yes">Yes</FormLabel>
                    <RadioGroupItem value="false" id="take-again-no" />
                    <FormLabel htmlFor="take-again-no">No</FormLabel>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grade Selection */}
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade Received</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"].map(
                        (grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keywords"
            render={() => (
              <FormItem>
                <FormLabel>Select Keywords (Choose up to 3)</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {keywordOptions.map((keyword) => (
                    <div key={keyword} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedKeywords.includes(keyword)}
                        onCheckedChange={() => handleKeywordToggle(keyword)}
                        disabled={
                          selectedKeywords.length >= 3 &&
                          !selectedKeywords.includes(keyword)
                        }
                      />
                      <span>{keyword}</span>
                    </div>
                  ))}
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading || selectedKeywords.length === 0}
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
