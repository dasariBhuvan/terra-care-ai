-- Create crops table
CREATE TABLE public.crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  soil_type text NOT NULL,
  area numeric NOT NULL,
  sowing_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create monitoring data table
CREATE TABLE public.monitoring_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  temperature numeric NOT NULL,
  humidity numeric NOT NULL,
  soil_moisture numeric NOT NULL,
  growth_stage text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crops
CREATE POLICY "Users can view their own crops"
  ON public.crops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crops"
  ON public.crops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops"
  ON public.crops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops"
  ON public.crops FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for monitoring_data
CREATE POLICY "Users can view monitoring data for their crops"
  ON public.monitoring_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crops
    WHERE crops.id = monitoring_data.crop_id
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can create monitoring data for their crops"
  ON public.monitoring_data FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.crops
    WHERE crops.id = monitoring_data.crop_id
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can update monitoring data for their crops"
  ON public.monitoring_data FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.crops
    WHERE crops.id = monitoring_data.crop_id
    AND crops.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete monitoring data for their crops"
  ON public.monitoring_data FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.crops
    WHERE crops.id = monitoring_data.crop_id
    AND crops.user_id = auth.uid()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for crops
CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();