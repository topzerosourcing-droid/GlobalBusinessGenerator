import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Save, 
  RotateCw, 
  Loader2, 
  Check, 
  Edit3, 
  Wand2, 
  AlertCircle,
  Code
} from 'lucide-react';
import { 
  BusinessPlanInput, 
  BusinessPlanSectionKey, 
  PLAN_SECTIONS_META 
} from '../types';

interface SectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: BusinessPlanSectionKey;
  initialContent: any;
  planInput: BusinessPlanInput;
  onSaveContent: (sectionKey: BusinessPlanSectionKey, newContent: any) => Promise<void> | void;
}

export const SectionEditModal: React.FC<SectionEditModalProps> = ({
  isOpen,
  onClose,
  sectionKey,
  initialContent,
  planInput,
  onSaveContent,
}) => {
  if (!isOpen) return null;

  const sectionMeta = PLAN_SECTIONS_META.find((s) => s.key === sectionKey);
  const sectionTitle = sectionMeta?.title || sectionKey;
  const sectionNumber = sectionMeta?.number;

  const [activeTab, setActiveTab] = useState<'editor' | 'ai-regenerate'>('editor');
  const [editorMode, setEditorMode] = useState<'structured' | 'json'>('structured');
  
  // Local state for content
  const [content, setContent] = useState<any>(initialContent);
  const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(initialContent, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // AI Revision states
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  const [regeneratedPreview, setRegeneratedPreview] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...content, [field]: value };
    setContent(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setContent(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError('Invalid JSON syntax: ' + e.message);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRegenerationError(null);
    try {
      const res = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: planInput,
          sectionKey,
          currentContent: content,
          customInstruction: customPrompt.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: Failed to regenerate section`);
      }

      const data = await res.json();
      setRegeneratedPreview(data.content);
    } catch (err: any) {
      console.error('Error regenerating section:', err);
      setRegenerationError(err?.message || 'Failed to regenerate section');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAcceptRegeneration = () => {
    if (regeneratedPreview) {
      setContent(regeneratedPreview);
      setJsonText(JSON.stringify(regeneratedPreview, null, 2));
      setRegeneratedPreview(null);
      setActiveTab('editor');
    }
  };

  const handleSave = async () => {
    if (jsonError) {
      alert('Please fix JSON syntax errors before saving.');
      return;
    }
    setIsSaving(true);
    try {
      await onSaveContent(sectionKey, content);
      onClose();
    } catch (err: any) {
      alert('Error saving section changes: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-extrabold text-xs text-white">
              {sectionNumber ? String(sectionNumber).padStart(2, '0') : '##'}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Edit Section: {sectionTitle}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Customized for {planInput.cityRegion}, {planInput.country} • Currency: {planInput.currency}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-2 bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'editor'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Direct Content Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-regenerate')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'ai-regenerate'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Revise & Regenerate</span>
            </button>
          </div>

          {activeTab === 'editor' && (
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setEditorMode('structured')}
                className={`rounded px-2 py-1 font-semibold ${
                  editorMode === 'structured' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Form Fields
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setEditorMode('json')}
                className={`rounded px-2 py-1 font-semibold ${
                  editorMode === 'json' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Raw JSON
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Tab 1: Editor */}
          {activeTab === 'editor' && (
            <div>
              {editorMode === 'json' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Directly modify section JSON parameters:</span>
                    {jsonError && <span className="text-red-600 font-semibold">{jsonError}</span>}
                  </div>
                  <textarea
                    rows={16}
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 font-mono text-xs p-4 leading-relaxed focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-slate-950 text-slate-100"
                  />
                </div>
              ) : (
                /* Structured Dynamic Field Editor */
                <div className="space-y-4">
                  {content && typeof content === 'object' && !Array.isArray(content) ? (
                    Object.entries(content).map(([key, val]) => {
                      const label = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase());

                      if (typeof val === 'string') {
                        const isLong = val.length > 80;
                        return (
                          <div key={key}>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              {label}
                            </label>
                            {isLong ? (
                              <textarea
                                rows={3}
                                value={val}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none leading-relaxed"
                              />
                            ) : (
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                              />
                            )}
                          </div>
                        );
                      }

                      if (typeof val === 'number') {
                        return (
                          <div key={key}>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              {label}
                            </label>
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                          </div>
                        );
                      }

                      if (Array.isArray(val)) {
                        const isArrayOfStrings = val.every((item) => typeof item === 'string');
                        if (isArrayOfStrings) {
                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                  {label} ({val.length} items)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleFieldChange(key, [...val, '']);
                                  }}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                  + Add Item
                                </button>
                              </div>
                              <div className="space-y-2">
                                {val.map((itemStr: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={itemStr}
                                      onChange={(e) => {
                                        const newArr = [...val];
                                        newArr[idx] = e.target.value;
                                        handleFieldChange(key, newArr);
                                      }}
                                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newArr = val.filter((_: any, i: number) => i !== idx);
                                        handleFieldChange(key, newArr);
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs px-2"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      }

                      return (
                        <div key={key} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                          <span className="text-xs font-bold text-slate-700 block mb-1">
                            {label} (Complex Object / List)
                          </span>
                          <p className="text-[11px] text-slate-500 mb-2">
                            Use Raw JSON mode above to modify this nested structure.
                          </p>
                          <pre className="text-[11px] bg-white p-2 rounded border border-slate-200 overflow-x-auto text-slate-700 max-h-32">
                            {JSON.stringify(val, null, 2)}
                          </pre>
                        </div>
                      );
                    })
                  ) : Array.isArray(content) ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase">
                          Items List ({content.length})
                        </span>
                        <span className="text-xs text-slate-400">Switch to Raw JSON for fine-grained edits</span>
                      </div>
                      <textarea
                        rows={10}
                        value={jsonText}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 font-mono text-xs p-4 leading-relaxed focus:border-indigo-600 outline-none bg-slate-950 text-slate-100"
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={String(content)}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: AI Revision */}
          {activeTab === 'ai-regenerate' && (
            <div className="space-y-5">
              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4">
                <div className="flex items-start gap-2.5">
                  <Wand2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                      Section Strategist & Generator
                    </h4>
                    <p className="text-xs text-indigo-900/80 mt-0.5 leading-relaxed">
                      Regenerate this specific section with enhanced regional depth or provide custom revision instructions below. Other sections of your business plan will remain completely unchanged.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Guidance Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Optional Revision Instructions (Custom Guidance)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Focus more on corporate B2B clients in Austin, include lower-cost local machinery alternatives, adjust Year 1 unit sales to be more conservative..."
                  className="w-full rounded-xl border border-slate-300 p-3.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none leading-relaxed"
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Leave blank for standard optimization</span>
                  <span>Will format directly to {planInput.currency}</span>
                </div>
              </div>

              {/* Regenerate Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Section Revision...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="h-4 w-4" />
                      <span>Regenerate Section {sectionNumber ? `#${sectionNumber}` : ''}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {regenerationError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{regenerationError}</span>
                </div>
              )}

              {/* Regenerated Preview */}
              {regeneratedPreview && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Section Generated Successfully</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAcceptRegeneration}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs"
                    >
                      Accept & Review in Editor
                    </button>
                  </div>
                  <pre className="text-xs font-mono bg-white p-3 rounded-lg border border-emerald-200 max-h-56 overflow-y-auto text-slate-800">
                    {JSON.stringify(regeneratedPreview, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !!jsonError}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Apply & Save Section</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
