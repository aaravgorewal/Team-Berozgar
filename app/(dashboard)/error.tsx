"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Database } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const isDbTimeout = error.message.includes("Can't reach database server") || error.message.includes("P1001");

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <Database className="h-10 w-10 text-muted-foreground" />
      </div>
      
      {isDbTimeout ? (
        <>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Waking up the Database...</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Because you are on a free serverless tier, your database goes to sleep after inactivity. It just needs a few seconds to wake back up!
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
        </>
      )}

      <Button onClick={() => reset()} size="lg">
        {isDbTimeout ? "Retry Connection" : "Try Again"}
      </Button>
    </div>
  );
}
