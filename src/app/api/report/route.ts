import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Report } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reviewId, reason } = await req.json();
    console.log("Received reviewId:", reviewId);

    if (!ObjectId.isValid(reviewId)) {
      console.error("Invalid ObjectId format:", reviewId);
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const objectId = new ObjectId(reviewId);

    // Check if user has already reported this review
    const existingReport = await Report.findOne({ reviewId: objectId, userId });
    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this review" },
        { status: 400 }
      );
    }

    // Create a new report entry
    await Report.create({
      reviewId: objectId,
      userId,
      reason: reason || "No reason provided",
    });

    return NextResponse.json({ success: true, message: "Review reported" });
  } catch (error) {
    console.error("Error in report API:", error);
    return NextResponse.json(
      { error: "Failed to report review" },
      { status: 500 }
    );
  }
}
