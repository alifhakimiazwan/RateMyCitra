import { connectDB } from "@/lib/db/mongodb";
import { Citra } from "@/lib/db/schema";
import SearchBar from "@/components/SearchBar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export default async function Explore({
  searchParams,
}: {
  searchParams: { page?: string; query?: string };
}) {
  await connectDB();

  const page = parseInt(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Get total count of Citra courses
  const totalCitra = await Citra.countDocuments();
  const totalPages = Math.ceil(totalCitra / limit);

  const citraSubjects = await Citra.aggregate([
    { $sort: { name: 1 } }, // Sort alphabetically
    { $skip: skip },
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
                      in: { $cond: { if: "$$r.takeAgain", then: 1, else: 0 } },
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

  const serializedCitraSubjects = citraSubjects.map((subject) => ({
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
