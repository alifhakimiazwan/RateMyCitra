import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Citra } from "@/lib/db/schema";
import { Rating } from "@/lib/db/schema";

export async function GET() {
  try {
    await connectDB();

    // Fetch all Citra subjects
    const citraSubjects = await Citra.find();

    // Fetch and calculate ratings for each Citra
    const citraWithRatings = await Promise.all(
      citraSubjects.map(async (citra) => {
        const ratings = await Rating.find({ citraId: citra._id });

        if (ratings.length === 0) {
          return {
            ...citra.toObject(),
            quality: 0,
            difficulty: 0,
            takeAgain: 0,
          };
        }

        const totalQuality = ratings.reduce((sum, r) => sum + r.quality, 0);
        const totalDifficulty = ratings.reduce(
          (sum, r) => sum + r.difficulty,
          0
        );
        const takeAgainCount = ratings.filter((r) => r.takeAgain).length;

        return {
          ...citra.toObject(),
          quality: totalQuality / ratings.length,
          difficulty: totalDifficulty / ratings.length,
          takeAgain: (takeAgainCount / ratings.length) * 100, // Convert to percentage
        };
      })
    );

    return NextResponse.json(citraWithRatings);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching Citra", error },
      { status: 500 }
    );
  }
}
