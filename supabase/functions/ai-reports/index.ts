import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportType, dateRange, filters = {} } = await req.json();
    
    console.log('Generating AI report:', { reportType, dateRange, filters });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant data based on report type
    let data = {};
    let dataContext = '';

    switch (reportType) {
      case 'training_performance':
        const { data: sessions } = await supabase
          .from('training_sessions')
          .select(`
            *,
            attendance(count),
            photos(count)
          `)
          .gte('scheduled_date', dateRange.start)
          .lte('scheduled_date', dateRange.end);
        
        data = { sessions };
        dataContext = `Training Performance Data: ${sessions?.length || 0} sessions with attendance and photo metrics`;
        break;

      case 'attendance_analysis':
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select(`
            *,
            training_sessions(title, constituency, value_chain, scheduled_date)
          `)
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
        
        data = { attendance: attendanceData };
        dataContext = `Attendance Analysis Data: ${attendanceData?.length || 0} attendance records`;
        break;

      case 'constituency_overview':
        const { data: constituencyData } = await supabase
          .from('training_sessions')
          .select(`
            constituency,
            value_chain,
            status,
            actual_participants,
            expected_participants,
            scheduled_date
          `)
          .gte('scheduled_date', dateRange.start)
          .lte('scheduled_date', dateRange.end);
        
        data = { constituencyData };
        dataContext = `Constituency Overview Data: ${constituencyData?.length || 0} training sessions across constituencies`;
        break;

      case 'module_effectiveness':
        const { data: moduleData } = await supabase
          .from('modules')
          .select(`
            *,
            trainer_modules(count, certification_status, competency_level)
          `);
        
        data = { modules: moduleData };
        dataContext = `Module Effectiveness Data: ${moduleData?.length || 0} training modules with trainer assignments`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid report type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Generate AI report using Anthropic Claude
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = `
You are an expert data analyst for an agricultural training program in Kenya. 

Based on the following data, generate a comprehensive ${reportType.replace('_', ' ')} report:

${dataContext}

Data Summary:
${JSON.stringify(data, null, 2)}

Please provide:
1. Executive Summary (2-3 key insights)
2. Detailed Analysis with specific metrics and trends
3. Key Performance Indicators (KPIs)
4. Recommendations for improvement
5. Risk factors and mitigation strategies

Format the response as structured JSON with these sections:
{
  "title": "Report title",
  "executive_summary": "Brief overview",
  "analysis": "Detailed analysis with metrics",
  "kpis": ["KPI 1", "KPI 2", "KPI 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "risks": ["Risk 1", "Risk 2"],
  "generated_at": "ISO timestamp",
  "data_period": "Date range analyzed"
}

Focus on actionable insights for agricultural extension officers and program managers.
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    console.log('AI Response received');

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${aiResponse.error?.message || 'Unknown error'}`);
    }

    const reportContent = aiResponse.content[0].text;
    
    // Parse the JSON response from Claude
    let parsedReport;
    try {
      parsedReport = JSON.parse(reportContent);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      parsedReport = {
        title: `${reportType.replace('_', ' ')} Report`,
        executive_summary: 'Report generated successfully',
        analysis: reportContent,
        kpis: ['Data analysis completed'],
        recommendations: ['Review detailed analysis'],
        risks: ['No specific risks identified'],
        generated_at: new Date().toISOString(),
        data_period: `${dateRange.start} to ${dateRange.end}`
      };
    }

    // Store the report in the database for future reference
    const { data: savedReport } = await supabase
      .from('ai_reports')
      .insert({
        report_type: reportType,
        content: parsedReport,
        date_range_start: dateRange.start,
        date_range_end: dateRange.end,
        filters: filters,
        generated_by: 'claude-3-sonnet'
      })
      .select()
      .single();

    console.log('Report saved to database');

    return new Response(
      JSON.stringify({
        success: true,
        report: parsedReport,
        report_id: savedReport?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating AI report:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI report', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});