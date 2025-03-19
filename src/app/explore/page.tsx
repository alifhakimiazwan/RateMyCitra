"use client";
import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import { Loader2 } from "lucide-react";

export default function Explore() {
  const [citras, setCitras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCitras() {
      setLoading(true);
      const res = await fetch("/api/citra"); // API to get updated Citra subjects
      const data = await res.json();
      setCitras(data);
      setLoading(false);
    }

    fetchCitras();
  }, []);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 font-telegraf">
        Explore Citra Subjects
      </h1>

      {/* SearchBar Component */}
      {loading ? (
        <Loader2 className="animate-spin h-7 w-7" />
      ) : (
        <SearchBar subjects={citras} />
      )}
    </div>
  );
}
