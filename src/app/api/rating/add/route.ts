import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/db";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("application/json")) {
      return NextResponse.json(
        { error: "Invalid Content-Type" },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const data = await req.json();
    if (!data) throw new Error("Request body is missing");

    await db.collection("ratings").insertOne({
      userId,
      citraId: data.citraId,
      courseCode: data.courseCode,
      difficulty: data.difficulty,
      mode: data.mode,
      takeAgain: data.takeAgain === "true",
      attendanceMandatory: data.attendanceMandatory === "true",
      grade: data.grade,
      review: data.review,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Rating submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
