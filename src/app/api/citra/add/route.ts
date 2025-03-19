import { connectDB } from "@/lib/db/mongodb";
import { Citra } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB(); // Connect to MongoDB
    const { citraList } = await req.json(); // Get array from request body

    if (!Array.isArray(citraList) || citraList.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Insert into MongoDB
    const result = await Citra.insertMany(citraList);

    return NextResponse.json(
      { message: "Citra subjects added!", insertedCount: result.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding Citra subjects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
