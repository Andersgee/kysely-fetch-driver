# kysely-fetch-driver

Edge compatible fetch driver for kysely.

This driver uses requests with `fetch()` to a webserver that responds with the query result instead of querying the database directly.

This is the same idea as the popular planetscale dialect but is not limited to planetscale or even mysql.

## install

```sh
npm install @andersgee/kysely-fetch-driver
```

## usage

```ts
import { Kysely } from "kysely";
import { FetchDriver } from "@andersgee/kysely-fetch-driver";
import { DB } from "./types";
//adapter of your choice:
import { MysqlAdapter, MysqlIntrospector, MysqlQueryCompiler } from "kysely";

//something that can handle sending/recieving Date and bigint etc.
//using superjson here as an example
const transformer = {
  serialize: (value: any) => superjson.stringify(value),
  deserialize: (str: string) => superjson.parse(str),
};

export function dbfetch(init?: RequestInit) {
  return new Kysely<DB>({
    dialect: {
      createAdapter: () => new MysqlAdapter(),
      createIntrospector: (db) => new MysqlIntrospector(db),
      createQueryCompiler: () => new MysqlQueryCompiler(),
      createDriver: () => {
        return new FetchDriver({
          transformer: transformer,
          url: "http://localhost:4000",
          init: {
            headers: {
              Authorization: "Basic SOMESECRET",
            },
            //some default options of your choice here
            //cache: "no-store",
            ...init,
          },
        });
      },
    },
  });
}

//use kysely query builder as normal
const examples = await dbfetch()
  .selectFrom("Example")
  .selectAll()
  .execute();

//since this is just regular fetch()
//in nextjs we are free to use http cache, for example:
const examples = await dbfetch({ next: { revalidate: 10 } })
  .selectFrom("Example")
  .selectAll()
  .execute();
```

### webserver

You need to have a webserver located at `url` that handles the requests for this driver to work. The webserver should handle requests like this:

```ts
async function handler(request) {
  const compiledQuery = superjson.deserialize(request.query.q);
  const result = await kysely.executeQuery(compiledQuery);
  return superjson.serialize(result);
}
```

[see examples folder](examples) for a full example with fastify and mysql
