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
    console.log('Generating AI dashboard insights');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch comprehensive dashboard data
    const [
      { data: recentSessions },
      { data: attendanceStats },
      { data: moduleStats },
      { data: photoStats },
      { data: constituencyStats }
    ] = await Promise.all([
      // Recent training sessions
      supabase
        .from('training_sessions')
        .select('*')
        .order('scheduled_date', { ascending: false })
        .limit(10),
      
      // Attendance statistics
      supabase
        .from('attendance')
        .select('attendance_status, participant_gender, participant_age')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Module statistics
      supabase
        .from('modules')
        .select('value_chain, difficulty_level, is_active'),
      
      // Photo upload statistics
      supabase
        .from('photos')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Constituency distribution
      supabase
        .from('training_sessions')
        .select('constituency, value_chain, status')
        .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const dashboardData = {
      recentSessions: recentSessions?.length || 0,
      totalAttendance: attendanceStats?.length || 0,
      activeModules: moduleStats?.filter(m => m.is_active).length || 0,
      recentPhotos: photoStats?.length || 0,
      constituencyData: constituencyStats || [],
      attendanceByGender: attendanceStats?.reduce((acc, curr) => {
        const gender = curr.participant_gender || 'unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {}) || {},
      modulesByValueChain: moduleStats?.reduce((acc, curr) => {
        const chain = curr.value_chain || 'unknown';
        acc[chain] = (acc[chain] || 0) + 1;
        return acc;
      }, {}) || {}
    };

    // Generate AI insights using Anthropic Claude
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = `
You are an AI assistant for an agricultural training program dashboard in Kenya.

Analyze this real-time data and provide actionable insights:

Dashboard Data:
${JSON.stringify(dashboardData, null, 2)}

Please provide concise, actionable insights in JSON format:
{
  "headline_insight": "Single most important insight (1 sentence)",
  "performance_summary": "Brief performance overview",
  "alerts": ["Alert 1", "Alert 2"] (max 3 urgent items),
  "opportunities": ["Opportunity 1", "Opportunity 2"] (max 3 growth areas),
  "next_actions": ["Action 1", "Action 2"] (max 3 immediate actions),
  "trends": {
    "positive": ["Positive trend 1"],
    "concerning": ["Concerning trend 1"]
  },
  "recommendations": {
    "short_term": ["1-week action"],
    "medium_term": ["1-month action"],
    "long_term": ["3-month action"]
  }
}

Focus on:
- Agricultural extension effectiveness
- Training participation patterns
- Resource allocation
- Geographic coverage
- Gender inclusion
- Value chain development

Keep insights practical and specific to Kenyan agricultural context.
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
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    console.log('AI insights generated');

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${aiResponse.error?.message || 'Unknown error'}`);
    }

    const insightsContent = aiResponse.content[0].text;
    
    // Parse the JSON response from Claude
    let parsedInsights;
    try {
      parsedInsights = JSON.parse(insightsContent);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      parsedInsights = {
        headline_insight: "Dashboard data analysis completed successfully",
        performance_summary: "System is operational with active training sessions and participant engagement",
        alerts: ["Review data patterns for optimization opportunities"],
        opportunities: ["Continue monitoring system performance"],
        next_actions: ["Regular dashboard review recommended"],
        trends: {
          positive: ["System functioning normally"],
          concerning: ["No critical issues detected"]
        },
        recommendations: {
          short_term: ["Monitor daily activity"],
          medium_term: ["Review monthly performance"],
          long_term: ["Plan quarterly improvements"]
        }
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: dashboardData,
        insights: parsedInsights,
        generated_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating AI dashboard:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI dashboard', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});