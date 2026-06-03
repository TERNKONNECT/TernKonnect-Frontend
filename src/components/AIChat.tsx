// Create src/components/AIChat.tsx
import { useState } from "react";
import { Send, Mic, MicOff, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

export const AIChat = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const {
    isListening,
    isProcessing,
    isAIAvailable,
    chatHistory,
    lastResponse,
    startListening,
    stopListening,
    sendChatMessage,
    clearChat,
    isSupported,
  } = useVoiceAssistant();

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      await sendChatMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-80 h-[32rem] shadow-xl z-50 flex flex-col overflow-hidden">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            Ternkonnect AI
            {!isAIAvailable && <Badge variant="destructive">Offline</Badge>}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-6 w-6"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-2 min-h-0">
        <ScrollArea className="flex-1 min-h-0 mb-2">
          <div className="space-y-2 p-2">
            {chatHistory.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-4">
                Hi! I'm your TernKonnect assistant. I will assist you in navigating this website.
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm break-words ${msg.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                    }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted p-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {lastResponse?.suggestions && (
          <div className="shrink-0 mb-2">
            <div className="flex flex-wrap gap-1">
              {lastResponse.suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => sendChatMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="shrink-0 flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 text-sm"
            disabled={isProcessing}
          />

          {isSupported && (
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className="h-9 w-9 shrink-0"
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
