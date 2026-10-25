import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Bike,
  CheckCheck,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Thermometer,
  User,
} from 'lucide-react';
import { CourierProfile, DeliveryOrder, OrderChatMessage } from '../types';

interface OrderChatPanelProps {
  order: DeliveryOrder;
  courier: CourierProfile;
  currentRole: 'client' | 'driver';
  onSendMessage: (
    orderId: string,
    sender: 'client' | 'driver',
    text: string,
    contextTag?: string
  ) => void;
  onSwitchRole?: (targetRole: 'client' | 'driver') => void;
}

const CLIENT_QUICK_REPLIES: { label: string; text: string; tag: string }[] = [
  {
    label: 'Receção / Portaria',
    text: 'Por favor avise na receção / portaria ao chegar ao edifício. Já tenho o PIN pronto.',
    tag: 'Instrução de Entrega',
  },
  {
    label: 'Temperatura do Baú',
    text: 'Pode confirmar a leitura atual do sensor térmico do baú antes de chegar?',
    tag: 'Controlo Térmico',
  },
  {
    label: 'A descer com o PIN',
    text: 'Já estou a descer pelo elevador para validar o PIN de 4 dígitos pessoalmente.',
    tag: 'PIN de Entrega',
  },
  {
    label: 'Acesso Marginal / Polana',
    text: 'Use a entrada principal pela Av. Julius Nyerere / Marginal para estacionamento rápido.',
    tag: 'Acesso Local Maputo',
  },
];

const DRIVER_QUICK_REPLIES: { label: string; text: string; tag: string }[] = [
  {
    label: 'Lacre & Temperatura OK',
    text: 'Encomenda selada no baú térmico com temperatura estável e lacre intacto.',
    tag: 'Lacre & Sensor OK',
  },
  {
    label: 'A 3 min do Destino',
    text: 'Já passei pela Av. Julius Nyerere, chego ao destino em cerca de 3 minutos.',
    tag: 'Em Rota GPS',
  },
  {
    label: 'Cheguei à Portaria',
    text: 'Já me encontro na portaria / receção do destino em Maputo com a sua encomenda.',
    tag: 'No Local de Entrega',
  },
  {
    label: 'Solicitar PIN / QR',
    text: 'Por favor tenha o PIN de 4 dígitos ou o QR Code disponível para concluirmos a entrega.',
    tag: 'Validação PIN',
  },
];

export function getEffectiveOrderMessages(
  order: DeliveryOrder,
  courier: CourierProfile
): OrderChatMessage[] {
  if (order.chatMessages && order.chatMessages.length > 0) {
    return order.chatMessages;
  }

  // Fallback contextual session history for delivered or newly created orders
  const baseMessages: OrderChatMessage[] = [
    {
      id: `sys-init-${order.id}`,
      sender: 'system',
      senderName: 'Rede Express Maputo',
      text: `Canal contextual aberto para o pedido ${order.code} (${
        order.category === 'vip' ? 'Classe VIP Express Premium' : 'Classe Regular'
      }) · Origem: ${order.restaurantName}.`,
      timestamp: order.createdAt,
      contextTag: order.category === 'vip' ? 'Prioridade VIP' : 'Sessão do Pedido',
    },
    {
      id: `drv-init-${order.id}`,
      sender: 'driver',
      senderName: courier.name,
      text: `Olá ${order.customerName}! Sou o seu estafeta (${courier.vehicleModel} · ${courier.vehiclePlate}). Acompanhe por aqui qualquer detalhe da recolha e entrega em Maputo.`,
      timestamp: order.createdAt,
      contextTag: 'Apresentação Estafeta',
    },
  ];

  if (order.sealInspection) {
    baseMessages.push({
      id: `drv-seal-${order.id}`,
      sender: 'driver',
      senderName: courier.name,
      text: `Lacre #${order.sealInspection.sealCode} registado no restaurante. Compartimento térmico a ${order.sealInspection.compartmentTempHot.toFixed(
        1
      )}°C (Quente) / ${order.sealInspection.compartmentTempCold.toFixed(1)}°C (Frio).`,
      timestamp: order.sealInspection.capturedAt.slice(0, 5),
      contextTag: `Lacre #${order.sealInspection.sealCode}`,
    });
  }

  if (order.status === 'delivered' && order.deliveredAt) {
    baseMessages.push({
      id: `sys-del-${order.id}`,
      sender: 'system',
      senderName: 'Rede Express Maputo',
      text: `Entrega autenticada via PIN ${order.pinCode} às ${order.deliveredAt}. Histórico arquivado na sessão do pedido.`,
      timestamp: order.deliveredAt,
      contextTag: 'Entrega Concluída',
    });
  }

  return baseMessages;
}

export const OrderChatPanel: React.FC<OrderChatPanelProps> = ({
  order,
  courier,
  currentRole,
  onSendMessage,
  onSwitchRole,
}) => {
  const [draftText, setDraftText] = useState<string>('');
  const [autoReplySimulation, setAutoReplySimulation] = useState<boolean>(true);
  const [isTypingReply, setIsTypingReply] = useState<boolean>(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const isVip = order.category === 'vip';
  const messages = useMemo(
    () => getEffectiveOrderMessages(order, courier),
    [order, courier]
  );

  // Scroll chat container to bottom when messages change or order switches
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, order.id, isTypingReply]);

  const triggerSimulatedCounterpartReply = (
    sentBy: 'client' | 'driver',
    userMessageText: string
  ) => {
    if (!autoReplySimulation || order.status === 'delivered') return;

    const counterpart: 'client' | 'driver' = sentBy === 'client' ? 'driver' : 'client';
    const lower = userMessageText.toLowerCase();

    let replyText = '';
    let replyTag = '';

    if (counterpart === 'driver') {
      if (lower.includes('temperatura') || lower.includes('baú') || lower.includes('frio')) {
        replyText = `Confirmado! Sensor do baú térmico marca agora ${courier.thermalTempHot.toFixed(
          1
        )}°C na câmara quente e ${courier.thermalTempCold.toFixed(
          1
        )}°C na câmara fria. Lacre 100% intacto.`;
        replyTag = 'Telemetria Baú';
      } else if (lower.includes('receção') || lower.includes('portaria') || lower.includes('piso')) {
        replyText = `Combinado, ${order.customerName}! Assim que estacionar a mota (${courier.vehiclePlate}) dirijo-me diretamente à receção indicada.`;
        replyTag = 'Confirmação Estafeta';
      } else if (lower.includes('pin') || lower.includes('descer')) {
        replyText = `Perfeito! Estou a chegar ao local em Maputo. Assim que nos encontrarmos validamos o PIN de 4 dígitos no meu ecrã.`;
        replyTag = 'Validação PIN';
      } else {
        replyText = `Mensagem recebida, ${order.customerName}! Mantenho a rota prioritária para ${order.destination.label} (${order.estimatedMinutes} min estimados).`;
        replyTag = 'Resposta do Estafeta';
      }
    } else {
      if (lower.includes('pin') || lower.includes('qr')) {
        replyText = `Perfeito, ${courier.name}! Já tenho o código PIN (${order.pinCode}) aberto aqui no telemóvel para lhe indicar na entrega.`;
        replyTag = 'PIN Pronto';
      } else if (lower.includes('portaria') || lower.includes('cheguei')) {
        replyText = `Obrigado pelo aviso! Já estou a caminho da entrada principal para receber a encomenda.`;
        replyTag = 'A Receber';
      } else {
        replyText = `Obrigado pela atualização, ${courier.name}! Aguardo a sua chegada em ${order.destination.label}.`;
        replyTag = 'Confirmação Cliente';
      }
    }

    setIsTypingReply(true);
    window.setTimeout(() => {
      setIsTypingReply(false);
      onSendMessage(order.id, counterpart, replyText, replyTag);
    }, 950);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftText.trim();
    if (!trimmed) return;

    const tag =
      currentRole === 'client' ? 'Mensagem do Cliente' : 'Atualização do Estafeta';
    onSendMessage(order.id, currentRole, trimmed, tag);
    setDraftText('');
    triggerSimulatedCounterpartReply(currentRole, trimmed);
  };

  const handleQuickReplyClick = (item: { label: string; text: string; tag: string }) => {
    onSendMessage(order.id, currentRole, item.text, item.tag);
    triggerSimulatedCounterpartReply(currentRole, item.text);
  };

  const quickReplies =
    currentRole === 'client' ? CLIENT_QUICK_REPLIES : DRIVER_QUICK_REPLIES;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
      {/* Header with Counterpart Context & Role Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xs shrink-0 relative ${
              isVip
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-sm sm:text-base font-bold text-white">
                Chat Direto da Entrega · {order.code}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                  isVip
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {messages.length} msgs na sessão
              </span>
            </div>

            <p className="text-xs text-slate-400 truncate mt-0.5">
              {currentRole === 'client' ? (
                <>
                  Em linha com Estafeta{' '}
                  <strong className="text-slate-200">{courier.name}</strong> ({courier.vehiclePlate}) ·{' '}
                  <span className="font-mono text-amber-300">
                    Baú {courier.thermalTempHot.toFixed(1)}°C / {courier.thermalTempCold.toFixed(1)}°C
                  </span>
                </>
              ) : (
                <>
                  Em linha com Cliente{' '}
                  <strong className="text-slate-200">{order.customerName}</strong> · Destino:{' '}
                  <span className="text-slate-300">{order.destination.label}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-reply toggle for single-user testing */}
          <button
            type="button"
            onClick={() => setAutoReplySimulation((v) => !v)}
            className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              autoReplySimulation
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Ativar ou desativar resposta contextual automática da outra ponta"
          >
            <Sparkles className="w-3 h-3" />
            <span>{autoReplySimulation ? 'Auto-Resposta ON' : 'Auto-Resposta OFF'}</span>
          </button>

          {onSwitchRole && (
            <button
              type="button"
              onClick={() =>
                onSwitchRole(currentRole === 'client' ? 'driver' : 'client')
              }
              className="min-h-[34px] px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title="Alternar perfil para ver e responder no outro ecrã mantendo o histórico"
            >
              <ArrowLeftRight className="w-3 h-3 text-amber-400" />
              <span>
                {currentRole === 'client'
                  ? 'Abrir no App Estafeta'
                  : 'Abrir no App Cliente'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Contextual Order Bar (Origin -> Destination + Seal Status) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">
            {order.restaurantName} → <strong className="text-slate-200">{order.destination.label}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono shrink-0">
          {order.sealInspection ? (
            <span className="text-emerald-400">
              ✓ Lacre #{order.sealInspection.sealCode}
            </span>
          ) : (
            <span className="text-amber-400">Aguardando Lacre</span>
          )}
          <span className="text-slate-500">·</span>
          <span className="text-amber-300 flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            {courier.thermalTempHot.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* Message History List */}
      <div
        ref={messagesContainerRef}
        className="space-y-3 max-h-[270px] overflow-y-auto pr-1 scroll-smooth"
        aria-live="polite"
      >
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                className="flex items-center justify-center my-1.5"
              >
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/90 text-[11px] text-slate-400 text-center max-w-md">
                  {msg.contextTag && (
                    <span className="font-mono font-semibold text-amber-400 mr-1.5">
                      [{msg.contextTag}]
                    </span>
                  )}
                  <span>{msg.text}</span>
                  <span className="font-mono text-[10px] text-slate-500 ml-2">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          const isOwnMessage = msg.sender === currentRole;
          const isDriverSender = msg.sender === 'driver';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isOwnMessage ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {isDriverSender ? (
                  <Bike className="w-3 h-3 text-amber-400" />
                ) : (
                  <User className="w-3 h-3 text-emerald-400" />
                )}
                <span className="text-[11px] font-semibold text-slate-300">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({isDriverSender ? 'Estafeta' : 'Cliente'})
                </span>
                {msg.contextTag && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isDriverSender
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {msg.contextTag}
                  </span>
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                  isOwnMessage
                    ? isVip
                      ? 'bg-amber-500/15 border-amber-500/40 text-slate-100 rounded-br-none'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-slate-100 rounded-br-none'
                    : 'bg-slate-950 border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="break-words">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] font-mono text-slate-400 tabular-nums">
                  <span>{msg.timestamp}</span>
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </div>
          );
        })}

        {isTypingReply && (
          <div className="flex items-center gap-2 text-xs text-slate-400 px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              {currentRole === 'client' ? courier.name : order.customerName} está a
              escrever...
            </span>
          </div>
        )}
      </div>

      {/* Contextual Quick Reply Chips */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
          <span>
            Respostas Rápidas Contextuais (
            {currentRole === 'client' ? 'Cliente' : 'Estafeta'}):
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Histórico sincronizado na sessão
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {quickReplies.map((qr) => (
            <button
              key={qr.label}
              type="button"
              onClick={() => handleQuickReplyClick(qr)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              + {qr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder={
            currentRole === 'client'
              ? `Escreva para o estafeta ${courier.name} sobre a entrega ${order.code}...`
              : `Escreva para o cliente ${order.customerName} (${order.destination.label})...`
          }
          className="flex-1 h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!draftText.trim()}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 ${
            isVip
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
};
