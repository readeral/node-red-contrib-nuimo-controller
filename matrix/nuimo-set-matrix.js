//Needs to access the 'writeMatrix' method of Nuimo object

module.exports = function(RED) {

  function nuimoSetMatrixNode(config) {
    RED.nodes.createNode(this,config);
//import the config node
    nuimo = RED.nodes.getNode(config.nuimoConfig);

    var appMatrixImage = config.appMatrixImage.split(',');

    var node = this;
    this.on('input', function(msg) {
      msg.instructions = { matrix: appMatrixImage, brightness: config.brightness, timeout: config.timeout, options: {onionSkinning: config.onionSkinning}};
      nuimo.writeMatrix(msg.instructions);
      node.send(msg);
    });
  }
  RED.nodes.registerType("nuimo-set-matrix",nuimoSetMatrixNode);
}
