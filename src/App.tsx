import React, { useEffect, useMemo, useState } from 'react';
import {
  Bike,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  KeyRound,
  Navigation,
  Package,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  Volume2,
  VolumeX,
  WifiOff,
  Zap,
} from 'lucide-react';
import {
  CourierProfile,
  DeliveryOrder,
  OrderStatus,
  RoleView,
  SealInspectionRecord,
  ServiceCategory,
} from './types';
import {
  COURIER_FLEET,
  INITIAL_ORDERS,
  ITEM_TYPES,
  PRESET_DESTINATIONS,
  PRESET_ORIGINS,
  playAlertSound,
} from './data/initialData';
import { LeafletMap } from './components/LeafletMap';
import { CourierStoryModal } from './components/CourierStoryModal';
import { SealCaptureModal } from './components/SealCaptureModal';
import { QrCodeGraphic } from './components/QrCodeGraphic';
import { HostingerExportModal } from './components/HostingerExportModal';
import { DispatchAnalyticsCharts } from './components/DispatchAnalyticsCharts';
import { OrderChatPanel, getEffectiveOrderMessages } from './components/OrderChatPanel';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { exportConsolidatedPdfReport } from './utils/exportPdfReport';

const STORAGE_KEY_ORDERS = 'rede_vip_express_maputo_orders_v5';
const STORAGE_KEY_ROLE = 'rede_vip_express_maputo_role_v5';

export function formatMetical(amount: number): string {
  return `${amount.toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MT`;
}

export default function App() {
  // Persistent state in LocalStorage (v3 with Maputo multi-date history & Metical)
  const [roleView, setRoleView] = useState<RoleView>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    if (saved === 'client' || saved === 'driver' || saved === 'dispatch') return saved;
    return 'client';
  });

  const [orders, setOrders] = useState<DeliveryOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].dateIso) return parsed;
      }
    } catch {
      // Fallback to initial Maputo orders
    }
    return INITIAL_ORDERS;
  });

  const [couriers] = useState<CourierProfile[]>(COURIER_FLEET);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => INITIAL_ORDERS[0].id);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gpsAutoSimulate, setGpsAutoSimulate] = useState<boolean>(true);

  // Modals state
  const [storyCourier, setStoryCourier] = useState<CourierProfile | null>(null);
  const [sealModalOrder, setSealModalOrder] = useState<DeliveryOrder | null>(null);
  const [previewSealOrder, setPreviewSealOrder] = useState<DeliveryOrder | null>(null);
  const [isHostingerModalOpen, setIsHostingerModalOpen] = useState<boolean>(false);
  const [showIOSInstallModal, setShowIOSInstallModal] = useState<boolean>(false);
  const [showMatrixDrawer, setShowMatrixDrawer] = useState<boolean>(false);

  // Client Order Creation Form State
  const [originIdx, setOriginIdx] = useState<number>(0);
  const [destIdx, setDestIdx] = useState<number>(0);
  const [itemTypeIdx, setItemTypeIdx] = useState<number>(0);
  const [customNotes, setCustomNotes] = useState<string>(ITEM_TYPES[0].defaultDesc);
  const [customerName, setCustomerName] = useState<string>('Dr. Lourenço Matsinhe');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('vip');
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  // Driver PIN / QR Verification State
  const [driverPinInput, setDriverPinInput] = useState<string>('');
  const [pinFeedback, setPinFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [driverFilter, setDriverFilter] = useState<'all' | 'vip' | 'regular'>('all');

  // Dispatch Web Panel State (Active Monitor vs. Histórico de Entregas)
  const [dispatchSubView, setDispatchSubView] = useState<'operations' | 'history'>('operations');
  const [commissionPercent, setCommissionPercent] = useState<number>(20); // 15% to 25% per Business Plan
  const [hasDedicatedFleetSub, setHasDedicatedFleetSub] = useState<boolean>(true);
  const [hasSponsoredFeed, setHasSponsoredFeed] = useState<boolean>(true);
  const [dispatchFilter, setDispatchFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [dispatchRestaurant, setDispatchRestaurant] = useState<number>(0);
  const [dispatchDest, setDispatchDest] = useState<number>(1);
  const [dispatchCustomer, setDispatchCustomer] = useState<string>('Eng. Amélia Mondlane');
  const [dispatchCategory, setDispatchCategory] = useState<ServiceCategory>('vip');

  // Historical Deliveries Filter State (Histórico de Entregas)
  const [historyStartDate, setHistoryStartDate] = useState<string>('2026-10-21');
  const [historyEndDate, setHistoryEndDate] = useState<string>('2026-10-25');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<'all' | 'vip' | 'regular'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // PWA & Connectivity Hooks
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Persist orders & active role to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // Ignore quota errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, roleView);
    } catch {
      // Ignore
    }
  }, [roleView]);

  // Real-time GPS route progression simulator in Maputo
  useEffect(() => {
    if (!gpsAutoSimulate) return;
    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.status === 'to_pickup' && order.routeProgress < 15) {
            const nextProg = Math.min(15, order.routeProgress + 3);
            return {
              ...order,
              routeProgress: nextProg,
              status: nextProg >= 15 ? 'at_pickup' : 'to_pickup',
            };
          }
          if (order.status === 'in_transit' && order.routeProgress < 96) {
            const step = order.category === 'vip' ? 3 : 2;
            const nextProg = Math.min(96, order.routeProgress + step);
            const ratio = nextProg / 100;
            return {
              ...order,
              routeProgress: nextProg,
              courierLocation: {
                lat: order.origin.lat + (order.destination.lat - order.origin.lat) * ratio,
                lng: order.origin.lng + (order.destination.lng - order.origin.lng) * ratio,
              },
            };
          }
          return order;
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [gpsAutoSimulate]);

  // Active selected order
  const activeOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  const activeCourier = useMemo(() => {
    if (!activeOrder) return couriers[0];
    return couriers.find((c) => c.id === activeOrder.assignedCourierId) || couriers[0];
  }, [activeOrder, couriers]);

  // Real-time distance & fare calculator in Meticais (MT) for Maputo
  const calculatedQuote = useMemo(() => {
    const orig = PRESET_ORIGINS[originIdx] || PRESET_ORIGINS[0];
    const dest = PRESET_DESTINATIONS[destIdx] || PRESET_DESTINATIONS[0];
    const dLat = (dest.lat - orig.lat) * 111;
    const dLng = (dest.lng - orig.lng) * 100;
    const rawDist = Math.sqrt(dLat * dLat + dLng * dLng) * 1.35;
    const distanceKm = Math.max(1.2, Number(rawDist.toFixed(1)));

    const basePrice = Math.round(130 + distanceKm * 45);
    const vipSupplement = 150;
    const regularTotal = basePrice;
    const vipTotal = basePrice + vipSupplement;

    const regularMinutes = Math.round(12 + distanceKm * 3.5);
    const vipMinutes = Math.round(5 + distanceKm * 2.1);

    return {
      distanceKm,
      basePrice,
      vipSupplement,
      regularTotal,
      vipTotal,
      regularMinutes,
      vipMinutes,
    };
  }, [originIdx, destIdx]);

  const todayIso = '2026-10-25';

  // Create new order (from Client view)
  const handleCreateClientOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = PRESET_ORIGINS[originIdx];
    const destination = PRESET_DESTINATIONS[destIdx];
    const itemObj = ITEM_TYPES[itemTypeIdx];
    const isVip = selectedCategory === 'vip';

    const assignedCourier = isVip ? couriers[0] : couriers[2];
    const pinCode = String(Math.floor(1000 + Math.random() * 9000));
    const orderNum = Math.floor(9050 + Math.random() * 900);
    const code = `${isVip ? 'EXP' : 'REG'}-${orderNum}`;

    const newOrder: DeliveryOrder = {
      id: `ord-${orderNum}-${Date.now()}`,
      code,
      dateIso: todayIso,
      createdAt: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      restaurantName: origin.label,
      customerName: customerName.trim() || 'Cliente Executivo Maputo',
      customerPhone: '+258 84 000 0000',
      itemType: itemObj.label,
      itemDescription: customNotes.trim() || itemObj.defaultDesc,
      category: selectedCategory,
      status: 'at_pickup',
      origin,
      destination,
      courierLocation: { lat: origin.lat, lng: origin.lng },
      routeProgress: 12,
      distanceKm: calculatedQuote.distanceKm,
      estimatedMinutes: isVip ? calculatedQuote.vipMinutes : calculatedQuote.regularMinutes,
      slaTargetMinutes: isVip ? 12 : 22,
      basePrice: calculatedQuote.basePrice,
      vipSupplement: isVip ? calculatedQuote.vipSupplement : 0,
      totalPrice: isVip ? calculatedQuote.vipTotal : calculatedQuote.regularTotal,
      pinCode,
      qrPayload: `EXPRESS-${isVip ? 'VIP' : 'REG'}:${code}:PIN-${pinCode}`,
      assignedCourierId: assignedCourier.id,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    if (soundEnabled) playAlertSound(isVip ? 'vip' : 'regular');
  };

  // Send Contextual Chat Message (Client <-> Driver) persisted in order session
  const handleSendOrderChatMessage = (
    orderId: string,
    sender: 'client' | 'driver',
    text: string,
    contextTag?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString('pt-MZ', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const c = couriers.find((cr) => cr.id === o.assignedCourierId) || couriers[0];
        const existingMessages = getEffectiveOrderMessages(o, c);
        const senderName = sender === 'client' ? o.customerName : c.name;

        return {
          ...o,
          chatMessages: [
            ...existingMessages,
            {
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              sender,
              senderName,
              text,
              timestamp: nowTime,
              contextTag,
            },
          ],
        };
      })
    );
  };

  // Confirm Seal Photo in Driver View
  const handleConfirmSeal = (orderId: string, record: SealInspectionRecord) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const c = couriers.find((cr) => cr.id === o.assignedCourierId) || couriers[0];
        const existingMessages = getEffectiveOrderMessages(o, c);

        return {
          ...o,
          sealInspection: record,
          status: 'in_transit',
          routeProgress: Math.max(28, o.routeProgress),
          chatMessages: [
            ...existingMessages,
            {
              id: `msg-seal-${Date.now()}`,
              sender: 'driver',
              senderName: c.name,
              text: `Fotografia do Lacre #${record.sealCode} registada na recolha. Baú térmico estabilizado a ${record.compartmentTempHot.toFixed(
                1
              )}°C (Quente) / ${record.compartmentTempCold.toFixed(1)}°C (Frio). A iniciar rota para o destino!`,
              timestamp: record.capturedAt.slice(0, 5),
              contextTag: `Lacre #${record.sealCode}`,
            },
          ],
        };
      })
    );
    setSealModalOrder(null);
    if (soundEnabled) playAlertSound('success');
  };

  // Validate PIN or QR Code in Driver View
  const handleValidateDeliveryPin = (order: DeliveryOrder, enteredPin: string) => {
    if (!order.sealInspection && order.status !== 'in_transit') {
      setPinFeedback({
        type: 'error',
        message: 'Registe primeiro a Fotografia de Lacre e Inspeção na recolha.',
      });
      if (soundEnabled) playAlertSound('error');
      return;
    }

    if (enteredPin.trim() === order.pinCode) {
      const nowStr = new Date().toLocaleTimeString('pt-MZ', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== order.id) return o;
          const c = couriers.find((cr) => cr.id === o.assignedCourierId) || couriers[0];
          const existingMessages = getEffectiveOrderMessages(o, c);

          return {
            ...o,
            status: 'delivered',
            routeProgress: 100,
            deliveredAt: nowStr,
            courierLocation: { lat: o.destination.lat, lng: o.destination.lng },
            clientRating: 5,
            driverRating: 5,
            chatMessages: [
              ...existingMessages,
              {
                id: `msg-del-${Date.now()}`,
                sender: 'system',
                senderName: 'Rede Express Maputo',
                text: `Entrega autenticada com sucesso via PIN ${order.pinCode} às ${nowStr}. Obrigado por utilizar a Rede Express Maputo!`,
                timestamp: nowStr,
                contextTag: 'PIN Validado',
              },
            ],
          };
        })
      );
      setDriverPinInput('');
      setPinFeedback({
        type: 'success',
        message: `Entrega ${order.code} autenticada com sucesso! Receita de ${formatMetical(order.totalPrice)} creditada.`,
      });
      if (soundEnabled) playAlertSound('success');
    } else {
      setPinFeedback({
        type: 'error',
        message: `PIN incorreto (${enteredPin || 'vazio'}). Solicite o PIN de 4 dígitos ao cliente.`,
      });
      if (soundEnabled) playAlertSound('error');
    }
  };

  // Simulate QR Code Scan in Driver View
  const handleSimulateQrScan = (order: DeliveryOrder) => {
    setDriverPinInput(order.pinCode);
    handleValidateDeliveryPin(order, order.pinCode);
  };

  // Update Bilateral Star Rating
  const handleSetRating = (orderId: string, stars: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, clientRating: stars } : o))
    );
  };

  // Dispatch Single Order from Restaurant Web Panel
  const handleQuickDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = PRESET_ORIGINS[dispatchRestaurant] || PRESET_ORIGINS[0];
    const destination = PRESET_DESTINATIONS[dispatchDest] || PRESET_DESTINATIONS[1];
    const isVip = dispatchCategory === 'vip';
    const courier = isVip ? couriers[1] : couriers[3];
    const pinCode = String(Math.floor(1000 + Math.random() * 9000));
    const num = Math.floor(9100 + Math.random() * 890);
    const code = `${isVip ? 'EXP' : 'REG'}-${num}`;
    const basePrice = 220;
    const vipSupplement = isVip ? 150 : 0;

    const newOrder: DeliveryOrder = {
      id: `ord-${num}-${Date.now()}`,
      code,
      dateIso: todayIso,
      createdAt: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      restaurantName: origin.label,
      customerName: dispatchCustomer.trim() || 'Cliente Restaurante Maputo',
      customerPhone: '+258 84 822 0330',
      itemType: isVip ? 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)' : 'Refeição Executiva Selada',
      itemDescription: isVip
        ? 'Pedido Prioritário Despachado via Painel Web Maputo · Baú Duplo'
        : 'Pedido Regular Despachado via Painel Web Maputo',
      category: dispatchCategory,
      status: 'at_pickup',
      origin,
      destination,
      courierLocation: { lat: origin.lat, lng: origin.lng },
      routeProgress: 10,
      distanceKm: 2.1,
      estimatedMinutes: isVip ? 9 : 16,
      slaTargetMinutes: isVip ? 12 : 22,
      basePrice,
      vipSupplement,
      totalPrice: basePrice + vipSupplement,
      pinCode,
      qrPayload: `EXPRESS-${isVip ? 'VIP' : 'REG'}:${code}:PIN-${pinCode}`,
      assignedCourierId: courier.id,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    if (soundEnabled) playAlertSound(isVip ? 'vip' : 'regular');
  };

  // Dispatch Batch (3 Simultaneous Orders in Maputo) from Restaurant Web Panel
  const handleBatchDispatch = () => {
    const nowStr = new Date().toLocaleTimeString('pt-MZ', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const batchConfigs = [
      {
        origin: PRESET_ORIGINS[0],
        dest: PRESET_DESTINATIONS[0],
        customer: 'Dra. Ivone Mabote (Lote #1)',
        cat: 'vip' as ServiceCategory,
        courierId: 'courier-vip-1',
        base: 240,
      },
      {
        origin: PRESET_ORIGINS[1],
        dest: PRESET_DESTINATIONS[3],
        customer: 'Eng. Sérgio Tembe (Lote #2)',
        cat: 'vip' as ServiceCategory,
        courierId: 'courier-vip-2',
        base: 210,
      },
      {
        origin: PRESET_ORIGINS[3],
        dest: PRESET_DESTINATIONS[4],
        customer: 'Cláudia Mucavele (Lote #3)',
        cat: 'regular' as ServiceCategory,
        courierId: 'courier-reg-1',
        base: 180,
      },
    ];

    const createdBatch: DeliveryOrder[] = batchConfigs.map((cfg, idx) => {
      const isVip = cfg.cat === 'vip';
      const num = Math.floor(9200 + Math.random() * 790) + idx;
      const code = `${isVip ? 'EXP' : 'REG'}-${num}`;
      const pinCode = String(Math.floor(1000 + Math.random() * 9000));
      const vipSupp = isVip ? 150 : 0;

      return {
        id: `batch-${num}-${Date.now()}-${idx}`,
        code,
        dateIso: todayIso,
        createdAt: nowStr,
        restaurantName: cfg.origin.label,
        customerName: cfg.customer,
        customerPhone: '+258 84 500 0111',
        itemType: isVip ? 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)' : 'Refeição Executiva Selada',
        itemDescription: 'Despacho em Lote (Painel Web de Despacho Maputo)',
        category: cfg.cat,
        status: 'at_pickup',
        origin: cfg.origin,
        destination: cfg.dest,
        courierLocation: { lat: cfg.origin.lat, lng: cfg.origin.lng },
        routeProgress: 10,
        distanceKm: 2.2,
        estimatedMinutes: isVip ? 8 : 15,
        slaTargetMinutes: isVip ? 12 : 20,
        basePrice: cfg.base,
        vipSupplement: vipSupp,
        totalPrice: cfg.base + vipSupp,
        pinCode,
        qrPayload: `EXPRESS-${isVip ? 'VIP' : 'REG'}:${code}:PIN-${pinCode}`,
        assignedCourierId: cfg.courierId,
        isBatchOrder: true,
      };
    });

    setOrders((prev) => [...createdBatch, ...prev]);
    setSelectedOrderId(createdBatch[0].id);
    if (soundEnabled) playAlertSound('vip');
  };

  // Financial Metrics in Meticais (MT) for Painel Web de Despacho
  const financialMetrics = useMemo(() => {
    const grossVolume = orders.reduce((acc, o) => acc + o.totalPrice, 0);
    const baseDeliveryVolume = orders.reduce((acc, o) => acc + o.basePrice, 0);
    const vipSupplementRetained = orders.reduce((acc, o) => acc + o.vipSupplement, 0);
    const intermediationFee = (baseDeliveryVolume * commissionPercent) / 100;
    const dedicatedFleetDailyShare = hasDedicatedFleetSub ? 1200 : 0;
    const sponsoredFeedDailyShare = hasSponsoredFeed ? 750 : 0;
    const platformTotalRevenue =
      intermediationFee +
      vipSupplementRetained +
      dedicatedFleetDailyShare +
      sponsoredFeedDailyShare;
    const courierPayout = baseDeliveryVolume - intermediationFee;

    const vipCount = orders.filter((o) => o.category === 'vip').length;
    const regularCount = orders.filter((o) => o.category === 'regular').length;
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

    return {
      grossVolume,
      intermediationFee,
      vipSupplementRetained,
      dedicatedFleetDailyShare,
      sponsoredFeedDailyShare,
      platformTotalRevenue,
      courierPayout,
      vipCount,
      regularCount,
      deliveredCount,
    };
  }, [orders, commissionPercent, hasDedicatedFleetSub, hasSponsoredFeed]);

  // Filtered Delivered Orders for the "Histórico de Entregas" screen
  const filteredDeliveredHistory = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== 'delivered') return false;
      if (historyStartDate && o.dateIso < historyStartDate) return false;
      if (historyEndDate && o.dateIso > historyEndDate) return false;
      if (historyCategoryFilter !== 'all' && o.category !== historyCategoryFilter) return false;
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const matchCode = o.code.toLowerCase().includes(q);
        const matchRest = o.restaurantName.toLowerCase().includes(q);
        const matchCust = o.customerName.toLowerCase().includes(q);
        const matchDest = o.destination.label.toLowerCase().includes(q);
        if (!matchCode && !matchRest && !matchCust && !matchDest) return false;
      }
      return true;
    });
  }, [orders, historyStartDate, historyEndDate, historyCategoryFilter, historySearchQuery]);

  // Consolidated Summary Metrics for Filtered History
  const historySummaryMetrics = useMemo(() => {
    const count = filteredDeliveredHistory.length;
    const vipCount = filteredDeliveredHistory.filter((o) => o.category === 'vip').length;
    const regularCount = filteredDeliveredHistory.filter((o) => o.category === 'regular').length;
    const grossTotal = filteredDeliveredHistory.reduce((acc, o) => acc + o.totalPrice, 0);
    const baseTotal = filteredDeliveredHistory.reduce((acc, o) => acc + o.basePrice, 0);
    const vipSuppTotal = filteredDeliveredHistory.reduce((acc, o) => acc + o.vipSupplement, 0);
    const commissionTotal = (baseTotal * commissionPercent) / 100;
    const platformRetained = commissionTotal + vipSuppTotal;
    const partnerNet = grossTotal - platformRetained;

    return {
      count,
      vipCount,
      regularCount,
      grossTotal,
      baseTotal,
      vipSuppTotal,
      commissionTotal,
      platformRetained,
      partnerNet,
    };
  }, [filteredDeliveredHistory, commissionPercent]);

  // Export CSV report in Meticais (supports either all orders or filtered history)
  const handleExportCsvReport = (targetOrders: DeliveryOrder[], filenamePrefix = 'relatorio_despacho_maputo') => {
    const headers = [
      'Codigo',
      'Data_Entrega',
      'Hora_Conclusao',
      'Categoria',
      'Status',
      'Restaurante_Origem_Maputo',
      'Cliente_Destino_Maputo',
      'PIN_Seguranca',
      'Lacre_Termico',
      'Frete_Base_MT',
      'Suplemento_VIP_MT',
      'Total_MT',
    ];
    const rows = targetOrders.map((o) => [
      o.code,
      o.dateIso,
      o.deliveredAt || o.createdAt,
      o.category.toUpperCase(),
      o.status,
      `"${o.restaurantName}"`,
      `"${o.customerName}"`,
      o.pinCode,
      o.sealInspection?.sealCode || 'Verificado',
      o.basePrice.toFixed(2),
      o.vipSupplement.toFixed(2),
      o.totalPrice.toFixed(2),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}_${historyStartDate || 'geral'}_${historyEndDate || ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Consolidated PDF Report
  const handleExportPdf = (targetOrders: DeliveryOrder[]) => {
    exportConsolidatedPdfReport({
      orders: targetOrders,
      couriers,
      startDate: historyStartDate,
      endDate: historyEndDate,
      commissionPercent,
    });
  };

  const handleResetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    setOrders(INITIAL_ORDERS);
    setSelectedOrderId(INITIAL_ORDERS[0].id);
    setPinFeedback(null);
  };

  const formatStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Aguardando Estafeta';
      case 'to_pickup':
        return 'A caminho da recolha';
      case 'at_pickup':
        return 'No restaurante · Aguarda Foto do Lacre';
      case 'in_transit':
        return 'Lacre verificado · A caminho do destino';
      case 'delivered':
        return 'Entregue & Autenticado via PIN/QR';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 lg:pb-12">
      {/* Offline Connectivity Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Modo Offline PWA Ativo — A utilizar dados persistidos localmente em Maputo.</span>
        </div>
      )}

      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (single text element, one line) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setRoleView('client');
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Rede de Delivery VIP &amp; Express
        </a>

        {/* Zone 2: 4-5 Concise Navigation Links (1-2 word labels, single-line) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setRoleView('client')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              roleView === 'client' ? 'text-amber-400 underline underline-offset-8' : ''
            }`}
          >
            Visão Cliente
          </button>
          <button
            type="button"
            onClick={() => setRoleView('driver')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              roleView === 'driver' ? 'text-amber-400 underline underline-offset-8' : ''
            }`}
          >
            App Estafeta
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleView('dispatch');
              setDispatchSubView('operations');
            }}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              roleView === 'dispatch' && dispatchSubView === 'operations'
                ? 'text-amber-400 underline underline-offset-8'
                : ''
            }`}
          >
            Painel Despacho
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleView('dispatch');
              setDispatchSubView('history');
            }}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              roleView === 'dispatch' && dispatchSubView === 'history'
                ? 'text-amber-400 underline underline-offset-8'
                : ''
            }`}
          >
            Histórico Entregas
          </button>
          <button
            type="button"
            onClick={() => setIsHostingerModalOpen(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kit Hostinger
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          {!isInstalled && isInstallable ? (
            <button
              type="button"
              onClick={install}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Instalar App PWA
            </button>
          ) : !isInstalled && isIOS ? (
            <button
              type="button"
              onClick={() => setShowIOSInstallModal(true)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Instalar no iPhone
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsHostingerModalOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Exportar Kit Hostinger
            </button>
          )}
        </div>
      </header>

      {/* WORKSPACE ROLE SWITCHER & SIMULATION BAR */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">
              Maputo, Moçambique · Moeda em Metical (MT) · Rastreamento 2D em Tempo Real
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              {roleView === 'client' && '1. Visão do Cliente — Maputo VIP & Regular (MT)'}
              {roleView === 'driver' && '2. Visão do Motorista / Estafeta — Inspeção de Lacre & PIN'}
              {roleView === 'dispatch' &&
                (dispatchSubView === 'history'
                  ? '3. Painel Gestor / Restaurante — Histórico de Entregas & Exportação PDF/CSV'
                  : '3. Painel Web de Despacho — Gestor & Restaurantes Maputo')}
            </h1>
          </div>

          {/* Interactive Role Switcher Segmented Control */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800"
              role="tablist"
              aria-label="Seletor de Perfil do Ecossistema"
            >
              <button
                type="button"
                role="tab"
                aria-selected={roleView === 'client'}
                onClick={() => setRoleView('client')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  roleView === 'client'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>1. Cliente</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={roleView === 'driver'}
                onClick={() => setRoleView('driver')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  roleView === 'driver'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>2. Estafeta</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={roleView === 'dispatch'}
                onClick={() => setRoleView('dispatch')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  roleView === 'dispatch'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>3. Despacho &amp; Histórico</span>
              </button>
            </div>

            {/* Matrix Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMatrixDrawer((v) => !v)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
            >
              Matriz VIP
            </button>

            {/* Simulation & Sound Utility Buttons */}
            <button
              type="button"
              onClick={() => setGpsAutoSimulate((s) => !s)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                gpsAutoSimulate
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
              title="Pausar ou retomar simulação de movimento GPS das motas em Maputo"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{gpsAutoSimulate ? 'GPS Maputo Ativo' : 'GPS Pausado'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title="Ativar ou silenciar alertas sonoros VIP/Regular"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDemoData}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title="Repor estado de demonstração de Maputo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Repor Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* COLLAPSIBLE BUSINESS PLAN MATRIX DRAWER */}
      {showMatrixDrawer && (
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  01. Matriz de Categorias de Entrega (Classe Regular vs. Classe VIP Express Premium)
                </h2>
                <p className="text-xs text-slate-400">
                  Operação Maputo, Moçambique — Segregação por exigência, transparência multimédia e tarifário em Meticais (MT)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixDrawer(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
              >
                Ocultar Matriz
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 pr-4 font-semibold">Critério / Requisito</th>
                    <th className="py-2.5 px-4 font-semibold text-emerald-400">Classe Regular</th>
                    <th className="py-2.5 pl-4 font-semibold text-amber-400">
                      Classe VIP (Express Premium)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-200">
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-white">Tipo de Veículo</td>
                    <td className="py-2.5 px-4">
                      Motas standard (125cc–150cc) em estado funcional e inspecionado.
                    </td>
                    <td className="py-2.5 pl-4 text-amber-200">
                      Motas de maior cilindrada ou elétricas modernas em estado impecável.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-white">Equipamento de Carga</td>
                    <td className="py-2.5 px-4">
                      Baú térmico padrão, selado, limpo e higienizado.
                    </td>
                    <td className="py-2.5 pl-4 text-amber-200">
                      Baú térmico duplo/reforçado com divisórias quentes/frias e sensor térmico.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-white">Perfil do Motorista</td>
                    <td className="py-2.5 px-4">
                      Colete e capacete regulamentado com identificação da rede.
                    </td>
                    <td className="py-2.5 pl-4 text-amber-200">
                      Uniforme completo premium, postura e protocolo de atendimento formal.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-white">Apresentação no App</td>
                    <td className="py-2.5 px-4">
                      Foto de perfil, foto do veículo e classificação por estrelas.
                    </td>
                    <td className="py-2.5 pl-4 text-amber-200">
                      Foto HD, vídeo de apresentação (5s), vídeo do veículo e distintivo VIP.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium text-white">SLA de Atendimento</td>
                    <td className="py-2.5 px-4">Alocação por proximidade padrão na rede de Maputo.</td>
                    <td className="py-2.5 pl-4 text-amber-200">
                      Alocação prioritária imediata com tempo de recolha reduzido (+150,00 MT).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          VIEW 1: VISÃO DO CLIENTE (CONSUMIDOR FINAL - MAPUTO)
         ===================================================================== */}
      {roleView === 'client' && (
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Novo Pedido em Maputo (Envio ou Recolha)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cálculo em Meticais (MT) · Validação direta da frota e código PIN único
                  </p>
                </div>
                <Package className="w-5 h-5 text-amber-400 shrink-0" />
              </div>

              <form onSubmit={handleCreateClientOrder} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Ponto de Origem em Maputo (Restaurante / Recolha)
                    </label>
                    <select
                      value={originIdx}
                      onChange={(e) => setOriginIdx(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {PRESET_ORIGINS.map((loc, idx) => (
                        <option key={loc.label} value={idx}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Ponto de Destino em Maputo (Entrega com PIN)
                    </label>
                    <select
                      value={destIdx}
                      onChange={(e) => setDestIdx(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {PRESET_DESTINATIONS.map((loc, idx) => (
                        <option key={loc.label} value={idx}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Natureza do Item
                      </label>
                      <select
                        value={itemTypeIdx}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setItemTypeIdx(idx);
                          setCustomNotes(ITEM_TYPES[idx].defaultDesc);
                          setSelectedCategory(ITEM_TYPES[idx].recommendedCategory);
                        }}
                        className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {ITEM_TYPES.map((item, idx) => (
                          <option key={item.id} value={idx}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Destinatário / Cliente
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* SELETOR DE CATEGORIA: Classe Regular vs. Classe VIP */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      Selecione a Categoria de Serviço
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      Distância em Maputo: {calculatedQuote.distanceKm} km
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('regular')}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedCategory === 'regular'
                          ? 'bg-emerald-500/10 border-emerald-400 shadow-lg shadow-emerald-950/30'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-sm text-emerald-400">
                            Classe Regular
                          </span>
                          <span className="font-mono font-bold text-base text-white tabular-nums">
                            {formatMetical(calculatedQuote.regularTotal)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                          Mota 125–150cc inspecionada · Baú térmico padrão selado e higienizado ·
                          Colete regulamentar
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                        <span>Alocação Padrão</span>
                        <span>~{calculatedQuote.regularMinutes} min</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory('vip')}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedCategory === 'vip'
                          ? 'bg-amber-500/12 border-amber-400 shadow-lg shadow-amber-950/40'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-sm text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Classe VIP</span>
                          </span>
                          <span className="font-mono font-bold text-base text-amber-300 tabular-nums">
                            {formatMetical(calculatedQuote.vipTotal)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 mt-1.5 leading-relaxed">
                          Mota Elétrica/Alta Cilindrada · Baú térmico duplo Quente/Frio c/ sensor ·
                          Uniforme formal + Stories 5s
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300 font-mono tabular-nums">
                        <span>SLA Prioritário Imediato</span>
                        <span>~{calculatedQuote.vipMinutes} min</span>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full min-h-[48px] py-3 px-5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === 'vip'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Solicitar {selectedCategory === 'vip' ? 'Entrega VIP Express' : 'Entrega Regular'} ·{' '}
                    {formatMetical(
                      selectedCategory === 'vip'
                        ? calculatedQuote.vipTotal
                        : calculatedQuote.regularTotal
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* PERFIL DA FROTA & STORIES 5S */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Frota Homologada em Maputo — Stories (5s)
                </h3>
                <p className="text-xs text-slate-400">
                  Toque num estafeta para ver o vídeo/apresentação de 5s, matrícula e sensor térmico
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {couriers.map((courier) => {
                  const isVip = courier.category === 'vip';
                  const isAssigned = activeCourier.id === courier.id;
                  return (
                    <button
                      key={courier.id}
                      type="button"
                      onClick={() => setStoryCourier(courier)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer group ${
                        isAssigned
                          ? isVip
                            ? 'bg-amber-500/10 border-amber-400'
                            : 'bg-emerald-500/10 border-emerald-400'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full p-0.5 border-2 flex items-center justify-center relative ${
                          isVip ? 'border-amber-400' : 'border-emerald-400'
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-display font-bold text-sm text-white group-hover:scale-105 transition-transform">
                          {courier.avatarInitials}
                        </div>
                        <div
                          className={`absolute -bottom-1 right-0 w-5 h-5 rounded-full flex items-center justify-center text-slate-950 ${
                            isVip ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                        </div>
                      </div>

                      <div className="min-w-0 w-full">
                        <div className="font-semibold text-xs text-white truncate">
                          {courier.name.split(' ')[0]}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            isVip ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {isVip ? '★ VIP 5s' : 'Regular 5s'} · {courier.rating}★
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {orders.map((ord) => {
                const isSelected = ord.id === activeOrder.id;
                const isVip = ord.category === 'vip';
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? isVip
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-emerald-500/15 border-emerald-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-mono font-bold">{ord.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{isVip ? 'VIP' : 'Regular'}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        ord.status === 'delivered' ? 'text-emerald-400' : 'text-amber-300'
                      }
                    >
                      {ord.status === 'delivered' ? 'Concluído' : `${ord.routeProgress}%`}
                    </span>
                  </button>
                );
              })}
            </div>

            <LeafletMap
              activeOrder={activeOrder}
              couriers={couriers}
              mode="single"
              onOpenCourierStory={(c) => setStoryCourier(c)}
            />

            {activeOrder && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">
                        {activeOrder.code} · {activeOrder.dateIso} ·{' '}
                        <span
                          className={
                            activeOrder.category === 'vip'
                              ? 'text-amber-400 font-semibold'
                              : 'text-emerald-400 font-semibold'
                          }
                        >
                          {activeOrder.category === 'vip'
                            ? 'Classe VIP (Express Premium)'
                            : 'Classe Regular'}
                        </span>{' '}
                        · {formatStatusLabel(activeOrder.status)}
                      </div>
                      <h3 className="font-display text-base font-bold text-white mt-1">
                        {activeOrder.restaurantName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Destino: {activeOrder.destination.label} ({activeOrder.customerName})
                      </p>
                    </div>
                    <div className="text-right font-mono tabular-nums shrink-0">
                      <div className="text-xs text-slate-400">Total</div>
                      <div className="text-base font-bold text-white">
                        {formatMetical(activeOrder.totalPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-sm border shrink-0 ${
                          activeCourier.category === 'vip'
                            ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                            : 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                        }`}
                      >
                        {activeCourier.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {activeCourier.name} · {activeCourier.rating} ★
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {activeCourier.vehicleModel} · {activeCourier.vehiclePlate}
                        </div>
                        <div className="text-[11px] font-mono text-amber-400 mt-0.5 tabular-nums">
                          Baú Térmico: {activeCourier.thermalTempHot.toFixed(1)}°C Quente /{' '}
                          {activeCourier.thermalTempCold.toFixed(1)}°C Frio
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStoryCourier(activeCourier)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Story 5s</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        Fotografia de Lacre e Inspeção no Restaurante
                      </span>
                      {activeOrder.sealInspection ? (
                        <span className="font-mono text-emerald-400">
                          ✓ Lacre #{activeOrder.sealInspection.sealCode} às{' '}
                          {activeOrder.sealInspection.capturedAt}
                        </span>
                      ) : (
                        <span className="text-amber-400">
                          Aguardando captura pelo estafeta na recolha
                        </span>
                      )}
                    </div>

                    {activeOrder.sealInspection ? (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        <img
                          src={activeOrder.sealInspection.dataUrl}
                          alt={`Fotografia de lacre ${activeOrder.sealInspection.sealCode}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-400">
                          O estafeta está no restaurante em Maputo e deve registar a fotografia da
                          encomenda selada no compartimento térmico.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRoleView('driver');
                            setSealModalOrder(activeOrder);
                          }}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Simular Recolha
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400">
                        Segurança &amp; Autenticação
                      </span>
                      <KeyRound className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="font-display text-base font-bold text-white">
                      PIN &amp; QR Code da Entrega
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Forneça este código de 4 dígitos ou apresente o QR Code ao estafeta apenas no
                      ato de receção da encomenda em Maputo.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400">
                      PIN de 4 Dígitos ({activeOrder.code})
                    </div>
                    <div className="font-mono text-3xl font-bold tracking-[0.25em] text-amber-400 tabular-nums">
                      {activeOrder.pinCode}
                    </div>

                    <QrCodeGraphic
                      value={activeOrder.qrPayload}
                      size={128}
                      accentColor={activeOrder.category === 'vip' ? '#f59e0b' : '#10b981'}
                    />

                    <div className="flex items-center gap-2 w-full pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeOrder.pinCode);
                          setCopiedPinId(activeOrder.id);
                          setTimeout(() => setCopiedPinId(null), 1800);
                        }}
                        className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {copiedPinId === activeOrder.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">PIN Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar PIN</span>
                          </>
                        )}
                      </button>

                      {activeOrder.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoleView('driver');
                            setDriverPinInput(activeOrder.pinCode);
                          }}
                          className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Validar no App</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {activeOrder.status === 'delivered' && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <div className="text-xs font-semibold text-emerald-300">
                        ✓ Entrega Finalizada em {activeOrder.dateIso} às {activeOrder.deliveredAt}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Avaliação Bilateral:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleSetRating(activeOrder.id, star)}
                              className="p-1 cursor-pointer"
                              aria-label={`Avaliar com ${star} estrelas`}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  (activeOrder.clientRating || 5) >= star
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contextual Quick Chat in Client View */}
                <div className="md:col-span-12">
                  <OrderChatPanel
                    order={activeOrder}
                    courier={activeCourier}
                    currentRole="client"
                    onSendMessage={handleSendOrderChatMessage}
                    onSwitchRole={(target) => setRoleView(target)}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* =====================================================================
          VIEW 2: VISÃO DO MOTORISTA / ESTAFETA (APP DO ENTREGADOR - MAPUTO)
         ===================================================================== */}
      {roleView === 'driver' && (
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Feed de Solicitações — Maputo
                  </h2>
                  <p className="text-xs text-slate-400">
                    Prioridade SLA para Classe VIP · Valores em Meticais (MT)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => playAlertSound('vip')}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Testar Alerta VIP</span>
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {(['all', 'vip', 'regular'] as const).map((flt) => (
                  <button
                    key={flt}
                    type="button"
                    onClick={() => setDriverFilter(flt)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      driverFilter === flt
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {flt === 'all' && `Todas (${orders.length})`}
                    {flt === 'vip' && '★ Classe VIP'}
                    {flt === 'regular' && '● Classe Regular'}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {orders
                  .filter((o) => (driverFilter === 'all' ? true : o.category === driverFilter))
                  .map((order) => {
                    const isVip = order.category === 'vip';
                    const isSelected = order.id === activeOrder.id;
                    return (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setPinFeedback(null);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                          isSelected
                            ? isVip
                              ? 'bg-amber-500/12 border-amber-400'
                              : 'bg-emerald-500/12 border-emerald-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              className={`font-mono font-bold ${
                                isVip ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {order.code}
                            </span>
                            <span className="text-slate-600" aria-hidden="true">·</span>
                            <span
                              className={
                                isVip
                                  ? 'text-amber-300 font-semibold'
                                  : 'text-emerald-300 font-medium'
                              }
                            >
                              {isVip ? 'Prioridade VIP Express' : 'Classe Regular'}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-sm text-white tabular-nums">
                            {formatMetical(order.totalPrice)}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-white">
                            Recolha: {order.restaurantName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Entrega: {order.destination.label} ({order.customerName})
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{formatStatusLabel(order.status)}</span>
                          <span className="font-mono tabular-nums">
                            {order.dateIso} · {order.distanceKm} km
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {activeOrder && (
              <>
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">
                        Terminal de Navegação Maputo · {activeCourier.name} (
                        {activeCourier.vehiclePlate})
                      </div>
                      <h3 className="font-display text-lg font-bold text-white mt-0.5">
                        {activeOrder.code} — {activeOrder.restaurantName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSealModalOrder(activeOrder)}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Camera className="w-4 h-4" />
                        <span>
                          {activeOrder.sealInspection
                            ? 'Atualizar Foto do Lacre'
                            : '1. Capturar Foto do Lacre'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === activeOrder.id
                              ? { ...o, status: 'at_pickup', routeProgress: 15 }
                              : o
                          )
                        )
                      }
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        activeOrder.status === 'to_pickup' || activeOrder.status === 'at_pickup'
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-mono text-amber-400">Etapa 01</div>
                      <div className="text-xs font-semibold mt-0.5">
                        No Restaurante / Recolha
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!activeOrder.sealInspection) {
                          setSealModalOrder(activeOrder);
                        } else {
                          setOrders((prev) =>
                            prev.map((o) =>
                              o.id === activeOrder.id
                                ? { ...o, status: 'in_transit', routeProgress: 65 }
                                : o
                            )
                          );
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        activeOrder.status === 'in_transit'
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-mono text-amber-400">Etapa 02</div>
                      <div className="text-xs font-semibold mt-0.5">
                        {activeOrder.sealInspection
                          ? `Lacre #${activeOrder.sealInspection.sealCode}`
                          : 'Exige Foto do Lacre'}
                      </div>
                    </button>

                    <div
                      className={`p-3 rounded-xl border text-left ${
                        activeOrder.status === 'delivered'
                          ? 'bg-emerald-500/15 border-emerald-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-mono text-emerald-400">Etapa 03</div>
                      <div className="text-xs font-semibold mt-0.5">
                        {activeOrder.status === 'delivered'
                          ? 'Entregue c/ PIN'
                          : 'Validação PIN no Cliente'}
                      </div>
                    </div>
                  </div>
                </div>

                <LeafletMap
                  activeOrder={activeOrder}
                  couriers={couriers}
                  mode="single"
                  heightClass="h-[320px]"
                />

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-white">
                        Autenticação de Entrega — PIN de 4 Dígitos ou Leitor QR Code
                      </h3>
                      <p className="text-xs text-slate-400">
                        O fecho da corrida só é libertado após inserir o PIN fornecido pelo cliente{' '}
                        <span className="font-mono text-amber-300">
                          (Demo PIN: {activeOrder.pinCode})
                        </span>
                      </p>
                    </div>
                  </div>

                  {activeOrder.status === 'delivered' ? (
                    <div className="p-4 rounded-xl bg-emerald-500/12 border border-emerald-500/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-sm font-bold text-white">
                            Entrega {activeOrder.code} Autenticada e Concluída
                          </div>
                          <div className="text-xs text-slate-300">
                            PIN {activeOrder.pinCode} validado em {activeOrder.dateIso} às{' '}
                            {activeOrder.deliveredAt} · Lacre{' '}
                            {activeOrder.sealInspection?.sealCode || 'Verificado'}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-base text-emerald-400 tabular-nums">
                        + {formatMetical(activeOrder.totalPrice)}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          maxLength={4}
                          value={driverPinInput}
                          onChange={(e) =>
                            setDriverPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
                          }
                          placeholder="Digite o PIN (4 dígitos)"
                          className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-700 font-mono text-lg font-bold tracking-widest text-center text-amber-400 tabular-nums focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <button
                          type="button"
                          onClick={() => handleValidateDeliveryPin(activeOrder, driverPinInput)}
                          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>Validar PIN e Concluir</span>
                        </button>
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={() => handleSimulateQrScan(activeOrder)}
                          className="w-full min-h-[48px] px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <QrCode className="w-4 h-4 text-amber-400" />
                          <span>Ler QR Code</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {pinFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        pinFeedback.type === 'success'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {pinFeedback.message}
                    </div>
                  )}
                </div>

                {/* Contextual Quick Chat in Driver View */}
                <OrderChatPanel
                  order={activeOrder}
                  courier={activeCourier}
                  currentRole="driver"
                  onSendMessage={handleSendOrderChatMessage}
                  onSwitchRole={(target) => setRoleView(target)}
                />
              </>
            )}
          </div>
        </main>
      )}

      {/* =====================================================================
          VIEW 3: PAINEL WEB DE DESPACHO & HISTÓRICO DE ENTREGAS (GESTOR / RESTAURANTE)
         ===================================================================== */}
      {roleView === 'dispatch' && (
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Sub-Navigation Bar inside Gestor/Restaurante View: Operação Ativa vs. Histórico de Entregas */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDispatchSubView('operations')}
                className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  dispatchSubView === 'operations'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Despacho &amp; Monitorização Ativa</span>
              </button>

              <button
                type="button"
                onClick={() => setDispatchSubView('history')}
                className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  dispatchSubView === 'history'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>
                  Histórico de Entregas ({orders.filter((o) => o.status === 'delivered').length})
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportPdf(filteredDeliveredHistory)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Exportar Consolidado PDF</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleExportCsvReport(
                    dispatchSubView === 'history' ? filteredDeliveredHistory : orders,
                    dispatchSubView === 'history'
                      ? 'historico_entregas_maputo'
                      : 'relatorio_despacho_maputo'
                  )
                }
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar CSV (MT)</span>
              </button>
            </div>
          </div>

          {/* ===============================================================
              SUB-VIEW A: HISTÓRICO DE ENTREGAS (FILTRO POR DATA + PDF + CSV)
             =============================================================== */}
          {dispatchSubView === 'history' ? (
            <div className="space-y-6">
              {/* Filter Bar: Date Range, Quick Date Presets, Category & Search */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <span>Histórico de Entregas Concluídas — Filtro por Período</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Consulte entregas autenticadas via PIN/QR em Maputo, filtre por intervalo de
                      datas e exporte o relatório consolidado em PDF ou CSV
                    </p>
                  </div>

                  {/* Quick Date Range Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryStartDate('2026-10-25');
                        setHistoryEndDate('2026-10-25');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        historyStartDate === '2026-10-25' && historyEndDate === '2026-10-25'
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hoje (25/10)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryStartDate('2026-10-24');
                        setHistoryEndDate('2026-10-24');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        historyStartDate === '2026-10-24' && historyEndDate === '2026-10-24'
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Ontem (24/10)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryStartDate('2026-10-23');
                        setHistoryEndDate('2026-10-25');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        historyStartDate === '2026-10-23' && historyEndDate === '2026-10-25'
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Últimos 3 Dias
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryStartDate('2026-10-21');
                        setHistoryEndDate('2026-10-25');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        historyStartDate === '2026-10-21' && historyEndDate === '2026-10-25'
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Últimos 5 Dias
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryStartDate('');
                        setHistoryEndDate('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        historyStartDate === '' && historyEndDate === ''
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Todo o Histórico
                    </button>
                  </div>
                </div>

                {/* Date Input Controls + Category Filter + Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={historyStartDate}
                      onChange={(e) => setHistoryStartDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={historyEndDate}
                      onChange={(e) => setHistoryEndDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Categoria de Serviço
                    </label>
                    <select
                      value={historyCategoryFilter}
                      onChange={(e) =>
                        setHistoryCategoryFilter(e.target.value as 'all' | 'vip' | 'regular')
                      }
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="all">Todas as Categorias (VIP &amp; Regular)</option>
                      <option value="vip">Apenas Classe VIP (Express Premium)</option>
                      <option value="regular">Apenas Classe Regular</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Pesquisar Restaurante / Cliente / Código
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder="Ex: Polana, EXP-9031..."
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Consolidated KPI Cards for Filtered Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="text-xs text-slate-400">Entregas no Período Selecionado</div>
                  <div className="font-mono text-2xl font-bold text-white mt-1 tabular-nums">
                    {historySummaryMetrics.count} entregas
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {historySummaryMetrics.vipCount} Classe VIP ·{' '}
                    {historySummaryMetrics.regularCount} Classe Regular
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="text-xs text-slate-400">Volume Faturado Consolidado</div>
                  <div className="font-mono text-2xl font-bold text-white mt-1 tabular-nums">
                    {formatMetical(historySummaryMetrics.grossTotal)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Frete Base: {formatMetical(historySummaryMetrics.baseTotal)}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="text-xs text-slate-400">
                    Retenção da Rede ({commissionPercent}% + VIP)
                  </div>
                  <div className="font-mono text-2xl font-bold text-amber-400 mt-1 tabular-nums">
                    {formatMetical(historySummaryMetrics.platformRetained)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Comissão: {formatMetical(historySummaryMetrics.commissionTotal)} · VIP:{' '}
                    {formatMetical(historySummaryMetrics.vipSuppTotal)}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="text-xs text-slate-400">Repasse Líquido (Frota / Parceiros)</div>
                  <div className="font-mono text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
                    {formatMetical(historySummaryMetrics.partnerNet)}
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">
                    100% Auditado com PIN &amp; Lacre
                  </div>
                </div>
              </div>

              {/* Recharts Analytical View (Filtered by Selected Date Range) */}
              <DispatchAnalyticsCharts
                orders={filteredDeliveredHistory}
                startDate={historyStartDate}
                endDate={historyEndDate}
                commissionPercent={commissionPercent}
              />

              {/* Historical Deliveries Table + Export Bar */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      Registo Consolidado de Entregas Finalizadas
                    </h3>
                    <p className="text-xs text-slate-400">
                      Clique em qualquer entrega para inspecionar a fotografia do lacre térmico ou
                      perfil do estafeta
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={filteredDeliveredHistory.length === 0}
                      onClick={() => handleExportPdf(filteredDeliveredHistory)}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Exportar Relatório Consolidado (PDF)</span>
                    </button>

                    <button
                      type="button"
                      disabled={filteredDeliveredHistory.length === 0}
                      onClick={() =>
                        handleExportCsvReport(
                          filteredDeliveredHistory,
                          'relatorio_historico_consolidado_maputo'
                        )
                      }
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 text-xs font-medium flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Exportar Histórico (CSV)</span>
                    </button>
                  </div>
                </div>

                {filteredDeliveredHistory.length === 0 ? (
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-8 text-center space-y-3">
                    <Filter className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-sm font-semibold text-white">
                      Nenhuma entrega concluída encontrada neste intervalo de datas
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Ajuste a Data Inicial / Data Final ou clique abaixo para mostrar todas as
                      entregas concluídas registadas em Maputo.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryStartDate('');
                        setHistoryEndDate('');
                        setHistoryCategoryFilter('all');
                        setHistorySearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold cursor-pointer"
                    >
                      Limpar Filtros de Data
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 pr-3 font-semibold">Código</th>
                          <th className="py-3 px-3 font-semibold">Data &amp; Hora</th>
                          <th className="py-3 px-3 font-semibold">Categoria</th>
                          <th className="py-3 px-3 font-semibold">Restaurante → Destino</th>
                          <th className="py-3 px-3 font-semibold">Estafeta</th>
                          <th className="py-3 px-3 font-semibold">Lacre Térmico</th>
                          <th className="py-3 px-3 font-semibold text-center">PIN / Aval.</th>
                          <th className="py-3 pl-3 font-semibold text-right">
                            Total / Retido (MT)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {filteredDeliveredHistory.map((order) => {
                          const courier = couriers.find((c) => c.id === order.assignedCourierId);
                          const isVip = order.category === 'vip';
                          const comm =
                            (order.basePrice * commissionPercent) / 100 + order.vipSupplement;

                          return (
                            <tr
                              key={order.id}
                              onClick={() => setPreviewSealOrder(order)}
                              className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <td className="py-3 pr-3 font-mono font-bold text-white whitespace-nowrap">
                                {order.code}
                              </td>
                              <td className="py-3 px-3 font-mono tabular-nums whitespace-nowrap">
                                <div className="text-slate-200">{order.dateIso}</div>
                                <div className="text-[11px] text-emerald-400">
                                  Concluído às {order.deliveredAt || order.createdAt}
                                </div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={
                                    isVip
                                      ? 'text-amber-400 font-semibold'
                                      : 'text-emerald-400 font-medium'
                                  }
                                >
                                  {isVip ? '★ Classe VIP' : '● Regular'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-slate-200 truncate max-w-[230px]">
                                  {order.restaurantName}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[230px]">
                                  → {order.destination.label} ({order.customerName})
                                </div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                {courier ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStoryCourier(courier);
                                    }}
                                    className="text-left hover:underline text-slate-200 cursor-pointer"
                                  >
                                    <div className="font-medium">{courier.name}</div>
                                    <div className="text-[11px] font-mono text-slate-400">
                                      {courier.vehiclePlate}
                                    </div>
                                  </button>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap font-mono">
                                {order.sealInspection ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewSealOrder(order);
                                    }}
                                    className="text-emerald-400 hover:underline cursor-pointer"
                                  >
                                    ✓ #{order.sealInspection.sealCode}
                                  </button>
                                ) : (
                                  <span className="text-slate-400">Verificado</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center font-mono tabular-nums whitespace-nowrap">
                                <div className="text-amber-300 font-bold">PIN {order.pinCode}</div>
                                <div className="text-[11px] text-slate-300">
                                  {order.clientRating || 5}.0 ★
                                </div>
                              </td>
                              <td className="py-3 pl-3 text-right font-mono tabular-nums whitespace-nowrap">
                                <div className="font-bold text-white">
                                  {formatMetical(order.totalPrice)}
                                </div>
                                <div className="text-[11px] text-emerald-400">
                                  Rede: {formatMetical(comm)}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===============================================================
                SUB-VIEW B: OPERAÇÃO ATIVA & TERMINAL DE DESPACHO
               =============================================================== */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="text-xs text-slate-400">
                    Volume Bruto Global ({orders.length} pedidos)
                  </div>
                  <div className="font-mono text-2xl font-bold text-white mt-1 tabular-nums">
                    {formatMetical(financialMetrics.grossVolume)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {financialMetrics.vipCount} Classe VIP · {financialMetrics.regularCount} Regular
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Taxa de Intermediação ({commissionPercent}%)</span>
                    <span className="font-mono text-emerald-400">15%–25%</span>
                  </div>
                  <div className="font-mono text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
                    {formatMetical(financialMetrics.intermediationFee)}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      min={15}
                      max={25}
                      step={1}
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                      aria-label="Ajustar percentagem de comissão entre 15% e 25%"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="text-xs text-slate-400">Suplemento Classe VIP Retido</div>
                  <div className="font-mono text-2xl font-bold text-amber-400 mt-1 tabular-nums">
                    {formatMetical(financialMetrics.vipSupplementRetained)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Taxa fixa prioritária (150,00 MT / entrega VIP)
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                  <div className="text-xs text-slate-400">Receita Líquida Total da Rede</div>
                  <div className="font-mono text-2xl font-bold text-white mt-1 tabular-nums">
                    {formatMetical(financialMetrics.platformTotalRevenue)}
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">
                    Inclui Assinatura Frota &amp; Destaques
                  </div>
                </div>
              </div>

              {/* Recharts Analytical View in Operations Sub-View */}
              <DispatchAnalyticsCharts
                orders={orders}
                startDate={historyStartDate}
                endDate={historyEndDate}
                commissionPercent={commissionPercent}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-bold text-white">
                        Terminal de Despacho Rápido &amp; Em Lote (Maputo)
                      </h2>
                      <p className="text-xs text-slate-400">
                        Alocação imediata para restaurantes parceiros em Maputo
                      </p>
                    </div>
                    <Truck className="w-5 h-5 text-amber-400" />
                  </div>

                  <form onSubmit={handleQuickDispatch} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Estabelecimento / Restaurante Parceiro (Maputo)
                      </label>
                      <select
                        value={dispatchRestaurant}
                        onChange={(e) => setDispatchRestaurant(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        {PRESET_ORIGINS.map((o, idx) => (
                          <option key={o.label} value={idx}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Destino da Entrega em Maputo
                        </label>
                        <select
                          value={dispatchDest}
                          onChange={(e) => setDispatchDest(Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        >
                          {PRESET_DESTINATIONS.map((d, idx) => (
                            <option key={d.label} value={idx}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Cliente Destinatário
                        </label>
                        <input
                          type="text"
                          value={dispatchCustomer}
                          onChange={(e) => setDispatchCustomer(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Categoria de Alocação da Frota
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDispatchCategory('vip')}
                          className={`h-10 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                            dispatchCategory === 'vip'
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          ★ Classe VIP (Imediato)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDispatchCategory('regular')}
                          className={`h-10 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                            dispatchCategory === 'regular'
                              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          ● Classe Regular (Padrão)
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                      <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                        <span>Assinatura de Frota Dedicada (+1.200,00 MT/dia)</span>
                        <input
                          type="checkbox"
                          checked={hasDedicatedFleetSub}
                          onChange={(e) => setHasDedicatedFleetSub(e.target.checked)}
                          className="accent-amber-400"
                        />
                      </label>
                      <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                        <span>Destaque Patrocinado no Feed (+750,00 MT/dia)</span>
                        <input
                          type="checkbox"
                          checked={hasSponsoredFeed}
                          onChange={(e) => setHasSponsoredFeed(e.target.checked)}
                          className="accent-amber-400"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <button
                        type="submit"
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Despachar Pedido Único</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBatchDispatch}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Despachar Lote (3 Motas)</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <LeafletMap
                    activeOrder={activeOrder}
                    allOrders={orders}
                    couriers={couriers}
                    mode="fleet"
                    onSelectOrder={(id) => setSelectedOrderId(id)}
                    heightClass="h-[380px]"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      Monitor de Entregas Ativas em Maputo, SLA &amp; Auditoria de Lacre
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rastreio em tempo real de todas as motas, códigos PIN e comissões em Meticais (MT)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                      {(['all', 'active', 'delivered'] as const).map((flt) => (
                        <button
                          key={flt}
                          type="button"
                          onClick={() => setDispatchFilter(flt)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                            dispatchFilter === flt
                              ? 'bg-slate-800 text-white font-semibold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {flt === 'all' && 'Todas'}
                          {flt === 'active' && 'Em Curso'}
                          {flt === 'delivered' && 'Concluídas'}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDispatchSubView('history')}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Filtrar por Data &amp; PDF</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 pr-3 font-semibold">Pedido</th>
                        <th className="py-3 px-3 font-semibold">Data</th>
                        <th className="py-3 px-3 font-semibold">Categoria</th>
                        <th className="py-3 px-3 font-semibold">Restaurante → Cliente (Maputo)</th>
                        <th className="py-3 px-3 font-semibold">Estafeta Atribuído</th>
                        <th className="py-3 px-3 font-semibold">Lacre Térmico</th>
                        <th className="py-3 px-3 font-semibold">SLA / Estado</th>
                        <th className="py-3 px-3 font-semibold text-right">PIN</th>
                        <th className="py-3 pl-3 font-semibold text-right">Total / Comissão (MT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {orders
                        .filter((o) => {
                          if (dispatchFilter === 'active') return o.status !== 'delivered';
                          if (dispatchFilter === 'delivered') return o.status === 'delivered';
                          return true;
                        })
                        .map((order) => {
                          const courier = couriers.find((c) => c.id === order.assignedCourierId);
                          const isVip = order.category === 'vip';
                          const comm =
                            (order.basePrice * commissionPercent) / 100 + order.vipSupplement;

                          return (
                            <tr
                              key={order.id}
                              onClick={() => setSelectedOrderId(order.id)}
                              className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <td className="py-3 pr-3 font-mono font-bold text-white whitespace-nowrap">
                                {order.code}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                                {order.dateIso}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={
                                    isVip
                                      ? 'text-amber-400 font-semibold'
                                      : 'text-emerald-400 font-medium'
                                  }
                                >
                                  {isVip ? '★ Classe VIP' : '● Regular'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-slate-200 truncate max-w-[220px]">
                                  {order.restaurantName}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                                  → {order.destination.label} ({order.customerName})
                                </div>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                {courier ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStoryCourier(courier);
                                    }}
                                    className="text-left hover:underline text-slate-200 cursor-pointer"
                                  >
                                    <div className="font-medium">{courier.name}</div>
                                    <div className="text-[11px] font-mono text-slate-400">
                                      {courier.vehiclePlate} · {courier.thermalTempHot.toFixed(1)}°C
                                    </div>
                                  </button>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap font-mono">
                                {order.sealInspection ? (
                                  <span className="text-emerald-400">
                                    ✓ #{order.sealInspection.sealCode}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSealModalOrder(order);
                                    }}
                                    className="text-amber-400 underline cursor-pointer"
                                  >
                                    Registar Lacre
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="text-slate-200">
                                  {formatStatusLabel(order.status)}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                                  Alvo SLA: {order.slaTargetMinutes} min ({order.routeProgress}%)
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-amber-300 tabular-nums">
                                {order.pinCode}
                              </td>
                              <td className="py-3 pl-3 text-right font-mono tabular-nums whitespace-nowrap">
                                <div className="font-bold text-white">
                                  {formatMetical(order.totalPrice)}
                                </div>
                                <div className="text-[11px] text-emerald-400">
                                  Rede: {formatMetical(comm)}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 items-center h-16 px-2"
        aria-label="Navegação Mobile"
      >
        <button
          type="button"
          onClick={() => setRoleView('client')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            roleView === 'client' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">1. Cliente</span>
        </button>

        <button
          type="button"
          onClick={() => setRoleView('driver')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            roleView === 'driver' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Bike className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">2. Estafeta</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRoleView('dispatch');
            setDispatchSubView('operations');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            roleView === 'dispatch' && dispatchSubView === 'operations'
              ? 'text-amber-400'
              : 'text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">3. Despacho</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRoleView('dispatch');
            setDispatchSubView('history');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
            roleView === 'dispatch' && dispatchSubView === 'history'
              ? 'text-emerald-400'
              : 'text-slate-400'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Histórico</span>
        </button>
      </nav>

      {/* MODALS */}
      <CourierStoryModal courier={storyCourier} onClose={() => setStoryCourier(null)} />

      <SealCaptureModal
        order={sealModalOrder}
        courier={activeCourier}
        onClose={() => setSealModalOrder(null)}
        onConfirmSeal={handleConfirmSeal}
      />

      <HostingerExportModal
        isOpen={isHostingerModalOpen}
        onClose={() => setIsHostingerModalOpen(false)}
      />

      {/* Historical Order Seal Inspection Preview Modal */}
      {previewSealOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Auditoria de Entrega Concluída · {previewSealOrder.code}
                </h3>
                <p className="text-xs text-slate-400">
                  Data: {previewSealOrder.dateIso} às{' '}
                  {previewSealOrder.deliveredAt || previewSealOrder.createdAt} · PIN{' '}
                  {previewSealOrder.pinCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSealOrder(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {previewSealOrder.sealInspection && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={previewSealOrder.sealInspection.dataUrl}
                  alt={`Evidência de lacre ${previewSealOrder.sealInspection.sealCode}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-52 object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Origem (Maputo)</span>
                <span className="font-semibold text-white">
                  {previewSealOrder.restaurantName}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Destino / Cliente</span>
                <span className="font-semibold text-white">
                  {previewSealOrder.destination.label} ({previewSealOrder.customerName})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                Lacre: {previewSealOrder.sealInspection?.sealCode || 'Verificado'} · Avaliação:{' '}
                {previewSealOrder.clientRating || 5} ★
              </span>
              <span className="font-mono font-bold text-base text-amber-400">
                {formatMetical(previewSealOrder.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Install Modal */}
      {showIOSInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              Instalar App Express no iPhone / iPad
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Toque no ícone <strong>Partilhar</strong> na barra do Safari.
              <br />
              2. Selecione <strong>Adicionar ao Ecrã Principal</strong> para executar em ecrã
              inteiro como PWA nativo.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSInstallModal(false)}
              className="w-full min-h-[44px] rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
