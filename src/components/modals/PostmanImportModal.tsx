import React, { useState } from 'react';
import {
  parsePostmanCollectionJson,
  PostmanFolder,
} from '../../data/postmanCollection';
import { FileCode, Upload, Check, AlertCircle, X, RotateCcw } from 'lucide-react';

interface PostmanImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (folders: PostmanFolder[], metadata: any) => void;
}

export const PostmanImportModal: React.FC<PostmanImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    totalEndpoints: number;
    categoriesCount: number;
    name: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleValidate = (text: string) => {
    setJsonInput(text);
    setErrorMsg('');
    setParsedPreview(null);

    if (!text.trim()) return;

    try {
      const result = parsePostmanCollectionJson(text);
      if (result.metadata.totalEndpoints === 0) {
        setErrorMsg('Valid JSON detected, but no request items were found in the collection.');
      } else {
        setParsedPreview({
          totalEndpoints: result.metadata.totalEndpoints,
          categoriesCount: result.metadata.categoriesCount,
          name: result.metadata.name,
        });
      }
    } catch (err: any) {
      setErrorMsg(`Invalid JSON schema: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleValidate(content);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    try {
      const result = parsePostmanCollectionJson(jsonInput);
      onImportSuccess(result.folders, result.metadata);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message}`);
    }
  };

  const handleLoadDefaultAttached = async () => {
    try {
      const res = await fetch('/postman_collection.json');
      const text = await res.text();
      handleValidate(text);
    } catch {
      setErrorMsg('Could not read default /postman_collection.json');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#191C20] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
                Import Postman Collection JSON
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste raw v2.1.0 collection JSON or upload exported file
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Collection JSON Payload
            </label>
            <button
              onClick={handleLoadDefaultAttached}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Multi-Handler API Template</span>
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => handleValidate(e.target.value)}
            placeholder='Paste {"info": {...}, "item": [...]} here...'
            className="w-full h-56 text-xs font-mono p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />

          {/* File Upload drag/button */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              <Upload className="w-4 h-4 text-orange-500" />
              <span>Choose .json file</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {parsedPreview && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>
                  Ready: {parsedPreview.name} ({parsedPreview.totalEndpoints} endpoints in {parsedPreview.categoriesCount} categories)
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyImport}
            disabled={!parsedPreview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply &amp; Load Collection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
