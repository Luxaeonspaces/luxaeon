import { readdir } from "fs/promises";
import path from "path";

const groups = [
  {
    title: "Client-facing templates",
    prefixes: [
      "01_",
      "02_",
      "03_",
      "04_",
      "05_",
      "06_",
      "07_",
      "08_",
      "09_",
      "10_",
      "11_",
      "12_",
      "13_",
    ],
  },
  {
    title: "Operations & vendors",
    prefixes: [
      "14_",
      "15_",
      "16_",
      "17_",
      "18_",
      "20_",
      "21_",
    ],
  },
];

export async function getTemplates() {
  const directory = path.join(
    process.cwd(),
    "public",
    "templates"
  );

  try {
    const files = await readdir(directory);

    return files.filter(
      (file) =>
        file.endsWith(".docx") ||
        file.endsWith(".xlsx")
    );
  } catch {
    return [];
  }
}

export function getTemplateGroups(files) {
  return groups.map((group) => {
    const templates = files.filter((file) =>
      group.prefixes.some((prefix) =>
        file.startsWith(prefix)
      )
    );

    return {
      title: group.title,
      templates,
    };
  });
}

export function getOtherTemplates(files) {
  return files.filter(
    (file) =>
      !groups.some((group) =>
        group.prefixes.some((prefix) =>
          file.startsWith(prefix)
        )
      )
  );
}