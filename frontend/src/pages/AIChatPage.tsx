import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareCode, Send, Sparkles, Database, Trash2, Copy,
  Check, Download, Bot, User as UserIcon, ArrowRight, CornerDownLeft,
  Lightbulb, RefreshCw
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../services/api';
import type { AIChatMessage } from '../types';

export const AIChatPage: React.FC = () => {
  const { activeDataset, profile } = useDataset();
  const { user } = useAuth();

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterSuggestions = [
    "Give me an executive dataset summary",
    "What are the top drivers and correlations?",
    "Which entities or segments perform best?",
    "What are the unusual records and anomalies?",
    "Forecast future trajectory and momentum",
    "What is the overall data quality health score?"
  ];

  useEffect(() => {
    if (activeDataset) {
      loadHistory(activeDataset.id);
    }
  }, [activeDataset?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async (datasetId: number) => {
    try {
      const hist = await chatApi.getHistory(datasetId);
      if (hist && hist.length > 0) {
        setMessages(hist);
      } else {
        setMessages([
          {
            id: 1,
            sender: 'ai',
            content: `👋 Hello **${user?.name || 'Analyst'}**! I am your AI DataSense copilot.\n\nI have indexed **${activeDataset?.name || 'your dataset'}** (${activeDataset?.rows.toLocaleString()} records, ${activeDataset?.columns} feature dimensions, **${activeDataset?.domain || 'Universal'}** domain).\n\nYou can ask me natural language questions to compute metrics, test hypotheses, identify anomalies, or uncover patterns.`,
            created_at: new Date().toISOString(),
            metadata_json: {
              suggested_queries: starterSuggestions.slice(0, 3)
            }
          }
        ]);
      }
    } catch {
      // Default greeting
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: Date.now(),
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await chatApi.sendMessage({
        message: text,
        dataset_id: activeDataset?.id,
        session_id: sessionId
      });

      setSessionId(res.session_id);

      const aiMsg: AIChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: res.message,
        created_at: new Date().toISOString(),
        metadata_json: {
          suggested_queries: res.suggested_queries,
          related_metrics: res.related_metrics
        }
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: AIChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: "⚠️ I encountered an error while calculating dataset inferences. Please try rephrasing your question.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearHistory = async () => {
    if (activeDataset) {
      try {
        await chatApi.clearHistory(activeDataset.id);
        setMessages([]);
        loadHistory(activeDataset.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExportChat = () => {
    const content = messages.map(m => `[${m.sender.toUpperCase()}] ${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_DataSense_Chat_${activeDataset?.name || 'Export'}.md`;
    a.click();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-in-scale">
      {/* Left Drawer: Dataset Context & Suggestions */}
      <div className="hidden lg:flex w-80 flex-col glass-card p-5 overflow-y-auto justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Database className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-white text-sm">
              Active Context
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#07090E]/80 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
              <span className="truncate max-w-[140px]">{activeDataset?.name || "Active Dataset"}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                {profile?.data_quality_score || 94}% Health
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <div>Records: <strong className="text-white">{activeDataset?.rows.toLocaleString()}</strong></div>
              <div>Columns: <strong className="text-white">{activeDataset?.columns}</strong></div>
              <div>Domain: <strong className="text-purple-300 uppercase font-sans">{activeDataset?.domain || 'Universal'}</strong></div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-purple-400" /> Starter Queries
            </h3>
            <div className="space-y-1.5">
              {starterSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-purple-600/15 border border-white/[0.04] hover:border-purple-500/30 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{s}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <button
            onClick={handleExportChat}
            className="w-full py-2 px-3 btn-ai-secondary text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Chat (.md)
          </button>
          <button
            onClick={handleClearHistory}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                ✦ AI DataSense Copilot
                <span className="text-[9px] font-bold px-2 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  Online
                </span>
              </h2>
              <p className="text-xs text-slate-400">Grounded mathematical computations & verified dataset insights</p>
            </div>
          </div>

          <button
            onClick={() => handleSendMessage("Give me a comprehensive executive dataset synthesis")}
            className="btn-ai-secondary px-3 py-1.5 text-xs font-bold hidden sm:flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Executive Summary
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                  : 'bg-[#07090E] text-purple-400 border border-purple-500/30'
              }`}>
                {msg.sender === 'user' ? (user?.name ? user.name[0] : 'U') : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-4 rounded-3xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'btn-ai-primary rounded-tr-none text-white'
                    : 'bg-[#0D111A]/90 border border-white/[0.08] text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}>
                  {msg.content}
                </div>

                {/* Metrics Pill Preview if attached */}
                {msg.metadata_json?.related_metrics && Object.keys(msg.metadata_json.related_metrics).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(msg.metadata_json.related_metrics).map(([k, v], mIdx) => (
                      <div key={mIdx} className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-300">
                        <span className="capitalize text-slate-400">{k.replace(/_/g, ' ')}:</span> <strong>{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested follow-up buttons */}
                {msg.metadata_json?.suggested_queries && msg.metadata_json.suggested_queries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.metadata_json.suggested_queries.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSendMessage(q)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-purple-600/20 text-[11px] text-slate-300 hover:text-white border border-white/[0.06] hover:border-purple-500/30 transition-colors"
                      >
                        {q} →
                      </button>
                    ))}
                  </div>
                )}

                {/* Copy Button */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-md items-center">
              <div className="w-8 h-8 rounded-xl bg-[#07090E] text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0D111A] border border-white/[0.08] text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Computing dataset metrics and synthesizing insight...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/[0.06] bg-[#07090E]/60">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2 bg-[#0D111A] border border-white/[0.08] rounded-2xl p-2 focus-within:border-purple-500/50 transition-all"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about your data (e.g. 'Which student scored highest in Mathematics?')..."
              className="flex-1 px-3 py-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-xl btn-ai-primary disabled:opacity-40 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
