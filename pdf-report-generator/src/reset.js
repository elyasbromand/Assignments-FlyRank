import { rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
rmSync(join(root, "report.db"), { force: true });
rmSync(join(root, "reports"), { recursive: true, force: true });
console.log("wiped report.db and reports/");