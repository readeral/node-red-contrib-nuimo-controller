//Needs to 'hold' the bluetooth connection and expose it to the various 'normal' nodes

module.exports = function(RED) {

  function nuimoConfigNode(n) {
      RED.nodes.createNode(this,n);

      let Nuimo = require('nuimojs'),
      nuimo = new Nuimo();

      var node = this;

      nuimo.on("discover", (device) => {
        nuimo.stop();
        node.writeMatrix = (instructions) => {
          device.setLEDMatrix(instructions.matrix, instructions.brightness, instructions.timeout, instructions.options);
        }
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

        device.connect();

      });

      nuimo.scan();

      node.on('close', function () {
        nuimo.stop();
        nuimo.removeAllListeners();
      });
  }
  RED.nodes.registerType("nuimo-config",nuimoConfigNode);
}
