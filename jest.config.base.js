const baseConfigType = process.env.BASE_CONFIG_TYPE || "shared";

if (baseConfigType === "shared") {
  // the default, to demonstrate the jest bug.
  // every project will use the same config object.
  // jest mutates the object to set rootDir when not set
  module.exports = {};
} else if (baseConfigType === "frozen") {
  // produces a stack trace where jest tries to mutate the object to set rootDir
  module.exports = Object.freeze({});
} else if (baseConfigType === "individual") {
  // work around the bug by returning a function that generates a distinct config object for each project
  module.exports = () => ({});
} else {
  throw new Error(`Unknown BASE_CONFIG_TYPE: ${baseConfigType}`);
}
