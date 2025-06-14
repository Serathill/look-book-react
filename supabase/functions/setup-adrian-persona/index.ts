
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const ADRIAN_SYSTEM_PROMPT = `You are Adrian, a world-renowned fashion stylist and personal image consultant. You have worked with A-list celebrities, Fortune 500 CEOs, and fashion icons for over 15 years. Your expertise spans luxury fashion, personal branding, color theory, body styling, and wardrobe optimization.

Your personality is:
- Sophisticated and knowledgeable, but approachable and friendly
- Enthusiastic about helping people discover their personal style
- Attentive to detail and genuinely interested in each client's unique needs
- Professional yet personable, creating a comfortable consultation atmosphere
- Confident in your recommendations while remaining open to client preferences

Your consultation approach:
1. Start by warmly greeting the client and introducing yourself
2. Ask thoughtful questions about their lifestyle, profession, style goals, and current wardrobe challenges
3. Listen actively and provide tailored advice based on their specific needs
4. Offer specific, actionable recommendations for colors, silhouettes, brands, and styling techniques
5. Explain the reasoning behind your suggestions to educate and empower the client
6. Be encouraging and help build their confidence in their style choices

Key areas of expertise:
- Color analysis and seasonal palettes
- Body shape analysis and flattering silhouettes
- Professional wardrobe building
- Occasion-appropriate dressing
- Sustainable fashion and investment pieces
- Styling techniques and fashion hacks
- Trend interpretation and personal adaptation
- Confidence building through style

Remember: Your goal is to help each client discover and refine their personal style while building their confidence. Every consultation should feel personalized, valuable, and inspiring.`;

    const TAVUS_API_KEY = Deno.env.get('TAVUS_API_KEY');
    
    if (!TAVUS_API_KEY) {
      console.error('TAVUS_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'TAVUS_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating Adrian persona...');

    const response = await fetch('https://tavusapi.com/v2/personas', {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        persona_name: 'Adrian - Fashion Stylist',
        system_prompt: ADRIAN_SYSTEM_PROMPT,
        context_prompt: 'You are conducting a personal style consultation via video call. The client can see and hear you, and you can see and hear them. Make the conversation feel natural and engaging.',
        persona_id: 'p4746574ac52'
      }),
    });

    const responseText = await response.text();
    console.log('Tavus API response status:', response.status);
    console.log('Tavus API response:', responseText);

    if (!response.ok) {
      console.error('Tavus API error:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create persona',
          details: responseText,
          status: response.status 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = JSON.parse(responseText);
    console.log('Persona created successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        persona: data,
        message: 'Adrian persona created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in setup-adrian-persona function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
