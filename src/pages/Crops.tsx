import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Sprout } from "lucide-react";

export default function Crops() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    soil_type: "",
    area: "",
    sowing_date: ""
  });

  useEffect(() => {
    checkAuth();
    fetchCrops();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchCrops = async () => {
    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load crops");
    } else {
      setCrops(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("crops").insert({
      ...formData,
      area: parseFloat(formData.area),
      user_id: user.id
    });

    if (error) {
      toast.error("Failed to add crop");
    } else {
      toast.success("Crop added successfully!");
      setOpen(false);
      setFormData({ name: "", soil_type: "", area: "", sowing_date: "" });
      fetchCrops();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              My Crops
            </h1>
            <p className="text-muted-foreground">Manage and monitor your crops</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-glow">
                <Plus className="w-5 h-5 mr-2" />
                Add Crop
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Crop</DialogTitle>
                <DialogDescription>Enter the details of your new crop</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Crop Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Wheat, Rice, Corn"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soil_type">Soil Type</Label>
                  <Input
                    id="soil_type"
                    placeholder="e.g., Loamy, Clay, Sandy"
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area (hectares)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2.5"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sowing_date">Sowing Date</Label>
                  <Input
                    id="sowing_date"
                    type="date"
                    value={formData.sowing_date}
                    onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Crop</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {crops.length === 0 ? (
          <Card className="text-center py-16 animate-scale-in">
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="p-6 rounded-full bg-gradient-primary">
                  <Sprout className="w-16 h-16 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Crops Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start monitoring your crops by adding your first one
              </p>
              <Button onClick={() => setOpen(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Crop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {crops.map((crop) => (
              <Card
                key={crop.id}
                className="hover:shadow-glow transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/crop/${crop.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-gradient-primary group-hover:scale-110 transition-transform">
                      <Sprout className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-4">{crop.name}</CardTitle>
                  <CardDescription>
                    Planted: {new Date(crop.sowing_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Soil Type:</span>
                      <span className="font-medium">{crop.soil_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Area:</span>
                      <span className="font-medium">{crop.area} ha</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}