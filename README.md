Barebones Fastify server generator with auto-generated docs (Swagger) and client (React Query).

# Backend

Set up using `npm install`.

Before creating a route, create a feature using `npm run new:feature` and follow the steps. The generator is powered by hygen, and is not tested very thoroughly.

To create a route, run `npm run new:route`. This will generate a bunch of files. Renaming a route or deleting a route is a little annoying because you have to change multiple files.

Route specs support authentication but right now any authenticated route will throw a 401. Edit `src/router/router.ts` to hook your auth up.

Run the server using `npm run dev`. Go to `localhost:4000/docs` to view the docs.

Generate the react query client by running `npm run generateclient`. Edit the location of the generated client in `generate-client.ts`.
