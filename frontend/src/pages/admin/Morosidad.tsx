import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { gastoComunService, type GastoComun } from "@/services/gastoComunService";
import { multaService, type Multa } from "@/services/multaService";
import { residenteService, type Residente } from "@/services/residenteService";
import { authService } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "nombre" | "vivienda" | "deudaTotal" | "d0_30" | "d31_60" | "d60";

interface MorosoRow {
  residenteId: number;
  nombre: string;
  vivienda: string;
  email?: string;
  deudaTotal: number;
  d0_30: number;
  d31_60: number;
  d60: number;
}

const estadosGastoDeuda = ["PENDIENTE", "VENCIDO", "MOROSO"];
const estadosMultaDeuda = ["PENDIENTE"]; // solo pendientes cuentan como deuda

const toInt = (val: number | string | undefined | null) => Math.round(Number(val ?? 0));
const hoy = () => new Date();
const diasEntre = (fecha: string | Date) => {
  const target = new Date(fecha);
  const diff = hoy().getTime() - target.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const bucketMonto = (dias: number, monto: number) => {
  if (dias <= 30) return { d0_30: monto, d31_60: 0, d60: 0 };
  if (dias <= 60) return { d0_30: 0, d31_60: monto, d60: 0 };
  // +60 agrupa cualquier atraso mayor a 60 días
  return { d0_30: 0, d31_60: 0, d60: monto };
};

export default function AdminMorosidad() {
  const [rows, setRows] = useState<MorosoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("deudaTotal");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const load = async () => {
      try {
        const user = authService.getUser();
        if (!user) throw new Error("Usuario no autenticado");

        const condominioId = user.condominio_id || user.condominioId;
        const [gastos, multas, residentes] = await Promise.all([
          gastoComunService.getAll().catch(() => [] as GastoComun[]),
          multaService.getAll().catch(() => [] as Multa[]),
          residenteService.getAll().catch(() => [] as Residente[]),
        ]);

        const residentesCondo = condominioId
          ? residentes.filter((r) => r.condominio_id === condominioId)
          : residentes;

        const residenteMap = new Map<number, Residente>();
        residentesCondo.forEach((r) => residenteMap.set(r.id, r));

        const deudaMap = new Map<number, MorosoRow>();

        const agregarDeuda = (residenteId: number, monto: number, fechaReferencia: string | Date) => {
          if (!residenteMap.has(residenteId)) return;
          const base =
            deudaMap.get(residenteId) ||
            ({
              residenteId,
              nombre: `${residenteMap.get(residenteId)?.nombre || "Residente"} ${residenteMap.get(residenteId)?.apellido || ""}`.trim(),
              vivienda: residenteMap.get(residenteId)?.vivienda_numero || "S/N",
              email: residenteMap.get(residenteId)?.email,
              deudaTotal: 0,
              d0_30: 0,
              d31_60: 0,
              d60: 0,
            } as MorosoRow);

          const dias = diasEntre(fechaReferencia);
          if (dias <= 0) return; // sin atraso, no cuenta para morosidad
          const buckets = bucketMonto(dias, monto);
          const updated: MorosoRow = {
            ...base,
            deudaTotal: base.deudaTotal + monto,
            d0_30: base.d0_30 + buckets.d0_30,
            d31_60: base.d31_60 + buckets.d31_60,
            d60: base.d60 + buckets.d60,
          };
          deudaMap.set(residenteId, updated);
        };

        gastos
          .filter((g) => estadosGastoDeuda.includes(g.estado) && toInt(g.monto_total) > 0)
          .forEach((g) => {
            const monto = toInt(g.monto_total);
            agregarDeuda(g.residente_id, monto, g.fecha_vencimiento || g.fecha_emision);
          });

        multas
          .filter((m) => estadosMultaDeuda.includes(m.estado) && toInt(m.monto) > 0)
          .forEach((m) => {
            const monto = toInt(m.monto);
            // Sin fecha de vencimiento, usamos fecha_emision como referencia
            agregarDeuda(m.residente_id, monto, m.fecha_emision || m.fecha_pago || hoy());
          });

        const morosos = Array.from(deudaMap.values()).filter((r) => r.deudaTotal > 0);

        setRows(
          morosos.sort((a, b) => b.deudaTotal - a.deudaTotal)
        );
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Error al cargar morosidad");
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "deudaTotal" ? "desc" : "asc");
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const base = term
      ? rows.filter(
          (r) =>
            r.nombre.toLowerCase().includes(term) ||
            r.vivienda.toLowerCase().includes(term) ||
            (r.email || "").toLowerCase().includes(term)
        )
      : rows;

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const getVal = (row: MorosoRow) => {
        switch (sortKey) {
          case "nombre":
            return row.nombre.toLowerCase();
          case "vivienda":
            return row.vivienda.toLowerCase();
          case "d0_30":
            return row.d0_30;
          case "d31_60":
            return row.d31_60;
          case "d60":
            return row.d60;
          default:
            return row.deudaTotal;
        }
      };

      const va = getVal(a);
      const vb = getVal(b);

      if (typeof va === "string" && typeof vb === "string") {
        return va.localeCompare(vb) * dir;
      }
      return (Number(va) - Number(vb)) * dir;
    });

    return sorted;
  }, [rows, search, sortKey, sortDir]);

  const renderSortIcon = (key: SortKey) => (
    <ArrowUpDown
      className={cn(
        "h-4 w-4 inline ml-1 transition-colors",
        sortKey === key ? "text-gray-800" : "text-gray-400"
      )}
    />
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[#F5F6F8] overflow-hidden font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="h-full hidden md:block border-r border-gray-200/50">
          <SidebarAdmin className="h-full" />
        </div>

        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Residentes Morosos</h1>
              <p className="text-gray-500 mt-1">
                Lista de residentes con saldo adeudado &gt; 0, segmentada por antig&uuml;edad.
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="pl-9 bg-white"
                placeholder="Filtrar por nombre, unidad o email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
                <tr className="text-center">
                  <th className="px-6 py-4 cursor-pointer text-left" onClick={() => toggleSort("nombre")}>
                    Residente {renderSortIcon("nombre")}
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort("vivienda")}>
                    Número de vivienda {renderSortIcon("vivienda")}
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort("deudaTotal")}>
                    Monto Total Adeudado {renderSortIcon("deudaTotal")}
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort("d0_30")}>
                    0-30 d&iacute;as {renderSortIcon("d0_30")}
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort("d31_60")}>
                    31-60 d&iacute;as {renderSortIcon("d31_60")}
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort("d60")}>
                    +60 d&iacute;as {renderSortIcon("d60")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      Cargando morosidad...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      No hay residentes morosos con deuda pendiente.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.residenteId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 text-left">{row.nombre}</td>
                      <td className="px-6 py-4 text-gray-700">{row.vivienda}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">${row.deudaTotal.toLocaleString("es-CL")}</td>
                      <td className="px-6 py-4 text-gray-700">${row.d0_30.toLocaleString("es-CL")}</td>
                      <td className="px-6 py-4 text-gray-700">${row.d31_60.toLocaleString("es-CL")}</td>
                      <td className="px-6 py-4 text-gray-700">${row.d60.toLocaleString("es-CL")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}



