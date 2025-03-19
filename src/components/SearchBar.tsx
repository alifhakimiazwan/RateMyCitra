"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import RateButton from "@/components/RateButton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Subject {
  _id: string;
  name: string;
  courseCode: string;
  citraType: string;
  faculty: string;
  mode: string;
  totalRatings: number;
  takeAgainPercentage: number;
  averageDifficulty: number;
}

export default function SearchBar({ subjects }: { subjects: Subject[] }) {
  const [query, setQuery] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState(subjects);
  const [selectedCitraType, setSelectedCitraType] = useState("All");
  const [sortOption, setSortOption] = useState("difficulty-highest");

  useEffect(() => {
    let filtered = subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query.toLowerCase()) ||
        subject.courseCode.toLowerCase().includes(query.toLowerCase())
    );

    if (selectedCitraType !== "All") {
      filtered = filtered.filter(
        (subject) => subject.citraType === selectedCitraType
      );
    }

    // Extract sorting criteria and order
    const [sortBy, order] = sortOption.split("-");
    filtered.sort((a, b) => {
      const isDescending = order === "highest";
      if (sortBy === "difficulty") {
        return isDescending
          ? b.averageDifficulty - a.averageDifficulty
          : a.averageDifficulty - b.averageDifficulty;
      } else {
        return isDescending
          ? b.totalRatings - a.totalRatings
          : a.totalRatings - b.totalRatings;
      }
    });

    setFilteredSubjects(filtered);
  }, [query, selectedCitraType, sortOption, subjects]);

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search subjects..."
        className="w-full mb-6"
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedCitraType} onValueChange={setSelectedCitraType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Citra Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Citra Types</SelectItem>
            <SelectItem value="C1">C1</SelectItem>
            <SelectItem value="C2">C2</SelectItem>
            <SelectItem value="C3">C3</SelectItem>
            <SelectItem value="C4">C4</SelectItem>
            <SelectItem value="C5">C5</SelectItem>
            <SelectItem value="C6">C6</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Sort Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="difficulty-highest">
              Difficulty (Highest to Lowest)
            </SelectItem>
            <SelectItem value="difficulty-lowest">
              Difficulty (Lowest to Highest)
            </SelectItem>
            <SelectItem value="ratings-highest">
              Total Ratings (Highest to Lowest)
            </SelectItem>
            <SelectItem value="ratings-lowest">
              Total Ratings (Lowest to Highest)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredSubjects.map((subject) => (
          <Card key={subject._id} className="w-full px-4 py-6 mt-4">
            <CardContent className="flex justify-between items-center">
              <div>
                <Link href={`/citra/${subject._id}`} className="block">
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
                  <p className="text-xs hidden sm:block">Difficulty</p>
                  <p className="text-sm sm:text-lg font-bold md:ml-2">
                    {subject.averageDifficulty.toFixed(1)}
                  </p>
                  <p className="text-xs sm:text-sm ml-1">/ 5</p>
                </div>
                <RateButton citraId={subject._id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
