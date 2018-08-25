//Needs to 'hold' the bluetooth connection and expose it to the various 'normal' nodes

module.exports = function(RED) {
let Timeout = require('../Timeout');
  function nuimoConfigNode(n) {
      RED.nodes.createNode(this,n);
      var context = this.context().global;

      if (!context.get("activeApp")) {
        context.set("activeApp", "pending");
      }
      var activeApp = context.get("activeApp");

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
        device.on("release", (activeApp) => {
          Timeout.clear('extender');
          if (Date.now() - longPress < 800) {
            node.emit('press',activeApp)
          } else {
            node.emit('longPress')
          }
        })
        device.on("touch", (direction, activeApp) => {
          switch (direction) {
            case (Nuimo.Area.LEFT):
                console.log("Touched left"); break;
            case (Nuimo.Area.RIGHT):
                console.log("Touched right"); break;
            case (Nuimo.Area.TOP):
                console.log("Touched top"); break;
            case (Nuimo.Area.BOTTOM):
                console.log("Touched bottom"); break;
            case (Nuimo.Area.LONGLEFT):
                console.log("Long touched left"); break;
            case (Nuimo.Area.LONGRIGHT):
                console.log("Long touched right"); break;
            case (Nuimo.Area.LONGTOP):
                console.log("Long touched top"); break;
            case (Nuimo.Area.LONGBOTTOM):
                console.log("Long touched bottom"); break;
          }
        })

        device.on("rotate", (amount, activeApp) => {
          console.log(`Rotated by ${amount}`);
          node.emit("rotate", amount, activeApp);
        });

        device.connect();

      });

      nuimo.scan();

      node.on('close', function () {
        nuimo.stop();
        nuimo.removeAllListeners();
      });
  }
  RED.nodes.registerType("nuimo-config",nuimoConfigNode);
}
