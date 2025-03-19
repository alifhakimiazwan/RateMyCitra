import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db/mongodb";
import { Citra } from "@/lib/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { query } = req.query;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "Invalid search query" });
  }

  try {
    await connectDB();

    // Search subjects across all pages
    const subjects = await Citra.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { courseCode: { $regex: query, $options: "i" } },
          ],
        },
      },
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
          averageQuality: { $avg: "$ratings.quality" },
          averageDifficulty: { $avg: "$ratings.difficulty" },
          takeAgainPercentage: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: {
                $multiply: [
                  {
                    $avg: {
                      $map: {
                        input: "$ratings",
                        as: "r",
                        in: {
                          $cond: { if: "$$r.takeAgain", then: 1, else: 0 },
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
              then: { $arrayElemAt: ["$ratings.mode", 0] },
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
          averageQuality: { $ifNull: ["$averageQuality", 0] },
          averageDifficulty: { $ifNull: ["$averageDifficulty", 0] },
          takeAgainPercentage: 1,
        },
      },
    ]);

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
