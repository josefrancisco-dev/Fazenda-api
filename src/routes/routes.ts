import { clientsRoutes } from "@/controllers/clients"
import { supplierRoutes } from "@/controllers/suppliers"
import { FastifyTypeInstance } from "../types" 
import { ordersRoutes } from "@/controllers/orders"
import { stockRoutes } from "@/controllers/stock"
import { shoppingRoutes } from "@/controllers/shopping"
import { productsRoutes } from "@/controllers/products"
import { authRoutes } from "@/controllers/authenticantion"
import { checkoutRoutes } from "@/controllers/paypemnts"
import { stockPrintRoutes } from "@/controllers/print/estock"
import { shoppingPrintRoutes} from "@/controllers/print/shopping"
import { supplierPrintRoutes } from "@/controllers/print/suppliers"
import { productsPrintRoutes } from "@/controllers/print/product"
import { ordersPrintRoutes } from "@/controllers/print/orders"
import { clientsPrintRoutes } from "@/controllers/print/client"
import { categoriesRoutes } from "@/controllers/category"
import { dashboardRoutes } from "@/controllers/dashboard"

export function registerRoutes(app: FastifyTypeInstance) { 
  
  app.register(authRoutes, { prefix: '/auth' })
  app.register(clientsRoutes,   { prefix: "/clients" })
  app.register(supplierRoutes,  { prefix: "/suppliers" })
  app.register(ordersRoutes,    { prefix: "/orders" })
  app.register(categoriesRoutes, { prefix: "/categories" })
  app.register(checkoutRoutes,    { prefix: "/orders" })
  app.register(stockRoutes,     { prefix: "/stock" })
  app.register(shoppingRoutes,  { prefix: "/shopping" })
  app.register(productsRoutes,  { prefix: "/products" })

  app.register(stockPrintRoutes, { prefix: "/stock/print" })
  app.register(shoppingPrintRoutes,  { prefix: "/shopping/print" })
  app.register(supplierPrintRoutes,  { prefix: "/suppliers/print" })
  app.register(productsPrintRoutes,  { prefix: "/products/print" })
  app.register(ordersPrintRoutes,  { prefix: "/orders/print" })
 app.register(clientsPrintRoutes,   { prefix: "/clients/print" })

app.register(dashboardRoutes, { prefix: "/dashboard" })
}