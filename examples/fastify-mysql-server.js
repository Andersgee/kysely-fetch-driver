import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { serialize, deserialize } from "superjson";
import Fastify from "fastify";

const fastify = Fastify({ logger: true });

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

fastify.route({
  method: "POST",
  url: "/",
  preHandler: async (request, reply) => {
    if (request.headers.authorization !== "Basic SOMESECRET") {
      reply.code(401).send("Unauthorized");
    }
  },
  handler: async (request, reply) => {
    const result = await kysely.executeQuery(deserialize(request.body));
    reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send(serialize(result));
  },
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();