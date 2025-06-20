import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["./src/main.tsx"],
  bundle: true,
  outdir: "build",
  loader: {
    ".svg": "file",
    ".png": "file",
    ".mp3": "file",
    ".wav": "file",
  },
});
