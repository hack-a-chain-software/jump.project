import shell from "shelljs";

export function exec(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    shell.exec(cmd, { async: true, silent: true }, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}
