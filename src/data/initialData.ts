import { CourierProfile, DeliveryOrder, LatLngPoint } from '../types';

export const PRESET_ORIGINS: LatLngPoint[] = [
  {
    lat: -25.9672,
    lng: 32.5968,
    label: 'Hotel Polana Serena · Av. Julius Nyerere (Polana)',
    address: 'Av. Julius Nyerere 1380, Polana Cimento, Maputo, Moçambique',
  },
  {
    lat: -25.9739,
    lng: 32.5732,
    label: 'Restaurante Zambi · Av. 10 de Novembro (Marginal)',
    address: 'Av. 10 de Novembro 8, Baixa / Marginal, Maputo, Moçambique',
  },
  {
    lat: -25.9792,
    lng: 32.5944,
    label: 'Dhow Maputo · Ponta Vermelha',
    address: 'Rua de Marracuene 45, Ponta Vermelha, Maputo, Moçambique',
  },
  {
    lat: -25.9568,
    lng: 32.5942,
    label: 'Mundo’s Executive Kitchen · Sommerschield',
    address: 'Av. Julius Nyerere 657, Sommerschield, Maputo, Moçambique',
  },
  {
    lat: -25.9655,
    lng: 32.5878,
    label: 'Restaurante Piri-Piri · Av. 24 de Julho',
    address: 'Av. 24 de Julho, esquina c/ Av. Salvador Allende, Maputo, Moçambique',
  },
  {
    lat: -25.9325,
    lng: 32.6164,
    label: 'Campo di Mare · Av. da Marginal (Costa do Sol)',
    address: 'Av. da Marginal, Bairro Triunfo / Costa do Sol, Maputo, Moçambique',
  },
];

export const PRESET_DESTINATIONS: LatLngPoint[] = [
  {
    lat: -25.9718,
    lng: 32.5858,
    label: 'Torres Rani · Av. da Marginal (Piso 14)',
    address: 'Av. da Marginal, Torre Corporativa Rani, Maputo, Moçambique',
  },
  {
    lat: -25.9704,
    lng: 32.5712,
    label: 'Complexo JAT · Av. 25 de Setembro (Baixa)',
    address: 'Av. 25 de Setembro 420, Baixa de Maputo, Moçambique',
  },
  {
    lat: -25.9512,
    lng: 32.5985,
    label: 'Condomínio Sommerschield II · Rua Damião de Góis',
    address: 'Rua Damião de Góis, Sommerschield, Maputo, Moçambique',
  },
  {
    lat: -25.9574,
    lng: 32.5812,
    label: 'Residência Diplomática · Bairro Coop',
    address: 'Rua da Imprensa, Bairro Coop, Maputo, Moçambique',
  },
  {
    lat: -25.9442,
    lng: 32.6085,
    label: 'Baía Mall Maputo · Av. da Marginal',
    address: 'Av. da Marginal, Centro Empresarial Baía Mall, Maputo, Moçambique',
  },
  {
    lat: -25.9682,
    lng: 32.5736,
    label: 'Praça da Independência · Av. Samora Machel',
    address: 'Av. Samora Machel 120, Centro de Maputo, Moçambique',
  },
];

export const ITEM_TYPES = [
  {
    id: 'gastronomia_vip',
    label: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
    recommendedCategory: 'vip' as const,
    defaultDesc: 'Lagosta Grelhada da Polana + Sobremesa Gelada em divisórias Quente/Fria',
  },
  {
    id: 'refeicao_diaria',
    label: 'Refeição Executiva Selada',
    recommendedCategory: 'regular' as const,
    defaultDesc: 'Frango Zambeziana / Caril de Camarão em embalagem térmica selada',
  },
  {
    id: 'documentos_valiosos',
    label: 'Contrato / Documentação Bancária Confidencial',
    recommendedCategory: 'vip' as const,
    defaultDesc: 'Envelope lacrado com entrega presencial exclusiva mediante PIN em Maputo',
  },
  {
    id: 'pastelaria_eventos',
    label: 'Pastelaria Fina & Bebidas Climatizadas',
    recommendedCategory: 'vip' as const,
    defaultDesc: 'Transporte estabilizado com controlo térmico 4°C na divisória fria',
  },
];

export const COURIER_FLEET: CourierProfile[] = [
  {
    id: 'courier-vip-1',
    name: 'Edmilson Macamo',
    category: 'vip',
    rating: 4.98,
    totalDeliveries: 642,
    vehicleModel: 'BMW CE 04 Elétrica · 31 kW',
    vehiclePlate: 'MMA-88-26',
    vehicleSpecs: 'Mota 100% Elétrica de alta cilindrada · Suspensão estabilizada anti-vibração',
    cargoEquipment: 'Baú Térmico Duplo Reforçado com divisórias Quente/Frio e sensor ativo',
    uniformProtocol: 'Uniforme completo premium antracite, luvas homologadas e protocolo formal',
    thermalTempHot: 65.4,
    thermalTempCold: 3.8,
    avatarInitials: 'EM',
    accentColor: '#f59e0b',
    currentLocation: { lat: -25.9695, lng: 32.5912 },
    verifiedDate: 'Vistoria Homologada Maputo · Hoje 08:15',
    stories: [
      {
        id: 'st-1',
        title: 'Apresentação Formal do Estafeta (5s)',
        subtitle: 'Protocolo Executivo Classe VIP Maputo · Uniforme Completo Homologado',
        durationSec: 5,
        type: 'driver_profile',
        metrics: [
          { label: 'Classificação Bilateral', value: '4.98 ★ (642 entregas em Maputo)' },
          { label: 'Certificação Atendimento', value: 'Protocolo VIP Nível Ouro' },
          { label: 'Pontualidade SLA', value: '99.4% no prazo prioritário' },
        ],
        inspectionNote: 'Estafeta verificado biometricamente na base da Polana com uniforme executivo completo e crachá digital ativo.',
      },
      {
        id: 'st-2',
        title: 'Vistoria Técnica do Veículo (5s)',
        subtitle: 'BMW CE 04 Elétrica · Matrícula MMA-88-26 · Estado Impecável',
        durationSec: 5,
        type: 'vehicle_inspection',
        metrics: [
          { label: 'Autonomia & Bateria', value: '94% · Tração Silenciosa Zero Emissões' },
          { label: 'Estabilização de Carga', value: 'Amortecimento Hidráulico Nível 3' },
          { label: 'Higienização Exterior', value: 'Inspecionado às 08:15' },
        ],
        inspectionNote: 'Veículo elétrico de alta cilindrada aprovado na inspeção visual HD para circulação na Av. Julius Nyerere e Marginal.',
      },
      {
        id: 'st-3',
        title: 'Baú Térmico Duplo & Sensor Ativo (5s)',
        subtitle: 'Divisórias Quente/Fria Isoladas · Telemetria em Tempo Real',
        durationSec: 5,
        type: 'thermal_sensor',
        metrics: [
          { label: 'Câmara Quente Superior', value: '65.4 °C (Estável)' },
          { label: 'Câmara Fria Inferior', value: '3.8 °C (Climatizada)' },
          { label: 'Esterilização UV-C', value: 'Ciclo Concluído 100%' },
        ],
        inspectionNote: 'Compartimento térmico duplo com isolamento reforçado para o clima de Maputo e leitura contínua de temperatura.',
      },
    ],
  },
  {
    id: 'courier-vip-2',
    name: 'Samira Nhantumbo',
    category: 'vip',
    rating: 4.96,
    totalDeliveries: 518,
    vehicleModel: 'Honda Forza 350 ABS · Euro 5+',
    vehiclePlate: 'MCZ-42-91',
    vehicleSpecs: 'Maxi-Scooter 330cc de maior cilindrada em estado impecável',
    cargoEquipment: 'Baú Térmico Duplo Reforçado com divisórias Quente/Frio e sensor térmico',
    uniformProtocol: 'Uniforme completo premium, postura executiva e protocolo formal',
    thermalTempHot: 64.8,
    thermalTempCold: 4.1,
    avatarInitials: 'SN',
    accentColor: '#f59e0b',
    currentLocation: { lat: -25.9739, lng: 32.5732 },
    verifiedDate: 'Vistoria Homologada Maputo · Hoje 08:30',
    stories: [
      {
        id: 'st-201',
        title: 'Apresentação Formal do Estafeta (5s)',
        subtitle: 'Samira Nhantumbo · Especialista em Entregas Gourmet & Corporativas',
        durationSec: 5,
        type: 'driver_profile',
        metrics: [
          { label: 'Classificação Bilateral', value: '4.96 ★ (518 entregas)' },
          { label: 'Protocolo VIP', value: 'Uniforme Executivo Completo' },
          { label: 'Tempo Médio Recolha', value: '3.2 min (Alocação Imediata)' },
        ],
        inspectionNote: 'Apresentação gravada na base operacional de Sommerschield com validação de equipamento e uniforme formal.',
      },
      {
        id: 'st-202',
        title: 'Vistoria Técnica Honda Forza 350 (5s)',
        subtitle: 'Matrícula MCZ-42-91 · Maior Cilindrada & Suporte Anti-Oscilação',
        durationSec: 5,
        type: 'vehicle_inspection',
        metrics: [
          { label: 'Cilindrada / Potência', value: '330cc · Controlo de Binário HSTC' },
          { label: 'Estado de Conservação', value: 'Grau A+ Impecável' },
          { label: 'Suporte de Baú', value: 'Chassi Reforçado Anti-Impacto' },
        ],
        inspectionNote: 'Mota de maior cilindrada homologada para ligações rápidas entre Polana, Baixa e Costa do Sol.',
      },
      {
        id: 'st-203',
        title: 'Baú Térmico Duplo & Sensor (5s)',
        subtitle: 'Divisórias Independentes · Quente 64.8°C / Frio 4.1°C',
        durationSec: 5,
        type: 'thermal_sensor',
        metrics: [
          { label: 'Divisória Quente', value: '64.8 °C' },
          { label: 'Divisória Fria', value: '4.1 °C' },
          { label: 'Sensor de Abertura', value: 'Bloqueio Magnético Ativo' },
        ],
        inspectionNote: 'Zero contaminação térmica entre bebidas/sobremesas frias e pratos principais quentes.',
      },
    ],
  },
  {
    id: 'courier-reg-1',
    name: 'Nelson Sitoe',
    category: 'regular',
    rating: 4.87,
    totalDeliveries: 390,
    vehicleModel: 'Honda PCX 125cc eSP+',
    vehiclePlate: 'MMP-19-44',
    vehicleSpecs: 'Mota standard (125cc) em estado funcional e inspecionado',
    cargoEquipment: 'Baú térmico padrão, selado, limpo e higienizado (45L)',
    uniformProtocol: 'Colete refletor e capacete regulamentado com identificação da rede',
    thermalTempHot: 58.2,
    thermalTempCold: 12.0,
    avatarInitials: 'NS',
    accentColor: '#10b981',
    currentLocation: { lat: -25.9568, lng: 32.5942 },
    verifiedDate: 'Verificado Maputo · Hoje 09:00',
    stories: [
      {
        id: 'st-301',
        title: 'Perfil Verificado Classe Regular (5s)',
        subtitle: 'Nelson Sitoe · Colete e Capacete Regulamentado da Rede',
        durationSec: 5,
        type: 'driver_profile',
        metrics: [
          { label: 'Classificação por Estrelas', value: '4.87 ★ (390 entregas)' },
          { label: 'Equipamento de Segurança', value: 'Colete & Capacete Homologados' },
          { label: 'SLA de Atendimento', value: 'Alocação por Proximidade Padrão' },
        ],
        inspectionNote: 'Estafeta registado com identificação visível da Rede Express Transparente em Maputo.',
      },
      {
        id: 'st-302',
        title: 'Foto & Inspeção do Veículo 125cc (5s)',
        subtitle: 'Honda PCX 125cc · Matrícula MMP-19-44',
        durationSec: 5,
        type: 'vehicle_inspection',
        metrics: [
          { label: 'Categoria de Veículo', value: 'Standard 125cc-150cc' },
          { label: 'Inspeção Mecânica', value: 'Funcional & Aprovada' },
          { label: 'Baú Térmico Padrão', value: 'Selado, Limpo e Higienizado' },
        ],
        inspectionNote: 'Veículo ágil para entregas urbanas em Maputo com excelente relação custo-benefício.',
      },
    ],
  },
  {
    id: 'courier-reg-2',
    name: 'Celso Mondlane',
    category: 'regular',
    rating: 4.84,
    totalDeliveries: 275,
    vehicleModel: 'Yamaha NMAX 155cc',
    vehiclePlate: 'MMC-73-12',
    vehicleSpecs: 'Mota standard (150cc) em estado funcional e inspecionado',
    cargoEquipment: 'Baú térmico padrão, selado, limpo e higienizado',
    uniformProtocol: 'Colete e capacete regulamentado com identificação da rede',
    thermalTempHot: 57.5,
    thermalTempCold: 12.5,
    avatarInitials: 'CM',
    accentColor: '#10b981',
    currentLocation: { lat: -25.9655, lng: 32.5878 },
    verifiedDate: 'Verificado Maputo · Hoje 09:10',
    stories: [
      {
        id: 'st-401',
        title: 'Perfil Verificado Classe Regular (5s)',
        subtitle: 'Celso Mondlane · Yamaha NMAX 155cc',
        durationSec: 5,
        type: 'driver_profile',
        metrics: [
          { label: 'Classificação', value: '4.84 ★ (275 entregas)' },
          { label: 'Baú Térmico', value: 'Padrão Selado e Higienizado' },
          { label: 'SLA', value: 'Proximidade Padrão na Rede' },
        ],
        inspectionNote: 'Verificação diária de higiene do baú térmico e identificação regulamentar concluída em Maputo.',
      },
    ],
  },
];

export function createSealSnapshotDataUrl(params: {
  orderCode: string;
  sealCode: string;
  restaurantName: string;
  courierName: string;
  category: 'vip' | 'regular';
  tempHot: number;
  tempCold: number;
  timestamp: string;
}): string {
  const accent = params.category === 'vip' ? '#f59e0b' : '#10b981';
  const badgeText = params.category === 'vip' ? 'CLASSE VIP · BAÚ DUPLO SENSOR ATIVO' : 'CLASSE REGULAR · BAÚ SELADO HIGIENIZADO';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#334155" stroke-width="0.6" opacity="0.4"/>
      </pattern>
    </defs>
    <rect width="640" height="400" fill="url(#bg)"/>
    <rect width="640" height="400" fill="url(#grid)"/>
    <rect x="28" y="24" width="584" height="352" rx="18" fill="#0f172a" stroke="${accent}" stroke-width="2.5" stroke-opacity="0.7"/>
    <rect x="48" y="42" width="544" height="42" rx="8" fill="#1e293b"/>
    <circle cx="72" cy="63" r="7" fill="${accent}"/>
    <text x="90" y="68" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">${badgeText}</text>
    <text x="574" y="68" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">${params.timestamp}</text>
    <rect x="64" y="104" width="290" height="196" rx="12" fill="#162032" stroke="#475569" stroke-width="1.5"/>
    <rect x="96" y="136" width="226" height="134" rx="10" fill="#1e293b" stroke="${accent}" stroke-width="2"/>
    <rect x="96" y="188" width="226" height="30" fill="${accent}" opacity="0.9"/>
    <text x="209" y="208" fill="#090d16" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">LACRE #${params.sealCode}</text>
    <circle cx="209" cy="158" r="16" fill="#090d16" stroke="${accent}" stroke-width="2"/>
    <path d="M202 158 L207 163 L217 153" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="374" y="104" width="218" height="196" rx="12" fill="#162032" stroke="#334155" stroke-width="1.5"/>
    <text x="392" y="132" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">PEDIDO VERIFICADO (MAPUTO)</text>
    <text x="392" y="154" fill="#f8fafc" font-family="monospace" font-size="16" font-weight="bold">${params.orderCode}</text>
    <text x="392" y="184" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">SENSOR TÉRMICO BAÚ</text>
    <text x="392" y="206" fill="#f59e0b" font-family="monospace" font-size="15" font-weight="bold">Quente: ${params.tempHot.toFixed(1)} °C</text>
    <text x="392" y="226" fill="#38bdf8" font-family="monospace" font-size="15" font-weight="bold">Frio: ${params.tempCold.toFixed(1)} °C</text>
    <text x="392" y="258" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">ESTAFETA RESPONSÁVEL</text>
    <text x="392" y="278" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="bold">${params.courierName}</text>
    <text x="48" y="336" fill="#cbd5e1" font-family="sans-serif" font-size="12">Origem: ${params.restaurantName}</text>
    <text x="48" y="356" fill="#10b981" font-family="monospace" font-size="12" font-weight="bold">✓ FOTOGRAFIA DE LACRE E INSPEÇÃO AUTENTICADA EM MAPUTO</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_ORDERS: DeliveryOrder[] = [
  {
    id: 'ord-9042',
    code: 'EXP-9042',
    dateIso: '2026-10-25',
    createdAt: '13:18',
    restaurantName: 'Hotel Polana Serena · Av. Julius Nyerere (Polana)',
    customerName: 'Dr. Lourenço Matsinhe',
    customerPhone: '+258 84 321 9010',
    itemType: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
    itemDescription: 'Lagosta Grelhada da Polana + Sobremesa Gelada (Divisória Quente/Fria Ativa)',
    category: 'vip',
    status: 'in_transit',
    origin: PRESET_ORIGINS[0],
    destination: PRESET_DESTINATIONS[0],
    courierLocation: { lat: -25.9695, lng: 32.5912 },
    routeProgress: 56,
    distanceKm: 1.8,
    estimatedMinutes: 7,
    slaTargetMinutes: 12,
    basePrice: 220,
    vipSupplement: 150,
    totalPrice: 370,
    pinCode: '4829',
    qrPayload: 'EXPRESS-VIP:EXP-9042:PIN-4829',
    assignedCourierId: 'courier-vip-1',
    sealInspection: {
      capturedAt: '13:21:08',
      sealCode: 'VIP-8841-A',
      compartmentTempHot: 65.4,
      compartmentTempCold: 3.8,
      packagingIntegrity: 'Impecável · Duplo Lacre',
      notes: 'Embalagem selada pelo Chef no Polana Serena e posicionada no compartimento duplo com sensor ativo.',
      dataUrl: createSealSnapshotDataUrl({
        orderCode: 'EXP-9042',
        sealCode: 'VIP-8841-A',
        restaurantName: 'Hotel Polana Serena · Maputo',
        courierName: 'Edmilson Macamo (MMA-88-26)',
        category: 'vip',
        tempHot: 65.4,
        tempCold: 3.8,
        timestamp: '13:21:08',
      }),
    },
    chatMessages: [
      {
        id: 'msg-9042-1',
        sender: 'system',
        senderName: 'Rede Express Maputo',
        text: 'Sessão de comunicação direta iniciada para o pedido EXP-9042 (Classe VIP Express Premium).',
        timestamp: '13:18',
        contextTag: 'SLA VIP Ativo',
      },
      {
        id: 'msg-9042-2',
        sender: 'driver',
        senderName: 'Edmilson Macamo',
        text: 'Boa tarde Dr. Lourenço! Encomenda recolhida no Hotel Polana Serena com Lacre #VIP-8841-A. Baú térmico estabilizado a 65.4°C (Quente) e 3.8°C (Frio).',
        timestamp: '13:21',
        contextTag: 'Lacre #VIP-8841-A',
      },
      {
        id: 'msg-9042-3',
        sender: 'client',
        senderName: 'Dr. Lourenço Matsinhe',
        text: 'Excelente, Edmilson! Ao chegar às Torres Rani na Marginal, avise na receção do Piso 14. Já tenho o PIN de 4 dígitos pronto.',
        timestamp: '13:22',
        contextTag: 'Instrução de Entrega',
      },
      {
        id: 'msg-9042-4',
        sender: 'driver',
        senderName: 'Edmilson Macamo',
        text: 'Confirmado! Já estou a descer pela Av. Julius Nyerere rumo à Marginal. Chego em cerca de 4 minutos.',
        timestamp: '13:24',
        contextTag: 'Em Rota GPS',
      },
    ],
  },
  {
    id: 'ord-9045',
    code: 'EXP-9045',
    dateIso: '2026-10-25',
    createdAt: '13:24',
    restaurantName: 'Restaurante Zambi · Av. 10 de Novembro (Marginal)',
    customerName: 'Dra. Graça Chissano',
    customerPhone: '+258 82 410 5500',
    itemType: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
    itemDescription: 'Camarão Tigre Grelhado + Espumante Brut 4°C (Exige Foto de Lacre na Recolha)',
    category: 'vip',
    status: 'at_pickup',
    origin: PRESET_ORIGINS[1],
    destination: PRESET_DESTINATIONS[2],
    courierLocation: { lat: -25.9739, lng: 32.5732 },
    routeProgress: 12,
    distanceKm: 3.4,
    estimatedMinutes: 11,
    slaTargetMinutes: 15,
    basePrice: 280,
    vipSupplement: 150,
    totalPrice: 430,
    pinCode: '7391',
    qrPayload: 'EXPRESS-VIP:EXP-9045:PIN-7391',
    assignedCourierId: 'courier-vip-2',
    chatMessages: [
      {
        id: 'msg-9045-1',
        sender: 'system',
        senderName: 'Rede Express Maputo',
        text: 'Estafeta VIP Samira Nhantumbo (Honda Forza 350 · MCZ-42-91) chegou ao Restaurante Zambi para recolha.',
        timestamp: '13:24',
        contextTag: 'No Restaurante',
      },
      {
        id: 'msg-9045-2',
        sender: 'client',
        senderName: 'Dra. Graça Chissano',
        text: 'Olá Samira, por favor confirme se o espumante vai na divisória fria de 4°C antes de sair da Marginal.',
        timestamp: '13:25',
        contextTag: 'Controlo Térmico',
      },
      {
        id: 'msg-9045-3',
        sender: 'driver',
        senderName: 'Samira Nhantumbo',
        text: 'Boa tarde Dra. Graça! Sim, estou neste momento a selar o compartimento frio a 4.1°C e já envio a foto do lacre térmico.',
        timestamp: '13:26',
        contextTag: 'Inspeção de Lacre',
      },
    ],
  },
  {
    id: 'ord-9048',
    code: 'REG-9048',
    dateIso: '2026-10-25',
    createdAt: '13:26',
    restaurantName: 'Mundo’s Executive Kitchen · Sommerschield',
    customerName: 'Eng. Tomás Guebuza',
    customerPhone: '+258 84 609 1180',
    itemType: 'Refeição Executiva Selada',
    itemDescription: 'Menu Executivo Almoço em embalagem selada padrão',
    category: 'regular',
    status: 'to_pickup',
    origin: PRESET_ORIGINS[3],
    destination: PRESET_DESTINATIONS[3],
    courierLocation: { lat: -25.9568, lng: 32.5942 },
    routeProgress: 8,
    distanceKm: 1.6,
    estimatedMinutes: 14,
    slaTargetMinutes: 20,
    basePrice: 180,
    vipSupplement: 0,
    totalPrice: 180,
    pinCode: '2054',
    qrPayload: 'EXPRESS-REG:REG-9048:PIN-2054',
    assignedCourierId: 'courier-reg-1',
    chatMessages: [
      {
        id: 'msg-9048-1',
        sender: 'system',
        senderName: 'Rede Express Maputo',
        text: 'Estafeta Nelson Sitoe (Honda PCX 125cc · MMP-19-44) alocado para recolha em Sommerschield.',
        timestamp: '13:26',
        contextTag: 'Alocação Regular',
      },
      {
        id: 'msg-9048-2',
        sender: 'driver',
        senderName: 'Nelson Sitoe',
        text: 'Boa tarde Eng. Tomás! Estou a chegar ao Mundo’s na Av. Julius Nyerere para recolher o seu pedido.',
        timestamp: '13:27',
        contextTag: 'A Caminho da Recolha',
      },
    ],
  },
  // DELIVERED ORDERS ACROSS 5 DAYS (2026-10-21 TO 2026-10-25) FOR RECHARTS ANALYTICAL TRENDS
  {
    id: 'ord-9031',
    code: 'EXP-9031',
    dateIso: '2026-10-25',
    createdAt: '12:40',
    restaurantName: 'Dhow Maputo · Ponta Vermelha',
    customerName: 'Dr. Filipe Cossa',
    customerPhone: '+258 84 902 8810',
    itemType: 'Contrato / Documentação Bancária Confidencial',
    itemDescription: 'Dossier Lacrado + Documentação Autenticada para JAT Complex',
    category: 'vip',
    status: 'delivered',
    origin: PRESET_ORIGINS[2],
    destination: PRESET_DESTINATIONS[1],
    courierLocation: PRESET_DESTINATIONS[1],
    routeProgress: 100,
    distanceKm: 2.5,
    estimatedMinutes: 0,
    slaTargetMinutes: 12,
    basePrice: 240,
    vipSupplement: 150,
    totalPrice: 390,
    pinCode: '9182',
    qrPayload: 'EXPRESS-VIP:EXP-9031:PIN-9182',
    assignedCourierId: 'courier-vip-1',
    deliveredAt: '12:51',
    clientRating: 5,
    driverRating: 5,
    sealInspection: {
      capturedAt: '12:42:19',
      sealCode: 'VIP-7710-X',
      compartmentTempHot: 64.0,
      compartmentTempCold: 4.0,
      packagingIntegrity: 'Impecável · Duplo Lacre',
      notes: 'Lacre numerado conferido na recolha na Ponta Vermelha.',
      dataUrl: createSealSnapshotDataUrl({
        orderCode: 'EXP-9031',
        sealCode: 'VIP-7710-X',
        restaurantName: 'Dhow Maputo · Ponta Vermelha',
        courierName: 'Edmilson Macamo (MMA-88-26)',
        category: 'vip',
        tempHot: 64.0,
        tempCold: 4.0,
        timestamp: '12:42:19',
      }),
    },
  },
  {
    id: 'ord-9028',
    code: 'EXP-9028',
    dateIso: '2026-10-25',
    createdAt: '11:50',
    restaurantName: 'Hotel Polana Serena · Av. Julius Nyerere (Polana)',
    customerName: 'Dra. Luísa Diogo',
    customerPhone: '+258 84 300 4120',
    itemType: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
    itemDescription: 'Menu Degustação Polana + Tartar Refrigerado 3.9°C',
    category: 'vip',
    status: 'delivered',
    origin: PRESET_ORIGINS[0],
    destination: PRESET_DESTINATIONS[3],
    courierLocation: PRESET_DESTINATIONS[3],
    routeProgress: 100,
    distanceKm: 2.2,
    estimatedMinutes: 0,
    slaTargetMinutes: 12,
    basePrice: 250,
    vipSupplement: 150,
    totalPrice: 400,
    pinCode: '4109',
    qrPayload: 'EXPRESS-VIP:EXP-9028:PIN-4109',
    assignedCourierId: 'courier-vip-2',
    deliveredAt: '12:01',
    clientRating: 5,
    driverRating: 5,
    sealInspection: {
      capturedAt: '11:52:10',
      sealCode: 'VIP-9012-P',
      compartmentTempHot: 65.1,
      compartmentTempCold: 3.9,
      packagingIntegrity: 'Impecável · Duplo Lacre',
      notes: 'Lacre duplo verificado na Polana Cimento.',
      dataUrl: createSealSnapshotDataUrl({
        orderCode: 'EXP-9028',
        sealCode: 'VIP-9012-P',
        restaurantName: 'Hotel Polana Serena · Maputo',
        courierName: 'Samira Nhantumbo (MCZ-42-91)',
        category: 'vip',
        tempHot: 65.1,
        tempCold: 3.9,
        timestamp: '11:52:10',
      }),
    },
  },
  {
    id: 'ord-9024',
    code: 'REG-9024',
    dateIso: '2026-10-25',
    createdAt: '11:15',
    restaurantName: 'Restaurante Piri-Piri · Av. 24 de Julho',
    customerName: 'Nádia Langa',
    customerPhone: '+258 85 274 5120',
    itemType: 'Refeição Executiva Selada',
    itemDescription: 'Frango à Cafreal Duplo em baú higienizado',
    category: 'regular',
    status: 'delivered',
    origin: PRESET_ORIGINS[4],
    destination: PRESET_DESTINATIONS[5],
    courierLocation: PRESET_DESTINATIONS[5],
    routeProgress: 100,
    distanceKm: 1.7,
    estimatedMinutes: 0,
    slaTargetMinutes: 20,
    basePrice: 190,
    vipSupplement: 0,
    totalPrice: 190,
    pinCode: '6410',
    qrPayload: 'EXPRESS-REG:REG-9024:PIN-6410',
    assignedCourierId: 'courier-reg-2',
    deliveredAt: '11:32',
    clientRating: 5,
    driverRating: 5,
    sealInspection: {
      capturedAt: '11:18:04',
      sealCode: 'REG-5102-B',
      compartmentTempHot: 58.0,
      compartmentTempCold: 12.0,
      packagingIntegrity: 'Selado · Padrão Higienizado',
      notes: 'Embalagem selada verificada na Av. 24 de Julho.',
      dataUrl: createSealSnapshotDataUrl({
        orderCode: 'REG-9024',
        sealCode: 'REG-5102-B',
        restaurantName: 'Restaurante Piri-Piri · Maputo',
        courierName: 'Celso Mondlane (MMC-73-12)',
        category: 'regular',
        tempHot: 58.0,
        tempCold: 12.0,
        timestamp: '11:18:04',
      }),
    },
  },
  {
    id: 'ord-8994',
    code: 'EXP-8994',
    dateIso: '2026-10-24',
    createdAt: '19:40',
    restaurantName: 'Campo di Mare · Av. da Marginal (Costa do Sol)',
    customerName: 'Embaixador Carlos Mucavele',
    customerPhone: '+258 84 110 2290',
    itemType: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
    itemDescription: 'Garoupa Grelhada + Vinho Branco Climatizado 4°C',
    category: 'vip',
    status: 'delivered',
    origin: PRESET_ORIGINS[5],
    destination: PRESET_DESTINATIONS[2],
    courierLocation: PRESET_DESTINATIONS[2],
    routeProgress: 100,
    distanceKm: 4.1,
    estimatedMinutes: 0,
    slaTargetMinutes: 15,
    basePrice: 310,
    vipSupplement: 150,
    totalPrice: 460,
    pinCode: '5518',
    qrPayload: 'EXPRESS-VIP:EXP-8994:PIN-5518',
    assignedCourierId: 'courier-vip-2',
    deliveredAt: '19:53',
    clientRating: 5,
    driverRating: 5,
    sealInspection: {
      capturedAt: '19:42:10',
      sealCode: 'VIP-6091-M',
      compartmentTempHot: 65.0,
      compartmentTempCold: 4.0,
      packagingIntegrity: 'Impecável · Duplo Lacre',
      notes: 'Lacre térmico duplo verificado no Campo di Mare.',
      dataUrl: createSealSnapshotDataUrl({
        orderCode: 'EXP-8994',
        sealCode: 'VIP-6091-M',
        restaurantName: 'Campo di Mare · Costa do Sol',
        courierName: 'Samira Nhantumbo (MCZ-42-91)',
        category: 'vip',
        tempHot: 65.0,
        tempCold: 4.0,
        timestamp: '19:42:10',
      }),
    },
  },
  {
    id: 'ord-8981',
    code: 'REG-8981',
    dateIso: '2026-10-24',
    createdAt: '14:10',
    restaurantName: 'Mundo’s Executive Kitchen · Sommerschield',
    customerName: 'Arq. Joana Mondlane',
    customerPhone: '+258 82 778 3410',
    itemType: 'Refeição Executiva Selada',
    itemDescription: 'Pizza Artesanal + Bebida em baú selado',
    category: 'regular',
    status: 'delivered',
    origin: PRESET_ORIGINS[3],
    destination: PRESET_DESTINATIONS[4],
    courierLocation: PRESET_DESTINATIONS[4],
    routeProgress: 100,
    distanceKm: 2.3,
    estimatedMinutes: 0,
    slaTargetMinutes: 20,
    basePrice: 210,
    vipSupplement: 0,
    totalPrice: 210,
    pinCode: '3094',
    qrPayload: 'EXPRESS-REG:REG-8981:PIN-3094',
    assignedCourierId: 'courier-reg-1',
    deliveredAt: '14:27',
    clientRating: 5,
    driverRating: 5,
    sealInspection: {
      capturedAt: '14:13:00',
      sealCode: 'REG-4429-C',
      compartmentTempHot: 58.4,
      compartmentTempCold: 11.8,
      packagingIntegrity: 'Selado · Padrão Higienizado',
      notes: 'Lacre padrão conferido em Sommerschield.',
      dataUrl: createSealSnapshotDataUrl({
        orderCode: 'REG-8981',
        sealCode: 'REG-4429-C',
        restaurantName: 'Mundo’s · Sommerschield',
        courierName: 'Nelson Sitoe (MMP-19-44)',
        category: 'regular',
        tempHot: 58.4,
        tempCold: 11.8,
        timestamp: '14:13:00',
      }),
    },
  },
  {
    id: 'ord-8975',
    code: 'REG-8975',
    dateIso: '2026-10-24',
    createdAt: '12:20',
    restaurantName: 'Restaurante Piri-Piri · Av. 24 de Julho',
    customerName: 'Dr. Hélder Muteia',
    customerPhone: '+258 84 612 9080',
    itemType: 'Refeição Executiva Selada',
    itemDescription: 'Bife na Caçarola em embalagem térmica selada',
    category: 'regular',
    status: 'delivered',
    origin: PRESET_ORIGINS[4],
    destination: PRESET_DESTINATIONS[1],
    courierLocation: PRESET_DESTINATIONS[1],
    routeProgress: 100,
    distanceKm: 1.9,
    estimatedMinutes: 0,
    slaTargetMinutes: 20,
    basePrice: 195,
    vipSupplement: 0,
    totalPrice: 195,
    pinCode: '7120',
    qrPayload: 'EXPRESS-REG:REG-8975:PIN-7120',
    assignedCourierId: 'courier-reg-2',
    deliveredAt: '12:36',
    clientRating: 5,
    driverRating: 5,
  },
  {
    id: 'ord-8920',
    code: 'EXP-8920',
    dateIso: '2026-10-23',
    createdAt: '20:05',
    restaurantName: 'Hotel Polana Serena · Av. Julius Nyerere (Polana)',
    customerName: 'Dr. Agostinho Zacarias',
    customerPhone: '+258 84 555 8190',
    itemType: 'Pastelaria Fina & Bebidas Climatizadas',
    itemDescription: 'Degustação Aquarius Sushi & Champagne Climatizado 3.8°C',
    category: 'vip',
    status: 'delivered',
    origin: PRESET_ORIGINS[0],
    destination: PRESET_DESTINATIONS[3],
    courierLocation: PRESET_DESTINATIONS[3],
    routeProgress: 100,
    distanceKm: 2.0,
    estimatedMinutes: 0,
    slaTargetMinutes: 12,
    basePrice: 230,
    vipSupplement: 150,
    totalPrice: 380,
    pinCode: '8472',
    qrPayload: 'EXPRESS-VIP:EXP-8920:PIN-8472',
    assignedCourierId: 'courier-vip-1',
    deliveredAt: '20:15',
    clientRating: 5,
    driverRating: 5,
    sealInspection: {
      capturedAt: '20:07:12',
      sealCode: 'VIP-3109-Z',
      compartmentTempHot: 65.2,
      compartmentTempCold: 3.8,
      packagingIntegrity: 'Impecável · Duplo Lacre',
      notes: 'Divisória fria estabilizada a 3.8°C.',
      dataUrl: createSealSnapshotDataUrl({
        orderCode: 'EXP-8920',
        sealCode: 'VIP-3109-Z',
        restaurantName: 'Hotel Polana Serena · Maputo',
        courierName: 'Edmilson Macamo (MMA-88-26)',
        category: 'vip',
        tempHot: 65.2,
        tempCold: 3.8,
        timestamp: '20:07:12',
      }),
    },
  },
  {
    id: 'ord-8911',
    code: 'REG-8911',
    dateIso: '2026-10-23',
    createdAt: '13:10',
    restaurantName: 'Restaurante Zambi · Av. 10 de Novembro (Marginal)',
    customerName: 'Dra. Catarina Nhampossa',
    customerPhone: '+258 82 901 3320',
    itemType: 'Refeição Executiva Selada',
    itemDescription: 'Caril de Caranguejo Tradicional Selado',
    category: 'regular',
    status: 'delivered',
    origin: PRESET_ORIGINS[1],
    destination: PRESET_DESTINATIONS[5],
    courierLocation: PRESET_DESTINATIONS[5],
    routeProgress: 100,
    distanceKm: 1.5,
    estimatedMinutes: 0,
    slaTargetMinutes: 18,
    basePrice: 185,
    vipSupplement: 0,
    totalPrice: 185,
    pinCode: '2941',
    qrPayload: 'EXPRESS-REG:REG-8911:PIN-2941',
    assignedCourierId: 'courier-reg-1',
    deliveredAt: '13:26',
    clientRating: 5,
    driverRating: 5,
  },
  {
    id: 'ord-8860',
    code: 'EXP-8860',
    dateIso: '2026-10-22',
    createdAt: '19:15',
    restaurantName: 'Dhow Maputo · Ponta Vermelha',
    customerName: 'Comendador Rui Manjate',
    customerPhone: '+258 84 700 1122',
    itemType: 'Alta Gastronomia Quente & Frio (Mariscos / Gourmet)',
    itemDescription: 'Prato Principal Gourmet + Sobremesa Fria 4°C',
    category: 'vip',
    status: 'delivered',
    origin: PRESET_ORIGINS[2],
    destination: PRESET_DESTINATIONS[0],
    courierLocation: PRESET_DESTINATIONS[0],
    routeProgress: 100,
    distanceKm: 2.3,
    estimatedMinutes: 0,
    slaTargetMinutes: 12,
    basePrice: 260,
    vipSupplement: 150,
    totalPrice: 410,
    pinCode: '6190',
    qrPayload: 'EXPRESS-VIP:EXP-8860:PIN-6190',
    assignedCourierId: 'courier-vip-2',
    deliveredAt: '19:26',
    clientRating: 5,
    driverRating: 5,
  },
  {
    id: 'ord-8812',
    code: 'EXP-8812',
    dateIso: '2026-10-21',
    createdAt: '13:05',
    restaurantName: 'Hotel Polana Serena · Av. Julius Nyerere (Polana)',
    customerName: 'Eng. Mateus Langa',
    customerPhone: '+258 84 441 8890',
    itemType: 'Contrato / Documentação Bancária Confidencial',
    itemDescription: 'Documentação Corporativa Lacrada para Torres Rani',
    category: 'vip',
    status: 'delivered',
    origin: PRESET_ORIGINS[0],
    destination: PRESET_DESTINATIONS[0],
    courierLocation: PRESET_DESTINATIONS[0],
    routeProgress: 100,
    distanceKm: 1.8,
    estimatedMinutes: 0,
    slaTargetMinutes: 10,
    basePrice: 220,
    vipSupplement: 150,
    totalPrice: 370,
    pinCode: '5028',
    qrPayload: 'EXPRESS-VIP:EXP-8812:PIN-5028',
    assignedCourierId: 'courier-vip-1',
    deliveredAt: '13:14',
    clientRating: 5,
    driverRating: 5,
  },
  {
    id: 'ord-8804',
    code: 'REG-8804',
    dateIso: '2026-10-21',
    createdAt: '12:30',
    restaurantName: 'Mundo’s Executive Kitchen · Sommerschield',
    customerName: 'Paula Chissano',
    customerPhone: '+258 82 310 9900',
    itemType: 'Refeição Executiva Selada',
    itemDescription: 'Almoço Executivo Sommerschield',
    category: 'regular',
    status: 'delivered',
    origin: PRESET_ORIGINS[3],
    destination: PRESET_DESTINATIONS[2],
    courierLocation: PRESET_DESTINATIONS[2],
    routeProgress: 100,
    distanceKm: 1.4,
    estimatedMinutes: 0,
    slaTargetMinutes: 18,
    basePrice: 175,
    vipSupplement: 0,
    totalPrice: 175,
    pinCode: '1833',
    qrPayload: 'EXPRESS-REG:REG-8804:PIN-1833',
    assignedCourierId: 'courier-reg-2',
    deliveredAt: '12:45',
    clientRating: 5,
    driverRating: 5,
  },
];

// Synthesized Web Audio alert differentiating VIP (Harmonic Gold Fanfare) vs Regular (Double Pulse) vs Success
export function playAlertSound(type: 'vip' | 'regular' | 'success' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'vip') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.09);
        gain.gain.setValueAtTime(0.001, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.16, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.3);
      });
    } else if (type === 'regular') {
      const freqs = [440, 587.33];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.12);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.22);
      });
    } else if (type === 'success') {
      const freqs = [587.33, 880];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
}
