
import { Button } from "@/components/ui/button";

const Index = () => {
  const handleConsultationClick = () => {
    console.log("Style consultation started!");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
