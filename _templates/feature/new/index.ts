import type { Prompter as BasePrompter } from "hygen/dist/types"
import { camelCase, paramCase } from "change-case";

// Using `any` here. If we wanted to we could specify the exact
// prompt and response types here but it's probably overkill.
type Prompter = BasePrompter<any, any>;

export default {
  prompt: async ({ prompter }: { prompter: Prompter }) => {
    const { rawFeatureName } = await prompter.prompt({
      type: "input",
      name: "rawFeatureName",
      message: "What is the feature's name?",
    });
    const feature = camelCase(rawFeatureName);

    const { path } = await prompter.prompt({
      type: "input",
      name: "path",
      message: `What is the root path of the ${rawFeatureName} routes?`,
      initial: `/${paramCase(rawFeatureName)}`,
    });

    return { feature, path };
  },
};
