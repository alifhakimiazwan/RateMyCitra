"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="mb-4 flex items-center gap-2 cursor-pointer"
      onClick={() => router.back()}
    >
      <ArrowLeft size={16} />
      Back
    </Button>
  );
}
