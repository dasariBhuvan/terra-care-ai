import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CloudRain, Wind, Droplets, MapPin } from "lucide-react";

export default function Weather() {
  const navigate = useNavigate();
  const [city, setCity] = useState("Delhi");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchWeather("Delhi");
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchWeather = async (searchCity: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weather", {
        body: { city: searchCity }
      });

      if (error) throw error;
      setWeather(data);
      toast.success("Weather data updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch weather data");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
            Live Weather
          </h1>
          <p className="text-muted-foreground">Real-time weather data for your location</p>
        </div>

        <Card className="mb-8 animate-scale-in">
          <CardHeader>
            <CardTitle>Search Location</CardTitle>
            <CardDescription>Enter a city name to get weather information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="shadow-glow">
                {loading ? "Loading..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {weather && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            <Card className="border-2 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-4 rounded-xl bg-gradient-accent">
                    <CloudRain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Temperature</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {weather.city}, {weather.country}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-accent mb-2">
                    {Math.round(weather.temperature)}°C
                  </div>
                  <p className="text-xl text-muted-foreground capitalize">
                    {weather.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle>Weather Details</CardTitle>
                <CardDescription>Additional environmental data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-primary">
                      <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-2xl font-bold">{weather.humidity}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-accent">
                      <Wind className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conditions</p>
                      <p className="text-xl font-medium capitalize">{weather.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Weather Impact on Crops</CardTitle>
            <CardDescription>How weather affects your farming</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-accent" />
                Temperature
              </h3>
              <p className="text-sm text-muted-foreground">
                Optimal crop growth occurs between 15-35°C. Monitor for extreme temperatures.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary" />
                Humidity
              </h3>
              <p className="text-sm text-muted-foreground">
                High humidity (&gt;70%) may increase disease risk. Low humidity (&lt;30%) may stress plants.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Wind className="w-5 h-5 text-accent" />
                Conditions
              </h3>
              <p className="text-sm text-muted-foreground">
                Clear skies promote photosynthesis. Rain provides natural irrigation but may delay fieldwork.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}