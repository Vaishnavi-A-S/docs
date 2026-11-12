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
      color: '#97c2f8',
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
      color: '#c084fc',
      generate: () => `
        <h3>Autonomous Agent Standard Operating Procedure (SOP)</h3>
        <p>This specification defines stateful agent orchestration using deterministic transition guarantees:</p>
        <ul>
          <li><strong>Trigger Condition:</strong> New unstructured technical specification uploaded to workspace repository.</li>
          <li><strong>Agent Sub-tasks:</strong>
            <ol>
              <li><em>Parser Agent:</em> Ingests Markdown/HTML artifacts into structured token representations.</li>
              <li><em>Validation Agent:</em> Evaluates schema invariants against production compliance rules.</li>
              <li><em>Synthesis Agent:</em> Emits auditable pull-request summaries and change notes.</li>
            </ol>
          </li>
          <li><strong>Human-in-the-loop Boundary:</strong> Any destructive state change or production deployment requires explicit cryptographic sign-off.</li>
        </ul>
      `
    },
    {
      id: 'enablement-roadmap',
      title: 'Workforce Enablement Roadmap',
      desc: 'Structures team upskilling, prompt engineering guidelines, and adoption phases',
      icon: Brain,
      color: '#f59e0b',
      generate: () => `
        <h3>Enterprise Workforce Enablement & AI Upskilling Plan</h3>
        <p>Ajaia's organizational readiness blueprint ensures engineering teams safely harness AI acceleration:</p>
        <ul>
          <li><strong>Phase 1: Foundation (Weeks 1-2):</strong> Practical prompt engineering, test-driven validation, and sandboxed AI prototyping.</li>
          <li><strong>Phase 2: Agent Integration (Weeks 3-6):</strong> Autonomous task delegators, evaluation harnesses, and continuous verification loops.</li>
          <li><strong>Phase 3: Scale & Governance (Weeks 7+):</strong> Cross-functional centers of excellence, telemetry, and automated token cost controls.</li>
        </ul>
      `
    }
  ];

  const handleRunWorkflow = (workflow: typeof ajaiaWorkflows[0]) => {
    setIsGenerating(true);
    setActiveActionLabel(workflow.title);
    setGeneratedResult(null);

    setTimeout(() => {
      setGeneratedResult(workflow.generate());
      setIsGenerating(false);
    }, 600);
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setActiveActionLabel(`Prompt: "${customPrompt.slice(0, 30)}..."`);
    setGeneratedResult(null);

    setTimeout(() => {
      setGeneratedResult(`
        <h3>Ajaia Copilot Synthesis</h3>
        <p><em>Generated in response to: "${customPrompt}"</em></p>
        <p>Based on current deliverable context (<strong>${documentTitle}</strong>):</p>
        <ul>
          <li><strong>Strategic Recommendation:</strong> Align proposed changes with core performance and reliability metrics.</li>
          <li><strong>Architectural Observation:</strong> Decouple client orchestration from backend persistence using explicit schema contracts.</li>
          <li><strong>Next Step:</strong> Review with engagement leads and record verification test snapshots.</li>
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
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#001244] shadow-2xl border-l border-[#97c2f8]/30 z-50 flex flex-col animate-in slide-in-from-right duration-200 select-none font-sans text-[#f1f7ff]">
      {/* Header */}
      <div className="p-4 bg-[#00091f] text-white flex items-center justify-between border-b border-[#97c2f8]/20 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#001d6b] via-[#1a73e8] to-[#97c2f8] border border-[#97c2f8]/40 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">Ajaia Copilot</h2>
              <span className="bg-[#001d6b] text-[#97c2f8] text-[10px] font-semibold px-2 py-0.2 rounded-full border border-[#97c2f8]/30">
                Enterprise AI
              </span>
            </div>
            <p className="text-[11px] text-[#aebfe2]">Strategy, Engineering & Workflow Enablement</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#aebfe2] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Document Context Chip */}
        <div className="p-2.5 bg-[#00091f] rounded-xl border border-[#97c2f8]/20 text-xs flex items-center justify-between">
          <span className="text-[#aebfe2] truncate max-w-[240px]">
            Target: <strong>{documentTitle}</strong>
          </span>
          <span className="text-[10px] font-semibold text-[#97c2f8] bg-[#001d6b] px-2 py-0.5 rounded-full border border-[#97c2f8]/30">
            Active Canvas
          </span>
        </div>

        {/* 1. Quick One-Click Ajaia Workflows */}
        <div>
          <h3 className="text-[11px] font-bold text-[#97c2f8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#97c2f8]" />
            <span>Consulting & Engineering Workflows</span>
          </h3>

          <div className="space-y-2">
            {ajaiaWorkflows.map(flow => {
              const Icon = flow.icon;
              return (
                <button
                  key={flow.id}
                  onClick={() => handleRunWorkflow(flow)}
                  disabled={isGenerating}
                  className="w-full text-left p-3 rounded-xl bg-[#00091f]/80 hover:bg-[#001d6b]/60 border border-[#97c2f8]/20 hover:border-[#97c2f8] transition-all group disabled:opacity-50"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="p-2 rounded-lg bg-[#001d6b] border border-[#97c2f8]/30 shrink-0 group-hover:scale-105 transition-transform"
                      style={{ color: flow.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#f1f7ff] group-hover:text-[#97c2f8] transition-colors">
                        {flow.title}
                      </p>
                      <p className="text-[11px] text-[#aebfe2] leading-relaxed mt-0.5">
                        {flow.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Custom Prompt Input */}
        <div className="pt-2">
          <h3 className="text-[11px] font-bold text-[#97c2f8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#97c2f8]" />
            <span>Custom Intelligence Prompt</span>
          </h3>

          <form onSubmit={handleCustomPromptSubmit} className="relative">
            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="e.g. Expand section 3 with fault tolerance guarantees or add a deployment checklist..."
              rows={3}
              className="w-full bg-[#00091f] text-xs text-[#f1f7ff] rounded-xl border border-[#97c2f8]/30 focus:border-[#97c2f8] focus:ring-1 focus:ring-[#97c2f8] p-3 pr-10 focus:outline-none transition-all placeholder:text-[#aebfe2]/50 resize-none"
            />
            <button
              type="submit"
              disabled={!customPrompt.trim() || isGenerating}
              className="absolute right-2.5 bottom-3.5 p-1.5 bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#00091f] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              title="Send to Copilot"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 3. Generating Indicator */}
        {isGenerating && (
          <div className="p-4 bg-[#00091f] border border-[#97c2f8]/30 rounded-xl text-center space-y-2">
            <div className="inline-flex p-2 rounded-full bg-[#001d6b] text-[#97c2f8] animate-spin">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#f1f7ff]">
              Ajaia Intelligence is synthesizing {activeActionLabel}...
            </p>
            <p className="text-[11px] text-[#aebfe2]">
              Benchmarking against enterprise guidelines & security posture
            </p>
          </div>
        )}

        {/* 4. Generated Preview & Action Bar */}
        {generatedResult && !isGenerating && (
          <div className="bg-[#00091f] border border-[#97c2f8]/30 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-bold text-[#97c2f8] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#97c2f8]" />
                Generated Output
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 text-[#aebfe2] hover:text-[#97c2f8] rounded-md transition-colors text-[10px] flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div
              className="text-xs text-[#f1f7ff] max-h-48 overflow-y-auto pr-1 leading-relaxed prose prose-invert prose-xs"
              dangerouslySetInnerHTML={{ __html: generatedResult }}
            />

            {/* Insert Action Button */}
            <button
              onClick={handleInsert}
              className="w-full bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#00091f] font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Insert Directly into Document Canvas</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Strip */}
      <div className="p-3 bg-[#00091f] border-t border-[#97c2f8]/20 flex items-center justify-between text-[11px] text-[#aebfe2]">
        <span>Ajaia Enterprise Engine v2.4</span>
        <span className="text-[#97c2f8]">Deterministic & Auditable</span>
      </div>
    </div>
  );
};
