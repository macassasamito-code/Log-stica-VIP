import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, FileCode, FileText, Server, X } from 'lucide-react';

interface HostingerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostingerExportModal: React.FC<HostingerExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'index.html' | 'app.js' | 'styles.css' | 'pdf'>('index.html');
  const [filesContent, setFilesContent] = useState<Record<string, string>>({
    'index.html': 'Carregando index.html...',
    'app.js': 'Carregando app.js...',
    'styles.css': 'Carregando styles.css...',
  });
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      fetch('/hostinger/index.html').then((r) => r.text()),
      fetch('/hostinger/app.js').then((r) => r.text()),
      fetch('/hostinger/styles.css').then((r) => r.text()),
    ])
      .then(([html, js, css]) => {
        setFilesContent({
          'index.html': html,
          'app.js': js,
          'styles.css': css,
        });
      })
      .catch(() => {
        // Keep fallback
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (fileName: string) => {
    navigator.clipboard.writeText(filesContent[fileName] || '');
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = (fileName: string) => {
    const content = filesContent[fileName] || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Kit de Deploy Hostinger e Plano de Negócio"
    >
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Kit Autónomo GitHub &amp; Hostinger (<code className="font-mono text-amber-400">public_html</code>) + Documento Executivo
              </h3>
              <p className="text-xs text-slate-400">
                Ficheiros prontos para publicação imediata ou consulta do Plano de Negócios oficial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['index.html', 'app.js', 'styles.css'] as const).map((file) => (
              <button
                key={file}
                type="button"
                onClick={() => setActiveTab(file)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === file
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'pdf'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Plano de Negócios (PDF)</span>
            </button>
          </div>

          {activeTab !== 'pdf' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(activeTab)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedFile === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar {activeTab}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDownload(activeTab)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-slate-950 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar {activeTab}</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950">
          {activeTab === 'pdf' ? (
            <div className="w-full h-[55vh] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
              <iframe
                src="/assets/aistudio/Plano_de_Negocio_App_Delivery_VIP.html_f0150675.pdf"
                title="Plano de Negócio Rede de Delivery VIP & Express"
                className="w-full h-full"
              />
            </div>
          ) : (
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <code>{filesContent[activeTab]}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
