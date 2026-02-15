import { useState } from "react";
import { format, addDays, subDays, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";

interface HorizontalCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const HorizontalCalendar = ({ selectedDate, onSelectDate }: HorizontalCalendarProps) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    setWeekStart(subDays(weekStart, 7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const goToToday = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    onSelectDate(today);
  };

  return (
    <div className="bg-card rounded-2xl p-4 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-semibold">
            {format(weekStart, "MMMM yyyy", { locale: es })}
          </h3>
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
            Hoy
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : isToday
                  ? "bg-secondary text-foreground"
                  : "hover:bg-secondary/70 text-muted-foreground"
              )}
            >
              <span className="text-xs font-medium uppercase">
                {format(day, "EEE")}
              </span>
              <span className={cn(
                "text-xl font-bold mt-1",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(day, "d")}
              </span>
              {isToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalCalendar;
