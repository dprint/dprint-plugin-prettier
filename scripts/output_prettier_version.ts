import $ from "dax";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const packageJson = rootDir.join("js/node/package.json").readJsonSync<{ dependencies: Record<string, string> }>();
console.log(packageJson.dependencies["prettier"].replace("^", ""));
