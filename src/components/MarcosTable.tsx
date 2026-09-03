import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fmt1, fmtInt, fmtPct } from "@/lib/format"
import type { LinhaSimulacao } from "@/lib/simulacao"

interface MarcosTableProps {
  marcos: LinhaSimulacao[]
}

export function MarcosTable({ marcos }: MarcosTableProps) {
  if (marcos.length === 0) {
    return (
      <p className="py-3 text-sm text-muted-foreground">
        Nenhum marco atingido dentro do horizonte simulado.
      </p>
    )
  }

  return (
    <div className="max-h-85 overflow-y-auto rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead>Mês</TableHead>
            <TableHead className="text-right">Ano</TableHead>
            <TableHead className="text-right">Consumo</TableHead>
            <TableHead className="text-right">Patrimônio</TableHead>
            <TableHead className="text-right">Renda passiva/mês</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marcos.map((linha) => (
            <TableRow key={linha.mes}>
              <TableCell className="tabular-nums">{fmtInt(linha.mes)}</TableCell>
              <TableCell className="text-right tabular-nums">{fmt1(linha.ano)}</TableCell>
              <TableCell className="text-right tabular-nums">{fmtPct(linha.percentualConsumo)}</TableCell>
              <TableCell className="text-right tabular-nums">{fmt1(linha.patrimonio)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {fmt1(linha.rendaPassivaMensal * 100)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
