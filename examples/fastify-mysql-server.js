import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import superjson from "superjson";
import Fastify from "fastify";

const kysely = new Kysely({
  dialect: new MysqlDialect({
    pool: createPool({
      user: "someuser",
      password: "somepassword",
      host: "127.0.0.1",
      port: 4004,
      database: "db",
    }),
  }),
});

const AUTH_SECRET = "Basic SOMESECRET";

const server = Fastify();

server.addHook("onRequest", async (request) => {
  if (request.headers.authorization !== AUTH_SECRET) {
    throw { statusCode: 401, message: "Unauthorized" };
  }
});

server.route({
  method: "GET",
  url: "/",
  handler: async (request, reply) => {
    const compiledQuery = superjson.deserialize(request.query.q);
    const result = await kysely.executeQuery(compiledQuery);
    return superjson.serialize(result);
  },
});

async function start() {
  try {
    await server.listen({ host: "0.0.0.0", port: 4000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
start();
