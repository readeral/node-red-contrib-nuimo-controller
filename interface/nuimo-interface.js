module.exports = function(RED) {
  var apps = [];
  function nuimoInterfaceNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    var tempOption = 0;
    var selectionMode;


    //
    // HELPER FUNCTIONS AND DEFINITIONS
    //

    //import the config node
    nuimo = RED.nodes.getNode(config.nuimoConfig);

    //get context objects
    var flowContext = this.context().flow;
    var globalContext = this.context().global;

    globalContext.set("sensitivity", [config.nuimoRotation, config.selectTimeout])

    function setActiveApp(value, callback) {
      globalContext.set("activeApp", value)
      if (callback) {
        callback()
      }
      nuimo.getActive()
    }


    //
    // APP REGISTRATION
    //

    //The following code 'registers' app nodes outputs into an array called
    //'apps'. This is the means by which the Nuimo can control multiple devices

    //The node handles input as expected - if a normal message, it's passed
    //through, otherwise it receives app definitions and adds them to apps array
    this.on("input", function(msg) {
      if (msg.hasOwnProperty("image")) {
        //Pushes new apps to apps array. Apps that duplicate an existign name are ignored
        if (!apps.map((item) => item.name).includes(msg.name)) {
          apps.push(msg);
        }
      }
      node.send(msg);
    });
    //The registered apps are then added to the flow context, ready to be used
    //in the config options of Nuimo listener nodes
    flowContext.set("apps", apps);
    //if global context doesn't include the activeApp variable,
    //the variable is created and set to the first app in app array
    if (!globalContext.get("activeApp")) {
      setActiveApp(apps[0]);
    }

    //
    // NODE STATUS
    //

    //Nuimo connection and battery level output as a status icon

    //When the nuimo is connected or the battery level changes
    //it calls batteryStatus() to update the status with a colour and %
    //representation of the battery status
    nuimo.on("connected", (batteryLevel) => {
      batteryStatus(batteryLevel);
    })
    nuimo.on("batteryLevelChange", (batteryLevel) => {
      batteryStatus(batteryLevel);
    })
    nuimo.on("disconnected", () => {
      node.status({fill:"grey",shape:"ring",text:"disconnected"});
    })
    function batteryStatus(batteryLevel) {
      if (batteryLevel <= 15) {
        node.status({fill:"red",shape:"dot",text:`connected - ${batteryLevel}%`});
      } else if (batteryLevel <= 30) {
        node.status({fill:"yellow",shape:"dot",text:`connected - ${batteryLevel}%`});
      } else {
        node.status({fill:"green",shape:"dot",text:`connected - ${batteryLevel}%`});
      }
    }

//
// SELECTION MODE CODE
//

    //When the nuimo button is long-pressed (timing defined by interface config)
    //the nuimo is placed into 'app selection mode' and the global activeApp
    //variable is replaced with 'pending' to ensure all nuimo events are ignored
    //until a new app is selected
    //tempOption gets defined (as an integer) to tell the nuimo what to display
    nuimo.on("longPress", () => {
      var initial = apps.filter(item => item.name == globalContext.get("activeApp").name)[0];
      tempOption = (apps.indexOf(initial) < 0 ? 0 : apps.indexOf(initial));
      setActiveApp("pending");
      appSelectionMode(tempOption);
    });
    function appSelectionMode(opt) {
      selectionMode = true;
      var instructions = { matrix: apps[opt].image, brightness: 255, timeout: 500, onionSkinning: true};
      nuimo.writeMatrix(instructions);
      flash = setInterval( opt => {
        nuimo.writeMatrix(instructions);
        return apps[opt];
      }, 2000);
    }
    //cAcc for clockwise accumulator, acAcc for anti-clockwise
    var cAcc = 0;
    var acAcc = 0;
    //Once the accumulator reaches the threshold, nextApp/prevApp are called to:
    // - clear the appSelectionMode interval
    // - reset the relevant accumulator
    // - update the tempOption variable
    // - calling appSelectionMode with the new tempOption
    nuimo.on("rotate", (amount) => {
      if (selectionMode) {
        if (amount > 0) {
          acAcc = 0;
          if (amount > 50) {
            cAcc += 1;
            if (cAcc >= 5) nextApp();
          }
        } else {
          cAcc = 0;
          if (amount < -50) {
            acAcc += 1;
            if (acAcc >= 5) prevApp();
          }
        }
      }
    });
    function nextApp() {
      clearInterval(flash);
      cAcc = 0;
      tempOption == (apps.length - 1) ? tempOption = 0 : tempOption += 1;
      appSelectionMode(tempOption);
    }
    function prevApp() {
      clearInterval(flash);
      acAcc = 0;
      tempOption == 0 ? tempOption = (apps.length - 1) : tempOption -= 1;
      appSelectionMode(tempOption);
    }
    //when a normal press is registered while in 'app selection' mode,
    //the displayed app is stored in the activeApp variable
    nuimo.on("press", (activeApp) => {
      if (activeApp == "pending" && selectionMode) {
        clearInterval(flash);
        selectionMode = false;
        setActiveApp(apps[tempOption]);
        nuimo.writeMatrix({ matrix: apps[tempOption].image, brightness: 255, timeout: 2000, onionSkinning: true});
      }
    });
    this.on('close', function() {
      if (config.reinitialise) {
        console.log("Reinitialising apps.");
        apps = [];
        flowContext.set("apps", apps);
        config.reinitialise = false;
      }
    });
  }
  RED.nodes.registerType("nuimo-interface",nuimoInterfaceNode);
  RED.httpAdmin.get("/applist", RED.auth.needsPermission("nuimo-interface.read"), function(req,res) {
    res.json(apps);
  });
};
