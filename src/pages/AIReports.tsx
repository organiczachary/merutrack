import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Download, 
  Sparkles, 
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface AIReport {
  id: string;
  report_type: string;
  content: {
    title: string;
    executive_summary: string;
    analysis: string;
    kpis: string[];
    recommendations: string[];
    risks: string[];
    generated_at: string;
    data_period: string;
  };
  created_at: string;
  date_range_start: string;
  date_range_end: string;
}

const AIReports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/60 border-white/30 p-8 max-w-md">
          <CardContent className="text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Restricted</h2>
            <p className="text-slate-600">Only administrators can access AI reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch existing reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['ai-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        content: item.content as AIReport['content']
      })) as AIReport[];
    }
  });

  // Generate new report mutation
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReportType) throw new Error('Please select a report type');
      
      setIsGenerating(true);
      
      const response = await supabase.functions.invoke('ai-reports', {
        body: {
          reportType: selectedReportType,
          dateRange,
          filters: {}
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated Successfully",
        description: "Your AI-powered report is ready for review."
      });
      queryClient.invalidateQueries({ queryKey: ['ai-reports'] });
      setIsGenerating(false);
      // Auto-select the newly generated report
      if (data.report) {
        setSelectedReport({
          id: data.report_id,
          report_type: selectedReportType,
          content: data.report,
          created_at: new Date().toISOString(),
          date_range_start: dateRange.start,
          date_range_end: dateRange.end
        });
      }
    },
    onError: (error: any) => {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: error.message || "Unable to generate report. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  });

  const reportTypes = [
    { value: 'training_performance', label: 'Training Performance Analysis', icon: TrendingUp },
    { value: 'attendance_analysis', label: 'Attendance & Participation', icon: Users },
    { value: 'constituency_overview', label: 'Constituency Overview', icon: BarChart3 },
    { value: 'module_effectiveness', label: 'Module Effectiveness', icon: FileText },
  ];

  const handleDownloadReport = (report: AIReport) => {
    const reportData = {
      ...report.content,
      metadata: {
        generated_at: report.created_at,
        date_range: `${report.date_range_start} to ${report.date_range_end}`,
        report_type: report.report_type
      }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_type}_${report.created_at.split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedReport(null)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
          </div>

          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    {selectedReport.content.title}
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Generated on {format(new Date(selectedReport.created_at), 'PPP')}
                  </p>
                </div>
                <Button
                  onClick={() => handleDownloadReport(selectedReport)}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Executive Summary</h3>
                <p className="text-slate-700 leading-relaxed">{selectedReport.content.executive_summary}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Detailed Analysis</h3>
                <div className="prose prose-slate max-w-none">
                  <pre className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans">
                    {selectedReport.content.analysis}
                  </pre>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Key Performance Indicators</h3>
                  <div className="space-y-2">
                    {selectedReport.content.kpis?.map((kpi, index) => (
                      <Badge key={index} variant="secondary" className="block w-fit">
                        {kpi}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {selectedReport.content.recommendations?.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-slate-700 text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedReport.content.risks?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Risk Factors
                    </h3>
                    <div className="space-y-2">
                      {selectedReport.content.risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-slate-700 text-sm">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">AI-Powered Reports</h1>
              <p className="text-slate-600">Generate intelligent insights from your training data</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Generation Panel */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Generate New Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Report Type</label>
                  <Select onValueChange={setSelectedReportType} value={selectedReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => generateReportMutation.mutate()}
                  disabled={!selectedReportType || isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-white gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                    <p className="text-slate-600">Loading reports...</p>
                  </div>
                ) : reports?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Reports Generated</h3>
                    <p className="text-slate-600 mb-4">Generate your first AI-powered report to get started.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {reports?.map((report) => (
                        <Card
                          key={report.id}
                          className="border-slate-200 hover:border-primary/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedReport(report)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 mb-1">
                                  {report.content?.title || report.report_type.replace('_', ' ').toUpperCase()}
                                </h3>
                                <p className="text-sm text-slate-600 mb-2">
                                  {format(new Date(report.created_at), 'PPP')}
                                </p>
                                <p className="text-sm text-slate-700 line-clamp-2">
                                  {report.content?.executive_summary}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {report.report_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReports;