import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, RefreshCw, Copy, Check, MessageSquare, Zap, Shield, BookOpen } from 'lucide-react';
import { askGroqDesktop } from '../lib/groqService';

interface Message {
  id: string;
  sender: 'user' | 'uni';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'uni',
    text: "Bonjour ! Je suis Uni, ton intelligence artificielle et copilote académique officiel UniFlow, développé par l'équipe KERNEL FORGE à l'Université de Yaoundé I. Je tourne à pleine vitesse grâce au moteur Groq Llama 3.3 70B. Comment puis-je t'aider aujourd'hui ?",
    time: '12:00',
  },
];

const QUICK_PROMPTS = [
  "Résume le théorème CAP et le consensus Raft",
  "Comment fonctionne l'émargement SHA-256 sans triche ?",
  "Génère un plan de révision pour l'examen d'Algorithmique",
  "Qui sont les fondateurs de KERNEL FORGE et UniFlow ?",
];

export function DesktopAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!contentToSend) setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      const reply = await askGroqDesktop([
        ...history,
        { role: 'user', content: text },
      ]);

      const uniMsg: Message = {
        id: `uni-${Date.now()}`,
        sender: 'uni',
        text: reply,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, uniMsg]);
    } catch (err) {
      console.error('Erreur Groq Desktop:', err);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'uni',
        text: "Désolé, une petite interruption est survenue lors de la communication avec le moteur Groq. Vérifiez votre connexion Internet locale ou la clé d'API.",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-slate-100">
      {/* Header bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101E33] via-[#142A4A] to-[#101E33] border border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="/mascot/uni_ai_3d.png"
              alt="Mascotte Uni"
              className="h-14 w-14 object-contain drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/brand/icon-192.png';
              }}
            />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#101E33] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Uni — Copilote IA Académique</h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono text-[10px] font-bold">
                Groq Llama 3.3 70B
              </span>
            </div>
            <p className="text-xs text-blue-200/80">
              Assistance académique intelligente, révision d'examen et réponses instantanées pour les étudiants et enseignants de l'UY1.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> 500+ tokens/sec
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono">
            <Shield className="h-3.5 w-3.5 text-emerald-400" /> Prompt Sécurisé
          </span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 rounded-2xl bg-[#0B1524] border border-[#1E293B] flex flex-col overflow-hidden">
        {/* Messages scroll list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUni = m.sender === 'uni';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isUni ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {isUni ? (
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] p-1 flex items-center justify-center shadow-md">
                    <img src="/mascot/uni_ai_3d.png" alt="Uni" className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                    VOUS
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    isUni
                      ? 'bg-[#101E33] border border-[#1E293B] text-slate-200'
                      : 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 opacity-60 text-[10px]">
                    <span className="font-bold">{isUni ? 'Uni (Mascotte KERNEL FORGE)' : 'Vous'}</span>
                    <span>{m.time}</span>
                  </div>

                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {isUni && (
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-end">
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier la réponse"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] p-1 flex items-center justify-center shadow-md animate-pulse">
                <img src="/mascot/uni_ai_3d.png" alt="Uni" className="h-full w-full object-contain" />
              </div>
              <div className="rounded-2xl p-4 bg-[#101E33] border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                <span>Uni réfléchit avec le moteur Groq Llama 3.3 70B…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt pills */}
        <div className="px-5 py-2.5 bg-[#081220] border-t border-[#1E293B] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Suggestions :</span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800 text-slate-300 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-4 bg-[#0A1628] border-t border-[#1E293B]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Posez une question sur vos cours, vos examens ou l'Université de Yaoundé I…"
              className="flex-1 rounded-xl bg-[#081220] border border-slate-700 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
