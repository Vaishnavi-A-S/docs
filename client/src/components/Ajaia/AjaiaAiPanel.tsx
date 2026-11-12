import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Check,
  ShieldCheck,
  Zap,
  FileCheck,
  TrendingUp,
  Brain,
  Copy,
  PlusCircle,
  Cpu
} from 'lucide-react';

interface AjaiaAiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentContent: string;
  onInsertContent: (htmlToInsert: string) => void;
}

export const AjaiaAiPanel: React.FC<AjaiaAiPanelProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentContent,
  onInsertContent
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [activeActionLabel, setActiveActionLabel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Pre-configured AI Actions specifically tailored to Ajaia's Consulting & Engineering Workflows
  const ajaiaWorkflows = [
    {
      id: 'exec-summary',
      title: 'Draft Executive Summary',
      desc: 'Synthesizes enterprise ROI and business outcomes for C-suite stakeholders',
      icon: TrendingUp,
      color: '#1a73e8',
      generate: () => `
        <h3>Executive Summary & Business Impact</h3>
        <p>This initiative leverages <strong>Ajaia's Production AI Framework</strong> to streamline operational workflows and eliminate manual processing overhead. By transitioning from isolated pilots to governed enterprise infrastructure, the organization unlocks:</p>
        <ul>
          <li><strong>40%+ Operational Efficiency:</strong> Automated document ingestion and semantic routing.</li>
          <li><strong>Deterministic Governance:</strong> End-to-end auditability conforming to SOC 2 and industry compliance.</li>
          <li><strong>Vendor Independence:</strong> Multi-model gateway orchestrating between top LLMs without single-provider lock-in.</li>
        </ul>
      `
    },
    {
      id: 'compliance-audit',
      title: 'HIPAA & Enterprise Compliance Audit',
      desc: 'Scans architecture against regulated healthcare and data perimeter standards',
      icon: ShieldCheck,
      color: '#0d9488',
      generate: () => `
        <h3>Security, Governance & Compliance Posture</h3>
        <p>In accordance with <strong>Ajaia's Enterprise Security Guidelines</strong>, the following protective boundaries are enforced:</p>
        <ol>
          <li><strong>Zero-Retention Data Perimeter:</strong> Downstream model APIs operate with contractually guaranteed zero training retention.</li>
          <li><strong>PII / PHI Redaction Filter:</strong> Sensitive healthcare identifiers are obfuscated at the API ingress layer before inference.</li>
          <li><strong>Role-Based Access Control:</strong> Strict segregation of duties between Owner, Editor, and Viewer principals.</li>
        </ol>
      `
    },
    {
      id: 'agentic-sop',
      title: 'Generate Agentic SOP Specification',
      desc: 'Formulates multi-agent triggers, tools, and human-in-the-loop checkpoints',
      icon: Cpu,
      color: '#9333ea',
      generate: () => `
        <h3>Autonomous Workflow SOP (Standard Operating Procedure)</h3>
        <p><strong>Trigger Condition:</strong> New client proposal or unstructured document uploaded to secure storage.</p>
        <ul>
          <li><strong>Agent 1 (Parser):</strong> Deconstructs PDF tables and footnotes into structured JSON schemas.</li>
          <li><strong>Agent 2 (Evaluator):</strong> Checks data consistency against enterprise historical knowledge bases.</li>
          <li><strong>Agent 3 (Synthesizer):</strong> Generates formatted client deliverable and notifies engagement lead.</li>
        </ul>
        <blockquote><strong>Human-in-the-Loop Checkpoint:</strong> Requires verified team member sign-off before client dissemination.</blockquote>
      `
    },
    {
      id: 'enablement-plan',
      title: 'Workforce Enablement & Training Plan',
      desc: 'Structures rollout milestones and team prompt engineering curricula',
      icon: Brain,
      color: '#ea580c',
      generate: () => `
        <h3>Workforce Enablement & Training Roadmap</h3>
        <p>To ensure measurable adoption across operational units, Ajaia recommends a 4-week structured enablement sprint:</p>
        <ul>
          <li><strong>Week 1 — AI Literacy & Governance:</strong> Safe tool usage, prompt engineering fundamentals, and data boundaries.</li>
          <li><strong>Week 2 — Daily Workflow Integration:</strong> Embedding internal copilots into departmental routines.</li>
          <li><strong>Week 3 — Advanced Agent Orchestration:</strong> Training power users on custom workflow builders.</li>
          <li><strong>Week 4 — ROI Measurement & Continuous Feedback:</strong> Evaluating team velocity against baseline benchmarks.</li>
        </ul>
      `
    }
  ];

  const handleRunWorkflow = (workflow: typeof ajaiaWorkflows[0]) => {
    setIsGenerating(true);
    setActiveActionLabel(workflow.title);
    setGeneratedResult(null);

    // Simulate intelligent generative processing
    setTimeout(() => {
      setGeneratedResult(workflow.generate());
      setIsGenerating(false);
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setActiveActionLabel(`Custom: "${customPrompt.slice(0, 30)}..."`);
    setGeneratedResult(null);

    setTimeout(() => {
      setGeneratedResult(`
        <h3>Ajaia AI Analysis: ${customPrompt}</h3>
        <p>Based on our enterprise delivery models at Ajaia LLC, we recommend structuring this workstream with explicit deliverables, measurable business impact metrics, and role-based operational ownership.</p>
        <ul>
          <li><strong>Immediate Milestone:</strong> Finalize functional scope and data boundary constraints.</li>
          <li><strong>Target Outcome:</strong> 3x increase in team authoring speed and client satisfaction.</li>
        </ul>
      `);
      setIsGenerating(false);
      setCustomPrompt('');
    }, 800);
  };

  const handleInsert = () => {
    if (!generatedResult) return;
    onInsertContent(generatedResult);
    setGeneratedResult(null);
    onClose();
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.replace(/<[^>]+>/g, '\n').trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-200 select-none font-sans">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">Ajaia Copilot</h2>
              <span className="bg-blue-500/30 text-blue-300 text-[10px] font-semibold px-2 py-0.2 rounded-full border border-blue-400/30">
                Enterprise AI
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Strategy, Engineering & Workflow Enablement</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {/* Custom Ask AI Form */}
        <form onSubmit={handleCustomSubmit} className="relative">
          <input
            type="text"
            placeholder="Ask Ajaia AI to draft, review, or refine..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="w-full text-xs pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:bg-white transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={!customPrompt.trim() || isGenerating}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Generated Output Card */}
        {isGenerating && (
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-blue-700 font-semibold">
              <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              <span>Ajaia AI is analyzing document context and formulating deliverable...</span>
            </div>
            <div className="h-2 bg-blue-200 rounded w-3/4" />
            <div className="h-2 bg-blue-200 rounded w-5/6" />
          </div>
        )}

        {generatedResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {activeActionLabel}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 text-[11px] flex items-center gap-1"
                  title="Copy text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div
              className="text-xs text-slate-700 space-y-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 max-h-60 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: generatedResult }}
            />

            <button
              onClick={handleInsert}
              className="w-full py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Insert into Document Canvas</span>
            </button>
          </div>
        )}

        {/* Specialized Ajaia Workflows */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Ajaia Enterprise Workflows
          </p>

          <div className="space-y-2">
            {ajaiaWorkflows.map(wf => {
              const Icon = wf.icon;
              return (
                <button
                  key={wf.id}
                  onClick={() => handleRunWorkflow(wf)}
                  disabled={isGenerating}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3 group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: wf.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#1a73e8] transition-colors">
                      {wf.title}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{wf.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Company Tenet Card */}
        <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl text-[11px] space-y-1 shadow-xs">
          <p className="font-semibold text-blue-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Ajaia Delivery Principle:
          </p>
          <p className="text-slate-300 leading-relaxed">
            Move clients from ungrounded AI pilots to verifiable, scalable systems with clear operational leverage.
          </p>
        </div>
      </div>
    </div>
  );
};
