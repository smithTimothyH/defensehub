import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send } from "lucide-react";

export default function ChatInterface({ userId }: { userId: number }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: Date }>>([]);
  const [inputValue, setInputValue] = useState("");

  const { data: coachingSessions } = useQuery({
    queryKey: ["/api/users", userId, "coaching"],
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        content: "I understand your question about cybersecurity best practices. Based on your recent training performance, I recommend focusing on email verification techniques and being more cautious with urgent requests.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <Card className="h-96">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-cyber-primary" />
          <h3 className="text-lg font-semibold text-gray-900">AI Security Coach</h3>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-80">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Hello! I'm your AI Security Coach. Ask me anything about cybersecurity best practices or your training progress.</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start space-x-3 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-cyber-primary text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user" 
                    ? "bg-cyber-primary text-white" 
                    : "bg-gray-100 text-gray-900"
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about cybersecurity..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button size="icon" onClick={handleSendMessage} className="bg-cyber-primary hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
