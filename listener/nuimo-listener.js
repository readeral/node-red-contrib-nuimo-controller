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
      if (appChoice == activeApp.name) {
        var msg = {
          topic: "press",
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("rotate", (amount, activeApp) => {
      if (appChoice == activeApp.name) {
        var msg = {
          topic: "rotate",
          amount: amount,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("touch", (region, activeApp) => {
      if (appChoice == activeApp.name) {
        var msg = {
          topic: "touch",
          region: region,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("swipe", (direction, activeApp) => {
      if (appChoice == activeApp.name) {
        var msg = {
          topic: "swipe",
          direction: direction,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("fly", (direction, activeApp) => {
      if (appChoice == activeApp.name) {
        var msg = {
          topic: "fly",
          direction: direction,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("distance", (distance, activeApp) => {
      if (appChoice == activeApp.name) {
        var msg = {
          topic: "distance",
          direction: distance,
          activeApp: activeApp
        };
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
