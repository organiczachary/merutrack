
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Camera, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VALUE_CHAINS = [
  { value: 'banana', label: 'Banana' },
  { value: 'avocado', label: 'Avocado' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'irish_potato', label: 'Irish Potato' },
  { value: 'coffee', label: 'Coffee' }
];

const CONSTITUENCIES = [
  { value: 'igembe_south', label: 'Igembe South' },
  { value: 'igembe_central', label: 'Igembe Central' },
  { value: 'igembe_north', label: 'Igembe North' },
  { value: 'tigania_west', label: 'Tigania West' },
  { value: 'tigania_east', label: 'Tigania East' },
  { value: 'north_imenti', label: 'North Imenti' },
  { value: 'buuri', label: 'Buuri' },
  { value: 'central_imenti', label: 'Central Imenti' },
  { value: 'south_imenti', label: 'South Imenti' }
];

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const TrainingScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: undefined as Date | undefined,
    scheduledTime: '',
    venue: '',
    valueChain: '',
    constituency: '',
    ward: '',
    expectedParticipants: 0,
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS not supported",
        description: "Your device doesn't support GPS location.",
        variant: "destructive"
      });
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsCapturingLocation(false);
        toast({
          title: "Location captured",
          description: `GPS coordinates saved with ${Math.round(position.coords.accuracy)}m accuracy.`
        });
      },
      (error) => {
        setIsCapturingLocation(false);
        toast({
          title: "Location capture failed",
          description: "Unable to get your location. Please try again.",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.scheduledDate) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('training_sessions')
        .insert({
          trainer_id: user.id,
          title: formData.title,
          description: formData.description,
          scheduled_date: format(formData.scheduledDate, 'yyyy-MM-dd'),
          scheduled_time: formData.scheduledTime,
          venue: formData.venue,
          value_chain: formData.valueChain as any,
          constituency: formData.constituency as any,
          ward: formData.ward,
          expected_participants: formData.expectedParticipants,
          gps_latitude: location?.latitude,
          gps_longitude: location?.longitude,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Training scheduled",
        description: "Your training session has been scheduled successfully."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        scheduledDate: undefined,
        scheduledTime: '',
        venue: '',
        valueChain: '',
        constituency: '',
        ward: '',
        expectedParticipants: 0,
      });
      setLocation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule training. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Schedule Training</h1>
              <p className="text-slate-600">Create a new training session</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800">Training Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-700 font-medium">Training Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter training title"
                    className="mt-1 bg-white/80 border-white/40 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the training objectives and content"
                    className="mt-1 bg-white/80 border-white/40 focus:bg-white transition-all"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Value Chain</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, valueChain: value }))}>
                    <SelectTrigger className="mt-1 bg-white/80 border-white/40 focus:bg-white">
                      <SelectValue placeholder="Select value chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_CHAINS.map((chain) => (
                        <SelectItem key={chain.value} value={chain.value}>
                          {chain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Date and Time */}
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-700 font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-1 justify-start text-left font-normal bg-white/80 border-white/40 hover:bg-white",
                          !formData.scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.scheduledDate}
                        onSelect={(date) => setFormData(prev => ({ ...prev, scheduledDate: date }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time" className="text-slate-700 font-medium">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="mt-1 bg-white/80 border-white/40 focus:bg-white transition-all"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-700 font-medium">Constituency</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, constituency: value }))}>
                    <SelectTrigger className="mt-1 bg-white/80 border-white/40 focus:bg-white">
                      <SelectValue placeholder="Select constituency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSTITUENCIES.map((constituency) => (
                        <SelectItem key={constituency.value} value={constituency.value}>
                          {constituency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ward" className="text-slate-700 font-medium">Ward</Label>
                  <Input
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                    placeholder="Enter ward name"
                    className="mt-1 bg-white/80 border-white/40 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="venue" className="text-slate-700 font-medium">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="Enter specific venue location"
                    className="mt-1 bg-white/80 border-white/40 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={captureLocation}
                    disabled={isCapturingLocation}
                    className="w-full bg-white/80 border-white/40 hover:bg-white"
                  >
                    {isCapturingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Capturing GPS Location...
                      </>
                    ) : location ? (
                      <>
                        <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                        GPS Location Captured
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Capture GPS Location
                      </>
                    )}
                  </Button>
                  {location && (
                    <p className="text-sm text-slate-600 mt-2">
                      Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      <br />
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Expected Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  min="0"
                  value={formData.expectedParticipants}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedParticipants: parseInt(e.target.value) || 0 }))}
                  placeholder="Number of expected participants"
                  className="bg-white/80 border-white/40 focus:bg-white transition-all"
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.scheduledDate}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Scheduling Training...
                </>
              ) : (
                <>
                  Schedule Training
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
