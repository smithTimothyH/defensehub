import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, BookOpen, Home } from "lucide-react";

export default function PhishingCaught() {
  const [, setLocation] = useLocation();
  const [animateEyes, setAnimateEyes] = useState(false);

  useEffect(() => {
    // Animate the demon eyes
    const interval = setInterval(() => {
      setAnimateEyes(prev => !prev);
    }, 2000);

    // Record the phishing click (you could expand this to call an API)
    console.log("User clicked phishing link - educational event logged");

    return () => clearInterval(interval);
  }, []);

  const educationalTips = [
    "Always verify sender email addresses before clicking links",
    "Look for spelling errors and urgent language - red flags!",
    "Hover over links to see the real URL before clicking",
    "When in doubt, contact IT or the sender directly",
    "Use multi-factor authentication whenever possible"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-black flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-900 border-red-500 border-2 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {/* Evil Hacker Demon SVG */}
            <svg width="120" height="120" viewBox="0 0 120 120" className="text-red-400">
              {/* Demon Head */}
              <circle cx="60" cy="60" r="45" fill="currentColor" />
              
              {/* Horns */}
              <polygon points="35,25 25,15 45,35" fill="#dc2626" />
              <polygon points="85,25 95,15 75,35" fill="#dc2626" />
              
              {/* Eyes */}
              <circle 
                cx="45" 
                cy="50" 
                r={animateEyes ? "8" : "6"} 
                fill="#fbbf24" 
                className="transition-all duration-300"
              />
              <circle 
                cx="75" 
                cy="50" 
                r={animateEyes ? "8" : "6"} 
                fill="#fbbf24" 
                className="transition-all duration-300"
              />
              <circle cx="45" cy="48" r="3" fill="#000" />
              <circle cx="75" cy="48" r="3" fill="#000" />
              
              {/* Evil Grin */}
              <path 
                d="M 40 70 Q 60 85 80 70" 
                stroke="#000" 
                strokeWidth="3" 
                fill="none"
              />
              
              {/* Fangs */}
              <polygon points="50,70 52,78 48,78" fill="#fff" />
              <polygon points="70,70 72,78 68,78" fill="#fff" />
              
              {/* Goatee */}
              <path d="M 55 85 Q 60 95 65 85" fill="#000" />
            </svg>
          </div>
          
          <CardTitle className="text-3xl font-bold text-red-400 mb-2">
            GOTCHA! 😈
          </CardTitle>
          
          <Badge variant="destructive" className="text-lg px-4 py-1">
            <AlertTriangle className="w-4 h-4 mr-2" />
            You Clicked a Phishing Link!
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-xl text-gray-300 mb-2">
              <strong className="text-red-400">Oops!</strong> You just fell for a phishing simulation!
            </p>
            <p className="text-gray-400">
              Don't worry - this was just a training exercise. In a real attack, your credentials, 
              personal data, or company systems could have been compromised!
            </p>
          </div>

          <div className="bg-red-950 border border-red-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Quick Security Tips:
            </h3>
            <ul className="space-y-2">
              {educationalTips.map((tip, index) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-950 border border-blue-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Remember:
            </h3>
            <p className="text-gray-300">
              Cybercriminals use psychology and urgency to trick you. Take a moment to think 
              before clicking, and when in doubt, verify through a separate communication channel.
            </p>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              This simulation helps improve your security awareness. Keep practicing!
            </p>
            
            <Button 
              onClick={() => setLocation("/")}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Safety (Dashboard)
            </Button>
          </div>

          <div className="text-center text-xs text-gray-600 border-t border-gray-700 pt-4">
            SentinelSim Cybersecurity Training Platform • This was a controlled phishing simulation
          </div>
        </CardContent>
      </Card>
    </div>
  );
}