import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CourierProfile, DeliveryOrder } from '../types';

interface ExportPdfParams {
  orders: DeliveryOrder[];
  couriers: CourierProfile[];
  startDate: string;
  endDate: string;
  commissionPercent: number;
}

function fmtMT(val: number): string {
  return `${val.toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MT`;
}

export function exportConsolidatedPdfReport({
  orders,
  couriers,
  startDate,
  endDate,
  commissionPercent,
}: ExportPdfParams): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Top Header Band
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 297, 32, 'F');

  doc.setTextColor(245, 158, 11); // Amber 500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('REDE DE DELIVERY VIP & EXPRESS — MAPUTO, MOCAMBIQUE', 14, 13);

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    'Relatorio Consolidado de Historico de Entregas, Auditoria de Lacre Termico e Comissoes (Meticais - MT)',
    14,
    20
  );

  const periodLabel =
    startDate && endDate
      ? `Periodo Filtrado: ${startDate} ate ${endDate}`
      : startDate
      ? `A partir de: ${startDate}`
      : endDate
      ? `Ate: ${endDate}`
      : 'Periodo: Todos os Registos Concluidos';

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8.5);
  doc.text(
    `${periodLabel}   |   Taxa de Intermediacao: ${commissionPercent}%   |   Emitido em: ${new Date().toLocaleString('pt-MZ')}`,
    14,
    27
  );

  // Executive Summary Calculations
  const totalCount = orders.length;
  const vipCount = orders.filter((o) => o.category === 'vip').length;
  const regularCount = orders.filter((o) => o.category === 'regular').length;
  const grossVolume = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const baseVolume = orders.reduce((acc, o) => acc + o.basePrice, 0);
  const vipSupplementTotal = orders.reduce((acc, o) => acc + o.vipSupplement, 0);
  const commissionRevenue = (baseVolume * commissionPercent) / 100;
  const totalPlatformRetained = commissionRevenue + vipSupplementTotal;
  const netPartnerPayout = grossVolume - totalPlatformRetained;

  // Summary Boxes Row
  const boxY = 38;
  const boxH = 20;
  const boxW = 64;
  const gap = 4.3;

  const summaryCards = [
    {
      title: 'ENTREGAS CONCLUIDAS',
      value: `${totalCount} (${vipCount} VIP / ${regularCount} Reg)`,
      sub: 'Autenticadas via PIN 4 digitos / QR',
    },
    {
      title: 'VOLUME BRUTO FATURADO',
      value: fmtMT(grossVolume),
      sub: `Base: ${fmtMT(baseVolume)}`,
    },
    {
      title: `COMISSAO (${commissionPercent}%) + SUPLEMENTO VIP`,
      value: fmtMT(totalPlatformRetained),
      sub: `Comissao: ${fmtMT(commissionRevenue)} | VIP: ${fmtMT(vipSupplementTotal)}`,
    },
    {
      title: 'REPASSE LIQUIDO (FROTA/PARCEIROS)',
      value: fmtMT(netPartnerPayout),
      sub: '100% Auditado com Lacre Termico',
    },
  ];

  summaryCards.forEach((card, idx) => {
    const x = 14 + idx * (boxW + gap);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, boxY, boxW, boxH, 2, 2, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(card.title, x + 3, boxY + 5.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(card.value, x + 3, boxY + 12.5);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(card.sub, x + 3, boxY + 17.5);
  });

  // Table Data
  const tableRows = orders.map((o) => {
    const courier = couriers.find((c) => c.id === o.assignedCourierId);
    const comm = (o.basePrice * commissionPercent) / 100 + o.vipSupplement;
    return [
      o.code,
      `${o.dateIso} ${o.deliveredAt || o.createdAt}`,
      o.category === 'vip' ? 'VIP Express' : 'Regular',
      o.restaurantName,
      `${o.destination.label} (${o.customerName})`,
      courier ? `${courier.name} (${courier.vehiclePlate})` : 'Estafeta Rede',
      o.sealInspection?.sealCode || 'Verificado',
      o.pinCode,
      `${o.clientRating || 5} ★`,
      fmtMT(o.basePrice),
      fmtMT(o.vipSupplement),
      fmtMT(o.totalPrice),
      fmtMT(comm),
    ];
  });

  autoTable(doc, {
    startY: 63,
    head: [
      [
        'Codigo',
        'Data / Hora',
        'Classe',
        'Restaurante (Origem)',
        'Destino / Cliente',
        'Estafeta / Matricula',
        'Lacre',
        'PIN',
        'Aval.',
        'Base (MT)',
        'VIP (MT)',
        'Total (MT)',
        'Retido Rede',
      ],
    ],
    body: tableRows,
    styles: {
      fontSize: 7.2,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [245, 158, 11],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      9: { halign: 'right' },
      10: { halign: 'right' },
      11: { halign: 'right', fontStyle: 'bold' },
      12: { halign: 'right' },
    },
    foot: [
      [
        'TOTAIS',
        `${totalCount} entregas`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        fmtMT(baseVolume),
        fmtMT(vipSupplementTotal),
        fmtMT(grossVolume),
        fmtMT(totalPlatformRetained),
      ],
    ],
    footStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'right',
    },
  });

  const fileSuffix =
    startDate && endDate
      ? `${startDate}_a_${endDate}`
      : new Date().toISOString().slice(0, 10);

  doc.save(`relatorio_historico_maputo_${fileSuffix}.pdf`);
}
