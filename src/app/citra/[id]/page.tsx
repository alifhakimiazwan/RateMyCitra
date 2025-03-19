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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Destructure params first

  if (!id) {
    return <p className="text-red-500">Invalid Citra ID: {id}</p>;
  } // ✅ Await params to resolve it

  await connectDB();

  import { ObjectId } from "mongodb";

  let citras;
  try {
    citras = await Citra.aggregate([
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
            $ifNull: [{ $arrayElemAt: ["$ratings.mode", 0] }, "Unknown"],
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
      { $sort: { totalRatings: -1 } }, // Sort by most-rated subjects
    ]);

    if (!citras || citras.length === 0) {
      return (
        <p className="text-center text-lg font-semibold">
          No Citra subjects found.
        </p>
      );
    }
  } catch (error) {
    console.error("Error fetching Citra subjects:", error);
    return <p className="text-red-500">Error loading Citra subjects.</p>;
  }

  const subject = citras[0];

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
