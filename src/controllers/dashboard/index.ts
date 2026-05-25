// import z from "zod"
// import { FastifyTypeInstance } from "../../types"
// import prisma from "prisma"

// export async function dashboardRoutes(app: FastifyTypeInstance) {
//   app.get("/", {
//     preHandler: [app.authenticate],
//     schema: {
//       tags: ["dashboard"],
//       response: {
//         200: z.object({
//           metrics: z.object({
//             receita_total: z.number(),
//             total_pedidos: z.number(),
//             total_compras: z.number(),
//             estoque_baixo: z.number(),
//           }),
//           grafico: z.array(z.object({
//             mes: z.string(),
//             valor: z.number(),
//           })),
//           atividades_recentes: z.array(z.object({
//             descricao: z.string(),
//             data: z.string(),
//             tipo: z.enum(["pedido", "estoque", "compra", "relatorio"]),
//           }))
//         })
//       }
//     }
//   }, async (req, reply) => {

//     // --- MÉTRICAS ---
//     const [
//       pedidos,
//       compras,
//       estoqueBaixo,
//     ] = await Promise.all([
//       prisma.order.findMany({
//         select: { total: true }
//       }),
//       prisma.purchase.count(),
//       prisma.stock.count({
//         where: { status: "Estoque_Baixo" }
//       }),
//     ])

//     const receita_total = pedidos.reduce((acc, p) => acc + (p.total ?? 0), 0)
//     const total_pedidos = pedidos.length
//     const total_compras = compras

//     // --- GRÁFICO (últimos 6 meses) ---
//     const hoje = new Date()
//     const meses = Array.from({ length: 6 }, (_, i) => {
//       const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1)
//       return {
//         inicio: new Date(d.getFullYear(), d.getMonth(), 1),
//         fim: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
//         mes: d.toLocaleString('pt-AO', { month: 'short' }),
//       }
//     })

//     const grafico = await Promise.all(
//       meses.map(async ({ inicio, fim, mes }) => {
//         const pedidosMes = await prisma.order.aggregate({
//           _sum: { total: true },
//           where: {
//             createdAt: { gte: inicio, lte: fim }
//           }
//         })
//         return {
//           mes,
//           valor: pedidosMes._sum.total ?? 0,
//         }
//       })
//     )

//     // --- ATIVIDADES RECENTES ---
//     const [
//       pedidosRecentes,
//       stocksRecentes,
//       comprasRecentes,
//     ] = await Promise.all([
//       prisma.order.findMany({
//         take: 3,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           createdAt: true,
//           status: true,
//           client: { select: { name: true } }
//         }
//       }),
//       prisma.stock.findMany({
//         take: 2,
//         orderBy: { updatedAt: "desc" },
//         select: {
//           updatedAt: true,
//           quantity: true,
//           status: true,
//           product: { select: { name: true } }
//         }
//       }),
//       prisma.purchase.findMany({
//         take: 2,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           createdAt: true,
//           status: true,
//         }
//       }),
//     ])

//     const atividades = [
//       ...pedidosRecentes.map(p => ({
//         descricao: p.status === "entregue"
//           ? `Pedido ${p.id.slice(0, 10).toUpperCase()} entregue com sucesso`
//           : `Novo pedido recebido de ${p.client?.name ?? "Cliente"}`,
//         data: p.createdAt.toISOString(),
//         tipo: "pedido" as const,
//       })),
//       ...stocksRecentes.map(s => ({
//         descricao: s.status === "Estoque_Baixo"
//           ? `Estoque de ${s.product?.name} abaixo do limite`
//           : `Estoque de ${s.product?.name} atualizado: ${s.quantity}`,
//         data: s.updatedAt.toISOString(),
//         tipo: "estoque" as const,
//       })),
//       ...comprasRecentes.map(c => ({
//         descricao: `Compra ${c.id.slice(0, 10).toUpperCase()} confirmada com fornecedor`,
//         data: c.createdAt.toISOString(),
//         tipo: "compra" as const,
//       })),
//     ]
//       .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
//       .slice(0, 6)

//     return reply.send({
//       metrics: {
//         receita_total,
//         total_pedidos,
//         total_compras,
//         estoque_baixo: estoqueBaixo,
//       },
//       grafico,
//       atividades_recentes: atividades,
//     })
//   })
// }