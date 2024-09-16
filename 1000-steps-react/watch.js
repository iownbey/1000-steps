import esbuild from "esbuild";

let ctx = await esbuild.context({
  entryPoints: ["./src/main.tsx"],
  bundle: true,
  publicPath: "/build",
  outdir: "./public/build",
  loader: {
    ".svg": "file",
    ".png": "file",
    ".mp3": "file",
  },
});

await ctx.watch();

let { host, port } = await ctx.serve({
  servedir: "./public",
  host: "localhost",
});

console.log(`Hosting on http://${host}:${port}`);
