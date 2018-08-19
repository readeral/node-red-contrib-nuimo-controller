//Needs to access the events of Nuimo object

module.exports = function(RED) {
  function nuimoListenerNode(config) {
    RED.nodes.createNode(this,config);
    this.config = config.nuimoConfig
    this.nuimoConfig = RED.nodes.getNode(this.config);
    var node = this;
  }
  RED.nodes.registerType("nuimo-listener",nuimoListenerNode);
}
