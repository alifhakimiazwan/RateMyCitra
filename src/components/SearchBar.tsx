"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import RateButton from "@/components/RateButton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SearchBar({ subjects }: { subjects: any[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const queryFromURL = searchParams.get("query") || "";
  const [query, setQuery] = useState(queryFromURL);
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);

  useEffect(() => {
    const filtered = subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query.toLowerCase()) ||
        subject.courseCode.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [query, subjects]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Update URL parameters without refreshing the page
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("query", value);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search subjects..."
        className="w-full mb-6"
      />

      <div className="space-y-4">
        {filteredSubjects.map((subject) => (
          <Card key={subject._id} className="w-full px-4 py-6 mt-4">
            <CardContent className="flex justify-between items-center">
              <div>
                <Link href={`/citra/${subject._id}`} passHref className="block">
                  <h2 className="text-xl font-semibold font-telegraf">
                    {subject.courseCode}
                  </h2>
                  <h3 className="text-lg font-semibold font-telegraf">
                    {subject.name}
                  </h3>
                </Link>

                <div className="hidden sm:block">
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="text-md font-telegraf font-bold text-black">
                      {subject.takeAgainPercentage.toFixed(1)}%
                    </span>{" "}
                    would take this subject again
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-md font-telegraf font-bold text-black mr-1">
                      {subject.totalRatings}
                    </span>{" "}
                    rating(s)
                  </p>
                  <div className="flex flex-row items-center gap-3 mt-2">
                    <Badge variant="default">{subject.citraType}</Badge>
                    <Badge variant="outline">{subject.faculty}</Badge>
                    <Badge variant="secondary">{subject.mode}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 px-2">
                <div className="border border-gray-400 sm:border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center">
                  <p className="text-xs hidden sm:block">Difficulty:</p>
                  <p className="text-sm sm:text-lg font-bold md:ml-2">
                    {subject.averageDifficulty.toFixed(1)}
                  </p>
                  <p className="text-xs sm:text-sm ml-1">/ 5</p>
                </div>
                <RateButton
                  citraId={subject._id}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
