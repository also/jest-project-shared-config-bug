# Jest bug sharing config instances between projects

If a single config instance ([`jest.config.base.js`](jest.config.base.js#L7)) is shared between multiple projects by [re-exporting the same module](project-b/jest.config.js#L1), Jest will set `rootDir` on the object, causing it to only run the first project, once for each project.

The [project-b tests](project-b/test.js) should fail, but they aren't run. The [project-a suite](project-a/test.js) is run twice:

```
$ ./node_modules/.bin/jest
 PASS  project-a/test.js
 PASS  project-a/test.js

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   2 passed, 2 total
Time:        0.155 s, estimated 1 s
Ran all test suites in 2 projects.
```

The location in the Jest source where it mutates the config to set `rootDir` can be found by [freezing the config object](jest.config.base.js#L10).

```
$ BASE_CONFIG_TYPE=frozen ./node_modules/.bin/jest
TypeError: Cannot add property rootDir, object is not extensible
    at readConfigFileAndSetRootDir (/Users/ryan/work/jest-project-shared-config-bug/node_modules/jest-config/build/readConfigFileAndSetRootDir.js:166:26)
    at async readConfig (/Users/ryan/work/jest-project-shared-config-bug/node_modules/jest-config/build/index.js:233:18)
    at async Promise.all (index 0)
    at async readConfigs (/Users/ryan/work/jest-project-shared-config-bug/node_modules/jest-config/build/index.js:441:27)
    at async runCLI (/Users/ryan/work/jest-project-shared-config-bug/node_modules/@jest/core/build/cli/index.js:132:59)
    at async Object.run (/Users/ryan/work/jest-project-shared-config-bug/node_modules/jest-cli/build/cli/index.js:155:37)
```

The bug can be worked around by [creating a new object](jest.config.base.js#L13) for each config. Using the config with the environment variable `BASE_CONFIG_TYPE=individual` demonstrates this:

```$ BASE_CONFIG_TYPE=individual ./node_modules/.bin/jest
 FAIL  project-b/test.js
  ● project b

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: true

      1 | test("project b", () => {
    > 2 |   expect(true).toBe(false);
        |                ^
      3 | });
      4 |

      at Object.<anonymous> (test.js:2:16)

 PASS  project-a/test.js

Test Suites: 1 failed, 1 passed, 2 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   1 passed, 1 total
Time:        0.169 s, estimated 1 s
```
