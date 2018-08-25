module.exports = function(RED) {
  var apps = [];
  function nuimoInterfaceNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    var tempOption = 0;
    var selectionMode;

    //import the config node
    nuimo = RED.nodes.getNode(config.nuimoConfig);

    //get context objects
    var flowContext = this.context().flow;
    var globalContext = this.context().global;

    //handle input - if a normal message, it's passed through,
    //else it receives app definitions and adds them to apps array
    this.on("input", function(msg) {
      if (msg.hasOwnProperty("image")) {
        //Pushes new apps to apps array. Apps that duplicate an existign name are ignored
        if (!apps.map((item) => item.name).includes(msg.name)) {
          apps.push(msg);
        }
      }
      node.send(msg);
    });
    //adds updated apps list to flow context
    flowContext.set("apps", apps);
    //if global context doesn't include the activeApp variable,
    //the variable is created and set to the first app in app array
    //the tempOption (for app selection mode) is either set to
    //first app in array or, if activeApp exists, to activeApp
    if (!globalContext.get("activeApp")) {
      globalContext.set("activeApp", apps[0]);
    } else {
      tempOption = apps.indexOf(apps.filter(item => item.name == globalContext.get("activeApp").name));
    }


    //When the nuimo button is long-pressed (over 2.5 seconds)
    //the nuimo is placed into 'app selection' mode and the
    //active app is replaced with pending to ensure all nuimo events
    //are ignored until a new app is selected
    nuimo.on("longPress", () => {
      tempOption = apps.indexOf(apps.filter(item => item.name == globalContext.get("activeApp").name)[0]);
      console.log(tempOption);
      globalContext.set("activeApp", "pending");

      appSelectionMode(tempOption);
      //when a normal press is registered while in 'app selection' mode,
      //the displayed app is stored in the activeApp variable.
    });
    nuimo.on("press", (activeApp) => {
      console.log(activeApp);
      if (selectionMode) {
        clearInterval(flash);
        globalContext.set("activeApp", apps[tempOption]);
        var thing = apps[tempOption].image
        var instructions = { matrix: thing, brightness: 255, timeout: 2000, onionSkinning: true};
        nuimo.writeMatrix(instructions);
      }
    });
    function appSelectionMode(opt) {
      console.log(opt);
      console.log(apps[opt]);
      selectionMode = true;
      var thing = apps[opt].image
      var instructions = { matrix: thing, brightness: 255, timeout: 500, onionSkinning: true};
      nuimo.writeMatrix(instructions);
      flash = setInterval( opt => {
        nuimo.writeMatrix(instructions);
        return apps[opt];
      }, 2000);
    }
    //cAcc for clockwise accumulator, acAcc for anti-clockwise
    var cAcc = 0;
    var acAcc = 0;
    nuimo.on("rotate", (amount) => {
      if (selectionMode) {
        if (amount > 0) {
          acAcc = 0;
          if (amount > 50) {
            cAcc += 1;
            if (cAcc >= 5) {
              cAcc = 0;
              nextApp()
              console.log("nextApp!")
            }
          }
        } else {
          cAcc = 0;
          if (amount < -50) {
            acAcc += 1;
            if (acAcc >= 5) {
              acAcc = 0;
              console.log("prevApp!")
            }
              //nextApp();
          }
          //prevApp();
        }
      }
    });
    function nextApp() {
      clearInterval(flash);
      if (tempOption == (apps.length - 1)) {
        tempOption = 0;
      } else {
        tempOption += 1;
      }
      appSelectionMode(tempOption);
    }
    function prevApp() {
      clearInterval(flash);
      if (tempOption == 0) {
        tempOption = (apps.length - 1);
      } else {
        tempOption -= 1;
      }
      appSelectionMode(tempOption);
    }
  }
  RED.nodes.registerType("nuimo-interface",nuimoInterfaceNode);
  RED.httpAdmin.get("/applist", RED.auth.needsPermission("nuimo-interface.read"), function(req,res) {
    res.json(apps);
  });
};
