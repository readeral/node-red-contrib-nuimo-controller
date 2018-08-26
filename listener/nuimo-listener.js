//Needs to access the events of Nuimo object

module.exports = function(RED) {
  var apps = {};
  function nuimoListenerNode(config) {
    RED.nodes.createNode(this,config);
    nuimo = RED.nodes.getNode(config.nuimoConfig);
    var node = this;
    var appChoice = config.appChoice;
    //Nuimo actions for being output
    nuimo.on("press", (activeApp) => {
      //N.b. the 'press' action is actually emitted by the Nuimo's 'release'
      //event, in order to use the 'press' event to create and reserve
      //a 'longPress' action for app switching. There should be no notable
      //impact on the end user, but if you find one, please raise a github issue
      console.log(appChoice + " - variable");
      console.log(activeApp.name);
      if (appChoice == activeApp.name) {
        var msg = { payload:"I got pressed!" }
        node.send(msg);
      }
    })
    nuimo.on("rotate", (amount, activeApp) => {
      console.log(appChoice);
      if (appChoice == activeApp.name) {
        var msg = { payload:`I rotated ${amount}!`, degrees: amount }
        node.send(msg);
      }
    })
    nuimo.on("touch", (region, activeApp) => {
      console.log(appChoice);
      if (appChoice == activeApp.name) {
        var msg = {};
        msg.topic = "touch";
        msg.region = region;
        msg.activeApp = activeApp;
        node.send(msg);
      }
    })
    this.on('close', function() {
      nuimo.removeAllListeners();
      appChoice = null;
    });
  }
  RED.nodes.registerType("nuimo-listener",nuimoListenerNode);
}
