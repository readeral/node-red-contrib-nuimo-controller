let Nuimo = require('nuimojs'),
nuimo = new Nuimo();

nuimo.on("discover", (device) => {
  device.on("connect", () => {
    console.log("Nuimo connected");
  });
  device.on("disconnect", () => {
    console.log("Nuimo disconnected");
  });
  device.on("press", () => {
    console.log("Press");
  });
  function writeMatrix(instructions) {
    device.setLEDMatrix([instructions.matrix], instructions.brightness, instructions.timeout, instructions.options);
  }
  device.connect();
});

nuimo.scan();

module.exports.writeMatrix = writeMatrix;
