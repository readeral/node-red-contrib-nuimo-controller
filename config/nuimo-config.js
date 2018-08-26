//Needs to 'hold' the bluetooth connection and expose it to the various 'normal' nodes

module.exports = function(RED) {
let Timeout = require('../Timeout');
  function nuimoConfigNode(n) {
      RED.nodes.createNode(this,n);
      var globalContext = this.context().global;

      if (!globalContext.get("activeApp")) {
        globalContext.set("activeApp", "pending");
      }
      var activeApp = globalContext.get("activeApp");
      var sensitivity = globalContext.get("sensitivity") || [70, 800];

      let Nuimo = require('nuimojs'),
      nuimo = new Nuimo();

      var node = this;

      var longPress;

      nuimo.on("discover", (device) => {
        node.writeMatrix = (instructions) => {
          device.setLEDMatrix(instructions.matrix, instructions.brightness, instructions.timeout, instructions.options);
        }
        device.on("connect", () => {
          node.warn("Nuimo connected");
          node.emit('connected',device.batteryLevel);
        });
        device.on("disconnect", () => {
          node.warn("Nuimo disconnected");
          node.emit('disconnected','');
        });
        device.on("batteryLevelChange", (level) => {
          node.emit('batteryLevelChange', level);
        });
        device.on("press", () => {
          longPress = Date.now();
          Timeout.set('extender', () => {
            device.setLEDMatrix([0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 256, 1000, {onionSkinning: true});
          },400);
        });
        device.on("release", () => {
          activeApp = globalContext.get("activeApp");
          console.log(activeApp);
          console.log(sensitivity[1]);
          Timeout.clear('extender');
          console.log(Date.now() - longPress);
          if (Date.now() - longPress < sensitivity[1]) {
            node.emit('press', activeApp)
          } else {
            node.emit('longPress')
          }
        })
        device.on("touch", (direction) => {
          activeApp = globalContext.get("activeApp");
          switch (direction) {
            case (Nuimo.Area.LEFT):
                node.emit("touch", "LEFT", activeApp);
                console.log("Touched left"); break;
            case (Nuimo.Area.RIGHT):
                node.emit("touch", "RIGHT", activeApp);
                console.log("Touched right"); break;
            case (Nuimo.Area.TOP):
                node.emit("touch", "TOP", activeApp);
                console.log("Touched top"); break;
            case (Nuimo.Area.BOTTOM):
                node.emit("touch", "BOTTOM", activeApp);
                console.log("Touched bottom"); break;
            case (Nuimo.Area.LONGLEFT):
                node.emit("touch", "LONGLEFT", activeApp);
                console.log("Long touched left"); break;
            case (Nuimo.Area.LONGRIGHT):
                node.emit("touch", "LONGRIGHT", activeApp);
                console.log("Long touched right"); break;
            case (Nuimo.Area.LONGTOP):
                node.emit("touch", "LONGTOP", activeApp);
                console.log("Long touched top"); break;
            case (Nuimo.Area.LONGBOTTOM):
                node.emit("touch", "LONGBOTTOM", activeApp);
                console.log("Long touched bottom"); break;
          }
        })

        device.on("rotate", (amount) => {
          activeApp = globalContext.get("activeApp");
          console.log(`Rotated by ${amount}`);
          node.emit("rotate", amount, activeApp, sensitivity[0]);
        });

        device.connect();

        node.on('close', function() {
          device.removeAllListeners();
        });
      });

      nuimo.scan();

      node.on('close', function () {
        nuimo.stop();
        nuimo.removeAllListeners();
        delete nuimo;
      });
  }
  RED.nodes.registerType("nuimo-config",nuimoConfigNode);
}
