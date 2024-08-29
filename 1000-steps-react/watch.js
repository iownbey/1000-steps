import esbuild from "esbuild";

let ctx = await esbuild.context({
  entryPoints: ["./src/main.tsx"],
  bundle: true,
  outdir: "./public/build",
  loader: {
    ".svg": "file",
  },
});

let { host, port } = await ctx.serve({
  servedir: "./public",
  host: "localhost",
});

console.log(`Hosting on http://${host}:${port}`);
