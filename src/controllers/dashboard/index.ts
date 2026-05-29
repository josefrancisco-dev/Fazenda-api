import z from "zod"
import { FastifyTypeInstance } from "../../types"
import prisma from "../../../prisma"

export async function dashboardRoutes(app: FastifyTypeInstance) {

  app.get("/", {
    preHandler: [app.authenticate],
    schema: {
      tags: ["dashboard"],
      description: "Get dashboard overview data",
      response: {
        200: z.object({
          receita_total:    z.number(),
          total_pedidos:    z.number(),
          total_compras:    z.number(),
          estoque_baixo:    z.number(),
          atividades:       z.array(z.object({
            tipo:      z.string(),
            descricao: z.string(),
            data:      z.string(),
          }))
        })
      }
    }
  }, async (req, reply) => {
    const pedidos = await prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
    })

    const compras = await prisma.shopping.aggregate({
      _count: { id: true },
    })

    const estoqueBaixo = await prisma.stock.count({
      where: { status: "Estoque_Baixo" }
    })

    const [ultimosPedidos, ultimasCompras, ultimosStocks] = await Promise.all([
      prisma.order.findMany({
        take: 3,
        orderBy: { date: "desc" },
        include: { client: { select: { company: true } } }
      }),
      prisma.shopping.findMany({
        take: 3,
        orderBy: { number: "desc" },
        include: { supplier: { select: { name: true } } }
      }),
      prisma.stock.findMany({
        take: 3,
        where: { status: { in: ["Estoque_Baixo", "Estoque_Medio"] } },
        include: { product: { select: { name: true } } },
        orderBy: { id: "desc" }
      })
    ])

    // Monta lista de atividades
    const atividades = [
      ...ultimosPedidos.map(p => ({
        tipo: "pedido",
        descricao: `Novo pedido recebido de ${p.client?.company ?? "cliente"}`,
        data: p.date,
      })),
      ...ultimasCompras.map(c => ({
        tipo: "compra",
        descricao: `Compra COM-${String(c.number).padStart(6, "0")} confirmada com fornecedor ${c.supplier?.name ?? ""}`,
        data: c.date,
      })),
      ...ultimosStocks.map(s => ({
        tipo: "estoque",
        descricao: `Estoque de ${s.product?.name ?? "produto"} abaixo do limite`,
        data: new Date().toLocaleDateString("pt-PT"),
      }))
    ]

    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 6) 

    return reply.send({
      receita_total: pedidos._sum.total  ?? 0,
      total_pedidos: pedidos._count.id   ?? 0,
      total_compras: compras._count.id   ?? 0,
      estoque_baixo: estoqueBaixo        ?? 0,
      atividades,
    })
  })


  // Dados do gráfico de barras (receita por mês)
  // app.get("/chart", {
  //   // preHandler: [app.authenticate],
  //   schema: {
  //     tags: ["dashboard"],
  //     description: "Get monthly revenue chart data",
  //     response: {
  //       200: z.array(z.object({
  //         mes:    z.string(),
  //         total:  z.number(),
  //       }))
  //     }
  //   }
  // }, async (req, reply) => {

  //   const pedidos = await prisma.order.findMany({
  //     select: { date: true, total: true }
  //   })

  //   // Agrupa por mês
  //   const porMes: Record<string, number> = {}

  //   for (const pedido of pedidos) {
  //     // date está em formato "dd/mm/yyyy" (pt-PT)
  //     const [dia, mes, ano] = pedido.date.split("/")
  //     const chave = `${ano}-${mes}` // ex: "2024-03"

  //     porMes[chave] = (porMes[chave] ?? 0) + pedido.total
  //   }

  //   const resultado = Object.entries(porMes)
  //     .sort(([a], [b]) => a.localeCompare(b))
  //     .map(([mes, total]) => ({ mes, total }))

  //   return reply.send(resultado)
  // })

  app.get("/chart", {
  schema: {
    tags: ["dashboard"],
    description: "Get monthly revenue chart data",
    response: {
      200: z.array(z.object({
        mes:   z.string(),
        total: z.number(),
      }))
    }
  }
}, async (req, reply) => {

  const pedidos = await prisma.order.findMany({
    select: { date: true, total: true }
  })

  const porMes: Record<string, number> = {}

  for (const pedido of pedidos) {
    const raw = pedido.date
    let chave: string | null = null

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("/")
      chave = `${yyyy}-${mm}`
    }
    else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      chave = raw.substring(0, 7)
    }
    else if (raw.includes("T")) {
      chave = raw.substring(0, 7)
    }

    if (!chave) {
      console.warn("Formato de data desconhecido:", raw)
      continue
    }
    porMes[chave] = (porMes[chave] ?? 0) + pedido.total
  }

  const resultado = Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }))

  return reply.send(resultado)
})
}