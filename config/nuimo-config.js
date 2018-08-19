//Needs to 'hold' the bluetooth connection and expose it to the various 'normal' nodes

module.exports = function(RED) {

  function nuimoConfigNode(n) {
      RED.nodes.createNode(this,n);
      
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
  }

  RED.nodes.registerType("nuimo-config",nuimoConfigNode);
}
