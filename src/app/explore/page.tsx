import { connectDB } from "@/lib/db/mongodb";
import { Citra } from "@/lib/db/schema";
import SearchBar from "@/components/SearchBar";

export default async function Explore() {
  await connectDB();

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

  const serializedCitraSubjects = citras.map((subject) => ({
    ...subject,
    _id: subject._id.toString(),
  }));

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 font-telegraf">
        Explore Citra Subjects
      </h1>

      {/* SearchBar Component */}
      <SearchBar subjects={serializedCitraSubjects} />
    </div>
  );
}
