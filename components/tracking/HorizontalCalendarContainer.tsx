"use client";
import { useState } from "react";
import HorizontalCalendar from "./HorizontalCalendar";
import { useRouter } from "next/navigation";
import { extractDateFromDate } from "@/lib/utils";
export default function HorizontalCalendarContainer() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();


  return (
    <div className="mb-8">
      <HorizontalCalendar
        selectedDate={selectedDate}
        onSelectDate={(date)=>{
            setSelectedDate(date);
            router.replace(`tracking?date=${extractDateFromDate(date)}`)
        }}
      />
    </div>
  );
}
