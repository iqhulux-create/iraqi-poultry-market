import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Smartphone, Layers, HelpCircle, ExternalLink } from 'lucide-react';
import { ANDROID_XML_TEMPLATES } from '../data/androidXmlTemplates';

interface AndroidXmlExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidXmlExporter: React.FC<AndroidXmlExporterProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = ANDROID_XML_TEMPLATES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = currentFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadAll = () => {
    // Generate an all-in-one text file bundle
    let fullBundle = `/*
  سوق الدواجن والطيور العراقي - حزمة كود أندرويد الكاملة (Android XML Code Bundle)
  تاريخ التوليد: ${new Date().toLocaleDateString('ar-IQ')}
  الألوان المعتمدة:
  - لون البراند الرئيسي (Eco-Green): #27AE60
  - الخلفية العامة (Soft Gray): #F8F9FA
  - الحاويات والبطاقات (White): #FFFFFF
  دعم كامل لمحاذاة RTL واللغة العربية
======================================================
*/\n\n`;

    ANDROID_XML_TEMPLATES.forEach((tpl) => {
      fullBundle += `\n/* =====================================================\n`;
      fullBundle += `   ملف: ${tpl.path}\n`;
      fullBundle += `   الوصف: ${tpl.description}\n`;
      fullBundle += `   ===================================================== */\n\n`;
      fullBundle += tpl.code + '\n\n';
    });

    const element = document.createElement('a');
    const file = new Blob([fullBundle], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'IraqiPoultryMarket_Android_Layouts.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl h-[92vh] flex flex-col overflow-hidden border border-slate-700/60 text-slate-100"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#27AE60]/20 text-[#27AE60] border border-[#27AE60]/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  مركز تصدير كود أندرويد XML الجاهز
                </h3>
                <span className="bg-[#27AE60] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Material 3 + RTL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تنسيقات XML مهيكلة بالكامل وجاهزة للنسخ أو الاستيراد المباشر في Android Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
              title="تحميل كافة الملفات في حزمة واحدة"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل الحزمة كاملة</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-64 bg-slate-950/70 border-b md:border-b-0 md:border-l border-slate-800 p-3 overflow-y-auto shrink-0 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 block">
              ملفات المشروع المتوفرة ({ANDROID_XML_TEMPLATES.length})
            </span>
            {ANDROID_XML_TEMPLATES.map((item, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={item.name}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-right ${
                    isSelected
                      ? 'bg-[#27AE60] text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1 truncate">
                    <div className="truncate">{item.name}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {item.path}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Quick Android Setup Tips */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-[#27AE60]" />
                <span>تعليمات الاستيراد:</span>
              </div>
              <p className="leading-relaxed">
                1. انسخ ملفات <code className="text-[#27AE60]">res/layout</code> إلى مجلد layout.
              </p>
              <p className="leading-relaxed">
                2. انسخ قيم الألوان والنصوص إلى <code className="text-[#27AE60]">res/values</code>.
              </p>
              <p className="leading-relaxed">
                3. تأكد من وجود <code className="text-amber-400">supportsRtl="true"</code> في الـ Manifest.
              </p>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#0F172A] min-w-0 overflow-hidden">
            {/* File Info Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-emerald-400 font-bold dir-ltr">
                  {currentFile.path}
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-400 truncate hidden sm:inline">
                  {currentFile.description}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  title="تحميل هذا الملف"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل الملف</span>
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#27AE60] hover:bg-[#219653] text-white shadow-xs'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ الكود'}</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed dir-ltr bg-[#0B1120]">
              <pre className="whitespace-pre select-all">{currentFile.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
