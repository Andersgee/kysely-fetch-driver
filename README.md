# kysely-fetch-driver

This driver uses post requests with `fetch()` to a webserver that responds with the query result instead of querying the database directly.

## install

```sh
npm install @andersgee/kysely-fetch-driver
```

## usage

```ts
import { MysqlAdapter, MysqlIntrospector, MysqlQueryCompiler } from "kysely";
import { FetchDriver } from "@andersgee/kysely-fetch-driver";
import type { DB } from "./db";

const kysely = new Kysely<DB>({
  dialect: {
    createAdapter: () => new MysqlAdapter(),
    createIntrospector: (db) => new MysqlIntrospector(db),
    createQueryCompiler: () => new MysqlQueryCompiler(),
    createDriver: () =>
      new FetchDriver({
        url: "http://localhost:4000",
        authorization: "Basic SOMESECRET",
      }),
  },
});
```

### webserver

You need to have a webserver located at `url` that handles the post requests for this driver to work.

This is similar to how the popular planetscale dialect does it but here we are not limited to planetscale or even mysql.

The webserver should handle requests like this:

```ts
async function handler(request) {
  const result = await kysely.executeQuery(superjson.deserialize(request.body));
  return superjson.serialize(result);
}
```

[see examples folder](examples) for a full example with fastify and mysql
