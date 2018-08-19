//Needs to access the 'writeMatrix' method of Nuimo object

module.exports = function(RED) {

  function nuimoSetMatrixNode(config) {
    RED.nodes.createNode(this,config);
//import the config node
    this.nuimoConfig = RED.nodes.getNode(config.nuimoConfig);

    this.matrix = config.matrix;
    this.brightness = config.brightness;
    this.timeout = config.timeout;
    this.onionSkinning = config.onionSkinning;

    var node = this;
    this.on('input', function(msg) {
      let instructions = { matrix: node.matrix, brightness: node.brightness, timeout: node.timeout, options: {onionSkinning: node.onionSkinning}};
      msg.instructions = instructions;
      nuimo.writeMatrix(instructions);
      node.send(msg);
    });
  }
  RED.nodes.registerType("nuimo-set-matrix",nuimoSetMatrixNode);
}
