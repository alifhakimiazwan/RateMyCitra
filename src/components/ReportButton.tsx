"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import { Flag } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";

export default function ReportButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [reported, setReported] = useState(false);
  const [reason, setReason] = useState("");

  const handleReport = async () => {
    if (reported) return;

    try {
      await axios.post("/api/report", { reviewId, reason });
      setReported(true);
      toast.success("Review reported successfully");
      router.push(`/explore`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to report review");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={reported} className="flex items-center gap-2">
          <Flag className={"text-white"} />
          {"Report"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Report Review</DialogTitle>
        <p className="text-sm text-gray-500">
          Why are you reporting this review?
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the issue (optional)"
        />
        <Button onClick={handleReport} disabled={reported}>
          Submit Report
        </Button>
      </DialogContent>
    </Dialog>
  );
}
