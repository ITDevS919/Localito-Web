import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, Calendar, X, Plus, Grid3X3, Ban, CheckCircle } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, startOfWeek } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface AvailabilitySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityBlock {
  id: string;
  block_date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_all_day: boolean;
  created_at: string;
}

type SlotStatus = "available" | "booked" | "blocked" | "locked";

interface SlotGridEntry {
  date: string;
  time: string;
  status: SlotStatus;
  blockId?: string;
}

function generateHourlySlots(startTime: string, endTime: string): string[] {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMins = sh * 60 + (sm || 0);
  const endMins = eh * 60 + (em || 0);
  const slots: string[] = [];
  for (let m = startMins; m < endMins; m += 60) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

// UI ordering: Monday → Sunday to match working week expectations.
// The underlying values still use JS Date.getDay() semantics (0 = Sunday ... 6 = Saturday).
const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export default function BusinessAvailabilityPage() {
  useRequireRole("business", "/login/business");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<AvailabilitySchedule[]>([]);
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({
    blockDate: "",
    startTime: "",
    endTime: "",
    reason: "",
    isAllDay: false,
  });
  const [explicitSlotsByDay, setExplicitSlotsByDay] = useState<Record<number, { time: string; enabled: boolean }[]>>({});
  const [loadingExplicitSlots, setLoadingExplicitSlots] = useState(false);
  const [savingSlots, setSavingSlots] = useState(false);
  const [slotGrid, setSlotGrid] = useState<SlotGridEntry[]>([]);
  const [slotGridStart, setSlotGridStart] = useState(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [slotGridEnd, setSlotGridEnd] = useState(() => format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), "yyyy-MM-dd"));
  const [loadingSlotGrid, setLoadingSlotGrid] = useState(false);
  const [blockingSlot, setBlockingSlot] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    loadSchedule();
    loadBlocks();
    loadExplicitSlots();
  }, []);

  useEffect(() => {
    if (slotGridStart && slotGridEnd) loadSlotGrid();
  }, [slotGridStart, slotGridEnd]);

  const loadSchedule = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/business/availability/schedule`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        // If schedule exists, ensure all 7 days are present
        const loadedSchedule = data.data as AvailabilitySchedule[];
        const scheduleMap = new Map<number, AvailabilitySchedule>(
          loadedSchedule.map((day: AvailabilitySchedule) => [day.dayOfWeek, day])
        );
        
        // Create complete schedule with all 7 days
        const completeSchedule: AvailabilitySchedule[] = DAYS_OF_WEEK.map((day): AvailabilitySchedule => {
          const existingDay = scheduleMap.get(day.value);
          if (existingDay) {
            return existingDay;
          }
          // If day doesn't exist in database, default to unavailable
          return {
            dayOfWeek: day.value,
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: false,
          };
        });
        setSchedule(completeSchedule);
      } else {
        // Initialize with default schedule if none exists
        const defaultSchedule = DAYS_OF_WEEK.map((day) => ({
          dayOfWeek: day.value,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        }));
        setSchedule(defaultSchedule);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive",
      });
      // Initialize with default schedule on error
      const defaultSchedule = DAYS_OF_WEEK.map((day) => ({
        dayOfWeek: day.value,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      }));
      setSchedule(defaultSchedule);
    } finally {
      setLoading(false);
    }
  };

  const loadBlocks = async () => {
    setLoadingBlocks(true);
    try {
      const res = await fetch(`${API_BASE_URL}/business/availability/blocks`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlocks(data.data);
      }
    } catch (err) {
      console.error("Failed to load blocks:", err);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const loadExplicitSlots = async () => {
    setLoadingExplicitSlots(true);
    try {
      const res = await fetch(`${API_BASE_URL}/business/availability/slots`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setExplicitSlotsByDay(data.data);
      }
    } catch (err) {
      console.error("Failed to load explicit slots:", err);
    } finally {
      setLoadingExplicitSlots(false);
    }
  };

  const loadSlotGrid = async () => {
    setLoadingSlotGrid(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/business/availability/slot-grid?startDate=${slotGridStart}&endDate=${slotGridEnd}&slotIntervalMinutes=60&durationMinutes=60`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setSlotGrid(data.data);
      }
    } catch (err) {
      console.error("Failed to load slot grid:", err);
    } finally {
      setLoadingSlotGrid(false);
    }
  };

  const slotOptionsByDay = useMemo(() => {
    const out: Record<number, { time: string; enabled: boolean }[]> = {};
    for (const day of DAYS_OF_WEEK) {
      const s = schedule.find((d) => d.dayOfWeek === day.value);
      if (!s?.isAvailable || !s.startTime || !s.endTime) continue;
      const rangeSlots = generateHourlySlots(s.startTime, s.endTime);
      const explicit = explicitSlotsByDay[day.value];
      out[day.value] = rangeSlots.map((time) => {
        const ex = explicit?.find((e) => e.time === time || e.time?.slice(0, 5) === time);
        return { time, enabled: ex !== undefined ? ex.enabled : true };
      });
    }
    return out;
  }, [schedule, explicitSlotsByDay]);

  const handleSlotToggle = (dayOfWeek: number, time: string, enabled: boolean) => {
    setExplicitSlotsByDay((prev) => {
      const daySlots = prev[dayOfWeek] ?? slotOptionsByDay[dayOfWeek] ?? [];
      const next = [...daySlots];
      const i = next.findIndex((s) => s.time === time || s.time?.slice(0, 5) === time);
      if (i >= 0) next[i] = { ...next[i], time: time.slice(0, 5), enabled };
      else next.push({ time: time.slice(0, 5), enabled });
      return { ...prev, [dayOfWeek]: next };
    });
  };

  const handleSaveExplicitSlots = async () => {
    setSavingSlots(true);
    try {
      const slotsByDay: Record<string, { time: string; enabled: boolean }[]> = {};
      for (let d = 0; d <= 6; d++) {
        const arr = explicitSlotsByDay[d] ?? slotOptionsByDay[d];
        if (arr?.length) slotsByDay[String(d)] = arr.map((s) => ({ time: s.time.slice(0, 5), enabled: s.enabled }));
      }
      const res = await fetch(`${API_BASE_URL}/business/availability/slots`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slotsByDay }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Success", description: "Time slots updated. Customers will only see selected times." });
        loadExplicitSlots();
        loadSlotGrid();
      } else throw new Error(data.message || "Failed to save slots");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save slots", variant: "destructive" });
    } finally {
      setSavingSlots(false);
    }
  };

  const handleBlockSlot = async (date: string, time: string) => {
    const key = `${date}-${time}`;
    setBlockingSlot(key);
    try {
      const [h, m = 0] = time.split(":").map(Number);
      const endH = h + 1;
      const endTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const res = await fetch(`${API_BASE_URL}/business/availability/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          blockDate: date,
          startTime: time,
          endTime,
          reason: "Blocked from calendar",
          isAllDay: false,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Slot blocked", description: `${date} at ${time} is now blocked.` });
        loadBlocks();
        loadSlotGrid();
      } else throw new Error(data.message || "Failed to block");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to block slot", variant: "destructive" });
    } finally {
      setBlockingSlot(null);
    }
  };

  const handleUnblockSlot = async (blockId: string) => {
    setUnblockingId(blockId);
    try {
      const res = await fetch(`${API_BASE_URL}/business/availability/blocks/${blockId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Unblocked", description: "Slot is available again." });
        loadBlocks();
        loadSlotGrid();
      } else throw new Error(data.message || "Failed to unblock");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to unblock", variant: "destructive" });
    } finally {
      setUnblockingId(null);
    }
  };

  const handleScheduleChange = (dayOfWeek: number, field: keyof AvailabilitySchedule, value: any) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/business/availability/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schedule }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "Schedule updated successfully",
        });
      } else {
        throw new Error(data.message || "Failed to update schedule");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update schedule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async () => {
    if (!blockForm.blockDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/business/availability/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          blockDate: blockForm.blockDate,
          startTime: blockForm.isAllDay ? null : blockForm.startTime || null,
          endTime: blockForm.isAllDay ? null : blockForm.endTime || null,
          reason: blockForm.reason || null,
          isAllDay: blockForm.isAllDay,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "Block added successfully",
        });
        setShowBlockForm(false);
        setBlockForm({
          blockDate: "",
          startTime: "",
          endTime: "",
          reason: "",
          isAllDay: false,
        });
        loadBlocks();
      } else {
        throw new Error(data.message || "Failed to add block");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add block",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm("Are you sure you want to delete this block?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/business/availability/blocks/${blockId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "Block deleted successfully",
        });
        loadBlocks();
      } else {
        throw new Error(data.message || "Failed to delete block");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete block",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Availability Management</h1>
          <p className="text-muted-foreground">
            Set your weekly schedule, choose which time slots to offer, and block dates or times. Customers only see available slots.
          </p>
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              Set your regular working hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.map((day) => {
              const dayInfo = DAYS_OF_WEEK.find((d) => d.value === day.dayOfWeek);
              return (
                <div key={day.dayOfWeek} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg">
                  <div className="col-span-2">
                    <Label className="font-semibold">{dayInfo?.label}</Label>
                  </div>
                  <div className="col-span-2">
                    <Label>
                      <input
                        type="checkbox"
                        checked={day.isAvailable}
                        onChange={(e) =>
                          handleScheduleChange(day.dayOfWeek, "isAvailable", e.target.checked)
                        }
                        className="mr-2"
                      />
                      Available
                    </Label>
                  </div>
                  {day.isAvailable && (
                    <>
                      <div className="col-span-3">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={day.startTime}
                          onChange={(e) =>
                            handleScheduleChange(day.dayOfWeek, "startTime", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={day.endTime}
                          onChange={(e) =>
                            handleScheduleChange(day.dayOfWeek, "endTime", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <Button onClick={handleSaveSchedule} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Schedule"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Specific time slots per day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Specific time slots
            </CardTitle>
            <CardDescription>
              This is your weekly diary. Please click on any slots for bookings already made outside of localito. Blue slots means available to book. Please update this regularly to avoid double booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingExplicitSlots ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                {DAYS_OF_WEEK.map((day) => {
                  const opts = slotOptionsByDay[day.value];
                  if (!opts?.length) return null;
                  const dayLabel = day.label;
                  return (
                    <div key={day.value} className="border rounded-lg p-4 space-y-2">
                      <Label className="font-semibold">{dayLabel}</Label>
                      <div className="flex flex-wrap gap-2">
                        {opts.map((slot) => (
                          <label
                            key={slot.time}
                            className="flex items-center gap-1.5 cursor-pointer rounded border px-3 py-1.5 has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary"
                          >
                            <input
                              type="checkbox"
                              checked={slot.enabled}
                              onChange={(e) => handleSlotToggle(day.value, slot.time, e.target.checked)}
                              className="sr-only"
                            />
                            <span className="text-sm">{slot.time}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <Button onClick={handleSaveExplicitSlots} disabled={savingSlots} className="w-full">
                  {savingSlots ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save time slots"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Slot grid: see booked / blocked / available and block slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Slot grid – see what’s booked and block slots
            </CardTitle>
            <CardDescription>
              View available, booked, and blocked slots. Block a slot (e.g. for an external appointment) so customers can’t book it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Label>From</Label>
              <Input
                type="date"
                value={slotGridStart}
                onChange={(e) => setSlotGridStart(e.target.value)}
              />
              <Label>To</Label>
              <Input
                type="date"
                value={slotGridEnd}
                onChange={(e) => setSlotGridEnd(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={() => loadSlotGrid()}>
                Refresh
              </Button>
            </div>
            {loadingSlotGrid ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : slotGrid.length === 0 ? (
              <p className="text-muted-foreground text-sm">No slots in this range. Set your weekly schedule and time slots above.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotGrid.map((row) => (
                      <tr key={`${row.date}-${row.time}`} className="border-b">
                        <td className="p-2">{row.date}</td>
                        <td className="p-2">{row.time}</td>
                        <td className="p-2">
                          {row.status === "available" && (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" /> Available
                            </span>
                          )}
                          {row.status === "booked" && (
                            <span className="text-amber-600">Booked</span>
                          )}
                          {row.status === "blocked" && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Ban className="h-4 w-4" /> Blocked
                            </span>
                          )}
                          {row.status === "locked" && (
                            <span className="text-blue-600">Locked (checkout)</span>
                          )}
                        </td>
                        <td className="p-2">
                          {row.status === "available" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={blockingSlot === `${row.date}-${row.time}`}
                              onClick={() => handleBlockSlot(row.date, row.time)}
                            >
                              {blockingSlot === `${row.date}-${row.time}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Block"
                              )}
                            </Button>
                          )}
                          {row.status === "blocked" && row.blockId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={unblockingId === row.blockId}
                              onClick={() => handleUnblockSlot(row.blockId!)}
                            >
                              {unblockingId === row.blockId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Unblock"
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Blocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Blocked Dates & Times
            </CardTitle>
            <CardDescription>
              Block specific dates or time slots when you're unavailable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowBlockForm(!showBlockForm)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Block
            </Button>

            {showBlockForm && (
              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={blockForm.blockDate}
                        onChange={(e) =>
                          setBlockForm({ ...blockForm, blockDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        <input
                          type="checkbox"
                          checked={blockForm.isAllDay}
                          onChange={(e) =>
                            setBlockForm({ ...blockForm, isAllDay: e.target.checked })
                          }
                          className="mr-2"
                        />
                        All Day
                      </Label>
                    </div>
                  </div>
                  {!blockForm.isAllDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={blockForm.startTime}
                          onChange={(e) =>
                            setBlockForm({ ...blockForm, startTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={blockForm.endTime}
                          onChange={(e) =>
                            setBlockForm({ ...blockForm, endTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Reason (optional)</Label>
                    <Input
                      placeholder="e.g., Holiday, Maintenance"
                      value={blockForm.reason}
                      onChange={(e) =>
                        setBlockForm({ ...blockForm, reason: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddBlock} disabled={saving} className="flex-1">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Block"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowBlockForm(false);
                        setBlockForm({
                          blockDate: "",
                          startTime: "",
                          endTime: "",
                          reason: "",
                          isAllDay: false,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loadingBlocks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No blocked dates. Click "Add Block" to block a date or time.
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">
                        {new Date(block.block_date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      {block.is_all_day ? (
                        <div className="text-sm text-muted-foreground">All Day</div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {block.start_time} - {block.end_time}
                        </div>
                      )}
                      {block.reason && (
                        <div className="text-sm text-muted-foreground">{block.reason}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBlock(block.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

