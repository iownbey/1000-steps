import fg from "fast-glob";

const [pngEntries, jsonEntries] = await Promise.all([
  fg("./src/**/*.png"),
  fg(["!./src/**/*.processed.json", "./src/**/*.json"]),
]);

console.log(jsonEntries, pngEntries);

const validJsonFiles = jsonEntries.filter((json) =>
  pngEntries.some(
    (png) => png.replace(".png", "") === json.replace(".json", "")
  )
);

console.log(validJsonFiles);

await Promise.all(
  validJsonFiles.map((filePath) =>
    (async () => {
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        return;
      }

      console.log(`Processing < ${filePath}`);

      const data = await file.json();
      const oldFrameTags = data?.meta?.frameTags;
      if (oldFrameTags) {
        const frameTags = {} as any;
        data.meta.frameTags = frameTags;
        oldFrameTags.forEach((ft: any) => {
          frameTags[ft.name] = {
            from: ft.from,
            to: ft.to,
          };
        });
      }
      const processedFilePath = filePath.replace(".json", ".processed.json");
      await Bun.write(processedFilePath, JSON.stringify(data));

      console.log(`Output > ${processedFilePath}`);
    })()
  )
);
