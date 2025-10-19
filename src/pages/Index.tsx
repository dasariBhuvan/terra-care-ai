import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Activity, CloudRain, LineChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-sm shadow-glow">
              <Sprout className="w-20 h-20 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 text-white">
            TerraCare AI
          </h1>
          <p className="text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Smart Crop Monitoring & Analysis System
          </p>
          <p className="text-lg text-white/70 mb-12 max-w-3xl mx-auto">
            Monitor your crops with AI-powered insights, real-time weather data, and comprehensive health analysis. 
            Make data-driven decisions to maximize your harvest.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 shadow-glow"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 animate-slide-up">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="p-4 rounded-xl bg-gradient-primary w-fit mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">AI Health Analysis</h3>
            <p className="text-white/70">
              Get intelligent insights about crop health based on environmental conditions and monitoring data.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="p-4 rounded-xl bg-gradient-accent w-fit mb-4">
              <CloudRain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Live Weather Data</h3>
            <p className="text-white/70">
              Access real-time weather information to make informed decisions about irrigation and crop care.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="p-4 rounded-xl bg-gradient-primary w-fit mb-4">
              <LineChart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Data Visualization</h3>
            <p className="text-white/70">
              Track trends with interactive charts showing temperature, humidity, and soil moisture over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
