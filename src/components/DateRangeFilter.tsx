import { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangeFilterProps) {
  const hasFilter = startDate || endDate;

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">
          From:
        </label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">
          To:
        </label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-40"
          min={startDate || undefined}
        />
      </div>
      {hasFilter && (
        <Button variant="secondary" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}

