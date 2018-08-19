//Needs to access the events of Nuimo object

module.exports = function(RED) {
  function nuimoListenerNode(config) {
    RED.nodes.createNode(this,config);

    this.nuimoConfig = RED.nodes.getNode(config.nuimoConfig);

  }
  RED.nodes.registerType("nuimo-listener",nuimoListenerNode);
}
