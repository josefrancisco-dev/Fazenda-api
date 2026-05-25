import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { registerRoutes } from "./routes/routes";
import fastifyStatic from "@fastify/static"
import path from "node:path"
import jwt from "./plugins/jwt";

const app = fastify().withTypeProvider<ZodTypeProvider>()
// app.register(fastifyCors, {origin : "*"})
app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// 🔐 REGISTRA JWT (ANTES DAS ROTAS)
app.register(jwt)

app.register(fastifySwagger, {
  openapi :  {
    info :  {
      title :   "Api fazenda",
      version :  "1.0.0"
    }
  }, 
})

app.register(fastifySwaggerUi, {
  routePrefix :  "/docs", 
})

app.register(fastifyStatic, {
  root: path.resolve("uploads"), 
  prefix: "/uploads/",          
})

registerRoutes(app)

app.listen({port: 3333}).then(() => {
  console.log("Http server runing !")
})