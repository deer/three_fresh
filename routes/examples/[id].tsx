import { defineRoute } from "$fresh/server.ts";

export default defineRoute(async (req, ctx) => {
  if (!validIslands().includes(ctx.params.id)) return ctx.renderNotFound();
  const islandPath = `../../islands/${ctx.params.id}.tsx`;
  const component = await import(islandPath);

  return <component.default />;
});

function validIslands() {
  const islands: string[] = [];
  const location = new URL("../../islands", import.meta.url);
  for (const island of Deno.readDirSync(location)) {
    islands.push(island.name.replace(".tsx", ""));
  }
  return islands;
}
