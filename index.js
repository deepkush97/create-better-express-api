#! /usr/bin/env node
const { spawn } = require("child_process");

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
  console.log("Now, installing the dependencies...");
  // Installing the dependencies.
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
