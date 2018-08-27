//Needs to access the 'writeMatrix' method of Nuimo object

module.exports = function(RED) {

  function nuimoSetMatrixNode(config) {
    RED.nodes.createNode(this,config);
//import the config node
    nuimo = RED.nodes.getNode(config.nuimoConfig);

    var matrixArray;
    if (config.appMatrixImage.length === 0) {
        var appMatrixImage = new Array();
    } else {
        var appMatrixImage = config.appMatrixImage.split(',');
    }

    this.brightness = config.brightness;
    this.timeout = config.timeout;
    this.onionSkinning = config.onionSkinning;

    var node = this;
    this.on('input', function(msg) {
      msg.instructions = { matrix: appMatrixImage, brightness: node.brightness, timeout: node.timeout, options: {onionSkinning: node.onionSkinning}};
      nuimo.writeMatrix(msg.instructions);
      node.send(msg);
    });
  }
  RED.nodes.registerType("nuimo-set-matrix",nuimoSetMatrixNode);
}
