import { clientsRoutes } from "@/controllers/clients"
import { supplierRoutes } from "@/controllers/suppliers"
import { FastifyTypeInstance } from "../types" 
import { ordersRoutes } from "@/controllers/orders"
import { stockRoutes } from "@/controllers/stock"
import { shoppingRoutes } from "@/controllers/shopping"
import { productsRoutes } from "@/controllers/products"

export function registerRoutes(app: FastifyTypeInstance) { 
  app.register(clientsRoutes,   { prefix: "/clients" })
  app.register(supplierRoutes,  { prefix: "/suppliers" })
  app.register(ordersRoutes,    { prefix: "/orders" })
  app.register(stockRoutes,     { prefix: "/stock" })
  app.register(shoppingRoutes,  { prefix: "/shopping" })
  app.register(productsRoutes,  { prefix: "/products" })
  
// Dashboard
// app.register(kpiRoutes,        { prefix: "/kpi" })
// app.register(chartRoutes,      { prefix: "/chart" })
// app.register(activitiesRoutes, { prefix: "/activities" })
// app.register(weatherRoutes,    { prefix: "/weather" })

}