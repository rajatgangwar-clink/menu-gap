import { Suspense } from "react";
import { AIAssistance } from "@/components/AIAssistance";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-full" />}>
      <AIAssistance />
    </Suspense>
  );
}
