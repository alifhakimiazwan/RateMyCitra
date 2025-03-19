import { connectDB } from "@/lib/db/mongodb";
import { Citra } from "@/lib/db/schema";
import { ObjectId } from "mongodb"; // ✅ Import ObjectId
import RateButton from "@/components/RateButton";
import CitraReviews from "@/components/CitraReviews";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";

export default async function CitraDetails({
  params,
}: {
  params: { id: string };
}) {
  await connectDB();
  if (!params?.id) {
    return <p className="text-red-500">Invalid Citra ID</p>;
  }

  let citra;
  try {
    citra = await Citra.aggregate([
      { $match: { _id: new ObjectId(params.id) } },
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
          ratings: {
            user: 1,
            quality: 1,
            difficulty: 1,
            takeAgain: 1,
            comment: 1,
          }, // ✅ Pass user reviews to the frontend
        },
      },
    ]);

    if (!citra.length) {
      return (
        <p className="text-center text-lg font-semibold">
          Citra subject not found.
        </p>
      );
    }
  } catch (error) {
    console.error("Error fetching Citra:", error);

    return <p className="text-red-500">Error loading Citra details.</p>;
  }

  const subject = citra[0];

  return (
    <div className="container mx-auto px-6 py-10">
      <BackButton />
      <h1 className="text-3xl font-bold font-telegraf">{subject.courseCode}</h1>
      <h3 className="text-xl font-bold mb-4 font-telegraf">{subject.name}</h3>
      <div className="flex space-x-2 my-4">
        <Badge variant="default">{subject.citraType}</Badge>
        <Badge variant="outline">{subject.faculty}</Badge>
        <Badge variant="secondary">{subject.mode}</Badge>
      </div>

      <RateButton citraId={subject._id.toString()} />

      <div className="mt-6 flex justify-between text-center text-sm border border-gray-300 rounded-lg p-4">
        <div className="w-1/3">
          <p className="text-xl font-telegraf font-bold">
            {subject.totalRatings}
          </p>
          <p className="text-muted-foreground">Total Ratings</p>
        </div>
        <div className="w-1/3 border-l border-gray-300">
          <p className="text-xl font-telegraf font-bold">
            {subject.takeAgainPercentage.toFixed(1)}%
          </p>
          <p className="text-muted-foreground">Would Take Again</p>
        </div>
        <div className="w-1/3 border-l border-gray-300">
          <p className="text-xl font-telegraf font-bold">
            {subject.averageDifficulty.toFixed(1)} / 5
          </p>
          <p className="text-muted-foreground">Difficulty</p>
          <p>{subject.ratings.quality}</p>
        </div>
      </div>
      <CitraReviews courseCode={subject.courseCode} />
    </div>
  );
}
