import { readFile } from "node:fs/promises";
import path from "node:path";

/** Read a component's source off disk so the Code tab always mirrors reality. */
export async function readSource(relPath: string): Promise<string> {
  const abs = path.join(process.cwd(), relPath);
  return readFile(abs, "utf8");
}
