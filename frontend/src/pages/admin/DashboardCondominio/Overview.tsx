"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface OverviewProps {
  data: Array<{
    name: string;
    total: number;
    estimado: number;
  }>;
}

export function Overview({ data }: OverviewProps) {
  // Si no hay datos, usar datos de ejemplo
  const chartData = data && data.length > 0 ? data : [
    { name: "Enero", total: 12000, estimado: 10000 },
    { name: "Febrero", total: 13000, estimado: 11000 },
    { name: "Marzo", total: 18000, estimado: 16000 },
    { name: "Abril", total: 14000, estimado: 22000 },
    { name: "Mayo", total: 24000, estimado: 13000 },
    { name: "Junio", total: 19000, estimado: 14000 },
    { name: "Julio", total: 23000, estimado: 21000 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />

        <Tooltip 
          contentStyle={{ 
            borderRadius: '10px', 
            border: 'none', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
          }}
          formatter={(value: any) => {
            return new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }}
        />

        {/* Línea Sólida (Dinero Ingresado) */}
        <Line
          type="monotone"
          dataKey="total"
          stroke="#99D050"
          strokeWidth={4}
          dot={false}
          activeDot={{ r: 6, fill: "#99D050", strokeWidth: 0 }}
          name="Ingresado"
        />

        {/* Línea Punteada (Dinero Estimado) */}
        <Line
          type="monotone"
          dataKey="estimado"
          stroke="#D6E88A"
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={false}
          name="Estimado"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
