import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";
import type { Class, TimeSlot, Session } from "@/types";

type CreateClassForm = {
  subject_name: string;
  subject_code: string;
  description: string;
  max_students: number;
  meeting_link: string;
  number_of_weeks: number;
};

interface CreateClassModalProps {
  onClose: () => void;
  onCreateClass: (newClass: Class) => void;
  tutorName: string;
  existingClasses?: Class[]; // All tutor's existing classes for conflict detection
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
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

// Generate sequential class code based on subject
const generateClassCode = (subjectCode: string, existingClasses: Class[]): string => {
  // Count existing classes for this subject
  const sameSubjectClasses = existingClasses.filter(c => c.subject_code === subjectCode);
  const count = sameSubjectClasses.length + 1;
  return `CC${count.toString().padStart(2, '0')}`;
};

export function CreateClassModal({ onClose, onCreateClass, tutorName, existingClasses = [] }: CreateClassModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateClassForm>({
    defaultValues: {
      subject_name: "",
      subject_code: "",
      description: "",
      max_students: 10,
      meeting_link: "",
      number_of_weeks: 4, // Default 4 weeks
    }
  });

  const weeksValue = watch("number_of_weeks");
  const subjectCodeValue = watch("subject_code");

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

  const validateTimeSlots = (): boolean => {
    // Check for overlapping time slots within this class
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1 = timeSlots[i];
        const slot2 = timeSlots[j];
        
        if (slot1.dayOfWeek === slot2.dayOfWeek) {
          // Check if periods overlap
          const dayName = DAYS_OF_WEEK.find(d => d.value === slot1.dayOfWeek)?.label;
          if (
            (slot1.startPeriod <= slot2.endPeriod && slot1.endPeriod >= slot2.startPeriod)
          ) {
            alert(`⚠️ Duplicate Time Slot: ${dayName} ${slot1.startPeriod}–${slot1.endPeriod} overlaps ${dayName} ${slot2.startPeriod}–${slot2.endPeriod}.`);
            return false;
          }
        }
      }
      
      // Validate start <= end
      if (timeSlots[i].endPeriod < timeSlots[i].startPeriod) {
        alert("End period must be equal to or after start period");
        return false;
      }
    }
    return true;
  };

  const checkCrossClassConflicts = (): string[] => {
    const conflicts: string[] = [];
    
    // Check against all existing classes
    for (const existingClass of existingClasses) {
      for (const newSlot of timeSlots) {
        for (const existingSlot of existingClass.time_slots) {
          if (newSlot.dayOfWeek === existingSlot.dayOfWeek) {
            // Check if periods overlap
            if (
              newSlot.startPeriod <= existingSlot.endPeriod && 
              newSlot.endPeriod >= existingSlot.startPeriod
            ) {
              const dayName = DAYS_OF_WEEK.find(d => d.value === newSlot.dayOfWeek)?.label;
              conflicts.push(
                `${dayName} ${newSlot.startPeriod}–${newSlot.endPeriod} conflicts with Class ${existingClass.class_code} (${existingClass.subject_name}) - ${dayName} ${existingSlot.startPeriod}–${existingSlot.endPeriod}`
              );
            }
          }
        }
      }
    }
    
    return conflicts;
  };

  const onSubmit = (data: CreateClassForm) => {
    if (timeSlots.length === 0) {
      alert("Please add at least one time slot");
      return;
    }

    if (!validateTimeSlots()) {
      return;
    }

    // Check for cross-class conflicts
    const conflicts = checkCrossClassConflicts();
    if (conflicts.length > 0) {
      setConflictDetails(conflicts);
      setShowConflictWarning(true);
      return;
    }

    // Generate class code based on subject
    const classCode = generateClassCode(data.subject_code, existingClasses);
    const classId = `class-${Date.now()}`;
    const subjectId = Math.floor(Math.random() * 1000);

    // Generate sessions for N weeks
    const sessions: Session[] = [];

    for (let week = 0; week < data.number_of_weeks; week++) {
      for (const slot of timeSlots) {
        const sessionDate = getNextDayOfWeek(slot.dayOfWeek, week);
        const [hours] = periodToTime(slot.startPeriod).split(':');
        sessionDate.setHours(parseInt(hours), 0, 0, 0);

        sessions.push({
          id: `session-${Date.now()}-${week}-${slot.id}`,
          class_id: classId,
          subject_id: subjectId,
          subject_name: data.subject_name,
          subject_code: data.subject_code,
          class_code: classCode,
          description: data.description || null,
          session_date: sessionDate.toISOString(),
          duration_minutes: calculateDuration(slot.startPeriod, slot.endPeriod),
          meeting_link: data.meeting_link || null,
          status: "scheduled",
          week_number: week + 1,
          day_of_week: slot.dayOfWeek,
          start_period: slot.startPeriod,
          end_period: slot.endPeriod,
        });
      }
    }

    // Create the class object
    const newClass: Class = {
      id: classId,
      subject_id: subjectId,
      subject_name: data.subject_name,
      subject_code: data.subject_code,
      class_code: classCode,
      description: data.description || null,
      tutor_id: "tutor-1", // Mock tutor ID
      tutor_name: tutorName,
      max_students: data.max_students,
      current_enrolled: 0,
      number_of_weeks: data.number_of_weeks,
      meeting_link: data.meeting_link || null,
      time_slots: timeSlots,
      sessions: sessions,
      created_at: new Date().toISOString(),
    };

    onCreateClass(newClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="border-b bg-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-blue-900">Create New Class</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Set up a multi-week class with recurring sessions</p>
              <p className="text-xs text-blue-600 mt-1 font-semibold">
                Class Code: {subjectCodeValue ? generateClassCode(subjectCodeValue, existingClasses) : 'Enter subject code first'}
              </p>
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
                  placeholder="Brief description of the class topics..."
                  className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  {...register("description")}
                />
              </div>
            </div>

            {/* Class Settings */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 flex items-center gap-2">
                ⚙️ Class Settings
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_students">Max Students *</Label>
                  <Input
                    id="max_students"
                    type="number"
                    min="1"
                    max="50"
                    {...register("max_students", { 
                      required: "Max students is required",
                      min: { value: 1, message: "At least 1 student required" },
                      max: { value: 50, message: "Maximum 50 students allowed" }
                    })}
                  />
                  {errors.max_students && (
                    <p className="text-sm text-red-500">{errors.max_students.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number_of_weeks">Number of Weeks *</Label>
                  <Input
                    id="number_of_weeks"
                    type="number"
                    min="1"
                    max="16"
                    {...register("number_of_weeks", { 
                      required: "Number of weeks is required",
                      min: { value: 1, message: "At least 1 week required" },
                      max: { value: 16, message: "Maximum 16 weeks allowed" }
                    })}
                  />
                  {errors.number_of_weeks && (
                    <p className="text-sm text-red-500">{errors.number_of_weeks.message}</p>
                  )}
                  <p className="text-xs text-gray-600">
                    Class will run for {weeksValue || 1} week(s)
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
                  {timeSlots.map((slot) => {
                    const dayLabel = DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label || "";
                    const duration = calculateDuration(slot.startPeriod, slot.endPeriod);
                    
                    return (
                      <div key={slot.id} className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-purple-200">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                    Period {period}
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
                                    Period {period}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="text-xs bg-blue-50 px-3 py-2 rounded text-blue-800">
                            <strong>{dayLabel}</strong> {periodToTime(slot.startPeriod)} - {periodToTime(slot.endPeriod)} 
                            ({duration} minutes)
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
                    );
                  })}
                </div>
              )}

              {timeSlots.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📊 Summary:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Class Code: <strong>{subjectCodeValue ? generateClassCode(subjectCodeValue, existingClasses) : 'TBD'}</strong></li>
                    <li>• <strong>{timeSlots.length}</strong> session(s) per week</li>
                    <li>• Running for <strong>{weeksValue || 1}</strong> week(s)</li>
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
                Create Class
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Conflict Warning Modal */}
      {showConflictWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
          <Card className="max-w-lg w-full mx-4 p-6 bg-white">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-800 mb-2">Class Conflict Detected</h3>
                <p className="text-gray-700 mb-4">
                  The following time slots conflict with your existing classes:
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 max-h-48 overflow-y-auto">
                  <ul className="text-sm text-yellow-900 space-y-2">
                    {conflictDetails.map((conflict, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{conflict}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Please adjust your time slots to avoid scheduling conflicts.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowConflictWarning(false)}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              OK, I'll Adjust
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
