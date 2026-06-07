"use client";

import { useState } from "react";
import axios from "axios";
import { FlaskConical, Building2, Clock, ArrowRight } from "lucide-react";
import LabDetailsPopup from "./LabDetailsPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lab } from "@/lib/types";

function TestCard({ name, testId }: { name: string; testId: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const [labsList, setLabsList] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLabs = async () => {
    setShowDetails(true);
    setLoading(true);
    try {
      const response = await axios({
        url: `/api/v1/tests/getlabsfortest`,
        method: "POST",
        data: { test_name: name },
      });
      setLabsList(response.data.labs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-0" />

        <div className="flex items-start justify-between gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FlaskConical className="h-6 w-6" />
          </span>
          <Badge variant="warning">20% off</Badge>
        </div>

        <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug">
          {name}
        </h3>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            Multiple labs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            Report in 12 hrs
          </span>
        </div>

        <Button
          onClick={handleLabs}
          variant="outline"
          className="mt-6 w-full group-hover:border-primary/50"
        >
          View labs &amp; prices
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {showDetails && (
        <LabDetailsPopup
          testId={testId}
          labsdata={labsList}
          testName={name}
          loading={loading}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

export default TestCard;
