import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, Calendar, X, Plus } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useToast } from "@/hooks/use-toast";

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

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function RetailerAvailabilityPage() {
  useRequireRole("retailer", "/login/retailer");
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

  useEffect(() => {
    loadSchedule();
    loadBlocks();
  }, []);

  const loadSchedule = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/retailer/availability/schedule`, {
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
      const res = await fetch(`${API_BASE_URL}/retailer/availability/blocks`, {
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
      const res = await fetch(`${API_BASE_URL}/retailer/availability/schedule`, {
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
      const res = await fetch(`${API_BASE_URL}/retailer/availability/blocks`, {
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
      const res = await fetch(`${API_BASE_URL}/retailer/availability/blocks/${blockId}`, {
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
            Set your weekly schedule and block specific dates or times when you're unavailable.
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

