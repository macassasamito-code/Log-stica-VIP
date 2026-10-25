/**
 * Rede de Delivery VIP & Express — App Express Transparente (Maputo, Moçambique)
 * Lógica Reativa Completa em Meticais (MT) com Histórico de Entregas & Exportação PDF/CSV
 */
const STORAGE_KEY = 'express_transparente_maputo_state_v3';

const DEFAULT_STATE = {
  role: 'client', // 'client' | 'driver' | 'dispatch' | 'history'
  commissionRate: 20,
  historyStartDate: '2026-10-23',
  historyEndDate: '2026-10-25',
  orders: [
    {
      id: 'EXP-9042',
      dateIso: '2026-10-25',
      restaurantName: 'Hotel Polana Serena · Av. Julius Nyerere (Polana)',
      customerName: 'Dr. Lourenço Matsinhe',
      itemType: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
      category: 'vip',
      status: 'in_transit',
      origin: { lat: -25.9672, lng: 32.5968, label: 'Hotel Polana Serena · Polana' },
      destination: { lat: -25.9718, lng: 32.5858, label: 'Torres Rani · Av. da Marginal' },
      routeProgress: 58,
      distanceKm: 1.8,
      basePrice: 220,
      vipSupplement: 150,
      totalPrice: 370,
      pinCode: '4829',
      courierName: 'Edmilson Macamo',
      vehicle: 'BMW CE 04 Elétrica (MMA-88-26)',
      tempHot: 65.4,
      tempCold: 3.8,
      sealCaptured: true,
      sealCode: 'VIP-8841-A'
    },
    {
      id: 'EXP-9031',
      dateIso: '2026-10-25',
      restaurantName: 'Dhow Maputo · Ponta Vermelha',
      customerName: 'Dr. Filipe Cossa',
      itemType: 'Contrato / Documentação Confidencial',
      category: 'vip',
      status: 'delivered',
      origin: { lat: -25.9792, lng: 32.5944, label: 'Dhow Maputo · Ponta Vermelha' },
      destination: { lat: -25.9704, lng: 32.5712, label: 'Complexo JAT · Baixa' },
      routeProgress: 100,
      distanceKm: 2.5,
      basePrice: 240,
      vipSupplement: 150,
      totalPrice: 390,
      pinCode: '9182',
      courierName: 'Edmilson Macamo',
      vehicle: 'BMW CE 04 Elétrica (MMA-88-26)',
      tempHot: 64.0,
      tempCold: 4.0,
      sealCaptured: true,
      sealCode: 'VIP-7710-X'
    },
    {
      id: 'EXP-8994',
      dateIso: '2026-10-24',
      restaurantName: 'Campo di Mare · Av. da Marginal (Costa do Sol)',
      customerName: 'Embaixador Carlos Mucavele',
      itemType: 'Alta Gastronomia Quente & Frio',
      category: 'vip',
      status: 'delivered',
      origin: { lat: -25.9325, lng: 32.6164, label: 'Campo di Mare · Costa do Sol' },
      destination: { lat: -25.9512, lng: 32.5985, label: 'Condomínio Sommerschield II' },
      routeProgress: 100,
      distanceKm: 4.1,
      basePrice: 310,
      vipSupplement: 150,
      totalPrice: 460,
      pinCode: '5518',
      courierName: 'Samira Nhantumbo',
      vehicle: 'Honda Forza 350 ABS (MCZ-42-91)',
      tempHot: 65.0,
      tempCold: 4.0,
      sealCaptured: true,
      sealCode: 'VIP-6091-M'
    }
  ],
  selectedOrderId: 'EXP-9042'
};

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || DEFAULT_STATE;

function formatMT(val) {
  return Number(val).toFixed(2).replace('.', ',') + ' MT';
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderApp();
}

function setRole(newRole) {
  state.role = newRole;
  saveState();
}

function getFilteredHistory() {
  return state.orders.filter((o) => {
    if (o.status !== 'delivered') return false;
    if (state.historyStartDate && o.dateIso < state.historyStartDate) return false;
    if (state.historyEndDate && o.dateIso > state.historyEndDate) return false;
    return true;
  });
}

function exportHistoryCsv() {
  const list = getFilteredHistory();
  const headers = ['Codigo', 'Data', 'Categoria', 'Restaurante', 'Cliente', 'PIN', 'Lacre', 'Total_MT'];
  const rows = list.map((o) => [
    o.id,
    o.dateIso,
    o.category.toUpperCase(),
    `"${o.restaurantName}"`,
    `"${o.customerName}"`,
    o.pinCode,
    o.sealCode || 'Verificado',
    o.totalPrice.toFixed(2)
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `historico_entregas_maputo_${state.historyStartDate || 'geral'}.csv`;
  a.click();
}

function exportHistoryPdf() {
  window.print();
}

window.setRole = setRole;
window.exportHistoryCsv = exportHistoryCsv;
window.exportHistoryPdf = exportHistoryPdf;
