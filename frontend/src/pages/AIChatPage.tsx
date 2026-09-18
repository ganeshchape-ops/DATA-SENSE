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
    "Which product has the highest sales?",
    "What is my total profit and margin?",
    "Show monthly sales trend and growth rate",
    "Which region performs best in revenue?",
    "What are the unusual records and anomalies?",
    "Predict next month's sales projection"
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
        // Initial AI greeting
        setMessages([
          {
            id: 1,
            sender: 'ai',
            content: `👋 Hello **${user?.name || 'Analyst'}**! I am your AI Data Sense assistant.\n\nI have indexed **${activeDataset?.name || 'your dataset'}** (${activeDataset?.rows.toLocaleString()} records, ${activeDataset?.columns} feature dimensions).\n\nYou can ask me anything about sales performance, profit margins, anomalies, regional distributions, or future forecasts.`,
            created_at: new Date().toISOString(),
            metadata_json: {
              suggested_queries: starterSuggestions.slice(0, 3)
            }
          }
        ]);
      }
    } catch {
      // Set default greeting
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
        content: "⚠️ I encountered an error while processing that dataset calculation. Please try phrasing your question differently.",
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
    a.download = `AI_Insight_Chat_${activeDataset?.name || 'Export'}.md`;
    a.click();
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-6 animate-in-scale">
      {/* Left Drawer: Dataset Intel */}
      <div className="hidden lg:flex w-80 flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs overflow-y-auto justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">
              Active Context
            </h2>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-bold">
              <span>{activeDataset?.name || "Enterprise Sales Model"}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                {profile?.data_quality_score || 94}% Health
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div>Records: <strong className="text-slate-800 dark:text-slate-200">{activeDataset?.rows.toLocaleString()}</strong></div>
              <div>Columns: <strong className="text-slate-800 dark:text-slate-200">{activeDataset?.columns}</strong></div>
              <div>Format: <strong className="text-slate-800 dark:text-slate-200 uppercase">{activeDataset?.file_type}</strong></div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Starter Queries
            </h3>
            <div className="space-y-1.5">
              {starterSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{s}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={handleExportChat}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Conversation (.md)
          </button>
          <button
            onClick={handleClearHistory}
            className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Chat History
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                AI DataSense Intelligent Copilot
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </h2>
              <p className="text-xs text-slate-400">Grounded statistical inferences & automated calculations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendMessage("Give me a comprehensive dataset summary with key insights")}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors hidden sm:flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Executive Summary
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                  : 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-cyan-300 border border-indigo-500/30'
              }`}>
                {msg.sender === 'user' ? (user?.name ? user.name[0] : 'U') : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`space-y-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-4 rounded-3xl text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none whitespace-pre-line'
                }`}>
                  {msg.content}
                </div>

                {/* Metrics Pill Preview if attached */}
                {msg.metadata_json?.related_metrics && Object.keys(msg.metadata_json.related_metrics).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(msg.metadata_json.related_metrics).map(([k, v], mIdx) => (
                      <div key={mIdx} className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                        <span className="capitalize text-slate-500">{k.replace(/_/g, ' ')}:</span> <strong>{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested follow up buttons */}
                {msg.metadata_json?.suggested_queries && msg.metadata_json.suggested_queries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.metadata_json.suggested_queries.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSendMessage(q)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
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
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-md items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-300 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>Computing dataset metrics and synthesizing insight...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about this dataset (e.g. 'Which product has highest sales?')..."
              className="flex-1 px-3 py-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            AI DataSense computes queries directly from verified numerical data in memory.
          </div>
        </div>
      </div>
    </div>
  );
};
