import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, Wifi, WifiOff, Calendar } from "lucide-react";

interface TimeClockProps {
  employee: any; // Current logged-in employee
  attendance?: any; // Today's attendance record
}

export default function TimeClock({ employee, attendance }: TimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Location access denied:", error)
      );
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const attendanceData = {
        employeeId: employee.id,
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toISOString(),
        status: "present",
        location: location ? "office" : "unknown",
        isRemote: !location || Math.abs(location.lat - 40.7128) > 0.01, // Example office coordinates
        remoteLocation: location ? { lat: location.lat, lng: location.lng } : null,
        gateEntry: new Date().toISOString(), // Simulate biometric gate entry
        biometricId: `BIO_${employee.employeeId}_${Date.now()}`,
      };
      
      return apiRequest("POST", "/api/attendance", attendanceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Clocked In Successfully",
        description: `Welcome back, ${employee.firstName}! Your attendance has been recorded.`,
      });
    },
    onError: () => {
      toast({
        title: "Clock In Failed",
        description: "Please try again or contact IT support.",
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const checkOutTime = new Date();
      const checkInTime = new Date(attendance.checkIn);
      const hoursWorked = ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2);
      
      return apiRequest("PATCH", `/api/attendance/${attendance.id}`, {
        checkOut: checkOutTime.toISOString(),
        hoursWorked: parseFloat(hoursWorked),
        gateExit: checkOutTime.toISOString(),
        overtimeHours: Math.max(0, parseFloat(hoursWorked) - 8).toFixed(2),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Clocked Out Successfully",
        description: "Have a great day! Your attendance has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Clock Out Failed",
        description: "Please try again or contact IT support.",
        variant: "destructive",
      });
    },
  });

  const isWorking = attendance && attendance.checkIn && !attendance.checkOut;
  const workingHours = isWorking 
    ? ((currentTime.getTime() - new Date(attendance.checkIn).getTime()) / (1000 * 60 * 60)).toFixed(1)
    : "0.0";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}${employee.lastName}&size=48`}
              alt={`${employee.firstName} ${employee.lastName}`}
            />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
              {employee.firstName[0]}{employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
            <p className="text-sm text-gray-500">{employee.position}</p>
          </div>
        </div>
        
        <div className="text-3xl font-mono font-bold">
          {currentTime.toLocaleTimeString()}
        </div>
        <p className="text-sm text-gray-500">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="flex justify-center space-x-2">
          <Badge variant={isWorking ? "default" : "secondary"} className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{isWorking ? "Working" : "Not Working"}</span>
          </Badge>
          
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </Badge>
          
          {location && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Located</span>
            </Badge>
          )}
        </div>

        {/* Working Hours */}
        {isWorking && (
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Hours Worked Today</p>
            <p className="text-2xl font-bold text-green-700">{workingHours}h</p>
            {parseFloat(workingHours) > 8 && (
              <p className="text-xs text-orange-600">
                Overtime: {(parseFloat(workingHours) - 8).toFixed(1)}h
              </p>
            )}
          </div>
        )}

        {/* Clock In/Out Buttons */}
        <div className="space-y-2">
          {!attendance || !attendance.checkIn ? (
            <Button
              onClick={() => clockInMutation.mutate()}
              disabled={clockInMutation.isPending || !isOnline}
              className="w-full"
              size="lg"
            >
              {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
            </Button>
          ) : isWorking ? (
            <Button
              onClick={() => clockOutMutation.mutate()}
              disabled={clockOutMutation.isPending || !isOnline}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
            </Button>
          ) : (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed for today</p>
              <p className="text-lg font-semibold">
                {attendance.hoursWorked || 0}h worked
              </p>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="text-xs text-gray-500 space-y-1">
          {attendance && attendance.checkIn && (
            <div className="flex justify-between">
              <span>Clock In:</span>
              <span>{new Date(attendance.checkIn).toLocaleTimeString()}</span>
            </div>
          )}
          {attendance && attendance.checkOut && (
            <div className="flex justify-between">
              <span>Clock Out:</span>
              <span>{new Date(attendance.checkOut).toLocaleTimeString()}</span>
            </div>
          )}
          {attendance && attendance.gateEntry && (
            <div className="flex justify-between">
              <span>Gate Entry:</span>
              <span>{new Date(attendance.gateEntry).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}