import { useState } from "react";
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

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface CreateClassModalProps {
  onClose: () => void;
  onCreateClass: (data: any) => void;
  availableSubjects: Subject[];
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

export function CreateClassModal({
  onClose,
  onCreateClass,
  availableSubjects,
}: CreateClassModalProps) {
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (parseInt(formData.start_time) >= parseInt(formData.end_time)) {
      alert("End time must be after start time");
      return;
    }
    onCreateClass(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Subject Selection */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => handleChange("subject_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.subject_code} - {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                type="number"
                placeholder="e.g. 251"
                value={formData.semester}
                onChange={(e) => handleChange("semester", e.target.value)}
                required
              />
            </div>

            {/* Week Day */}
            <div className="space-y-2">
              <Label htmlFor="week_day">Day of Week</Label>
              <Select
                value={formData.week_day}
                onValueChange={(value) => handleChange("week_day", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Hour (0-23)</Label>
              <Input
                id="start_time"
                type="number"
                min="0"
                max="23"
                value={formData.start_time}
                onChange={(e) => handleChange("start_time", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Hour (0-23)</Label>
              <Input
                id="end_time"
                type="number"
                min="0"
                max="23"
                value={formData.end_time}
                onChange={(e) => handleChange("end_time", e.target.value)}
                required
              />
            </div>

            {/* Location & Capacity */}
            <div className="space-y-2">
              <Label htmlFor="location">Location / Meeting Link</Label>
              <Input
                id="location"
                placeholder="Room 101 or Zoom Link"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                required
              />
            </div>

            {/* Duration & Deadline */}
            <div className="space-y-2">
              <Label htmlFor="num_of_weeks">Number of Weeks</Label>
              <Input
                id="num_of_weeks"
                type="number"
                min="1"
                value={formData.num_of_weeks}
                onChange={(e) => handleChange("num_of_weeks", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_deadline">Registration Deadline</Label>
              <Input
                id="registration_deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => handleChange("registration_deadline", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}