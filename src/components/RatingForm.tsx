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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
const formSchema = z.object({
  courseCode: z.string().min(4, "Course code is required"),
  citraId: z.string(),
  difficulty: z.number().min(1).max(5),
  mode: z.enum(["Online", "Face-to-Face"]),
  takeAgain: z.enum(["true", "false"]),
  slidesProvided: z.enum(["true", "false"]),
  attendanceMandatory: z.enum(["true", "false"]),
  grade: z.enum(["A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"]),
  review: z.string().min(10, "Review must be at least 10 characters"),
});
type FormValues = z.infer<typeof formSchema>; // Generate TypeScript type

interface Citra {
  _id: string;
  courseCode: string;
  name: string;
  faculty: string;
  citraType: string;
}

// const restrictedWords = [
//   "bodoh",
//   "tak guna",
//   "sampah",
//   "teruk",
//   "gagal",
//   "malas",
//   "tak adil",
//   "menyusahkan",
//   "buang masa",
//   "sial",
//   "celaka",
//   "bangang",
//   "babi",
//   "anjing",
//   "maki",
//   "tak faham",
//   "tak reti",
//   "pemalas",
//   "terlampau susah",
//   "soalan merepek",
//   "soalan bodoh",
//   "mustahil nak lulus",
//   "tak boleh skor",
//   "subjek tak berguna",
//   "membazir masa",
//   "assignment tak masuk akal",
//   "buang kredit",

//   // Lecturer titles to block any name after them
//   "\\bDr\\.?\\b",
//   "\\bProfessor\\b",
//   "\\bProf\\.?\\b",
//   "\\bSir\\b",
//   "\\bMadam\\b",
//   "\\bEncik\\b",
//   "\\bPuan\\b",
//   "\\bCikgu\\b",
//   "\\bUstaz\\b",
//   "\\bUstazah\\b",
//   "\\bTuan\\b",
//   "\\bDatin\\b",
//   "\\bDato'\\b",
//   "\\bDatuk\\b",
// ];

export default function RatingForm({ course }: { course: Citra }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [difficultyValue, setDifficultyValue] = useState(3);

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
      review: "",
    },
  });

  const containsRestrictedWords = (text: string) => {
    console.log("Checking review:", text); // Log input text

    const toxicWords = [
      "bodoh",
      "tak guna",
      "sampah",
      "teruk",
      "gagal",
      "malas",
      "nigga",
      "bangla",
      "india",
      "melayu",
      "cina",
      "type c",
      "maki",
      "bodoh",
      "bodo",
      "tak adil",
      "menyusahkan",
      "buang masa",
      "sial",
      "celaka",
      "bangang",
      "babi",
      "anjing",
      "maki",
      "tak faham",
      "tak reti",
      "pemalas",
      "terlampau susah",
      "soalan merepek",
      "soalan bodoh",
      "mustahil nak lulus",
      "tak boleh skor",
      "subjek tak berguna",
      "membazir masa",
      "assignment tak masuk akal",
      "buang kredit",
      "tak faham",
      "pemalas",
      "soalan merepek",
      "assignment tak masuk akal",
    ];

    const lecturerTitles = [
      "Dr",
      "Professor",
      "Prof",
      "Sir",
      "Madam",
      "Encik",
      "Puan",
      "Cikgu",
      "Ustaz",
      "Ustazah",
      "Tuan",
      "Datin",
      "Dato'",
      "Datuk",
    ];

    // Create regex patterns
    const toxicPattern = toxicWords.join("|");
    const lecturerPattern = lecturerTitles
      .map((title) => `\\b${title}\\.?\\s+[A-Za-z]+`)
      .join("|");

    // Combine both
    const pattern = `(${toxicPattern})|(${lecturerPattern})`;
    const regex = new RegExp(pattern, "gi");

    const match = text.match(regex);
    console.log("Matched words:", match); // Log matched words

    return match !== null;
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting review:", data.review); // Log review content

    if (containsRestrictedWords(data.review)) {
      toast.error("Submission blocked due to restricted words!");
      return; // Prevent submission
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/rating/add", {
        ...data,
        citraId: course.courseCode,
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
          {/* Course Code */}
          <FormItem>
            <FormLabel>Course</FormLabel>
            <Input value={`${course.name} (${course.courseCode})`} disabled />
          </FormItem>

          {/* Difficulty Slider */}
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
                  <span className="text-sm font-medium">{difficultyValue}</span>{" "}
                  {/* Displaying value */}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mode (Online / Face-to-Face) */}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <RadioGroupItem value="Online" id="online" />
                    <FormLabel htmlFor="online">Online</FormLabel>
                    <RadioGroupItem value="Face-to-Face" id="face-to-face" />
                    <FormLabel htmlFor="face-to-face">Face-to-Face</FormLabel>
                  </RadioGroup>
                </FormControl>
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

          {/* Review Textarea */}
          {/* Review Textarea */}
          <FormField
            control={form.control}
            name="review"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review</FormLabel>
                {/* Rules Note */}
                <p className="text-sm text-red-500">
                  ⚠ No hateful comments, no mentioning lecturers names, and
                  avoid toxic language.
                </p>
                <FormControl>
                  <Textarea placeholder="Write your experience..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
