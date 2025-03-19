import RatingForm from "@/components/RatingForm";
import { db } from "@/lib/db/db";
import { ObjectId } from "mongodb";

export default async function RatePage({
  params,
}: {
  params: { citraId: string };
}) {
  const { citraId } = params; // ✅ No need for await here

  // Fetch course details directly from the database
  const course = await db
    .collection("citras")
    .findOne({ _id: new ObjectId(citraId) });

  if (!course) {
    throw new Error("Course not found");
  }

  const plainCourse = {
    _id: course._id.toString(), // Convert ObjectId to string
    courseCode: course.courseCode,
    name: course.name,
    faculty: course.faculty,
    citraType: course.citraType,
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 font-telegraf">RateMyCitra</h1>
      <RatingForm course={plainCourse} />
    </div>
  );
}
