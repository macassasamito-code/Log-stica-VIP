import React, { useState } from 'react';
import { CourierProfile, DeliveryOrder, SealInspectionRecord } from '../types';
import { createSealSnapshotDataUrl } from '../data/initialData';
import { Camera, CheckCircle2, ShieldAlert, Thermometer, X } from 'lucide-react';

interface SealCaptureModalProps {
  order: DeliveryOrder | null;
  courier: CourierProfile;
  onClose: () => void;
  onConfirmSeal: (orderId: string, record: SealInspectionRecord) => void;
}

export const SealCaptureModal: React.FC<SealCaptureModalProps> = ({
  order,
  courier,
  onClose,
  onConfirmSeal,
}) => {
  if (!order) return null;

  const isVip = order.category === 'vip';
  const defaultSealCode = `${isVip ? 'VIP' : 'REG'}-${Math.floor(1000 + Math.random() * 9000)}-A`;

  const [sealCode, setSealCode] = useState(defaultSealCode);
  const [tempHot, setTempHot] = useState(courier.thermalTempHot);
  const [tempCold, setTempCold] = useState(courier.thermalTempCold);
  const [notes, setNotes] = useState(
    isVip
      ? 'Lacre de segurança duplo conferido no restaurante e acondicionado no compartimento térmico com sensor ativo.'
      : 'Embalagem selada e conferida no interior do baú térmico higienizado.'
  );

  const nowTime = new Date().toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const previewUrl = createSealSnapshotDataUrl({
    orderCode: order.code,
    sealCode,
    restaurantName: order.restaurantName,
    courierName: `${courier.name} (${courier.vehiclePlate})`,
    category: order.category,
    tempHot,
    tempCold,
    timestamp: nowTime,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: SealInspectionRecord = {
      capturedAt: nowTime,
      sealCode: sealCode.trim() || defaultSealCode,
      compartmentTempHot: tempHot,
      compartmentTempCold: tempCold,
      packagingIntegrity: isVip
        ? 'Impecável · Duplo Lacre'
        : 'Selado · Padrão Higienizado',
      notes,
      dataUrl: previewUrl,
    };
    onConfirmSeal(order.id, record);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Captura de Fotografia de Lacre e Inspeção"
    >
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Camera className={`w-5 h-5 ${isVip ? 'text-amber-400' : 'text-emerald-400'}`} />
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Fotografia de Lacre e Inspeção
              </h3>
              <p className="text-xs text-slate-400">
                Etapa obrigatória no restaurante antes de iniciar a rota · Pedido {order.code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Live Thermal Box Camera Viewfinder Preview */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src={previewUrl}
              alt={`Evidência fotográfica do lacre ${sealCode} no compartimento térmico`}
              referrerPolicy="no-referrer"
              className="w-full h-52 object-cover"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Código do Lacre
              </label>
              <input
                type="text"
                value={sealCode}
                onChange={(e) => setSealCode(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Sensor Quente (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={tempHot}
                  onChange={(e) => setTempHot(parseFloat(e.target.value) || 60)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 tabular-nums focus:outline-none focus:border-amber-400"
                />
                <Thermometer className="w-3.5 h-3.5 text-amber-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Sensor Frio (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={tempCold}
                onChange={(e) => setTempCold(parseFloat(e.target.value) || 4)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-400 tabular-nums focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Observação de Integridade do Baú Térmico
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 flex items-center gap-2.5 text-xs text-slate-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Esta evidência fica visível em tempo real no ecrã do Cliente e no Painel Web de
              Despacho do Restaurante.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                isVip
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registar Lacre e Iniciar Rota</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
