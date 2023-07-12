import type prettier from "prettier";

export interface ResolvedConfig {
  prettier: prettier.Options;
  jsDocPlugin: boolean;
}
