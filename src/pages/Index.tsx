import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DailyIframe from '@daily-co/daily-js';

const Index = () => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isLandingVisible, setIsLandingVisible] = useState(true);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [callFrame, setCallFrame] = useState<any>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const PERSONA_ID = 'p4746574ac52';
  const REPLICA_ID = 'rb17cf590e15';

  const handleConsultationClick = async () => {
    console.log("Style consultation started!");
    setIsCreatingConversation(true);
    
    try {
      // Call the Supabase Edge Function using the client library
      const { data, error } = await supabase.functions.invoke('create-tavus-conversation', {
        body: {
          personaId: PERSONA_ID,
          replicaId: REPLICA_ID,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create conversation.');
      }

      const conversationUrl = data.conversationUrl;

      console.log("Conversation created:", conversationUrl);

      // Fade out landing page
      setIsLandingVisible(false);
      
      // Show video call after fade transition
      setTimeout(async () => {
        setIsVideoCallActive(true);
        await startTavusCall(conversationUrl);
        startUserWebcam();
      }, 300);

    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Could not start the style consultation. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleDevSetup = async () => {
    console.log("Setup function called.");
    try {
      await supabase.functions.invoke('setup-adrian-persona');
    } catch (error) {
      console.error("Error calling setup function:", error);
    }
  };

  const startTavusCall = async (conversationUrl: string) => {
    try {
      const frame = DailyIframe.createFrame(document.getElementById('tavus-frame'), {
        showLeaveButton: false,
      });

      await frame.join({ url: conversationUrl });
      setCallFrame(frame);
    } catch (error) {
      console.error("Error joining Tavus call:", error);
      toast({
        title: "Error",
        description: "Could not join the video consultation.",
        variant: "destructive",
      });
    }
  };

  const handleEndDemo = () => {
    console.log("Demo ended!");
    
    // Leave the Daily call if active
    if (callFrame) {
      callFrame.leave();
      callFrame.destroy();
      setCallFrame(null);
    }
    
    setIsVideoCallActive(false);
    setShowSignupForm(true);
    stopUserWebcam();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
        setShowSignupForm(false);
        setIsLandingVisible(true);
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startUserWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopUserWebcam = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      userVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopUserWebcam();
      if (callFrame) {
        callFrame.leave();
        callFrame.destroy();
      }
    };
  }, [callFrame]);

  if (isVideoCallActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Main Tavus Video Container */}
        <div className="flex-1 relative">
          <div 
            id="tavus-frame" 
            className="w-full h-full"
            style={{ minHeight: '600px' }}
          />
          
          {/* Picture-in-Picture User Webcam */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white/20">
            <video
              ref={userVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* End Demo Button */}
        <div className="p-4 flex justify-center">
          <Button
            onClick={handleEndDemo}
            variant="destructive"
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            End Demo
          </Button>
        </div>
      </div>
    );
  }

  if (showSignupForm) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Create your account to continue with AI Style Consultation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gray-900 flex items-center justify-center transition-opacity duration-300 ${
        isLandingVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center space-y-4">
        <Button 
          onClick={handleConsultationClick}
          disabled={isCreatingConversation}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out animate-pulse disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isCreatingConversation ? 'Initializing...' : 'Begin Your Style Consultation'}
        </Button>
        
        <Button 
          onClick={handleDevSetup}
          variant="outline"
          size="sm"
          className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          DEV TOOL: Create Persona
        </Button>
      </div>
    </div>
  );
};

export default Index;
