"use client";

import {
  ArrowDownUp,
  ChevronDown,
  Clock,
  Filter,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createChatSession,
  fetchChatSession,
  fetchChatSessions,
  sendChatMessage,
} from "@/lib/api";
import type { ChatMessage, ChatSession } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { MarkdownMessage } from "@/components/ui-extras/MarkdownMessage";

export function AIAssistance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomingPrompt = searchParams.get("prompt");
  const promptApplied = useRef(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [sort, setSort] = useState<SessionSort>("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const visibleSessions = useMemo(
    () => applyFilterAndSort(sessions, searchQuery, filter, sort),
    [sessions, searchQuery, filter, sort]
  );

  // Load all chat sessions on mount so previous conversations are visible.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchChatSessions();
        if (!active) return;
        setSessions(list);
      } catch {
        // Sessions endpoint may not be reachable — leave the empty state.
      } finally {
        if (active) setSessionsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSelectSession = async (session: ChatSession) => {
    // If we already have messages (e.g. user just sent some), skip the fetch.
    if (session.messages.length > 0) {
      setSelectedSession(session);
      return;
    }
    // Local/pending placeholders don't exist on the backend; just open them.
    if (session.id.startsWith("pending-") || session.id.startsWith("local-")) {
      setSelectedSession(session);
      return;
    }

    setSelectedSession(session);
    setLoadingSessionId(session.id);
    try {
      const full = await fetchChatSession(session.id);
      // Merge — keep summary fields if the detail endpoint omits them.
      const merged: ChatSession = {
        ...session,
        ...full,
        id: session.id,
        messages: full.messages,
      };
      setSelectedSession(merged);
      setSessions((prev) => prev.map((s) => (s.id === session.id ? merged : s)));
    } catch {
      setSelectedSession({
        ...session,
        messages: [
          {
            role: "assistant",
            content:
              "I couldn't load this conversation. The history endpoint may be down — try again in a moment.",
          },
        ],
      });
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleNewSession = async (): Promise<ChatSession | null> => {
    if (creatingSession) return null;

    // Open the chat panel instantly with a placeholder session so the UI
    // doesn't block on the network round-trip.
    const tempId = `pending-${Date.now()}`;
    const placeholder: ChatSession = {
      id: tempId,
      title: "New Conversation",
      lastMessage: "",
      timestamp: "Just now",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setSelectedSession(placeholder);
    setSessions((prev) => [placeholder, ...prev]);
    setCreatingSession(true);

    try {
      const sessionId = await createChatSession();
      const fresh: ChatSession = { ...placeholder, id: sessionId };
      // Swap the placeholder for the real session everywhere.
      setSelectedSession((cur) => (cur?.id === tempId ? fresh : cur));
      setSessions((prev) => prev.map((s) => (s.id === tempId ? fresh : s)));
      return fresh;
    } catch {
      const errored: ChatSession = {
        ...placeholder,
        id: `local-${Date.now()}`,
        title: "Session unavailable",
        messages: [
          {
            role: "assistant",
            content:
              "I couldn't start a new session — the chat service is unreachable. Check that the API is running and try again.",
          },
        ],
      };
      setSelectedSession((cur) => (cur?.id === tempId ? errored : cur));
      setSessions((prev) => prev.map((s) => (s.id === tempId ? errored : s)));
      return null;
    } finally {
      setCreatingSession(false);
    }
  };

  // Pick up a "prompt" query param (e.g. when arriving here from the must-have
  // Analyze button), auto-open a session, and pre-fill the input.
  useEffect(() => {
    if (!incomingPrompt || promptApplied.current) return;
    promptApplied.current = true;
    (async () => {
      if (!selectedSession) {
        await handleNewSession();
      }
      setInput(incomingPrompt);
      // Strip the param so a refresh doesn't re-trigger.
      router.replace("/ai-assistance");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingPrompt]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSession) return;
    // Block sending while the session is still being provisioned.
    if (selectedSession.id.startsWith("pending-")) return;
    if (selectedSession.id.startsWith("local-")) return;

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

      await streamReplyIntoSession({
        fullText: reply.content,
        baseSession: sessionWithUser,
        userPrompt: userMessage.content,
        onUpdate: setSelectedSession,
        onFirstChunk: () => setIsLoading(false),
      });

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
            updatedAt: new Date().toISOString(),
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
                className="flex items-center gap-2 px-4 py-2.5 bg-[#7F5539] text-white rounded-lg hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(127,85,57,0.25)]"
                style={{ fontWeight: 600 }}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#B08968]/40 focus:border-[#B08968] transition-colors"
                />
              </div>
              <DropdownButton
                open={filterOpen}
                onToggle={() => {
                  setFilterOpen((o) => !o);
                  setSortOpen(false);
                }}
                onClose={() => setFilterOpen(false)}
                icon={<Filter className="w-4 h-4" />}
                label={FILTER_OPTIONS.find((o) => o.key === filter)!.label}
                options={FILTER_OPTIONS}
                selectedKey={filter}
                onSelect={(k) => setFilter(k as SessionFilter)}
              />
              <DropdownButton
                open={sortOpen}
                onToggle={() => {
                  setSortOpen((o) => !o);
                  setFilterOpen(false);
                }}
                onClose={() => setSortOpen(false)}
                icon={<ArrowDownUp className="w-4 h-4" />}
                label={SORT_OPTIONS.find((o) => o.key === sort)!.label}
                options={SORT_OPTIONS}
                selectedKey={sort}
                onSelect={(k) => setSort(k as SessionSort)}
              />
            </div>
          </PageHeader>

          <GlassCard className="fade-rise" style={{ animationDelay: "120ms" }}>
            <div className="p-6 border-b border-border">
              <h3>Previous Conversations</h3>
              <p className="text-sm text-muted-foreground mt-1">Your chat history with Menu Gap AI</p>
            </div>

            <div className="divide-y divide-border">
              {visibleSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full p-6 transition-colors text-left ${
                    selectedSession?.id === session.id
                      ? "bg-[#F4ECE3]"
                      : "hover:bg-[#FCF8F3]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className="relative w-10 h-10 rounded-full bg-[#7F5539] flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm truncate">{session.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {session.timestamp}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {loadingSessionId === session.id ? "Loading conversation…" : session.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {sessionsLoading && sessions.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-sm text-muted-foreground">Loading conversations…</p>
                </div>
              )}

              {!sessionsLoading && sessions.length > 0 && visibleSessions.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No conversations match the current search or filter.
                  </p>
                </div>
              )}

              {!sessionsLoading && sessions.length === 0 && (
                <div className="p-12 text-center">
                  <div className="relative w-14 h-14 mx-auto mb-4">
                    <div className="relative w-14 h-14 rounded-full bg-[#7F5539] flex items-center justify-center shadow-[0_4px_12px_rgba(127,85,57,0.25)]">
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h4 className="mb-2">No conversations yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a new session to get AI-powered menu recommendations
                  </p>
                  <button
                    onClick={handleNewSession}
                    className="px-4 py-2 bg-[#7F5539] text-white rounded-lg hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(127,85,57,0.25)]"
                    style={{ fontWeight: 600 }}
                  >
                    Start Your First Conversation
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {selectedSession && (
        <div className="w-[480px] bg-[#F2EAD9] border-l border-[#E7DED2] flex flex-col fade-rise">
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
                  className="px-3 py-2 text-sm border border-[#E7DED2] bg-[#FCF8F3] rounded-lg hover:bg-[#F4ECE3] hover:border-[#E7DED2] transition-all"
                >
                  Should I add...
                </button>
                <button
                  onClick={() => setInput("Should I remove ")}
                  className="px-3 py-2 text-sm border border-[#E7DED2] bg-[#FCF8F3] rounded-lg hover:bg-[#F4ECE3] hover:border-[#E7DED2] transition-all"
                >
                  Should I remove...
                </button>
                <button
                  onClick={() => setInput("Is my pricing correct for ")}
                  className="px-3 py-2 text-sm border border-[#E7DED2] bg-[#FCF8F3] rounded-lg hover:bg-[#F4ECE3] hover:border-[#E7DED2] transition-all"
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
                  <div className="relative w-14 h-14 mx-auto mb-4">
                    <div className="relative w-14 h-14 rounded-full bg-[#7F5539] flex items-center justify-center shadow-[0_4px_12px_rgba(127,85,57,0.25)]">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                  </div>
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
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-[#7F5539] text-white shadow-[0_4px_12px_rgba(127,85,57,0.25)]"
                        : "border border-[#E7DED2] bg-[#FCF8F3] text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownMessage content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="border border-[#E7DED2] bg-[#FCF8F3] px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#B08968] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[#B08968] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[#B08968] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border">
            {creatingSession && (
              <div className="mb-2 text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Creating session…
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about a dish or menu strategy..."
                className="flex-1 px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#B08968]/40 focus:border-[#B08968] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-[#7F5539] text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-[0_4px_12px_rgba(127,85,57,0.25)]"
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

const STREAM_CHUNK_DELAY_MS = 25;

function tokenize(text: string): string[] {
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

// ─────────────────────────────────────────────────────────────────────────────
// Session list — search / filter / sort
// ─────────────────────────────────────────────────────────────────────────────

type SessionFilter = "all" | "recent" | "older";
type SessionSort = "newest" | "oldest" | "title";

const FILTER_OPTIONS: { key: SessionFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recent", label: "Last 7 days" },
  { key: "older", label: "Older" },
];

const SORT_OPTIONS: { key: SessionSort; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "title", label: "Title A→Z" },
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function applyFilterAndSort(
  sessions: ChatSession[],
  query: string,
  filter: SessionFilter,
  sort: SessionSort
): ChatSession[] {
  const q = query.trim().toLowerCase();
  const now = Date.now();

  const filtered = sessions.filter((s) => {
    if (q) {
      const hay = `${s.title} ${s.lastMessage}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filter !== "all") {
      const time = parseTime(s.updatedAt);
      // Undated sessions can't be classified into recent/older.
      if (time == null) return false;
      const ageMs = now - time;
      if (filter === "recent" && ageMs > SEVEN_DAYS_MS) return false;
      if (filter === "older" && ageMs <= SEVEN_DAYS_MS) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (sort === "title") {
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
    const ta = parseTime(a.updatedAt) ?? 0;
    const tb = parseTime(b.updatedAt) ?? 0;
    return sort === "newest" ? tb - ta : ta - tb;
  });
  return sorted;
}

function parseTime(iso: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

interface DropdownOption {
  key: string;
  label: string;
}

function DropdownButton({
  open,
  onToggle,
  onClose,
  icon,
  label,
  options,
  selectedKey,
  onSelect,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: React.ReactNode;
  label: string;
  options: DropdownOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="px-4 py-2.5 border border-[#E7DED2] bg-[#FCF8F3] rounded-lg hover:bg-[#F4ECE3] transition-colors flex items-center gap-2 text-sm"
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
          <div className="absolute right-0 top-full mt-1 w-44 glass-strong rounded-lg border border-[#E7DED2] z-50 py-1">
            {options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onSelect(opt.key);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-[#F4ECE3] transition-colors flex items-center justify-between ${
                  selectedKey === opt.key ? "text-[#B08968]" : "text-foreground"
                }`}
                style={{ fontWeight: selectedKey === opt.key ? 600 : 500 }}
              >
                {opt.label}
                {selectedKey === opt.key && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B08968]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
