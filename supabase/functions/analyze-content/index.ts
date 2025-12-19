import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  username: string;
  bio: string;
  contentType: string;
  platform?: string;
  imageUrl?: string;
}

interface AnalysisResult {
  verificationStatus: 'verified' | 'alert' | 'unverified';
  alertType?: string;
  alertMessage?: string;
  confidenceScore: number;
  deepfakeDetected: boolean;
  credentialVerified: boolean;
  analysisDetails: {
    credentialCheck: string;
    contentAnalysis: string;
    riskFactors: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { username, bio, contentType, platform, imageUrl }: AnalysisRequest = await req.json();

    console.log(`Analyzing content from @${username} on ${platform || 'unknown platform'}`);
    console.log(`Content type: ${contentType}`);
    console.log(`Bio: ${bio}`);

    // Craft the analysis prompt
    const systemPrompt = `You are Veritas, an advanced content verification AI system. Your task is to analyze social media content and creators for authenticity.

You must analyze the following aspects:
1. CREDENTIAL VERIFICATION: Check if the username and bio suggest professional credentials (doctor, lawyer, politician, etc.) and assess if they appear legitimate based on naming patterns, professional terminology, and consistency.

2. DEEPFAKE/SYNTHETIC MEDIA INDICATORS: Look for red flags that might indicate synthetic or AI-generated content. Consider:
   - Unrealistic claims or sensationalized content
   - Patterns common in misinformation
   - Bio/username patterns associated with fake accounts
   
3. RISK ASSESSMENT: Provide a confidence score (0-100) and identify specific risk factors.

IMPORTANT GUIDELINES:
- Use respectful, non-accusatory language
- Say "Registry Not Found" instead of calling someone a "liar" or "fake"
- Say "High Probability of Synthetic Media" for potential deepfakes
- Always provide actionable insights

Respond in JSON format only:
{
  "verificationStatus": "verified" | "alert" | "unverified",
  "alertType": "credential_issue" | "synthetic_media" | "misinformation" | null,
  "alertMessage": "string or null",
  "confidenceScore": number (0-100),
  "deepfakeDetected": boolean,
  "credentialVerified": boolean,
  "analysisDetails": {
    "credentialCheck": "string",
    "contentAnalysis": "string", 
    "riskFactors": ["string array"]
  }
}`;

    const userPrompt = `Analyze this social media creator:

Username: @${username}
Bio: "${bio}"
Content Type: ${contentType}
Platform: ${platform || 'Unknown'}
${imageUrl ? `Image URL provided: Yes` : 'No image provided'}

Provide your verification analysis.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI Response:', content);

    // Parse the JSON response from AI
    let analysisResult: AnalysisResult;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      analysisResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a default unverified status if parsing fails
      analysisResult = {
        verificationStatus: 'unverified',
        alertType: undefined,
        alertMessage: undefined,
        confidenceScore: 50,
        deepfakeDetected: false,
        credentialVerified: false,
        analysisDetails: {
          credentialCheck: 'Analysis incomplete',
          contentAnalysis: 'Could not complete full analysis',
          riskFactors: ['Analysis parsing error']
        }
      };
    }

    console.log('Analysis complete:', analysisResult.verificationStatus);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
