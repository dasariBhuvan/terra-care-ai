import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sprout, Plus, CloudRain, Activity } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchCrops();
    fetchWeather();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
    setLoading(false);
  };

  const fetchCrops = async () => {
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      toast.error("Failed to load crops");
    } else {
      setCrops(data || []);
    }
  };

  const fetchWeather = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("weather", {
        body: { city: "Delhi" }
      });

      if (error) throw error;
      setWeather(data);
    } catch (error) {
      console.error("Weather fetch error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to TerraCare AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor your crops with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <Card className="border-2 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-gradient-primary">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-primary">{crops.length}</span>
              </div>
              <CardTitle>My Crops</CardTitle>
              <CardDescription>Active crop monitoring</CardDescription>
            </CardHeader>
          </Card>

          {weather && (
            <Card className="border-2 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-gradient-accent">
                    <CloudRain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-accent">
                    {Math.round(weather.temperature)}°C
                  </span>
                </div>
                <CardTitle>Weather</CardTitle>
                <CardDescription>
                  {weather.city} - {weather.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card className="border-2 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-gradient-primary">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-success">AI</span>
              </div>
              <CardTitle>Health Analysis</CardTitle>
              <CardDescription>Powered by AI insights</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Recent Crops</CardTitle>
              <CardDescription>Your latest monitored crops</CardDescription>
            </CardHeader>
            <CardContent>
              {crops.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No crops yet</p>
                  <Button onClick={() => navigate("/crops")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Crop
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {crops.map((crop) => (
                    <div
                      key={crop.id}
                      className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/crop/${crop.id}`)}
                    >
                      <h3 className="font-semibold text-lg">{crop.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {crop.soil_type} • {crop.area} hectares
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/crops")}>
                    View All Crops
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your farming operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" onClick={() => navigate("/crops")}>
                <Sprout className="w-4 h-4 mr-2" />
                Add New Crop
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/weather")}>
                <CloudRain className="w-4 h-4 mr-2" />
                Check Weather
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/crops")}>
                <Activity className="w-4 h-4 mr-2" />
                View Crop Health
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}