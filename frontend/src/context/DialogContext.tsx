"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type DialogType = "confirm" | "alert" | "prompt";
type DialogSeverity = "info" | "warning" | "danger" | "success";

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: DialogSeverity;
  defaultValue?: string;
  placeholder?: string;
  inputType?: string;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: DialogOptions) => Promise<void>;
  prompt: (options: DialogOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<DialogType>("alert");
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [resolvePromise, setResolvePromise] = useState<((value: any) => void) | null>(null);

  const showDialog = useCallback((type: DialogType, options: DialogOptions) => {
    setType(type);
    setOptions(options);
    setInputValue(options.defaultValue || "");
    setIsOpen(true);
    return new Promise<any>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const confirm = (options: DialogOptions) => showDialog("confirm", options);
  const alert = (options: DialogOptions) => showDialog("alert", options);
  const prompt = (options: DialogOptions) => showDialog("prompt", options);

  const handleClose = (result: boolean | string | null) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(result);
      setResolvePromise(null);
    }
  };

  const getSeverityStyles = (severity: DialogSeverity = "info") => {
    switch (severity) {
      case "danger": return "border-red-500/50 shadow-red-500/20";
      case "warning": return "border-amber-500/50 shadow-amber-500/20";
      case "success": return "border-emerald-500/50 shadow-emerald-500/20";
      default: return "border-yellow-500/50 shadow-yellow-500/20"; // Gold theme
    }
  };

  const getButtonStyles = (severity: DialogSeverity = "info") => {
    switch (severity) {
      case "danger": return "bg-red-600 hover:bg-red-500 shadow-red-900/40";
      case "warning": return "bg-amber-600 hover:bg-amber-500 shadow-amber-900/40";
      case "success": return "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40";
      default: return "bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/40";
    }
  };

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}

      {/* Premium Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => type === 'alert' && handleClose(true)}
          />
          
          <div className={`relative w-full max-w-md bg-zinc-900/90 border-2 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 ${getSeverityStyles(options?.severity)}`}>
            {/* Glossy Header Highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="p-6">
              {options?.title && (
                <h3 className="text-xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
                   {options.severity === 'danger' && <span className="text-red-500">⚠</span>}
                   {options.severity === 'warning' && <span className="text-amber-500">⚠</span>}
                   {options.title}
                </h3>
              )}
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap mb-4">
                {options?.message}
              </p>

              {type === "prompt" && (
                <input
                  autoFocus
                  type={options?.inputType || "text"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={options?.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClose(inputValue);
                    if (e.key === "Escape") handleClose(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 outline-none focus:border-yellow-500/50 transition-all font-medium"
                />
              )}
            </div>

            <div className="p-4 bg-zinc-950/50 flex justify-end gap-3 border-t border-zinc-800">
              {(type === "confirm" || type === "prompt") && (
                <button
                  onClick={() => handleClose(type === "confirm" ? false : null)}
                  className="px-5 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all font-medium"
                >
                  {options?.cancelText || "Vazgeç"}
                </button>
              )}
              <button
                onClick={() => handleClose(type === "prompt" ? inputValue : true)}
                className={`px-6 py-2 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95 ${getButtonStyles(options?.severity)}`}
              >
                {options?.confirmText || (type === "confirm" ? "Onayla" : type === "prompt" ? "Tamam" : "Tamam")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
