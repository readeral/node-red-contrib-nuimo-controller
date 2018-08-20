//Needs to 'hold' the bluetooth connection and expose it to the various 'normal' nodes

module.exports = function(RED) {

  function nuimoConfigNode(n) {
      RED.nodes.createNode(this,n);

      let Nuimo = require('nuimojs'),
      nuimo = new Nuimo();

      var node = this;

      nuimo.on("discover", (device) => {
        device.on("connect", () => {
          node.warn("Nuimo connected");
          node.emit('connected',device.batteryLevel);
        });
        device.on("disconnect", () => {
          node.warn("Nuimo disconnected");
          node.emit('disconnected','');
        });
        device.on("batteryLevelChange", (level) => {
          node.emit('batteryLevelChange', level);
        });
        device.on("press", () => {
          node.emit('press','');
          device.setLEDMatrix([
                    0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 1, 0, 0, 1, 1, 0,
                    0, 0, 0, 1, 0, 1, 0, 0, 0,
                    0, 0, 0, 1, 0, 0, 1, 0, 0,
                    0, 1, 0, 1, 0, 0, 0, 1, 0,
                    0, 0, 1, 0, 0, 1, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0
                ], 255, 2000);
        });

        function writeMatrix(instructions) {
          device.setLEDMatrix(instructions.ledArray, instructions.brightness, instructions.timeout, instructions.options);
        };

        device.connect();
      });

      nuimo.scan();
  }

  RED.nodes.registerType("nuimo-config",nuimoConfigNode);
}
