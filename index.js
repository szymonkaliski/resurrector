const { argv } = require("yargs");
const { spawn } = require("child_process");
const { UdpReceiver } = require("omgosc");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const findIndex = require("lodash.findindex");
const dateFormat = require("dateformat");

const [configPath] = argv._;
const filePath = path.resolve(process.cwd(), configPath);
const dirPath = path.dirname(filePath);

const DEFAULT_TIMEOUT = 2000;
const DEFAULT_INTERVAL = 100;
const DEFAULT_PORT = 3000;
const DEFAULT_PATH = "/hb/";
const PROCESS_ID_COLORS = ["yellow", "blue", "magenta", "cyan", "white"];

if (!configPath || configPath.indexOf(".json") < 0) {
  console.log("pass configPath.json as argument");
  return;
}

const config = JSON.parse(fs.readFileSync(configPath).toString());

const getTime = () => new Date().getTime();

const readableDate = () => dateFormat(new Date(), "dd-mm-yy HH:MM:ss.l");

const idWithColor = processId => {
  const idx = findIndex(config.processes, ({ id }) => id === processId);
  const color = PROCESS_ID_COLORS[idx % PROCESS_ID_COLORS.length];

  return `${chalk.gray(readableDate())} [${chalk[color](processId)}]`;
};

const makeLogger = processId => data => {
  console.log(`${idWithColor(processId)} ${data.toString().trim()}`);
};

const spawnProcess = processId => {
  const configProcess = config.processes.find(({ id }) => id === processId);
  if (!configProcess) {
    console.log(`no process with id: ${processId}`);
    return;
  }

  const spawned = spawn(configProcess.cmd, [], {
    cwd: dirPath,
    shell: process.env.SHELL
  });

  const logger = makeLogger(processId);

  spawned.stdout.on("data", logger);
  spawned.stderr.on("data", logger);

  return spawned;
};

const processes = config.processes.reduce((memo, { id, timeout }) => {
  return Object.assign(memo, {
    [id]: {
      spawned: spawnProcess(id),
      lastPing: getTime(),
      timeout: timeout || DEFAULT_TIMEOUT
    }
  });
}, {});

const receiver = new UdpReceiver(config.port || DEFAULT_PORT);

receiver.on(config.path || DEFAULT_PATH, ({ params }) => {
  const [id] = params;
  processes[id].lastPing = getTime();
});

setInterval(() => {
  const now = getTime();

  Object.keys(processes).forEach(id => {
    const { lastPing, timeout } = processes[id];

    if (now - lastPing > timeout) {
      console.log(
        `${idWithColor(id)} ${chalk.red("timeouted, restarting...")} `
      );

      processes[id].spawned.kill("SIGKILL");
      processes[id].spawned = spawnProcess(id);
      processes[id].lastPing = now;
    }
  });
}, config.interval || DEFAULT_INTERVAL);
