import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { registerRoutes } from "./routes/routes";
import fastifyStatic from "@fastify/static"
import path from "node:path"



const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {origin : "*"})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifySwagger, {
  openapi :  {
    info :  {
      title :   "Api fazenda",
      version :  "1.0.0"
    }
  }
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