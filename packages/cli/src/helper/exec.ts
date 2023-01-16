import shell from "shelljs";

export function exec(cmd: string, options?: any) {
  return new Promise<string>((resolve, reject) => {
    shell.exec(cmd, { async: true, ...options }, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}
