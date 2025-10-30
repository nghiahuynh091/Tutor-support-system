import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";

type TimeSlot = {
  id: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  startPeriod: number; // 2-15
  endPeriod: number; // 2-15
};

type Session = {
  id: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  description: string | null;
  session_date: string;
  duration_minutes: number;
  meeting_link: string | null;
  current_enrolled: number;
  max_enrolled: number;
  status: string;
  week_number: number;
  day_of_week: number;
  start_period: number;
  end_period: number;
};

type CreateSessionForm = {
  subject_name: string;
  subject_code: string;
  description: string;
  max_enrolled: number;
  meeting_link: string;
  weeks: number;
};

interface CreateSessionModalProps {
  onClose: () => void;
  onCreateSession: (sessions: Session[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const PERIODS = Array.from({ length: 14 }, (_, i) => i + 2); // 2-15

// Convert period to time string
const periodToTime = (period: number): string => {
  const hour = period + 5; // Period 2 = 7:00, Period 3 = 8:00, etc.
  return `${hour.toString().padStart(2, '0')}:00`;
};

// Calculate duration in minutes between two periods
const calculateDuration = (startPeriod: number, endPeriod: number): number => {
  return (endPeriod - startPeriod + 1) * 50; // Each period is 50 minutes
};

// Get next occurrence of a day of week
const getNextDayOfWeek = (dayOfWeek: number, weekOffset: number = 0): Date => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // Convert our dayOfWeek (1=Monday) to JS dayOfWeek (1=Monday, 0=Sunday)
  const targetDay = dayOfWeek === 7 ? 0 : dayOfWeek;
  
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Move to next week if day has passed
  }
  
  const result = new Date(today);
  result.setDate(today.getDate() + daysUntilTarget + (weekOffset * 7));
  return result;
};

export function CreateSessionModal({ onClose, onCreateSession }: CreateSessionModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateSessionForm>({
    defaultValues: {
      subject_name: "",
      subject_code: "",
      description: "",
      max_enrolled: 10,
      meeting_link: "",
      weeks: 4, // Default 4 weeks
    }
  });

  const weeksValue = watch("weeks");

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      dayOfWeek: 1, // Monday by default
      startPeriod: 2,
      endPeriod: 3,
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: number) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const onSubmit = (data: CreateSessionForm) => {
    if (timeSlots.length === 0) {
      alert("Please add at least one time slot");
      return;
    }

    // Validate time slots
    for (const slot of timeSlots) {
      if (slot.endPeriod < slot.startPeriod) {
        alert("End period must be equal to or after start period");
        return;
      }
    }

    // Generate sessions for N weeks
    const sessions: Session[] = [];

    for (let week = 0; week < data.weeks; week++) {
      for (const slot of timeSlots) {
        const sessionDate = getNextDayOfWeek(slot.dayOfWeek, week);
        const [hours] = periodToTime(slot.startPeriod).split(':');
        sessionDate.setHours(parseInt(hours), 0, 0, 0);

        sessions.push({
          id: `session-${Date.now()}-${week}-${slot.id}`,
          subject_id: Math.floor(Math.random() * 1000),
          subject_name: data.subject_name,
          subject_code: data.subject_code,
          description: data.description || null,
          session_date: sessionDate.toISOString(),
          duration_minutes: calculateDuration(slot.startPeriod, slot.endPeriod),
          meeting_link: data.meeting_link || null,
          current_enrolled: 0,
          max_enrolled: data.max_enrolled,
          status: "scheduled",
          week_number: week + 1,
          day_of_week: slot.dayOfWeek,
          start_period: slot.startPeriod,
          end_period: slot.endPeriod,
        });
      }
    }

    onCreateSession(sessions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="border-b bg-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-blue-900">Create New Session</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Set up a recurring tutoring session schedule</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Subject Information */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                📚 Subject Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject_name">Subject Name *</Label>
                  <Input
                    id="subject_name"
                    placeholder="e.g., Advanced Mathematics"
                    {...register("subject_name", { required: "Subject name is required" })}
                  />
                  {errors.subject_name && (
                    <p className="text-sm text-red-500">{errors.subject_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject_code">Subject Code *</Label>
                  <Input
                    id="subject_code"
                    placeholder="e.g., MATH301"
                    {...register("subject_code", { required: "Subject code is required" })}
                  />
                  {errors.subject_code && (
                    <p className="text-sm text-red-500">{errors.subject_code.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Brief description of the session topics..."
                  className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  {...register("description")}
                />
              </div>
            </div>

            {/* Session Settings */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 flex items-center gap-2">
                ⚙️ Session Settings
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_enrolled">Max Students *</Label>
                  <Input
                    id="max_enrolled"
                    type="number"
                    min="1"
                    max="50"
                    {...register("max_enrolled", { 
                      required: "Max enrolled is required",
                      min: { value: 1, message: "At least 1 student required" },
                      max: { value: 50, message: "Maximum 50 students allowed" }
                    })}
                  />
                  {errors.max_enrolled && (
                    <p className="text-sm text-red-500">{errors.max_enrolled.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeks">Number of Weeks *</Label>
                  <Input
                    id="weeks"
                    type="number"
                    min="1"
                    max="16"
                    {...register("weeks", { 
                      required: "Number of weeks is required",
                      min: { value: 1, message: "At least 1 week required" },
                      max: { value: 16, message: "Maximum 16 weeks allowed" }
                    })}
                  />
                  {errors.weeks && (
                    <p className="text-sm text-red-500">{errors.weeks.message}</p>
                  )}
                  <p className="text-xs text-gray-600">
                    Sessions will repeat for {weeksValue || 1} week(s)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link">Meeting Link (Optional)</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  {...register("meeting_link")}
                />
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                  📅 Weekly Schedule
                </h3>
                <Button type="button" onClick={addTimeSlot} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </div>

              {timeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed">
                  <p className="font-medium">No time slots added yet</p>
                  <p className="text-sm mt-1">Click "Add Time Slot" to create your weekly schedule</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-purple-200">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Day of Week</Label>
                          <select
                            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                            value={slot.dayOfWeek}
                            onChange={(e) => updateTimeSlot(slot.id, 'dayOfWeek', parseInt(e.target.value))}
                          >
                            {DAYS_OF_WEEK.map(day => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            Start Period (⏰ {periodToTime(slot.startPeriod)})
                          </Label>
                          <select
                            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                            value={slot.startPeriod}
                            onChange={(e) => updateTimeSlot(slot.id, 'startPeriod', parseInt(e.target.value))}
                          >
                            {PERIODS.map(period => (
                              <option key={period} value={period}>
                                Period {period} ({periodToTime(period)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            End Period (⏰ {periodToTime(slot.endPeriod)})
                          </Label>
                          <select
                            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                            value={slot.endPeriod}
                            onChange={(e) => updateTimeSlot(slot.id, 'endPeriod', parseInt(e.target.value))}
                          >
                            {PERIODS.map(period => (
                              <option key={period} value={period}>
                                Period {period} ({periodToTime(period)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(slot.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {timeSlots.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📊 Summary:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>{timeSlots.length}</strong> time slot(s) per week</li>
                    <li>• Repeating for <strong>{weeksValue || 1}</strong> week(s)</li>
                    <li>• <strong>{timeSlots.length * parseInt(weeksValue?.toString() || "1")}</strong> total sessions will be created</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Create {timeSlots.length * parseInt(weeksValue?.toString() || "1")} Sessions
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
