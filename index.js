#! /usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
function runCommand(command, args, options = undefined) {
  const spawned = spawn(command, args, options);

  return new Promise((resolve) => {
    spawned.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    spawned.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    spawned.on("close", () => {
      resolve();
    });
  });
}

const main = async (repositoryUrl) => {
  //Get the name of the app-directory to make
  const directoryName = process.argv[2];
  if (!directoryName || directoryName.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
    return console.log(`
        Invalid directory name.
        Usage : 'create-better-express-api name_of_app'
        `);
  }
  // Clone the repository into the given name
  await runCommand("git", ["clone", repositoryUrl, directoryName]);
  // Removing the .git folder
  await runCommand("rm", ["-rf", `${directoryName}/.git`]);
  //1. Removing the readme, package-lock.json
  await runCommand("rm", ["-r", `${directoryName}/readme.md`]);
  await runCommand("rm", ["-r", `${directoryName}/package-lock.json`]);
  //2. rename .env.example to .env
  await runCommand("mv", [
    `${directoryName}/.env.example`,
    `${directoryName}/.env`,
  ]);

  //3. get the json from package.json
  const packageJsonRaw = fs.readFileSync(`${directoryName}/package.json`);
  const packageJson = JSON.parse(packageJsonRaw);
  // and modify its detail
  packageJson.name = directoryName;
  packageJson.author = "";
  packageJson.keywords = [];
  packageJson.version = "1.0.0";
  packageJson.description = "A node application";
  // and again write it again into package.json
  await runCommand("rm", ["-r", `${directoryName}/package.json`]);
  fs.writeFileSync(
    `${directoryName}/package.json`,
    JSON.stringify(packageJson, null, 2)
  );
  // Installing the dependencies.
  console.log("Now, installing the dependencies...");
  await runCommand("npm", ["i"], { cwd: `${process.cwd()}/${directoryName}` });

  console.log(`Application generated is ready to use.

To get started, 

- cd ${directoryName}
- npm run dev
  `);
};

return main(
  "https://github.com/deepkush97/better-express-api-structure-ts.git"
);
