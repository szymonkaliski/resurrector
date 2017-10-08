const osc = require("omgosc");
const sender = new osc.UdpSender("127.0.0.1", 4000);

setInterval(() => {
  if (Math.random() < 0.5) {
    console.log("app 2 is still up!");
    sender.send("/hb/", "s", ["app 2"]);
  } else {
    console.log("app 2 crashed...");
    process.exit(1);
  }
}, 3000);
