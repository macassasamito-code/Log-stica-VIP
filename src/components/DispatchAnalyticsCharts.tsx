import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DeliveryOrder } from '../types';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DispatchAnalyticsChartsProps {
  orders: DeliveryOrder[];
  startDate: string;
  endDate: string;
  commissionPercent: number;
}

interface DailyAggregateRow {
  dateIso: string;
  shortDate: string;
  vipDeliveries: number;
  regularDeliveries: number;
  totalDeliveries: number;
  grossRevenueMT: number;
  platformRetainedMT: number;
  partnerNetMT: number;
  vipRevenueMT: number;
  regularRevenueMT: number;
}

function formatShortDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}`;
}

export const DispatchAnalyticsCharts: React.FC<DispatchAnalyticsChartsProps> = ({
  orders,
  startDate,
  endDate,
  commissionPercent,
}) => {
  const [barLayout, setBarLayout] = useState<'grouped' | 'stacked'>('grouped');

  // Aggregate daily trends over the selected date range
  const dailyData = useMemo<DailyAggregateRow[]>(() => {
    const map = new Map<string, DailyAggregateRow>();

    // Ensure all dates present in filtered orders are grouped chronologically
    orders.forEach((order) => {
      if (startDate && order.dateIso < startDate) return;
      if (endDate && order.dateIso > endDate) return;

      const existing = map.get(order.dateIso) || {
        dateIso: order.dateIso,
        shortDate: formatShortDate(order.dateIso),
        vipDeliveries: 0,
        regularDeliveries: 0,
        totalDeliveries: 0,
        grossRevenueMT: 0,
        platformRetainedMT: 0,
        partnerNetMT: 0,
        vipRevenueMT: 0,
        regularRevenueMT: 0,
      };

      const isVip = order.category === 'vip';
      const commission = (order.basePrice * commissionPercent) / 100;
      const retained = commission + order.vipSupplement;
      const partnerNet = order.totalPrice - retained;

      existing.totalDeliveries += 1;
      if (isVip) {
        existing.vipDeliveries += 1;
        existing.vipRevenueMT += order.totalPrice;
      } else {
        existing.regularDeliveries += 1;
        existing.regularRevenueMT += order.totalPrice;
      }

      existing.grossRevenueMT = Number((existing.grossRevenueMT + order.totalPrice).toFixed(2));
      existing.platformRetainedMT = Number((existing.platformRetainedMT + retained).toFixed(2));
      existing.partnerNetMT = Number((existing.partnerNetMT + partnerNet).toFixed(2));

      map.set(order.dateIso, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  }, [orders, startDate, endDate, commissionPercent]);

  if (dailyData.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center text-xs text-slate-400">
        Sem dados diários para o intervalo de datas selecionado ({startDate || 'Início'} até{' '}
        {endDate || 'Hoje'}). Ajuste o filtro de datas acima para visualizar os gráficos analíticos.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Chart 1: Daily Delivery Volume Trends (Classe VIP vs. Classe Regular) */}
      <div className="lg:col-span-6 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="font-display text-base font-bold text-white">
                Tendência Diária de Entregas (VIP vs. Regular)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparação diária de volume por categoria no intervalo selecionado em Maputo
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setBarLayout('grouped')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                barLayout === 'grouped'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agrupado
            </button>
            <button
              type="button"
              onClick={() => setBarLayout('stacked')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                barLayout === 'stacked'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Empilhado
            </button>
          </div>
        </div>

        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="shortDate"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(30, 41, 59, 0.45)' }}
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                formatter={(value: number, name: string) => [`${value} entregas`, name]}
                labelFormatter={(label) => `Data em Maputo: ${label}/2026`}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <Bar
                dataKey="vipDeliveries"
                name="Classe VIP (Express Premium)"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
                stackId={barLayout === 'stacked' ? 'orders' : undefined}
              />
              <Bar
                dataKey="regularDeliveries"
                name="Classe Regular"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                stackId={barLayout === 'stacked' ? 'orders' : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Revenue & Commission Retention Curve in Meticais (MT) */}
      <div className="lg:col-span-6 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display text-base font-bold text-white">
                Evolução Diária de Receita e Retenção (MT)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Volume Bruto vs. Receita Retida da Rede ({commissionPercent}% + Suplemento VIP) em Meticais
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 tabular-nums">
            Moeda: Metical (MT)
          </span>
        </div>

        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="gradGrossMT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradRetainedMT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="shortDate"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v} MT`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                formatter={(value: number, name: string) => [
                  `${Number(value).toLocaleString('pt-MZ', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} MT`,
                  name,
                ]}
                labelFormatter={(label) => `Data em Maputo: ${label}/2026`}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="grossRevenueMT"
                name="Volume Bruto Total (MT)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradGrossMT)"
              />
              <Area
                type="monotone"
                dataKey="platformRetainedMT"
                name={`Retenção Rede (${commissionPercent}% + VIP)`}
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradRetainedMT)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
