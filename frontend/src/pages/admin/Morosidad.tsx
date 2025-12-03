import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { gastoComunService, type GastoComun } from "@/services/gastoComunService";
import { multaService, type Multa } from "@/services/multaService";
import { residenteService, type Residente } from "@/services/residenteService";
import { authService } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow as UiTableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Search } from "lucide-react";

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
const estadosMultaDeuda = ["PENDIENTE"];

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
          if (dias <= 0) return;
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

  const renderSortButton = (label: string, key: SortKey) => (
    <Button
      variant="ghost"
      onClick={() => toggleSort(key)}
      className="flex items-center gap-1 font-semibold hover:bg-transparent hover:text-primary p-0 h-auto"
    >
      {label}
      <ArrowUpDown className={`h-4 w-4 ${sortKey === key ? "text-primary" : "text-muted-foreground"}`} />
    </Button>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-muted/40 font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarAdmin />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Residentes Morosos</h1>
              <p className="text-muted-foreground mt-1">
                Lista de residentes con saldo adeudado &gt; 0, segmentada por antigüedad.
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="pl-9 bg-white"
                placeholder="Filtrar por nombre, unidad o email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <UiTableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[25%]">
                    {renderSortButton("Residente", "nombre")}
                  </TableHead>
                  <TableHead className="w-[15%]">
                    {renderSortButton("N° Vivienda", "vivienda")}
                  </TableHead>
                  <TableHead className="w-[15%]">
                    {renderSortButton("Deuda Total", "deudaTotal")}
                  </TableHead>
                  <TableHead className="w-[15%]">
                    {renderSortButton("0-30 días", "d0_30")}
                  </TableHead>
                  <TableHead className="w-[15%]">
                    {renderSortButton("31-60 días", "d31_60")}
                  </TableHead>
                  <TableHead className="w-[15%]">
                    {renderSortButton("+60 días", "d60")}
                  </TableHead>
                </UiTableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <UiTableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Cargando morosidad...
                    </TableCell>
                  </UiTableRow>
                ) : error ? (
                  <UiTableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-red-500">
                      {error}
                    </TableCell>
                  </UiTableRow>
                ) : filtered.length === 0 ? (
                  <UiTableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No hay residentes morosos con deuda pendiente.
                    </TableCell>
                  </UiTableRow>
                ) : (
                  filtered.map((row) => (
                    <UiTableRow key={row.residenteId} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{row.nombre}</TableCell>
                      <TableCell>{row.vivienda}</TableCell>
                      <TableCell className="font-bold text-gray-900">
                        ${row.deudaTotal.toLocaleString("es-CL")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ${row.d0_30.toLocaleString("es-CL")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ${row.d31_60.toLocaleString("es-CL")}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        ${row.d60.toLocaleString("es-CL")}
                      </TableCell>
                    </UiTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}
