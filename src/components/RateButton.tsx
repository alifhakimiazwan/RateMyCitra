"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RateButtonProps {
  citraId: number;
}

export default function RateButton({ citraId }: RateButtonProps) {
  const { userId } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!userId) {
      router.push("/sign-in"); // Redirect to sign-in page
    } else {
      router.push(`/rate/${citraId}`); // Redirect to the rating page
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="default"
      className="p-5 cursor-pointer"
    >
      Rate
    </Button>
  );
}
