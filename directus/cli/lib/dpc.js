import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DPC_MAIN = path.join(
  ROOT,
  "node_modules/@ebsi-epd/directus-provision-cli/dist/build/main.js"
);

export const runDpc = ({ command, uri, user, password, packagePath }) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        DPC_MAIN,
        command,
        "--uri",
        uri,
        "--user",
        user,
        "--password",
        password,
        "--path",
        packagePath,
      ],
      { stdio: "inherit", cwd: ROOT }
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`dpc ${command} exited ${code}`));
    });
  });
