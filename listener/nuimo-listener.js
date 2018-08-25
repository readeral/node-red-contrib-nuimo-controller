//Needs to access the events of Nuimo object

module.exports = function(RED) {
  var apps = {};
  function nuimoListenerNode(config) {
    RED.nodes.createNode(this,config);

    nuimo = RED.nodes.getNode(config.nuimoConfig);
    var node = this;
    var action = nuimo.action;

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
      node.send(msg);
    })
    nuimo.on("rotate", (amount, activeApp) => {
      console.log(activeApp);
      var msg = { payload:`I rotated ${amount}!`, degrees: amount }
      node.send(msg);
    })
  }
  RED.nodes.registerType("nuimo-listener",nuimoListenerNode);
}
