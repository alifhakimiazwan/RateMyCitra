import { Card, CardContent } from "@/components/ui/card";
import { connectDB } from "@/lib/db/mongodb";
import { Rating } from "@/lib/db/schema";
import { format } from "date-fns"; // Install with npm install date-fns

interface Rating {
  createdAt: string; // Assuming it's an ISO date string
  review: string;
  grade?: string; // Optional since you have a fallback "N/A"
  takeAgain: boolean;
  difficulty: number;
}

export default async function CitraReviews({
  courseCode,
}: {
  courseCode: string;
}) {
  await connectDB();

  const ratings = await Rating.aggregate([
    { $match: { courseCode } },
    { $sort: { createdAt: -1 } }, // ✅ Sort newest first
    { $limit: 10 }, // Optional: Fetch only the latest 10 reviews
  ]);
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold font-telegraf">User Reviews</h2>
      {ratings.length > 0 ? (
        <div className="mt-4 space-y-4">
          {ratings.map((rating: Rating, index: number) => (
            <Card key={index} className="rounded-2xl border">
              <CardContent>
                {/* Date at the top */}
                <p className="text-sm font-semibold text-gray-500 font-telegraf">
                  {format(new Date(rating.createdAt), "dd MMM yyyy")}
                </p>

                {/* Review in the middle */}
                <p className="mt-3 text-md font-telegraf font-black">
                  {rating.review}
                </p>

                {/* Three columns at the bottom */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t pt-3">
                  <div>
                    <p className="text-md font-bold font-telegraf">
                      {rating.grade || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Grade Received
                    </p>
                  </div>
                  <div className="border-l border-gray-300">
                    <p className="text-lg font-telegraf font-bold">
                      {rating.takeAgain ? "Yes" : "No"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Would Take Again
                    </p>
                  </div>
                  <div className="border-l border-gray-300">
                    <p className="text-lg font-bold font-telegraf">
                      {rating.difficulty} / 5
                    </p>
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-2">No reviews yet.</p>
      )}
    </div>
  );
}
