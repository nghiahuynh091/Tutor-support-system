import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { classService, type CreateClassPayload } from "@/services/classService";
import { subjectService, type Subject } from "@/services/subjectService";

interface TutorCreateClassModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

// Convert hour to period display
const hourToPeriodDisplay = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

export function TutorCreateClassModal({
  open,
  onClose,
  onSuccess,
}: TutorCreateClassModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: "",
    semester: "",
    week_day: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: "",
    num_of_weeks: "",
    registration_deadline: "",
  });

  // Load subjects when modal opens
  useEffect(() => {
    if (open) {
      loadSubjects();
    }
  }, [open]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to load subjects:", error);
      alert("Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      subject_id: "",
      semester: "",
      week_day: "",
      start_time: "",
      end_time: "",
      location: "",
      capacity: "",
      num_of_weeks: "",
      registration_deadline: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (parseInt(formData.start_time) >= parseInt(formData.end_time)) {
      alert("End time must be after start time");
      return;
    }

    if (!formData.subject_id || !formData.semester || !formData.week_day) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Convert deadline to UTC by subtracting 7 hours (Vietnam timezone)
      const localDeadline = new Date(formData.registration_deadline);
      const utcDeadline = new Date(
        localDeadline.getTime() - 7 * 60 * 60 * 1000
      );
      const utcDeadlineString = utcDeadline.toISOString().slice(0, 16);

      const payload: CreateClassPayload = {
        subject_id: parseInt(formData.subject_id),
        semester: parseInt(formData.semester),
        week_day: formData.week_day,
        start_time: parseInt(formData.start_time),
        end_time: parseInt(formData.end_time),
        location: formData.location,
        capacity: parseInt(formData.capacity),
        num_of_weeks: parseInt(formData.num_of_weeks),
        registration_deadline: utcDeadlineString,
      };

      const result = await classService.createClass(payload);

      if (result.success) {
        resetForm();
        onSuccess();
        onClose();
      } else {
        alert(result.error || "Failed to create class");
      }
    } catch (error: any) {
      console.error("Create class error:", error);
      alert(error.message || "Failed to create class. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-900">
            Create New Class
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading subjects...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Subject Selection */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="subject" className="text-gray-700">
                  Subject *
                </Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => handleChange("subject_id", value)}
                  required
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                        className="text-gray-900"
                      >
                        {subject.subject_code} - {subject.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-gray-700">
                  Semester *
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => handleChange("semester", value)}
                  required
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="251" className="text-gray-900">
                      251
                    </SelectItem>
                    <SelectItem value="252" className="text-gray-900">
                      252
                    </SelectItem>
                    <SelectItem value="253" className="text-gray-900">
                      253
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Week Day */}
              <div className="space-y-2">
                <Label htmlFor="week_day" className="text-gray-700">
                  Day of Week *
                </Label>
                <Select
                  value={formData.week_day}
                  onValueChange={(value) => handleChange("week_day", value)}
                  required
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem
                        key={day.value}
                        value={day.value}
                        className="text-gray-900"
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <Label htmlFor="start_time" className="text-gray-700">
                  Start Period (2-16) *
                  {formData.start_time && (
                    <span className="text-blue-600 ml-2">
                      ({hourToPeriodDisplay(parseInt(formData.start_time))})
                    </span>
                  )}
                </Label>
                <Input
                  id="start_time"
                  type="number"
                  min="2"
                  max="16"
                  placeholder="e.g. 8"
                  value={formData.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-gray-700">
                  End Period (2-16) *
                  {formData.end_time && (
                    <span className="text-blue-600 ml-2">
                      ({hourToPeriodDisplay(parseInt(formData.end_time))})
                    </span>
                  )}
                </Label>
                <Input
                  id="end_time"
                  type="number"
                  min="2"
                  max="16"
                  placeholder="e.g. 10"
                  value={formData.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                  required
                />
              </div>

              {/* Location & Capacity */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700">
                  Location / Meeting Link *
                </Label>
                <Input
                  id="location"
                  placeholder="Room 101 or Zoom Link"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-gray-700">
                  Capacity *
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g. 30"
                  value={formData.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                  required
                />
              </div>

              {/* Duration & Deadline */}
              <div className="space-y-2">
                <Label htmlFor="num_of_weeks" className="text-gray-700">
                  Number of Weeks *
                </Label>
                <Input
                  id="num_of_weeks"
                  type="number"
                  min="1"
                  max="16"
                  placeholder="e.g. 10"
                  value={formData.num_of_weeks}
                  onChange={(e) => handleChange("num_of_weeks", e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="registration_deadline"
                  className="text-gray-700"
                >
                  Registration Deadline *
                </Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) =>
                    handleChange("registration_deadline", e.target.value)
                  }
                  className="bg-white text-gray-900 border-gray-300"
                  required
                />
              </div>
            </div>

            {/* Preview */}
            {formData.subject_id &&
              formData.week_day &&
              formData.start_time &&
              formData.end_time && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    📋 Preview
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>Subject:</strong>{" "}
                      {
                        subjects.find(
                          (s) => s.id.toString() === formData.subject_id
                        )?.subject_name
                      }
                    </p>
                    <p>
                      <strong>Schedule:</strong>{" "}
                      {
                        DAYS_OF_WEEK.find((d) => d.value === formData.week_day)
                          ?.label
                      }{" "}
                      {hourToPeriodDisplay(parseInt(formData.start_time))} -{" "}
                      {hourToPeriodDisplay(parseInt(formData.end_time))}
                    </p>
                    {formData.num_of_weeks && (
                      <p>
                        <strong>Duration:</strong> {formData.num_of_weeks} weeks
                      </p>
                    )}
                    {formData.capacity && (
                      <p>
                        <strong>Capacity:</strong> {formData.capacity} students
                      </p>
                    )}
                  </div>
                </div>
              )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                className="text-black"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-gray-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
