-- Create ai_reports table for storing generated reports
CREATE TABLE public.ai_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT NOT NULL,
    content JSONB NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    filters JSONB DEFAULT '{}',
    generated_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_reports
CREATE POLICY "Admins can manage all AI reports" 
ON public.ai_reports 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_reports_updated_at
BEFORE UPDATE ON public.ai_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_ai_reports_type_date ON public.ai_reports(report_type, created_at DESC);
CREATE INDEX idx_ai_reports_date_range ON public.ai_reports(date_range_start, date_range_end);