import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// Assuming a ClassData type exists from another service
interface ClassData {
  id: number;
  subject_name: string;
  tutor_name: string;
  week_day: string;
  start_time: number;
  end_time: number;
  current_enrolled: number;
  capacity: number;
  class_status: string;
  registration_deadline: string;
}

export function AdminRegistrationPage() {
  const [pendingClasses, setPendingClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/classes/");
      if (response.data.success) {
        const scheduledClasses = response.data.classes.filter(
          (c: ClassData) => c.class_status === "scheduled"
        );
        setPendingClasses(scheduledClasses);
      } else {
        throw new Error("Failed to fetch classes.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingClasses();
  }, [fetchPendingClasses]);

  const handleConfirmClass = async (classId: number) => {
    try {
      const response = await api.post(`/classes/${classId}/confirm`);
      if (response.data.success) {
        alert(
          response.data.message || `Class #${classId} processed successfully.`
        );
      } else {
        alert(response.data.error || `Failed to process class #${classId}.`);
      }
      fetchPendingClasses(); // Refresh the list
    } catch (err) {
      alert(`An error occurred while processing class #${classId}.`);
      console.error(err);
    }
  };

  const handleConfirmAll = async () => {
    if (
      !confirm(
        "Are you sure you want to confirm all pending classes? This will create sessions for all eligible classes."
      )
    ) {
      return;
    }
    try {
      const response = await api.post("/classes/confirm/all");
      if (response.data.success) {
        alert(response.data.message || "All pending classes processed!");
      } else {
        alert(response.data.error || "Failed to process all classes.");
      }
      fetchPendingClasses(); // Refresh the list
    } catch (err) {
      alert("Failed to process all classes.");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Registration Management
          </h1>
        </div>
        <Button
          onClick={handleConfirmAll}
          disabled={loading || pendingClasses.length === 0}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Confirm All Pending
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">
          <AlertTriangle className="mx-auto h-10 w-10 mb-4" />
          <p>{error}</p>
        </div>
      ) : pendingClasses.length === 0 ? (
        <div className="text-center py-16">
          <XCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" />
          <p className="text-gray-500">
            No classes are currently pending confirmation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingClasses.map((cls) => (
            <Card key={cls.id} className="w-full">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                  <div className="col-span-2">
                    <p className="font-bold text-lg text-gray-800">
                      {cls.subject_name}
                    </p>
                    <p className="text-sm text-gray-500">Class #{cls.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {cls.tutor_name}
                    </p>
                    <p className="text-xs text-gray-500">Tutor</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {cls.week_day}, {cls.start_time}:00 - {cls.end_time}:00
                    </p>
                    <p className="text-xs text-gray-500">Schedule</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {cls.current_enrolled} / {cls.capacity}
                    </p>
                    <p className="text-xs text-gray-500">Enrollment</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {(() => {
                        const utcDate = new Date(cls.registration_deadline);
                        const vnDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
                        return vnDate.toISOString().replace("T", " ").slice(0, 16);
                      })()}
                    </p>
                    <p className="text-xs text-gray-500">Deadline</p>
                  </div>
                </div>
                <div className="ml-6">
                  <Button onClick={() => handleConfirmClass(cls.id)}>
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
