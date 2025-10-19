import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, Activity, Droplets, Thermometer } from "lucide-react";

export default function CropDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<any>(null);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [healthAnalysis, setHealthAnalysis] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    soil_moisture: "",
    growth_stage: ""
  });

  useEffect(() => {
    checkAuth();
    fetchCropDetails();
    fetchMonitoringData();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchCropDetails = async () => {
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load crop details");
      navigate("/crops");
    } else {
      setCrop(data);
    }
  };

  const fetchMonitoringData = async () => {
    const { data, error } = await supabase
      .from("monitoring_data")
      .select("*")
      .eq("crop_id", id)
      .order("date", { ascending: true });

    if (error) {
      toast.error("Failed to load monitoring data");
    } else {
      setMonitoringData(data || []);
      if (data && data.length > 0) {
        analyzeHealth(data[data.length - 1]);
      }
    }
  };

  const analyzeHealth = async (latestData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke("analyze-crop-health", {
        body: {
          temperature: latestData.temperature,
          humidity: latestData.humidity,
          soilMoisture: latestData.soil_moisture
        }
      });

      if (error) throw error;
      setHealthAnalysis(data);
    } catch (error) {
      console.error("Health analysis error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("monitoring_data").insert({
      crop_id: id,
      temperature: parseFloat(formData.temperature),
      humidity: parseFloat(formData.humidity),
      soil_moisture: parseFloat(formData.soil_moisture),
      growth_stage: formData.growth_stage
    });

    if (error) {
      toast.error("Failed to add monitoring data");
    } else {
      toast.success("Monitoring data added successfully!");
      setOpen(false);
      setFormData({ temperature: "", humidity: "", soil_moisture: "", growth_stage: "" });
      fetchMonitoringData();
    }
  };

  if (!crop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = monitoringData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temperature: d.temperature,
    humidity: d.humidity,
    soilMoisture: d.soil_moisture
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Button variant="ghost" onClick={() => navigate("/crops")} className="mb-4">
            ← Back to Crops
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                {crop.name}
              </h1>
              <p className="text-muted-foreground">
                {crop.soil_type} • {crop.area} hectares
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-glow">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Monitoring Data</DialogTitle>
                  <DialogDescription>Record today's crop monitoring data</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 28.5"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 65"
                      value={formData.humidity}
                      onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soil_moisture">Soil Moisture (%)</Label>
                    <Input
                      id="soil_moisture"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 45"
                      value={formData.soil_moisture}
                      onChange={(e) => setFormData({ ...formData, soil_moisture: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="growth_stage">Growth Stage</Label>
                    <Input
                      id="growth_stage"
                      placeholder="e.g., Vegetative, Flowering"
                      value={formData.growth_stage}
                      onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Data</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {healthAnalysis && (
          <Card className="mb-8 border-2 animate-scale-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-primary">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>AI Health Analysis</CardTitle>
                  <CardDescription>Based on latest monitoring data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Badge 
                  variant={
                    healthAnalysis.color === 'success' ? 'default' : 
                    healthAnalysis.color === 'warning' ? 'secondary' : 
                    'destructive'
                  }
                  className="text-lg py-2 px-4"
                >
                  {healthAnalysis.status}
                </Badge>
              </div>
              <p className="text-lg mb-4">{healthAnalysis.advice}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-accent" />
                  <span className="text-sm">Temp: {healthAnalysis.metrics.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  <span className="text-sm">Humidity: {healthAnalysis.metrics.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-success" />
                  <span className="text-sm">Soil: {healthAnalysis.metrics.soilMoisture}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {monitoringData.length > 0 ? (
          <Card className="mb-8 animate-fade-in">
            <CardHeader>
              <CardTitle>Monitoring Trends</CardTitle>
              <CardDescription>Track your crop's environmental conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(var(--accent))" name="Temperature (°C)" strokeWidth={2} />
                  <Line type="monotone" dataKey="humidity" stroke="hsl(var(--primary))" name="Humidity (%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="soilMoisture" stroke="hsl(var(--success))" name="Soil Moisture (%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-12 animate-scale-in">
            <CardContent>
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Monitoring Data</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your crop's health by adding monitoring data
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Add First Data Point
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}