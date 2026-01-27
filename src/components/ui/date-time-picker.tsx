import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

interface DateTimePickerProps {
  businessId: string;
  durationMinutes: number;
  onSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  className?: string;
}

export function DateTimePicker({
  businessId,
  durationMinutes,
  onSelect,
  selectedDate,
  selectedTime,
  className,
}: DateTimePickerProps) {
  const [selectedDateState, setSelectedDateState] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync internal state with props
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setSelectedDateState(date);
    } else {
      setSelectedDateState(undefined);
    }
  }, [selectedDate]);

  // Memoize loadAvailableSlots to prevent unnecessary re-renders
  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDateState || !businessId || !durationMinutes) return;

    setLoadingSlots(true);
    setError(null);

    try {
      const startDate = format(selectedDateState, "yyyy-MM-dd");
      const endDate = format(addDays(selectedDateState, 7), "yyyy-MM-dd");

      const res = await fetch(
        `${API_BASE_URL}/businesses/${businessId}/availability?startDate=${startDate}&endDate=${endDate}&durationMinutes=${durationMinutes}&slotIntervalMinutes=30`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load available slots");
      }

      // Filter slots for selected date
      const dateStr = format(selectedDateState, "yyyy-MM-dd");
      const allSlots = Array.isArray(data.data) ? data.data : [];
      const slotsForDate = allSlots.filter(
        (slot: TimeSlot) => slot.date === dateStr && slot.available
      );

      // If no slots at all in the response, business likely hasn't set up schedule
      if (allSlots.length === 0) {
        setError("This business hasn't set up their availability schedule yet. Please contact them to set up booking times.");
        setAvailableSlots([]);
      } else if (slotsForDate.length === 0) {
        // If there are slots but none for this date, show a different message
        setError("No available time slots for this date. Please select another date.");
        setAvailableSlots([]);
      } else {
        setError(null);
        setAvailableSlots(slotsForDate);
      }
    } catch (err: any) {
      console.error("Error loading available slots:", err);
      setError(err.message || "Failed to load available time slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDateState, businessId, durationMinutes]);

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDateState) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setError(null);
    }
  }, [selectedDateState, loadAvailableSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDateState(date);
    if (date) {
      onSelect(format(date, "yyyy-MM-dd"), "");
    }
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDateState) {
      onSelect(format(selectedDateState, "yyyy-MM-dd"), time);
    }
  };

  // Disable past dates
  const disabledDates = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-base font-semibold">Select Date</h4>
        </div>
        <Calendar
          mode="single"
          selected={selectedDateState}
          onSelect={handleDateSelect}
          disabled={disabledDates}
          className="w-1/2 mx-auto"
        />
      </div>

      {selectedDateState && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h4 className="text-base font-semibold">Select Time</h4>
          </div>
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-sm text-destructive py-4">{error}</div>
          ) : availableSlots.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 space-y-2">
              <p>No available time slots for this date.</p>
              <p className="text-xs">
                This may be because:
              </p>
              <ul className="text-xs list-disc list-inside space-y-1 ml-2">
                <li>The business hasn't set up their availability schedule</li>
                <li>All slots for this date are already booked</li>
                <li>This date is blocked by the business</li>
              </ul>
              <p className="text-xs mt-2">Please select another date or contact the business.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    selectedTime === slot.time && "bg-primary text-primary-foreground"
                  )}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedDateState && selectedTime && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Selected booking:</p>
          <p className="text-sm text-muted-foreground">
            {format(selectedDateState, "EEEE, MMMM d, yyyy")} at {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
}

