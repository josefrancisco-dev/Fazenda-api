"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/fastify-plugin/lib/getPluginName.js
var require_getPluginName = __commonJS({
  "node_modules/fastify-plugin/lib/getPluginName.js"(exports2, module2) {
    "use strict";
    var fpStackTracePattern = /at\s(?:.*\.)?plugin\s.*\n\s*(.*)/;
    var fileNamePattern = /(\w*(\.\w*)*)\..*/;
    module2.exports = function getPluginName(fn) {
      if (fn.name.length > 0) return fn.name;
      const stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 10;
      try {
        throw new Error("anonymous function");
      } catch (e) {
        Error.stackTraceLimit = stackTraceLimit;
        return extractPluginName(e.stack);
      }
    };
    function extractPluginName(stack) {
      const m = stack.match(fpStackTracePattern);
      return m ? m[1].split(/[/\\]/).slice(-1)[0].match(fileNamePattern)[1] : "anonymous";
    }
    module2.exports.extractPluginName = extractPluginName;
  }
});

// node_modules/fastify-plugin/lib/toCamelCase.js
var require_toCamelCase = __commonJS({
  "node_modules/fastify-plugin/lib/toCamelCase.js"(exports2, module2) {
    "use strict";
    module2.exports = function toCamelCase(name) {
      if (name[0] === "@") {
        name = name.slice(1).replace("/", "-");
      }
      return name.replace(/-(.)/g, function(match, g1) {
        return g1.toUpperCase();
      });
    };
  }
});

// node_modules/fastify-plugin/plugin.js
var require_plugin = __commonJS({
  "node_modules/fastify-plugin/plugin.js"(exports2, module2) {
    "use strict";
    var getPluginName = require_getPluginName();
    var toCamelCase = require_toCamelCase();
    var count = 0;
    function plugin(fn, options = {}) {
      let autoName = false;
      if (fn.default !== void 0) {
        fn = fn.default;
      }
      if (typeof fn !== "function") {
        throw new TypeError(
          `fastify-plugin expects a function, instead got a '${typeof fn}'`
        );
      }
      if (typeof options === "string") {
        options = {
          fastify: options
        };
      }
      if (typeof options !== "object" || Array.isArray(options) || options === null) {
        throw new TypeError("The options object should be an object");
      }
      if (options.fastify !== void 0 && typeof options.fastify !== "string") {
        throw new TypeError(`fastify-plugin expects a version string, instead got '${typeof options.fastify}'`);
      }
      if (!options.name) {
        autoName = true;
        options.name = getPluginName(fn) + "-auto-" + count++;
      }
      fn[/* @__PURE__ */ Symbol.for("skip-override")] = options.encapsulate !== true;
      fn[/* @__PURE__ */ Symbol.for("fastify.display-name")] = options.name;
      fn[/* @__PURE__ */ Symbol.for("plugin-meta")] = options;
      if (!fn.default) {
        fn.default = fn;
      }
      const camelCase = toCamelCase(options.name);
      if (!autoName && !fn[camelCase]) {
        fn[camelCase] = fn;
      }
      return fn;
    }
    module2.exports = plugin;
    module2.exports.default = plugin;
    module2.exports.fastifyPlugin = plugin;
  }
});

// src/server.ts
var import_fastify = __toESM(require("fastify"));
var import_cors = __toESM(require("@fastify/cors"));
var import_fastify_type_provider_zod = require("fastify-type-provider-zod");
var import_swagger = __toESM(require("@fastify/swagger"));
var import_swagger_ui = __toESM(require("@fastify/swagger-ui"));

// src/controllers/clients/index.ts
var import_zod = __toESM(require("zod"));

// prisma/index.ts
var import_client = require("@prisma/client");
var import_adapter_better_sqlite3 = require("@prisma/adapter-better-sqlite3");
var adapter = new import_adapter_better_sqlite3.PrismaBetterSqlite3({
  url: "file:./dev.db"
});
var prisma = new import_client.PrismaClient({ adapter });
var prisma_default = prisma;

// src/controllers/clients/index.ts
var import_client2 = require("@prisma/client");

// src/utils/password.ts
var import_bcrypt = __toESM(require("bcrypt"));
var SALT_ROUNDS = 10;
async function hashPassword(password) {
  return await import_bcrypt.default.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hash) {
  return await import_bcrypt.default.compare(password, hash);
}

// src/controllers/clients/index.ts
var clientResponseSchema = import_zod.default.object({
  id: import_zod.default.string().uuid(),
  name: import_zod.default.string(),
  role: import_zod.default.enum(["Client", "Commercial_Manager", "Admin"]),
  status: import_zod.default.enum(["Customer", "Lead", "Active"]),
  date: import_zod.default.string(),
  isCorporative: import_zod.default.string(),
  email: import_zod.default.email(),
  phone: import_zod.default.string(),
  nif: import_zod.default.string().nullable().optional(),
  // password:  z.string(),
  avatar: import_zod.default.string().nullable().optional()
});
var clientBodySchema = import_zod.default.object({
  name: import_zod.default.string(),
  role: import_zod.default.enum(["Client", "Commercial_Manager", "Admin"]),
  status: import_zod.default.enum(["Customer", "Lead", "Active"]),
  isCorporative: import_zod.default.string(),
  email: import_zod.default.email(),
  phone: import_zod.default.string(),
  nif: import_zod.default.string().nullable().optional(),
  password: import_zod.default.string(),
  avatar: import_zod.default.string().nullable().optional()
});
async function clientsRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["clients"],
      description: "List all clients",
      querystring: import_zod.default.object({
        q: import_zod.default.string().optional(),
        status: clientResponseSchema.shape.status.optional(),
        phone: import_zod.default.string().optional(),
        nif: import_zod.default.string().optional(),
        from: import_zod.default.string().optional(),
        to: import_zod.default.string().optional()
      }),
      response: { 200: import_zod.default.array(clientResponseSchema) }
    }
  }, async (req) => {
    const { q, status, phone, nif, from, to } = req.query;
    const dateFilter = from || to ? {
      date: {
        ...from && { gte: from },
        ...to && { lte: to }
      }
    } : {};
    return await prisma_default.client.findMany({
      where: {
        ...q && {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { isCorporative: { contains: q } },
            { phone: { contains: q } },
            { nif: { contains: q } }
          ]
        },
        ...status && { status },
        ...phone && { phone: { contains: phone } },
        ...nif && { nif: { contains: nif } },
        ...dateFilter
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true
      }
    });
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["clients"],
      description: "Get client by ID",
      params: import_zod.default.object({ id: import_zod.default.string().uuid() }),
      response: {
        200: clientResponseSchema,
        404: import_zod.default.object({ message: import_zod.default.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma_default.client.findUnique({
      where: { id: request.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true
      }
    });
    if (!client) return reply.status(404).send({ message: "Client not found" });
    return reply.status(200).send(client);
  });
  app2.post("/", {
    schema: {
      tags: ["clients"],
      description: "Create a new client",
      body: clientBodySchema,
      response: {
        201: import_zod.default.object({ id: import_zod.default.string() }),
        400: import_zod.default.object({ message: import_zod.default.string() })
      }
    }
  }, async (request, reply) => {
    const { isCorporative, name, email, phone, role = import_client2.Role.Client, nif, password, avatar, status } = request.body;
    const alreadyExists = await prisma_default.client.findFirst({ where: { email } });
    if (alreadyExists) return reply.status(400).send({ message: "Cliente j\xE1 existe!" });
    const hashedPassword = await hashPassword(password);
    const client = await prisma_default.client.create({
      data: {
        isCorporative,
        name,
        email,
        phone,
        role,
        nif: nif || null,
        password: hashedPassword,
        avatar: avatar ?? null,
        status,
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT")
      }
    });
    return reply.status(201).send({ id: client.id });
  });
  app2.put("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["clients"],
      description: "Update a client fully",
      params: import_zod.default.object({ id: import_zod.default.string().uuid() }),
      body: clientBodySchema,
      response: {
        200: import_zod.default.object({ message: import_zod.default.string() }),
        404: import_zod.default.object({ message: import_zod.default.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma_default.client.findUnique({
      where: { id: request.params.id }
    });
    if (!client) return reply.status(404).send({ message: "Client not found" });
    const { password, ...restData } = request.body;
    const updateData = { ...restData };
    if (password) {
      updateData.password = await hashPassword(password);
    }
    await prisma_default.client.update({
      where: { id: request.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true
      }
    });
    return reply.status(200).send({ message: "Client updated successfully" });
  });
  app2.patch("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["clients"],
      description: "Partially update a client",
      params: import_zod.default.object({ id: import_zod.default.string().uuid() }),
      body: clientBodySchema.partial(),
      response: {
        200: import_zod.default.object({ message: import_zod.default.string() }),
        404: import_zod.default.object({ message: import_zod.default.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma_default.client.findUnique({
      where: { id: request.params.id }
    });
    if (!client) return reply.status(404).send({ message: "Client not found" });
    const { password, ...restData } = request.body;
    const updateData = { ...restData };
    if (password) {
      updateData.password = await hashPassword(password);
    }
    await prisma_default.client.update({
      where: { id: request.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true
      }
    });
    return reply.status(200).send({ message: "Client patched successfully" });
  });
  app2.delete("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["clients"],
      description: "Delete a client",
      params: import_zod.default.object({ id: import_zod.default.string().uuid() }),
      response: {
        200: import_zod.default.object({ message: import_zod.default.string() }),
        404: import_zod.default.object({ message: import_zod.default.string() })
      }
    }
  }, async (request, reply) => {
    const client = await prisma_default.client.findUnique({
      where: { id: request.params.id }
    });
    if (!client) return reply.status(404).send({ message: "Client not found" });
    await prisma_default.client.delete({ where: { id: request.params.id } });
    return reply.status(200).send({ message: "Client deleted successfully" });
  });
}

// src/controllers/suppliers/index.ts
var import_zod2 = __toESM(require("zod"));
var import_client3 = require("@prisma/client");
var supplierResponseSchema = import_zod2.default.object({
  id: import_zod2.default.string().uuid(),
  name: import_zod2.default.string(),
  role: import_zod2.default.string(),
  status: import_zod2.default.enum(["Customer", "Lead", "Active"]),
  date: import_zod2.default.string(),
  company: import_zod2.default.string(),
  email: import_zod2.default.string(),
  phone: import_zod2.default.string(),
  nif: import_zod2.default.string(),
  avatar: import_zod2.default.string().nullable().optional()
});
var supplierBodySchema = supplierResponseSchema.omit({ id: true, date: true });
async function supplierRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "List all suppliers",
      querystring: import_zod2.default.object({
        q: import_zod2.default.string().optional()
      }),
      response: { 200: import_zod2.default.array(supplierResponseSchema) }
    }
  }, async (req) => {
    const { q } = req.query;
    return await prisma_default.supplier.findMany({
      where: q ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { company: { contains: q } },
          { nif: { contains: q } },
          { phone: { contains: q } }
        ]
      } : void 0,
      orderBy: { name: "asc" }
    });
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Get supplier by ID",
      params: import_zod2.default.object({ id: import_zod2.default.string().uuid() }),
      response: {
        200: supplierResponseSchema,
        404: import_zod2.default.object({ message: import_zod2.default.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma_default.supplier.findUnique({
      where: { id: request.params.id }
    });
    if (!supplier) return reply.status(404).send({ message: "Supplier not found" });
    return reply.status(200).send(supplier);
  });
  app2.post("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Create a new supplier",
      body: supplierBodySchema,
      response: {
        201: import_zod2.default.object({ id: import_zod2.default.string() }),
        400: import_zod2.default.object({ message: import_zod2.default.string() })
      }
    }
  }, async (request, reply) => {
    const { company, name, email, phone, role = import_client3.Role.Supplier, nif, avatar, status = import_client3.PersonStatus.Active } = request.body;
    const alreadyExists = await prisma_default.supplier.findFirst({ where: { email } });
    if (alreadyExists) return reply.status(400).send({ message: "Fornecedor j\xE1 existe!" });
    const supplier = await prisma_default.supplier.create({
      data: {
        company,
        name,
        email,
        phone,
        role,
        nif,
        avatar: avatar ?? null,
        status,
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT")
      }
    });
    return reply.status(201).send({ id: supplier.id });
  });
  app2.put("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Update a supplier fully",
      params: import_zod2.default.object({ id: import_zod2.default.string().uuid() }),
      body: supplierBodySchema,
      response: {
        200: import_zod2.default.object({ message: import_zod2.default.string() }),
        404: import_zod2.default.object({ message: import_zod2.default.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma_default.supplier.findUnique({
      where: { id: request.params.id }
    });
    if (!supplier) return reply.status(404).send({ message: "Supplier not found" });
    await prisma_default.supplier.update({
      where: { id: request.params.id },
      data: request.body
    });
    return reply.status(200).send({ message: "Supplier updated successfully" });
  });
  app2.patch("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Partially update a supplier",
      params: import_zod2.default.object({ id: import_zod2.default.string().uuid() }),
      body: supplierBodySchema.partial(),
      response: {
        200: import_zod2.default.object({ message: import_zod2.default.string() }),
        404: import_zod2.default.object({ message: import_zod2.default.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma_default.supplier.findUnique({
      where: { id: request.params.id }
    });
    if (!supplier) return reply.status(404).send({ message: "Supplier not found" });
    await prisma_default.supplier.update({
      where: { id: request.params.id },
      data: request.body
    });
    return reply.status(200).send({ message: "Supplier patched successfully" });
  });
  app2.delete("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["suppliers"],
      description: "Delete a supplier",
      params: import_zod2.default.object({ id: import_zod2.default.string().uuid() }),
      response: {
        200: import_zod2.default.object({ message: import_zod2.default.string() }),
        404: import_zod2.default.object({ message: import_zod2.default.string() })
      }
    }
  }, async (request, reply) => {
    const supplier = await prisma_default.supplier.findUnique({
      where: { id: request.params.id }
    });
    if (!supplier) return reply.status(404).send({ message: "Supplier not found" });
    await prisma_default.supplier.delete({ where: { id: request.params.id } });
    return reply.status(200).send({ message: "Supplier deleted successfully" });
  });
}

// src/controllers/orders/index.ts
var import_zod3 = __toESM(require("zod"));
var productSchema = import_zod3.default.object({
  id: import_zod3.default.string().uuid(),
  name: import_zod3.default.string(),
  category: import_zod3.default.object({
    id: import_zod3.default.string().uuid(),
    name: import_zod3.default.string()
  }),
  categoryId: import_zod3.default.string(),
  quantity: import_zod3.default.number(),
  unit: import_zod3.default.string(),
  price: import_zod3.default.number(),
  image: import_zod3.default.string(),
  banner: import_zod3.default.string(),
  emoji: import_zod3.default.string()
});
var clientSchema = import_zod3.default.object({
  id: import_zod3.default.string().uuid(),
  name: import_zod3.default.string(),
  email: import_zod3.default.string().email(),
  phone: import_zod3.default.string(),
  isCorporative: import_zod3.default.string(),
  nif: import_zod3.default.string().nullable().optional(),
  status: import_zod3.default.string(),
  role: import_zod3.default.string(),
  avatar: import_zod3.default.string().nullable()
});
var orderItemSchema = import_zod3.default.object({
  quantity: import_zod3.default.number().min(1),
  price: import_zod3.default.number().min(0),
  productId: import_zod3.default.string().uuid()
});
var orderItemFullSchema = orderItemSchema.extend({
  id: import_zod3.default.string().uuid(),
  orderId: import_zod3.default.string().uuid(),
  product: productSchema
});
var orderResponseSchema = import_zod3.default.object({
  id: import_zod3.default.string().uuid(),
  number: import_zod3.default.number(),
  date: import_zod3.default.string(),
  total: import_zod3.default.number().min(0),
  status: import_zod3.default.enum([
    "Pendente",
    "Confirmado",
    "Em_processamento",
    "Enviado",
    "Entregue"
  ]),
  clientId: import_zod3.default.string().uuid(),
  client: clientSchema,
  items: import_zod3.default.array(orderItemFullSchema).min(1)
});
var orderBodySchema = import_zod3.default.object({
  number: import_zod3.default.number(),
  date: import_zod3.default.string(),
  items: import_zod3.default.array(orderItemSchema).min(1, "Adicione pelo menos um item")
});
var orderUpdateSchema = import_zod3.default.object({
  status: orderResponseSchema.shape.status
});
var orderInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true
        }
      }
    }
  },
  client: true
};
async function ordersRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["orders"],
      description: "List all orders",
      querystring: import_zod3.default.object({
        q: import_zod3.default.string().optional(),
        from: import_zod3.default.string().optional(),
        to: import_zod3.default.string().optional(),
        status: orderResponseSchema.shape.status.optional()
      }),
      response: { 200: import_zod3.default.array(orderResponseSchema) }
    }
  }, async (req) => {
    const { q, from, to, status } = req.query;
    const dateFilter = from || to ? {
      date: {
        ...from && { gte: from },
        ...to && { lte: to }
      }
    } : {};
    return prisma_default.order.findMany({
      where: {
        ...q && {
          OR: [
            { client: { name: { contains: q } } },
            { client: { isCorporative: { contains: q } } }
          ]
        },
        ...status && { status },
        ...dateFilter
      },
      include: orderInclude,
      orderBy: { number: "asc" }
    });
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["orders"],
      description: "Get order by ID",
      params: import_zod3.default.object({ id: import_zod3.default.string().uuid() }),
      response: {
        200: orderResponseSchema,
        404: import_zod3.default.object({ message: import_zod3.default.string() })
      }
    }
  }, async (request, reply) => {
    const order = await prisma_default.order.findUnique({
      where: { id: request.params.id },
      include: orderInclude
    });
    if (!order) return reply.status(404).send({ message: "Order not found" });
    return reply.status(200).send(order);
  });
  app2.post("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["orders"],
      description: "Create a new order",
      body: orderBodySchema,
      response: { 201: import_zod3.default.object({ id: import_zod3.default.string() }) }
    }
  }, async (request, reply) => {
    const { number, date, items } = request.body;
    const clientId = request.user.sub;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await prisma_default.order.create({
      data: {
        number,
        date,
        total,
        status: "Pendente",
        clientId,
        items: { create: items }
      }
    });
    await Promise.all(
      items.map(async (item) => {
        await prisma_default.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      })
    );
    return reply.status(201).send({ id: order.id });
  });
  app2.put("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["orders"],
      description: "Update order status",
      params: import_zod3.default.object({
        id: import_zod3.default.string().uuid()
      }),
      body: orderUpdateSchema,
      response: {
        200: import_zod3.default.object({
          message: import_zod3.default.string()
        }),
        404: import_zod3.default.object({
          message: import_zod3.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    const exists = await prisma_default.order.findUnique({
      where: { id }
    });
    if (!exists) {
      return reply.status(404).send({
        message: "Order not found"
      });
    }
    await prisma_default.order.update({
      where: { id },
      data: {
        status
      }
    });
    return reply.status(200).send({
      message: "Order status updated successfully"
    });
  });
  app2.patch("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["orders"],
      description: "Partially update an order",
      params: import_zod3.default.object({ id: import_zod3.default.string().uuid() }),
      body: orderBodySchema.partial(),
      response: {
        200: import_zod3.default.object({ message: import_zod3.default.string() }),
        404: import_zod3.default.object({ message: import_zod3.default.string() })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { items, ...rest } = request.body;
    const exists = await prisma_default.order.findUnique({ where: { id } });
    if (!exists) return reply.status(404).send({ message: "Order not found" });
    const total = items ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : void 0;
    await prisma_default.order.update({
      where: { id },
      data: {
        ...rest,
        ...total !== void 0 && { total },
        ...items && { items: { deleteMany: {}, create: items } }
      }
    });
    return reply.status(200).send({ message: "Order patched successfully" });
  });
  app2.delete("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["orders"],
      description: "Delete an order",
      params: import_zod3.default.object({ id: import_zod3.default.string().uuid() }),
      response: {
        200: import_zod3.default.object({ message: import_zod3.default.string() }),
        404: import_zod3.default.object({ message: import_zod3.default.string() })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const exists = await prisma_default.order.findUnique({ where: { id } });
    if (!exists) return reply.status(404).send({ message: "Order not found" });
    await prisma_default.order.delete({ where: { id } });
    return reply.status(200).send({ message: "Order deleted successfully" });
  });
}

// src/controllers/stock/index.ts
var import_zod4 = __toESM(require("zod"));
var stockStatusEnum = import_zod4.default.enum([
  "Em_Estoque",
  "Estoque_Medio",
  "Estoque_Baixo"
]);
var categorySchema = import_zod4.default.object({
  id: import_zod4.default.string().uuid(),
  name: import_zod4.default.string(),
  description: import_zod4.default.string().nullable()
});
function getStockStatus(quantity) {
  if (quantity <= 5) return "Estoque_Baixo";
  if (quantity <= 20) return "Estoque_Medio";
  return "Em_Estoque";
}
var stockResponseSchema = import_zod4.default.object({
  id: import_zod4.default.string().uuid(),
  quantity: import_zod4.default.number(),
  value_Total: import_zod4.default.number(),
  status: stockStatusEnum,
  productId: import_zod4.default.string().uuid(),
  product: import_zod4.default.object({
    name: import_zod4.default.string(),
    category: categorySchema,
    unit: import_zod4.default.string(),
    price: import_zod4.default.number(),
    image: import_zod4.default.string().optional()
  }).optional()
});
var stockBodySchema = import_zod4.default.object({
  quantity: import_zod4.default.number().min(0),
  value_Total: import_zod4.default.number().min(0),
  productId: import_zod4.default.string().uuid()
});
async function stockRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["stock"],
      querystring: import_zod4.default.object({
        q: import_zod4.default.string().optional()
      }),
      response: { 200: import_zod4.default.array(stockResponseSchema) }
    }
  }, async (req) => {
    const { q } = req.query;
    return prisma_default.stock.findMany({
      where: q ? {
        OR: [
          { product: { name: { contains: q } } },
          { product: { category: { name: { contains: q } } } }
        ]
      } : void 0,
      select: {
        id: true,
        quantity: true,
        value_Total: true,
        status: true,
        productId: true,
        product: {
          select: {
            name: true,
            category: true,
            unit: true,
            price: true,
            image: true
          }
        }
      }
    });
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["stock"],
      params: import_zod4.default.object({ id: import_zod4.default.string().uuid() }),
      response: {
        200: stockResponseSchema,
        404: import_zod4.default.object({ message: import_zod4.default.string() })
      }
    }
  }, async (request, reply) => {
    const stock = await prisma_default.stock.findUnique({
      where: { id: request.params.id },
      select: {
        id: true,
        quantity: true,
        value_Total: true,
        status: true,
        productId: true,
        product: {
          select: {
            name: true,
            category: true,
            unit: true,
            price: true,
            image: true
          }
        }
      }
    });
    if (!stock) {
      return reply.status(404).send({ message: "Stock not found" });
    }
    return stock;
  });
  app2.post("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["stock"],
      body: stockBodySchema,
      response: {
        201: stockResponseSchema
      }
    }
  }, async (request, reply) => {
    const { quantity, value_Total, productId } = request.body;
    const stock = await prisma_default.stock.create({
      data: {
        quantity,
        value_Total,
        productId,
        status: getStockStatus(quantity)
      }
    });
    await prisma_default.product.update({
      where: { id: productId },
      data: {
        quantity: { increment: quantity }
      }
    });
    return reply.status(201).send(stock);
  });
  app2.put("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["stock"],
      params: import_zod4.default.object({ id: import_zod4.default.string().uuid() }),
      body: stockBodySchema
    }
  }, async (request, reply) => {
    const exists = await prisma_default.stock.findUnique({
      where: { id: request.params.id }
    });
    if (!exists) {
      return reply.status(404).send({ message: "Stock not found" });
    }
    const { quantity, value_Total, productId } = request.body;
    await prisma_default.stock.update({
      where: { id: request.params.id },
      data: {
        quantity,
        value_Total,
        productId,
        status: getStockStatus(quantity)
      }
    });
    return { message: "Stock atualizado com sucesso" };
  });
  app2.patch("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["stock"],
      params: import_zod4.default.object({ id: import_zod4.default.string().uuid() }),
      body: stockBodySchema.partial()
    }
  }, async (request, reply) => {
    const stock = await prisma_default.stock.findUnique({
      where: { id: request.params.id }
    });
    if (!stock) {
      return reply.status(404).send({ message: "Stock not found" });
    }
    const newQuantity = request.body.quantity ?? stock.quantity;
    await prisma_default.stock.update({
      where: { id: request.params.id },
      data: {
        ...request.body,
        status: getStockStatus(newQuantity)
      }
    });
    return { message: "Stock atualizado parcialmente" };
  });
  app2.delete("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["stock"],
      params: import_zod4.default.object({ id: import_zod4.default.string().uuid() })
    }
  }, async (request, reply) => {
    const exists = await prisma_default.stock.findUnique({
      where: { id: request.params.id }
    });
    if (!exists) {
      return reply.status(404).send({ message: "Stock not found" });
    }
    await prisma_default.stock.delete({
      where: { id: request.params.id }
    });
    return { message: "Stock removido com sucesso" };
  });
}

// src/controllers/shopping/index.ts
var import_zod5 = __toESM(require("zod"));
var shoppingResponseSchema = import_zod5.default.object({
  id: import_zod5.default.string().uuid(),
  number: import_zod5.default.number().int(),
  supplierId: import_zod5.default.string().uuid(),
  date: import_zod5.default.string(),
  total: import_zod5.default.number(),
  status: import_zod5.default.boolean(),
  supplier: import_zod5.default.object({
    id: import_zod5.default.string().uuid(),
    name: import_zod5.default.string(),
    company: import_zod5.default.string()
  }),
  items: import_zod5.default.array(import_zod5.default.object({
    id: import_zod5.default.string().uuid(),
    name: import_zod5.default.string(),
    quantity: import_zod5.default.number().int(),
    price: import_zod5.default.number()
  }))
});
var shoppingBodySchema = import_zod5.default.object({
  supplierId: import_zod5.default.string().uuid(),
  items: import_zod5.default.array(import_zod5.default.object({
    name: import_zod5.default.string(),
    quantity: import_zod5.default.number().int().positive(),
    price: import_zod5.default.number().nonnegative()
  })),
  status: import_zod5.default.boolean().default(false)
});
async function shoppingRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["shopping"],
      description: "List all shopping orders",
      querystring: import_zod5.default.object({
        q: import_zod5.default.string().optional()
      }),
      response: { 200: import_zod5.default.array(shoppingResponseSchema) }
    }
  }, async (req) => {
    const { q } = req.query;
    return await prisma_default.shopping.findMany({
      where: q ? {
        OR: [
          { supplier: { name: { contains: q } } },
          { supplier: { company: { contains: q } } }
        ]
      } : void 0,
      include: {
        supplier: true,
        items: true
      },
      orderBy: { number: "desc" }
    });
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Get shopping order by ID",
      params: import_zod5.default.object({ id: import_zod5.default.string().uuid() }),
      response: {
        200: shoppingResponseSchema,
        404: import_zod5.default.object({ message: import_zod5.default.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma_default.shopping.findUnique({
      where: { id: request.params.id },
      include: {
        supplier: true,
        items: true
      }
    });
    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" });
    }
    return reply.status(200).send(shopping);
  });
  app2.post("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Create a new shopping order",
      body: shoppingBodySchema,
      response: {
        201: import_zod5.default.object({ id: import_zod5.default.string() }),
        400: import_zod5.default.object({ message: import_zod5.default.string() }),
        404: import_zod5.default.object({ message: import_zod5.default.string() })
      }
    }
  }, async (request, reply) => {
    const { supplierId, items, status } = request.body;
    const supplier = await prisma_default.supplier.findUnique({
      where: { id: supplierId }
    });
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor n\xE3o encontrado!" });
    }
    if (!items || items.length === 0) {
      return reply.status(400).send({ message: "Adicione pelo menos um item!" });
    }
    const total = items.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
    const lastShopping = await prisma_default.shopping.findFirst({
      orderBy: { number: "desc" }
    });
    const number = (lastShopping?.number ?? 0) + 1;
    const shopping = await prisma_default.shopping.create({
      data: {
        number,
        supplierId,
        total,
        // ← usa o valor calculado
        status,
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT"),
        items: {
          create: items
          // ← cria os itens relacionados
        }
      }
    });
    return reply.status(201).send({ id: shopping.id });
  });
  app2.put("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Update a shopping order fully",
      params: import_zod5.default.object({ id: import_zod5.default.string().uuid() }),
      body: shoppingBodySchema,
      response: {
        200: import_zod5.default.object({ message: import_zod5.default.string() }),
        404: import_zod5.default.object({ message: import_zod5.default.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma_default.shopping.findUnique({
      where: { id: request.params.id }
    });
    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" });
    }
    const { supplierId, items, status } = request.body;
    const supplier = await prisma_default.supplier.findUnique({
      where: { id: supplierId }
    });
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor n\xE3o encontrado!" });
    }
    const total = items.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
    await prisma_default.$transaction([
      // Remove os itens antigos
      prisma_default.shoppingItem.deleteMany({
        where: { shoppingId: request.params.id }
      }),
      // Atualiza os dados da compra
      prisma_default.shopping.update({
        where: { id: request.params.id },
        data: {
          supplierId,
          total,
          status,
          items: {
            create: items
          }
        }
      })
    ]);
    return reply.status(200).send({ message: "Shopping updated successfully" });
  });
  app2.patch("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Partially update a shopping order",
      params: import_zod5.default.object({ id: import_zod5.default.string().uuid() }),
      body: shoppingBodySchema.partial(),
      response: {
        200: import_zod5.default.object({ message: import_zod5.default.string() }),
        404: import_zod5.default.object({ message: import_zod5.default.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma_default.shopping.findUnique({
      where: { id: request.params.id },
      include: { items: true }
    });
    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" });
    }
    const updateData = {};
    const { supplierId, items, status } = request.body;
    if (supplierId !== void 0) {
      const supplier = await prisma_default.supplier.findUnique({
        where: { id: supplierId }
      });
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor n\xE3o encontrado!" });
      }
      updateData.supplierId = supplierId;
    }
    if (status !== void 0) {
      updateData.status = status;
    }
    if (items !== void 0 && items.length > 0) {
      const newTotal = items.reduce((sum, item) => {
        return sum + item.quantity * item.price;
      }, 0);
      updateData.total = newTotal;
      updateData.items = {
        deleteMany: {},
        create: items
      };
    }
    await prisma_default.shopping.update({
      where: { id: request.params.id },
      data: updateData
    });
    return reply.status(200).send({ message: "Shopping patched successfully" });
  });
  app2.delete("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["shopping"],
      description: "Delete a shopping order",
      params: import_zod5.default.object({ id: import_zod5.default.string().uuid() }),
      response: {
        200: import_zod5.default.object({ message: import_zod5.default.string() }),
        404: import_zod5.default.object({ message: import_zod5.default.string() })
      }
    }
  }, async (request, reply) => {
    const shopping = await prisma_default.shopping.findUnique({
      where: { id: request.params.id }
    });
    if (!shopping) {
      return reply.status(404).send({ message: "Shopping not found" });
    }
    await prisma_default.shopping.delete({
      where: { id: request.params.id }
    });
    return reply.status(200).send({ message: "Shopping deleted successfully" });
  });
}

// src/controllers/products/index.ts
var import_zod6 = __toESM(require("zod"));
var import_multipart = __toESM(require("@fastify/multipart"));
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_node_crypto = require("crypto");
var categorySchema2 = import_zod6.default.object({
  id: import_zod6.default.string().uuid(),
  name: import_zod6.default.string()
});
var productResponseSchema = import_zod6.default.object({
  id: import_zod6.default.string().uuid(),
  name: import_zod6.default.string().min(1),
  categoryId: import_zod6.default.string().uuid(),
  category: categorySchema2,
  unit: import_zod6.default.string(),
  price: import_zod6.default.number().positive(),
  quantity: import_zod6.default.number().int(),
  banner: import_zod6.default.string().min(1),
  emoji: import_zod6.default.string().min(1),
  image: import_zod6.default.string()
});
var UPLOAD_DIR = import_node_path.default.resolve("uploads");
if (!import_node_fs.default.existsSync(UPLOAD_DIR)) {
  import_node_fs.default.mkdirSync(UPLOAD_DIR);
}
async function productsRoutes(app2) {
  await app2.register(import_multipart.default);
  app2.get("/", {
    schema: {
      tags: ["products"],
      querystring: import_zod6.default.object({
        q: import_zod6.default.string().optional()
      }),
      response: {
        200: import_zod6.default.array(productResponseSchema)
      }
    }
  }, async (req) => {
    const { q } = req.query;
    return await prisma_default.product.findMany({
      where: q ? {
        OR: [
          { name: { contains: q } },
          { category: { name: { contains: q } } }
        ]
      } : void 0,
      include: {
        category: true
      },
      orderBy: {
        name: "asc"
      }
    });
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["products"],
      params: import_zod6.default.object({
        id: import_zod6.default.string().uuid()
      }),
      response: {
        200: productResponseSchema,
        404: import_zod6.default.object({
          message: import_zod6.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const product = await prisma_default.product.findUnique({
      where: {
        id: request.params.id
      },
      include: {
        category: true
      }
    });
    if (!product) {
      return reply.status(404).send({
        message: "Product not found"
      });
    }
    return reply.status(200).send(product);
  });
  app2.post("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["products"],
      description: "Create a new product (multipart/form-data)",
      response: {
        201: import_zod6.default.object({
          id: import_zod6.default.string()
        }),
        400: import_zod6.default.object({
          message: import_zod6.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const parts = request.parts();
    let name = "";
    let categoryId = "";
    let unit = "";
    let banner = "";
    let emoji = "";
    let price = 0;
    let imagePath = "";
    for await (const part of parts) {
      if (part.type === "file") {
        const filename = `${(0, import_node_crypto.randomUUID)()}${import_node_path.default.extname(part.filename)}`;
        const filepath = import_node_path.default.join(UPLOAD_DIR, filename);
        await import_node_fs.default.promises.writeFile(
          filepath,
          await part.toBuffer()
        );
        imagePath = `/uploads/${filename}`;
      } else {
        const value = part.value;
        if (part.fieldname === "name") {
          name = value;
        }
        if (part.fieldname === "categoryId") {
          categoryId = value;
        }
        if (part.fieldname === "unit") {
          unit = value;
        }
        if (part.fieldname === "banner") {
          banner = value;
        }
        if (part.fieldname === "emoji") {
          emoji = value;
        }
        if (part.fieldname === "price") {
          price = parseFloat(value);
        }
      }
    }
    const alreadyExists = await prisma_default.product.findFirst({
      where: {
        name
      }
    });
    if (alreadyExists) {
      return reply.status(400).send({
        message: "Produto j\xE1 existe!"
      });
    }
    const categoryExists = await prisma_default.category.findUnique({
      where: {
        id: categoryId
      }
    });
    if (!categoryExists) {
      return reply.status(400).send({
        message: "Categoria n\xE3o encontrada!"
      });
    }
    const product = await prisma_default.product.create({
      data: {
        name,
        categoryId,
        unit,
        price,
        banner,
        emoji,
        quantity: 0,
        image: imagePath || ""
      }
    });
    return reply.status(201).send({
      id: product.id
    });
  });
  app2.put("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["products"],
      description: "Update a product (multipart/form-data)",
      params: import_zod6.default.object({
        id: import_zod6.default.string().uuid()
      }),
      response: {
        200: import_zod6.default.object({
          message: import_zod6.default.string()
        }),
        400: import_zod6.default.object({
          // ← adicionar
          message: import_zod6.default.string()
        }),
        404: import_zod6.default.object({
          message: import_zod6.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const product = await prisma_default.product.findUnique({
      where: {
        id: request.params.id
      }
    });
    if (!product) {
      return reply.status(404).send({
        message: "Product not found"
      });
    }
    const parts = request.parts();
    const updated = {};
    for await (const part of parts) {
      if (part.type === "file") {
        const filename = `${(0, import_node_crypto.randomUUID)()}${import_node_path.default.extname(part.filename)}`;
        const filepath = import_node_path.default.join(UPLOAD_DIR, filename);
        await import_node_fs.default.promises.writeFile(
          filepath,
          await part.toBuffer()
        );
        updated.image = `/uploads/${filename}`;
      } else {
        const value = part.value;
        if (part.fieldname === "name") {
          updated.name = value;
        }
        if (part.fieldname === "categoryId") {
          const categoryExists = await prisma_default.category.findUnique({
            where: {
              id: value
            }
          });
          if (!categoryExists) {
            return reply.status(400).send({
              message: "Categoria inv\xE1lida!"
            });
          }
          updated.categoryId = value;
        }
        if (part.fieldname === "unit") {
          updated.unit = value;
        }
        if (part.fieldname === "banner") {
          updated.banner = value;
        }
        if (part.fieldname === "emoji") {
          updated.emoji = value;
        }
        if (part.fieldname === "price") {
          updated.price = parseFloat(value);
        }
      }
    }
    await prisma_default.product.update({
      where: {
        id: request.params.id
      },
      data: updated
    });
    return reply.status(200).send({
      message: "Product updated successfully"
    });
  });
  app2.delete("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["products"],
      params: import_zod6.default.object({
        id: import_zod6.default.string().uuid()
      }),
      response: {
        200: import_zod6.default.object({
          message: import_zod6.default.string()
        }),
        404: import_zod6.default.object({
          message: import_zod6.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const product = await prisma_default.product.findUnique({
      where: {
        id: request.params.id
      }
    });
    if (!product) {
      return reply.status(404).send({
        message: "Product not found"
      });
    }
    await prisma_default.stock.deleteMany({
      where: {
        productId: request.params.id
      }
    });
    await prisma_default.product.delete({
      where: {
        id: request.params.id
      }
    });
    return reply.status(200).send({
      message: "Product deleted successfully"
    });
  });
}

// src/controllers/authenticantion/index.ts
var import_zod7 = __toESM(require("zod"));
async function authRoutes(app2) {
  app2.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        description: "Login de utilizador",
        body: import_zod7.default.object({
          email: import_zod7.default.string().email(),
          password: import_zod7.default.string().min(1)
        }),
        response: {
          200: import_zod7.default.object({ token: import_zod7.default.string() }),
          400: import_zod7.default.object({ error: import_zod7.default.string() })
        }
      }
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const user = await prisma_default.client.findUnique({
        where: { email }
      });
      if (!user) {
        return reply.status(400).send({ error: "User not found" });
      }
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return reply.status(400).send({ error: "Invalid password" });
      }
      const token = app2.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role
      });
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    }
  );
  app2.get("/me", { preHandler: [app2.authenticate] }, async (req, replay) => {
    const clientId = req.user.sub;
    const client = await prisma_default.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isCorporative: true,
        nif: true,
        avatar: true
      }
    });
    if (!client) {
      return replay.status(404).send({ message: "Cliente n\xE3o encontrado !" });
    }
    return replay.send({ client });
  });
  app2.get("/logout", { preHandler: [app2.authenticate] }, async (req, reply) => {
    return reply.send({ message: "Logout realizado com sucesso" });
  });
}

// src/controllers/paypemnts/index.ts
var import_zod8 = __toESM(require("zod"));
var import_stripe = __toESM(require("stripe"));
var stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY);
var checkoutResponseSchema = import_zod8.default.object({
  checkoutUrl: import_zod8.default.string().url()
});
var checkoutParamsSchema = import_zod8.default.object({
  id: import_zod8.default.string().uuid()
});
async function checkoutRoutes(app2) {
  app2.post("/:id/checkout", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["payment"],
      description: "Create Stripe checkout session",
      params: checkoutParamsSchema,
      response: {
        200: checkoutResponseSchema,
        400: import_zod8.default.object({ message: import_zod8.default.string() }),
        403: import_zod8.default.object({ message: import_zod8.default.string() }),
        404: import_zod8.default.object({ message: import_zod8.default.string() })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.sub;
    const order = await prisma_default.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }
    if (order.clientId !== userId) {
      return reply.status(403).send({ message: "Not allowed" });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "aoa",
          product_data: {
            name: item.product.name
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      metadata: {
        orderId: order.id
      },
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel"
    });
    await prisma_default.order.update({
      where: { id },
      data: {
        stripeSessionId: session.id
      }
    });
    return reply.status(200).send({
      checkoutUrl: session.url
    });
  });
}

// src/controllers/print/estock.ts
var import_zod9 = __toESM(require("zod"));
var stockStatusEnum2 = import_zod9.default.enum([
  "Em_Estoque",
  "Estoque_Medio",
  "Estoque_Baixo"
]);
var stockPrintSchema = import_zod9.default.object({
  id: import_zod9.default.string().uuid(),
  quantity: import_zod9.default.number(),
  value_Total: import_zod9.default.number(),
  status: stockStatusEnum2,
  product: import_zod9.default.object({
    name: import_zod9.default.string(),
    category: import_zod9.default.object({
      id: import_zod9.default.string().uuid(),
      name: import_zod9.default.string(),
      description: import_zod9.default.string().nullable()
    }),
    unit: import_zod9.default.string(),
    price: import_zod9.default.number()
  }).optional()
});
async function stockPrintRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["print"],
      response: {
        200: import_zod9.default.array(stockPrintSchema)
      }
    }
  }, async () => {
    return prisma_default.stock.findMany({
      select: {
        id: true,
        quantity: true,
        value_Total: true,
        status: true,
        product: {
          select: {
            name: true,
            category: true,
            unit: true,
            price: true
          }
        }
      }
    });
  });
}

// src/controllers/print/shopping.ts
var import_zod10 = __toESM(require("zod"));
var shoppingResponseSchema2 = import_zod10.default.object({
  id: import_zod10.default.string().uuid(),
  number: import_zod10.default.number().int(),
  supplierId: import_zod10.default.string().uuid(),
  date: import_zod10.default.string(),
  total: import_zod10.default.number(),
  status: import_zod10.default.boolean(),
  supplier: import_zod10.default.object({
    id: import_zod10.default.string().uuid(),
    name: import_zod10.default.string(),
    company: import_zod10.default.string()
  }),
  items: import_zod10.default.array(import_zod10.default.object({
    id: import_zod10.default.string().uuid(),
    name: import_zod10.default.string(),
    quantity: import_zod10.default.number().int(),
    price: import_zod10.default.number()
  }))
});
async function shoppingPrintRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["print"],
      description: "List all shopping orders",
      response: { 200: import_zod10.default.array(shoppingResponseSchema2) }
    }
  }, async () => {
    return await prisma_default.shopping.findMany({
      include: {
        supplier: true,
        items: true
      },
      orderBy: { number: "desc" }
    });
  });
}

// src/controllers/print/suppliers.ts
var import_zod11 = __toESM(require("zod"));
var supplierResponseSchema2 = import_zod11.default.object({
  id: import_zod11.default.string().uuid(),
  name: import_zod11.default.string(),
  role: import_zod11.default.string(),
  status: import_zod11.default.enum(["Customer", "Lead", "Active"]),
  date: import_zod11.default.string(),
  company: import_zod11.default.string(),
  email: import_zod11.default.string(),
  phone: import_zod11.default.string(),
  nif: import_zod11.default.string(),
  avatar: import_zod11.default.string().nullable().optional()
});
async function supplierPrintRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["print"],
      description: "List all suppliers",
      response: { 200: import_zod11.default.array(supplierResponseSchema2) }
    }
  }, async () => {
    return await prisma_default.supplier.findMany({
      orderBy: { name: "asc" }
    });
  });
}

// src/controllers/print/product.ts
var import_zod12 = __toESM(require("zod"));
var import_multipart2 = __toESM(require("@fastify/multipart"));
var productResponseSchema2 = import_zod12.default.object({
  id: import_zod12.default.string().uuid(),
  name: import_zod12.default.string().min(1),
  categoryId: import_zod12.default.string().uuid(),
  category: import_zod12.default.object({
    id: import_zod12.default.string(),
    name: import_zod12.default.string(),
    description: import_zod12.default.string().nullable()
  }),
  unit: import_zod12.default.string(),
  price: import_zod12.default.number().positive(),
  quantity: import_zod12.default.number().int(),
  banner: import_zod12.default.string().min(1),
  emoji: import_zod12.default.string().min(1),
  image: import_zod12.default.string()
});
async function productsPrintRoutes(app2) {
  await app2.register(import_multipart2.default);
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["print"],
      response: { 200: import_zod12.default.array(productResponseSchema2) }
    }
  }, async () => {
    return await prisma_default.product.findMany({
      include: {
        category: true
      },
      orderBy: { name: "asc" }
    });
  });
}

// src/controllers/print/orders.ts
var import_zod13 = __toESM(require("zod"));
var productSchema2 = import_zod13.default.object({
  id: import_zod13.default.string().uuid(),
  name: import_zod13.default.string(),
  category: import_zod13.default.object({
    id: import_zod13.default.string().uuid(),
    name: import_zod13.default.string()
  }),
  categoryId: import_zod13.default.string(),
  quantity: import_zod13.default.number(),
  unit: import_zod13.default.string(),
  price: import_zod13.default.number(),
  banner: import_zod13.default.string(),
  emoji: import_zod13.default.string(),
  image: import_zod13.default.string()
});
var clientSchema2 = import_zod13.default.object({
  id: import_zod13.default.string().uuid(),
  name: import_zod13.default.string(),
  email: import_zod13.default.string().email(),
  phone: import_zod13.default.string(),
  isCorporative: import_zod13.default.string(),
  nif: import_zod13.default.string().nullable().optional(),
  status: import_zod13.default.string(),
  role: import_zod13.default.string(),
  avatar: import_zod13.default.string().nullable()
});
var orderItemSchema2 = import_zod13.default.object({
  quantity: import_zod13.default.number().min(1),
  price: import_zod13.default.number().min(0),
  productId: import_zod13.default.string().uuid()
});
var orderItemFullSchema2 = orderItemSchema2.extend({
  id: import_zod13.default.string().uuid(),
  orderId: import_zod13.default.string().uuid(),
  product: productSchema2
});
var orderResponseSchema2 = import_zod13.default.object({
  id: import_zod13.default.string().uuid(),
  number: import_zod13.default.number(),
  date: import_zod13.default.string(),
  total: import_zod13.default.number().min(0),
  status: import_zod13.default.enum([
    "Pendente",
    "Confirmado",
    "Em_processamento",
    "Enviado",
    "Entregue"
  ]),
  clientId: import_zod13.default.string().uuid(),
  client: clientSchema2,
  items: import_zod13.default.array(orderItemFullSchema2).min(1)
});
var orderInclude2 = {
  items: {
    include: {
      product: {
        include: {
          category: true
        }
      }
    }
  },
  client: true
};
async function ordersPrintRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["print"],
      description: "List orders for report (respects q/status/from/to filters when provided)",
      querystring: import_zod13.default.object({
        q: import_zod13.default.string().optional(),
        status: orderResponseSchema2.shape.status.optional(),
        from: import_zod13.default.string().optional(),
        to: import_zod13.default.string().optional()
      }),
      response: { 200: import_zod13.default.array(orderResponseSchema2) }
    }
  }, async (request) => {
    const { q, status, from, to } = request.query;
    const dateFilter = from || to ? {
      date: {
        ...from && { gte: from },
        ...to && { lte: to }
      }
    } : {};
    return prisma_default.order.findMany({
      where: {
        ...q && {
          OR: [
            { client: { name: { contains: q } } },
            { client: { isCorporative: { contains: q } } }
          ]
        },
        ...status && { status },
        ...dateFilter
      },
      include: orderInclude2,
      orderBy: { number: "asc" }
    });
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["print"],
      description: "Get single order for receipt",
      params: import_zod13.default.object({ id: import_zod13.default.string().uuid() }),
      response: {
        200: orderResponseSchema2,
        404: import_zod13.default.object({ message: import_zod13.default.string() })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const order = await prisma_default.order.findUnique({
      where: { id },
      include: orderInclude2
    });
    if (!order) {
      return reply.status(404).send({ message: "Pedido n\xE3o encontrado" });
    }
    return order;
  });
}

// src/controllers/print/client.ts
var import_zod14 = __toESM(require("zod"));
var clientResponseSchema2 = import_zod14.default.object({
  id: import_zod14.default.string().uuid(),
  name: import_zod14.default.string(),
  role: import_zod14.default.enum(["Client", "Commercial_Manager", "Admin"]),
  status: import_zod14.default.enum(["Customer", "Lead", "Active"]),
  date: import_zod14.default.string(),
  isCorporative: import_zod14.default.string(),
  email: import_zod14.default.email(),
  phone: import_zod14.default.string(),
  nif: import_zod14.default.string().nullable().optional(),
  avatar: import_zod14.default.string().nullable().optional()
});
async function clientsPrintRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["print"],
      description: "List clients for report (respects q/status/phone/nif filters when provided)",
      querystring: import_zod14.default.object({
        q: import_zod14.default.string().optional(),
        status: clientResponseSchema2.shape.status.optional(),
        phone: import_zod14.default.string().optional(),
        nif: import_zod14.default.string().optional(),
        from: import_zod14.default.string().optional(),
        to: import_zod14.default.string().optional()
      }),
      response: { 200: import_zod14.default.array(clientResponseSchema2) }
    }
  }, async (request) => {
    const { q, status, phone, nif, from, to } = request.query;
    const dateFilter = from || to ? {
      date: {
        ...from && { gte: from },
        ...to && { lte: to }
      }
    } : {};
    return await prisma_default.client.findMany({
      where: {
        ...q && {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { isCorporative: { contains: q } },
            { phone: { contains: q } },
            { nif: { contains: q } }
          ]
        },
        ...status && { status },
        ...phone && { phone: { contains: phone } },
        ...nif && { nif: { contains: nif } },
        ...dateFilter
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isCorporative: true,
        nif: true,
        avatar: true,
        date: true
      }
    });
  });
}

// src/controllers/category/index.ts
var import_zod15 = __toESM(require("zod"));
var categorySchema3 = import_zod15.default.object({
  id: import_zod15.default.string().uuid(),
  name: import_zod15.default.string(),
  description: import_zod15.default.string().nullable()
});
var categoryBodySchema = import_zod15.default.object({
  name: import_zod15.default.string().min(2),
  description: import_zod15.default.string().optional()
});
async function categoriesRoutes(app2) {
  app2.get("/", {
    schema: {
      tags: ["categories"],
      description: "List all categories",
      response: {
        200: import_zod15.default.array(categorySchema3)
      }
    }
  }, async () => {
    const categories = await prisma_default.category.findMany({
      orderBy: {
        name: "asc"
      }
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description
    }));
  });
  app2.get("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["categories"],
      description: "Get category by ID",
      params: import_zod15.default.object({
        id: import_zod15.default.string().uuid()
      }),
      response: {
        200: categorySchema3,
        404: import_zod15.default.object({
          message: import_zod15.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const category = await prisma_default.category.findUnique({
      where: {
        id: request.params.id
      }
    });
    if (!category) {
      return reply.status(404).send({
        message: "Category not found"
      });
    }
    return reply.status(200).send({
      id: category.id,
      name: category.name,
      description: category.description
    });
  });
  app2.post("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["categories"],
      description: "Create category",
      body: categoryBodySchema,
      response: {
        201: import_zod15.default.object({
          id: import_zod15.default.string().uuid()
        }),
        400: import_zod15.default.object({
          message: import_zod15.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const { name, description } = request.body;
    const categoryAlreadyExists = await prisma_default.category.findUnique({
      where: { name }
    });
    if (categoryAlreadyExists) {
      return reply.status(400).send({
        message: "Category already exists"
      });
    }
    const category = await prisma_default.category.create({
      data: { name, description }
    });
    return reply.status(201).send({
      id: category.id
    });
  });
  app2.put("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["categories"],
      description: "Update category",
      params: import_zod15.default.object({
        id: import_zod15.default.string().uuid()
      }),
      body: categoryBodySchema,
      response: {
        200: import_zod15.default.object({
          message: import_zod15.default.string()
        }),
        404: import_zod15.default.object({
          message: import_zod15.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { name, description } = request.body;
    const categoryExists = await prisma_default.category.findUnique({
      where: { id }
    });
    if (!categoryExists) {
      return reply.status(404).send({
        message: "Category not found"
      });
    }
    await prisma_default.category.update({
      where: { id },
      data: { name, description }
    });
    return reply.status(200).send({
      message: "Category updated successfully"
    });
  });
  app2.patch("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["categories"],
      description: "Patch category",
      params: import_zod15.default.object({
        id: import_zod15.default.string().uuid()
      }),
      body: categoryBodySchema.partial(),
      response: {
        200: import_zod15.default.object({
          message: import_zod15.default.string()
        }),
        404: import_zod15.default.object({
          message: import_zod15.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const categoryExists = await prisma_default.category.findUnique({
      where: { id }
    });
    if (!categoryExists) {
      return reply.status(404).send({
        message: "Category not found"
      });
    }
    await prisma_default.category.update({
      where: { id },
      data: request.body
    });
    return reply.status(200).send({
      message: "Category patched successfully"
    });
  });
  app2.delete("/:id", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["categories"],
      description: "Delete category",
      params: import_zod15.default.object({
        id: import_zod15.default.string().uuid()
      }),
      response: {
        200: import_zod15.default.object({
          message: import_zod15.default.string()
        }),
        404: import_zod15.default.object({
          message: import_zod15.default.string()
        }),
        400: import_zod15.default.object({
          message: import_zod15.default.string()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const categoryExists = await prisma_default.category.findUnique({
      where: { id },
      include: { products: true }
    });
    if (!categoryExists) {
      return reply.status(404).send({
        message: "Category not found"
      });
    }
    if (categoryExists.products.length > 0) {
      return reply.status(400).send({
        message: "Category has related products"
      });
    }
    await prisma_default.category.delete({
      where: { id }
    });
    return reply.status(200).send({
      message: "Category deleted successfully"
    });
  });
}

// src/controllers/dashboard/index.ts
var import_zod16 = __toESM(require("zod"));
async function dashboardRoutes(app2) {
  app2.get("/", {
    preHandler: [app2.authenticate],
    schema: {
      tags: ["dashboard"],
      description: "Get dashboard overview data",
      response: {
        200: import_zod16.default.object({
          receita_total: import_zod16.default.number(),
          total_pedidos: import_zod16.default.number(),
          total_compras: import_zod16.default.number(),
          estoque_baixo: import_zod16.default.number(),
          atividades: import_zod16.default.array(import_zod16.default.object({
            tipo: import_zod16.default.string(),
            descricao: import_zod16.default.string(),
            data: import_zod16.default.string()
          }))
        })
      }
    }
  }, async (req, reply) => {
    const pedidos = await prisma_default.order.aggregate({
      _sum: { total: true },
      _count: { id: true }
    });
    const compras = await prisma_default.shopping.aggregate({
      _count: { id: true }
    });
    const estoqueBaixo = await prisma_default.stock.count({
      where: { status: "Estoque_Baixo" }
    });
    const [ultimosPedidos, ultimasCompras, ultimosStocks] = await Promise.all([
      prisma_default.order.findMany({
        take: 3,
        orderBy: { date: "desc" },
        include: { client: { select: { name: true } } }
      }),
      prisma_default.shopping.findMany({
        take: 3,
        orderBy: { number: "desc" },
        include: { supplier: { select: { name: true } } }
      }),
      prisma_default.stock.findMany({
        take: 3,
        where: { status: { in: ["Estoque_Baixo", "Estoque_Medio"] } },
        include: { product: { select: { name: true } } },
        orderBy: { id: "desc" }
      })
    ]);
    const atividades = [
      ...ultimosPedidos.map((p) => ({
        tipo: "pedido",
        descricao: `Novo pedido recebido de ${p.client?.name ?? "cliente"}`,
        data: p.date
      })),
      ...ultimasCompras.map((c) => ({
        tipo: "compra",
        descricao: `Compra COM-${String(c.number).padStart(6, "0")} confirmada com fornecedor ${c.supplier?.name ?? ""}`,
        data: c.date
      })),
      ...ultimosStocks.map((s) => ({
        tipo: "estoque",
        descricao: `Estoque de ${s.product?.name ?? "produto"} abaixo do limite`,
        data: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT")
      }))
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 6);
    return reply.send({
      receita_total: pedidos._sum.total ?? 0,
      total_pedidos: pedidos._count.id ?? 0,
      total_compras: compras._count.id ?? 0,
      estoque_baixo: estoqueBaixo ?? 0,
      atividades
    });
  });
  app2.get("/chart", {
    schema: {
      tags: ["dashboard"],
      description: "Get monthly revenue chart data",
      response: {
        200: import_zod16.default.array(import_zod16.default.object({
          mes: import_zod16.default.string(),
          total: import_zod16.default.number()
        }))
      }
    }
  }, async (req, reply) => {
    const pedidos = await prisma_default.order.findMany({
      select: { date: true, total: true }
    });
    const porMes = {};
    for (const pedido of pedidos) {
      const raw = pedido.date;
      let chave = null;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
        const [dd, mm, yyyy] = raw.split("/");
        chave = `${yyyy}-${mm}`;
      } else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        chave = raw.substring(0, 7);
      } else if (raw.includes("T")) {
        chave = raw.substring(0, 7);
      }
      if (!chave) {
        console.warn("Formato de data desconhecido:", raw);
        continue;
      }
      porMes[chave] = (porMes[chave] ?? 0) + pedido.total;
    }
    const resultado = Object.entries(porMes).sort(([a], [b]) => a.localeCompare(b)).map(([mes, total]) => ({ mes, total }));
    return reply.send(resultado);
  });
}

// src/routes/routes.ts
function registerRoutes(app2) {
  app2.register(authRoutes, { prefix: "/auth" });
  app2.register(clientsRoutes, { prefix: "/clients" });
  app2.register(supplierRoutes, { prefix: "/suppliers" });
  app2.register(ordersRoutes, { prefix: "/orders" });
  app2.register(categoriesRoutes, { prefix: "/categories" });
  app2.register(checkoutRoutes, { prefix: "/orders" });
  app2.register(stockRoutes, { prefix: "/stock" });
  app2.register(shoppingRoutes, { prefix: "/shopping" });
  app2.register(productsRoutes, { prefix: "/products" });
  app2.register(stockPrintRoutes, { prefix: "/stock/print" });
  app2.register(shoppingPrintRoutes, { prefix: "/shopping/print" });
  app2.register(supplierPrintRoutes, { prefix: "/suppliers/print" });
  app2.register(productsPrintRoutes, { prefix: "/products/print" });
  app2.register(ordersPrintRoutes, { prefix: "/orders/print" });
  app2.register(clientsPrintRoutes, { prefix: "/clients/print" });
  app2.register(dashboardRoutes, { prefix: "/dashboard" });
}

// src/server.ts
var import_static = __toESM(require("@fastify/static"));
var import_node_path2 = __toESM(require("path"));

// src/plugins/jwt.ts
var import_fastify_plugin = __toESM(require_plugin());
var import_jwt = __toESM(require("@fastify/jwt"));
var jwt_default = (0, import_fastify_plugin.default)(async (app2) => {
  app2.register(import_jwt.default, {
    secret: "supersecret"
  });
  app2.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: "N\xE3o autorizado" });
    }
  });
});

// src/server.ts
var app = (0, import_fastify.default)().withTypeProvider();
app.register(import_cors.default, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
});
app.setValidatorCompiler(import_fastify_type_provider_zod.validatorCompiler);
app.setSerializerCompiler(import_fastify_type_provider_zod.serializerCompiler);
app.register(jwt_default);
app.register(import_swagger.default, {
  openapi: {
    info: {
      title: "Api fazenda",
      version: "1.0.0"
    }
  },
  transform: ({ schema, url }) => {
    if (schema?.querystring) {
      schema = {
        ...schema,
        querystring: {
          type: "object",
          properties: {
            q: { type: "string", description: "Pesquisar" }
          }
        }
      };
    }
    return { schema, url };
  }
});
app.register(import_swagger_ui.default, {
  routePrefix: "/docs"
});
app.register(import_static.default, {
  root: import_node_path2.default.resolve("uploads"),
  prefix: "/uploads/"
});
registerRoutes(app);
app.listen({ port: 3333 }).then(() => {
  console.log("Http server runing !");
});
