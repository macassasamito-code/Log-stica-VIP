/**
 * Rede de Delivery VIP & Express — App Express Transparente (Maputo, Moçambique)
 * Lógica Reativa Completa em Meticais (MT) · Hostinger public_html / GitHub Autonomous Build
 */
const STORAGE_KEY = 'express_transparente_maputo_state_v2';

const DEFAULT_STATE = {
  role: 'client', // 'client' | 'driver' | 'dispatch'
  commissionRate: 20,
  orders: [
    {
      id: 'EXP-9042',
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
      id: 'EXP-9045',
      restaurantName: 'Restaurante Zambi · Av. 10 de Novembro (Marginal)',
      customerName: 'Dra. Graça Chissano',
      itemType: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
      category: 'vip',
      status: 'at_pickup',
      origin: { lat: -25.9739, lng: 32.5732, label: 'Restaurante Zambi · Marginal' },
      destination: { lat: -25.9512, lng: 32.5985, label: 'Condomínio Sommerschield II' },
      routeProgress: 12,
      distanceKm: 3.4,
      basePrice: 280,
      vipSupplement: 150,
      totalPrice: 430,
      pinCode: '7391',
      courierName: 'Samira Nhantumbo',
      vehicle: 'Honda Forza 350 ABS (MCZ-42-91)',
      tempHot: 64.8,
      tempCold: 4.1,
      sealCaptured: false,
      sealCode: ''
    }
  ],
  selectedOrderId: 'EXP-9042'
};

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || DEFAULT_STATE;
let mapInstance = null;
let mapLayerGroup = null;

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

function getSelectedOrder() {
  return state.orders.find((o) => o.id === state.selectedOrderId) || state.orders[0];
}

function createOrder(e) {
  e.preventDefault();
  const form = e.target;
  const category = form.category.value;
  const isVip = category === 'vip';
  const pinCode = String(Math.floor(1000 + Math.random() * 9000));
  const id = `${isVip ? 'EXP' : 'REG'}-${Math.floor(9100 + Math.random() * 899)}`;
  const basePrice = 220;
  const vipSupplement = isVip ? 150 : 0;

  const newOrder = {
    id,
    restaurantName: form.origin.value,
    customerName: form.customer.value || 'Cliente Executivo Maputo',
    itemType: form.itemType.value,
    category,
    status: 'at_pickup',
    origin: { lat: -25.9672, lng: 32.5968, label: form.origin.value },
    destination: { lat: -25.9704, lng: 32.5712, label: form.destination.value },
    routeProgress: 10,
    distanceKm: 2.2,
    basePrice,
    vipSupplement,
    totalPrice: basePrice + vipSupplement,
    pinCode,
    courierName: isVip ? 'Edmilson Macamo' : 'Nelson Sitoe',
    vehicle: isVip ? 'BMW CE 04 Elétrica (MMA-88-26)' : 'Honda PCX 125cc (MMP-19-44)',
    tempHot: isVip ? 65.2 : 58.0,
    tempCold: isVip ? 3.9 : 12.0,
    sealCaptured: false,
    sealCode: ''
  };

  state.orders.unshift(newOrder);
  state.selectedOrderId = newOrder.id;
  saveState();
}

function captureSeal(orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;
  order.sealCaptured = true;
  order.sealCode = `${order.category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  order.status = 'in_transit';
  order.routeProgress = 35;
  saveState();
}

function validatePin(orderId) {
  const inputEl = document.getElementById('driver-pin-input');
  const msgEl = document.getElementById('pin-feedback');
  const order = state.orders.find((o) => o.id === orderId);
  if (!order || !inputEl) return;

  if (inputEl.value.trim() === order.pinCode) {
    order.status = 'delivered';
    order.routeProgress = 100;
    saveState();
  } else if (msgEl) {
    msgEl.textContent = 'PIN incorreto. Solicite o código de 4 dígitos ao cliente.';
    msgEl.className = 'text-xs text-rose-400 mt-2';
  }
}

function initOrUpdateMap() {
  const container = document.getElementById('leaflet-map');
  if (!container || typeof L === 'undefined') return;

  const order = getSelectedOrder();
  if (!mapInstance) {
    mapInstance = L.map('leaflet-map').setView([-25.9655, 32.5892], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO · Maputo, Moçambique'
    }).addTo(mapInstance);
    mapLayerGroup = L.layerGroup().addTo(mapInstance);
  }

  mapLayerGroup.clearLayers();
  if (!order) return;

  const ratio = order.routeProgress / 100;
  const curLat = order.origin.lat + (order.destination.lat - order.origin.lat) * ratio;
  const curLng = order.origin.lng + (order.destination.lng - order.origin.lng) * ratio;
  const color = order.category === 'vip' ? '#f59e0b' : '#10b981';

  L.polyline([[order.origin.lat, order.origin.lng], [order.destination.lat, order.destination.lng]], {
    color,
    weight: 4
  }).addTo(mapLayerGroup);

  L.circleMarker([order.origin.lat, order.origin.lng], { radius: 7, color: '#94a3b8' })
    .bindPopup('Recolha Maputo: ' + order.origin.label)
    .addTo(mapLayerGroup);

  L.circleMarker([order.destination.lat, order.destination.lng], { radius: 8, color })
    .bindPopup('Destino Maputo · PIN ' + order.pinCode)
    .addTo(mapLayerGroup);

  L.circleMarker([curLat, curLng], { radius: 10, color, fillColor: color, fillOpacity: 0.9 })
    .bindPopup(order.courierName + ' (' + order.routeProgress + '%)')
    .addTo(mapLayerGroup);
}

function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;
  const order = getSelectedOrder();

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 class="text-xl font-bold text-white">Rede de Delivery VIP & Express — Maputo, Moçambique</h1>
          <p class="text-xs text-slate-400">App Express Transparente · Moeda em Metical (MT) · Rastreamento 2D · Validação PIN/QR</p>
        </div>
        <div class="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button onclick="setRole('client')" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${state.role === 'client' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}">1. Visão Cliente</button>
          <button onclick="setRole('driver')" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${state.role === 'driver' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}">2. Visão Estafeta</button>
          <button onclick="setRole('dispatch')" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${state.role === 'dispatch' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}">3. Despacho Web</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 space-y-4">
          <div id="leaflet-map" class="border border-slate-800"></div>
          <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="text-xs text-slate-400">${order.id} · ${order.category === 'vip' ? 'Classe VIP Express' : 'Classe Regular'} · ${formatMT(order.totalPrice)}</span>
              <h2 class="text-lg font-bold text-white">${order.restaurantName} → ${order.destination.label}</h2>
              <p class="text-xs text-slate-400">${order.courierName} · ${order.vehicle} · Sensor ${order.tempHot}°C / ${order.tempCold}°C</p>
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-400">PIN de Validação</div>
              <div class="text-2xl font-mono font-bold text-amber-400">${order.pinCode}</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 space-y-4">
          ${state.role === 'client' ? `
            <form onsubmit="createOrder(event)" class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 class="text-base font-bold text-white">Solicitar Entrega Express em Maputo</h3>
              <input name="origin" required value="Hotel Polana Serena · Av. Julius Nyerere" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" placeholder="Origem em Maputo" />
              <input name="destination" required value="Torres Rani · Av. da Marginal" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" placeholder="Destino em Maputo" />
              <input name="customer" value="Dr. Lourenço Matsinhe" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" placeholder="Nome do Cliente" />
              <select name="itemType" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                <option value="Alta Gastronomia Quente & Frio">Alta Gastronomia Quente & Frio</option>
                <option value="Contrato / Documentação Confidencial">Contrato / Documentação Confidencial</option>
                <option value="Refeição Executiva Selada">Refeição Executiva Selada</option>
              </select>
              <select name="category" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-semibold">
                <option value="vip">Classe VIP (Express Premium) · +150,00 MT</option>
                <option value="regular">Classe Regular · Tarifa Base (220,00 MT)</option>
              </select>
              <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Confirmar Pedido & Gerar PIN</button>
            </form>
          ` : ''}

          ${state.role === 'driver' ? `
            <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 class="text-base font-bold text-white">Terminal do Estafeta Maputo · ${order.id}</h3>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div class="text-xs text-slate-400 mb-2">Etapa 1: Fotografia de Lacre e Inspeção no Restaurante</div>
                ${order.sealCaptured
                  ? `<div class="text-xs text-emerald-400 font-mono">✓ Lacre #${order.sealCode} registado no baú térmico</div>`
                  : `<button onclick="captureSeal('${order.id}')" class="w-full py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Capturar Foto de Lacre e Iniciar Rota</button>`
                }
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div class="text-xs text-slate-400 mb-2">Etapa 2: Autenticação por PIN de 4 Dígitos (Dica: ${order.pinCode})</div>
                <div class="flex gap-2">
                  <input id="driver-pin-input" maxlength="4" placeholder="PIN 4 dígitos" class="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white" />
                  <button onclick="validatePin('${order.id}')" class="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">Validar Entrega</button>
                </div>
                <div id="pin-feedback"></div>
              </div>
            </div>
          ` : ''}

          ${state.role === 'dispatch' ? `
            <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 class="text-base font-bold text-white">Painel Web de Despacho & Comissões (MT)</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div class="text-xs text-slate-400">Volume Total</div>
                  <div class="text-lg font-mono font-bold text-white">${formatMT(state.orders.reduce((s, o) => s + o.totalPrice, 0))}</div>
                </div>
                <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div class="text-xs text-slate-400">Suplemento VIP Retido</div>
                  <div class="text-lg font-mono font-bold text-amber-400">${formatMT(state.orders.reduce((s, o) => s + o.vipSupplement, 0))}</div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  mapInstance = null;
  setTimeout(initOrUpdateMap, 60);
}

window.setRole = setRole;
window.createOrder = createOrder;
window.captureSeal = captureSeal;
window.validatePin = validatePin;

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  setInterval(() => {
    let updated = false;
    state.orders.forEach((o) => {
      if (o.status === 'in_transit' && o.routeProgress < 96) {
        o.routeProgress = Math.min(96, o.routeProgress + 2);
        updated = true;
      }
    });
    if (updated) initOrUpdateMap();
  }, 3000);
});
