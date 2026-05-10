"use client";

import { Search, Filter, Plus, MessageCircle, Clock, Sparkles, X, Send } from "lucide-react";
import { useState } from "react";
import { createChatSession, sendChatMessage } from "@/lib/api";
import type { ChatMessage, ChatSession } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";

export function AIAssistance() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  const handleNewSession = async () => {
    if (creatingSession) return;
    setCreatingSession(true);
    try {
      const sessionId = await createChatSession();
      const fresh: ChatSession = {
        id: sessionId,
        title: "New Conversation",
        lastMessage: "",
        timestamp: "Just now",
        messages: [],
      };
      setSelectedSession(fresh);
      setSessions((prev) => [fresh, ...prev]);
    } catch {
      setSelectedSession({
        id: `local-${Date.now()}`,
        title: "Session unavailable",
        lastMessage: "",
        timestamp: "Just now",
        messages: [
          {
            role: "assistant",
            content:
              "I couldn't start a new session — the chat service is unreachable. Check that the API is running and try again.",
          },
        ],
      });
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedSession) return;

    const sessionAtStart = selectedSession;
    const userMessage: ChatMessage = { role: "user", content: input };
    const sessionWithUser: ChatSession = {
      ...sessionAtStart,
      messages: [...sessionAtStart.messages, userMessage],
    };

    setSelectedSession(sessionWithUser);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendChatMessage({
        sessionId: sessionAtStart.id,
        message: userMessage.content,
        history: sessionWithUser.messages,
      });

      // Stream the reply token-by-token into the assistant bubble.
      await streamReplyIntoSession({
        fullText: reply.content,
        baseSession: sessionWithUser,
        userPrompt: userMessage.content,
        onUpdate: setSelectedSession,
        onFirstChunk: () => setIsLoading(false),
      });

      // Once streaming finishes, persist the completed session in the list.
      const finalLastMessage = reply.content;
      const finalTitle =
        sessionAtStart.title === "New Conversation"
          ? userMessage.content.slice(0, 60)
          : sessionAtStart.title;

      setSessions((prev) => {
        const without = prev.filter((s) => s.id !== sessionAtStart.id);
        return [
          {
            ...sessionWithUser,
            title: finalTitle,
            messages: [
              ...sessionWithUser.messages,
              { role: "assistant", content: finalLastMessage },
            ],
            lastMessage: finalLastMessage,
            timestamp: "Just now",
          },
          ...without,
        ];
      });
    } catch {
      setSelectedSession({
        ...sessionWithUser,
        messages: [
          ...sessionWithUser.messages,
          {
            role: "assistant",
            content:
              "I couldn't reach the analysis service right now. Try again in a moment, or check that the API is running.",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <PageHeader
            title="AI Assistance"
            subtitle="Get personalized menu recommendations"
            actions={
              <button
                onClick={handleNewSession}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Session</span>
              </button>
            }
          >
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button className="px-4 py-2.5 border border-border rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
              <button className="px-4 py-2.5 border border-border rounded-lg hover:bg-accent/50 transition-colors text-sm">
                Sort by Date
              </button>
            </div>
          </PageHeader>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <h3>Previous Conversations</h3>
              <p className="text-sm text-muted-foreground mt-1">Your chat history with Menu Gap AI</p>
            </div>

            <div className="divide-y divide-border">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full p-6 hover:bg-accent/30 transition-colors text-left ${
                    selectedSession?.id === session.id ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm truncate">{session.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {session.timestamp}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{session.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}

              {sessions.length === 0 && (
                <div className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="mb-2">No conversations yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a new session to get AI-powered menu recommendations
                  </p>
                  <button
                    onClick={handleNewSession}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Start Your First Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedSession && (
        <div className="w-[480px] bg-card border-l border-border flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3>{selectedSession.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedSession.timestamp}</p>
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedSession.messages.length === 0 && (
            <div className="p-6 border-b border-border">
              <p className="text-sm text-muted-foreground mb-3">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setInput("Should I add ")}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  Should I add...
                </button>
                <button
                  onClick={() => setInput("Should I remove ")}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  Should I remove...
                </button>
                <button
                  onClick={() => setInput("Is my pricing correct for ")}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  Pricing advice...
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedSession.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="mb-2">Ready to help!</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask me about adding or removing dishes, pricing strategies, or competitor analysis.
                  </p>
                </div>
              </div>
            ) : (
              selectedSession.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-accent px-4 py-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about a dish or menu strategy..."
                className="flex-1 px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reveals the assistant reply token-by-token into the current session so the
// chat bubble feels like it's streaming. The backend currently returns the
// whole reply at once; once it streams, swap this for fetch-stream chunks.
const STREAM_CHUNK_DELAY_MS = 25;

function tokenize(text: string): string[] {
  // Split on whitespace boundaries while keeping the whitespace as its own token,
  // so the output reads naturally word-by-word with proper spacing.
  return text.split(/(\s+)/).filter((c) => c.length > 0);
}

async function streamReplyIntoSession({
  fullText,
  baseSession,
  userPrompt,
  onUpdate,
  onFirstChunk,
}: {
  fullText: string;
  baseSession: ChatSession;
  userPrompt: string;
  onUpdate: (s: ChatSession) => void;
  onFirstChunk: () => void;
}): Promise<void> {
  const tokens = tokenize(fullText);
  const finalTitle =
    baseSession.title === "New Conversation" ? userPrompt.slice(0, 60) : baseSession.title;

  let assembled = "";
  let firstFired = false;

  // Append an empty assistant bubble so streaming has a target to grow into.
  let cur: ChatSession = {
    ...baseSession,
    title: finalTitle,
    messages: [...baseSession.messages, { role: "assistant", content: "" }],
    timestamp: "Just now",
  };
  onUpdate(cur);

  for (const token of tokens) {
    assembled += token;
    if (!firstFired && assembled.trim().length > 0) {
      onFirstChunk();
      firstFired = true;
    }
    cur = {
      ...cur,
      messages: cur.messages.map((m, idx) =>
        idx === cur.messages.length - 1 ? { ...m, content: assembled } : m
      ),
      lastMessage: assembled,
    };
    onUpdate(cur);
    await sleep(STREAM_CHUNK_DELAY_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
