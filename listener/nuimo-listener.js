//Needs to access the events of Nuimo object

module.exports = function(RED) {
  var apps = {};
  function nuimoListenerNode(config) {
    RED.nodes.createNode(this,config);
    nuimo = RED.nodes.getNode(config.nuimoConfig);
    var node = this;
    var appChoice = config.appChoice;
    var outputStyle= config.outputStyle

    function msg(topic, activeApp, data) {
      this.topic = topic;
      this.activeApp = activeApp;
      this.data = data;
    }
    function payload(topic, activeApp, dataName, dataValue) {
      var msg = {};
      if (outputStyle == "payload") {
        if (dataName && dataValue) {
          msg = {
            "payload": {
              "topic": topic,
              "activeApp": activeApp,
              [dataName]: dataValue
            }
          }
        } else {
          msg = {
            "payload": {
              "topic": topic,
              "activeApp": activeApp
            }
          }
        }
      } else {
        msg.topic = topic;
        msg.activeApp = activeApp;
        (dataName && dataValue) ? msg[dataName] = dataValue : '';
      }
      return msg;
    }

    //Nuimo actions for being output
    //The node will only pass on the action if the app chosen in the config interface
    //matches the currently active app. There is an 'all' option in the config to pass
    //on all actions from the nuimo from a single node.
    nuimo.on("press", (activeApp) => {
      //N.b. the 'press' action is actually emitted by the Nuimo's 'release'
      //event, in order to use the 'press' event to create and reserve
      //a 'longPress' action for app switching. There should be no notable
      //impact on the end user, but if you find one, please raise a github issue
      if (appChoice == activeApp.name || appChoice == "all") {
        node.send(payload("press", activeApp));
      }
    })
    nuimo.on("rotate", (amount, activeApp) => {
      if (appChoice == activeApp.name || appChoice == "all") {
        var msg = {
          topic: "rotate",
          amount: amount,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("touch", (region, activeApp) => {
      if (appChoice == activeApp.name || appChoice == "all") {
        var msg = {
          topic: "touch",
          region: region,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("swipe", (direction, activeApp) => {
      if (appChoice == activeApp.name || appChoice == "all") {
        var msg = {
          topic: "swipe",
          direction: direction,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("fly", (direction, activeApp) => {
      if (appChoice == activeApp.name || appChoice == "all") {
        var msg = {
          topic: "fly",
          direction: direction,
          activeApp: activeApp
        };
        node.send(msg);
      }
    })
    nuimo.on("distance", (distance, activeApp) => {
      if (appChoice == activeApp.name || appChoice == "all") {
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
