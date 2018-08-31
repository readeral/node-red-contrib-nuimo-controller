module.exports = function(RED) {

  function nuimoAppNode(config) {
    RED.nodes.createNode(this,config);

    //get matrix image and app name from editor values
    var appMatrixImage = config.appMatrixImage.replace(/\s/g,'').split(',');
    var appData = { name: config.name, image: appMatrixImage }

    //sends app name and matrix image, for output to interface node
    this.send(appData);

  }
  RED.nodes.registerType("nuimo-app",nuimoAppNode);
}
