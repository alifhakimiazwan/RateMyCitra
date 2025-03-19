import { connectDB } from "@/lib/db/mongodb";
import { Citra } from "@/lib/db/schema";

export async function GET() {
  await connectDB();

  const citras = await Citra.aggregate([
    {
      $lookup: {
        from: "ratings",
        localField: "courseCode",
        foreignField: "courseCode",
        as: "ratings",
      },
    },
    {
      $addFields: {
        totalRatings: { $size: "$ratings" },
        averageQuality: {
          $cond: {
            if: { $gt: [{ $size: "$ratings" }, 0] },
            then: { $avg: "$ratings.quality" },
            else: 0,
          },
        },
        averageDifficulty: {
          $cond: {
            if: { $gt: [{ $size: "$ratings" }, 0] },
            then: { $avg: "$ratings.difficulty" },
            else: 0,
          },
        },
        takeAgainPercentage: {
          $cond: {
            if: { $gt: [{ $size: "$ratings" }, 0] },
            then: {
              $multiply: [
                {
                  $avg: {
                    $map: {
                      input: "$ratings",
                      as: "rating",
                      in: {
                        $cond: [
                          { $ifNull: ["$$rating.takeAgain", false] },
                          1,
                          0,
                        ],
                      },
                    },
                  },
                },
                100,
              ],
            },
            else: 0,
          },
        },
        mode: {
          $cond: {
            if: { $gt: [{ $size: "$ratings" }, 0] },
            then: { $arrayElemAt: ["$ratings.mode", 0] }, // Get first mode if exists
            else: "Unknown",
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        courseCode: 1,
        name: 1,
        faculty: 1,
        citraType: 1,
        totalRatings: 1,
        mode: 1,
        averageQuality: 1,
        averageDifficulty: 1,
        takeAgainPercentage: 1,
      },
    },
  ]);

  return Response.json(citras);
}
