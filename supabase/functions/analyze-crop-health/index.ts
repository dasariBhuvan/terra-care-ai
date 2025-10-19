import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { temperature, humidity, soilMoisture } = await req.json();
    
    console.log('Analyzing crop health with:', { temperature, humidity, soilMoisture });

    let status = 'Good';
    let advice = 'Crop is healthy. Continue current practices.';
    let color = 'success';

    // AI-based analysis logic
    if (soilMoisture < 35) {
      status = 'Poor';
      advice = 'Soil moisture is low. Immediate irrigation required. Check irrigation system.';
      color = 'destructive';
    } else if (temperature > 38 || humidity < 30) {
      status = 'Moderate';
      advice = 'Climate conditions need monitoring. Consider shade nets or humidity management.';
      color = 'warning';
    } else if (soilMoisture < 50) {
      status = 'Moderate';
      advice = 'Soil moisture is adequate but could be improved. Schedule irrigation soon.';
      color = 'warning';
    } else if (temperature < 15) {
      status = 'Moderate';
      advice = 'Temperature is low. Monitor for cold stress. Consider protective measures.';
      color = 'warning';
    }

    const result = {
      status,
      advice,
      color,
      metrics: {
        temperature,
        humidity,
        soilMoisture
      }
    };

    console.log('Analysis result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-crop-health function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});