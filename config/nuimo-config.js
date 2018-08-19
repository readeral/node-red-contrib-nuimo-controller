//Needs to 'hold' the bluetooth connection and expose it to the various 'normal' nodes

var nuimo = require('../nuimo.js')

module.exports = function(RED) {

  /*let Nuimo = require('nuimojs'),
  nuimo = new Nuimo();
*/
  function nuimoConfigNode(n) {
      RED.nodes.createNode(this,n);
      this.nuimo = nuimo;
      /*
      this.users = [];
      this.configNode = n.configNode
      this.name = n.name;
      var node = this;

      nuimo.on("discover", (device) => {
        nuimo.on("connect", () => {
          node.warn("connected");
          connection = "connected";
        });

        nuimo.on("disconnect", () => {
          node.warn("disconnected");
          connection = "disconnected";
        });
        device.connect();
      });

      function writeMatrix(instructions) {
        node.warn("Writing matrix");
        nuimo.setLEDMatrix([instructions.matrix], instructions.brightness, instructions.timeout, instructions.options);
      }

      nuimo.scan();*/
  }

  RED.nodes.registerType("nuimo-config",nuimoConfigNode);
}
