
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isLandingVisible, setIsLandingVisible] = useState(true);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  const handleConsultationClick = () => {
    console.log("Style consultation started!");
    // Fade out landing page
    setIsLandingVisible(false);
    // Show video call after fade transition
    setTimeout(() => {
      setIsVideoCallActive(true);
      startUserWebcam();
    }, 300);
  };

  const handleEndDemo = () => {
    console.log("Demo ended!");
    setIsVideoCallActive(false);
    setIsLandingVisible(true);
    stopUserWebcam();
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
    };
  }, []);

  if (isVideoCallActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Main Tavus Video Container */}
        <div className="flex-1 relative">
          <iframe
            src="https://tavus.daily.co/c48b5a164603c48a"
            className="w-full h-full border-none"
            allow="camera; microphone; fullscreen; display-capture"
            title="Tavus AI Stylist Consultation"
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

  return (
    <div 
      className={`min-h-screen bg-gray-900 flex items-center justify-center transition-opacity duration-300 ${
        isLandingVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        <Button 
          onClick={handleConsultationClick}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out animate-pulse"
        >
          Begin Your Style Consultation
        </Button>
      </div>
    </div>
  );
};

export default Index;
