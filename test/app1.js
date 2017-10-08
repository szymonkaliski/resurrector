const osc = require("omgosc");
const sender = new osc.UdpSender("127.0.0.1", 4000);

setInterval(() => {
  if (Math.random() < 0.95) {
    console.log("app 1 is still up!");
    sender.send("/hb/", "s", ["app 1"]);
  } else {
    console.log("app 1 crashed...");
    process.exit(1);
  }
}, 1000);
