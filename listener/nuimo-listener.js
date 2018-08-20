//Needs to access the events of Nuimo object

module.exports = function(RED) {
  function nuimoListenerNode(config) {
    RED.nodes.createNode(this,config);

    nuimo = RED.nodes.getNode(config.nuimoConfig);
    var node = this;
    nuimo.on("connected", (batteryLevel) => {
      node.status({fill:"green",shape:"dot",text:`connected - ${batteryLevel}`});
    })
    nuimo.on("batteryLevelChange", (batteryLevel) => {
      node.status({fill:"green",shape:"dot",text:`connected - ${batteryLevel}`});
    })
    nuimo.on("disconnected", () => {
      node.status({fill:"red",shape:"ring",text:"disconnected"});
    })
    nuimo.on("press", () => {
      var msg = { payload:"I got pressed!" }
      nuimo.testFunction();
      node.send(msg);
    })

  }
  RED.nodes.registerType("nuimo-listener",nuimoListenerNode);
}
