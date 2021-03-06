//Needs to 'hold' the bluetooth connection and expose it to the various 'normal' nodes

module.exports = function(RED) {
  let Timeout = require('../Timeout');
  let Nuimo = require('nuimojs');

  function nuimoConfigNode(n) {
    RED.nodes.createNode(this, n);
    var globalContext = this.context().global;
    var node = this;

    if (!globalContext.get("activeApp")) {
      globalContext.set("activeApp", "pending");
    }
    var activeApp = globalContext.get("activeApp");
    var sensitivity = globalContext.get("sensitivity") || [70, 800];

    var longPress;
    console.log(n.nuimoOption);
    nuimo = new Nuimo(n.nuimoOption);

    nuimo.on("discover", (device) => {
        console.log(device);
        node.writeMatrix = (instructions) => {
          device.setLEDMatrix(instructions.matrix, instructions.brightness, instructions.timeout, instructions.options);
        }
        node.getActive = () => {
          activeApp = globalContext.get("activeApp");
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
          },200);
        });
        device.on("release", () => {
          Timeout.clear('extender');
          if (Date.now() - longPress < sensitivity[1]) {
            longPress = null;
            node.emit('press', activeApp)
          } else {
            longPress = null;
            node.emit('longPress')
          }
        })
        device.on("touch", (direction) => {
          switch (direction) {
            case (Nuimo.Area.LEFT):
                node.emit("touch", "LEFT", activeApp); break;
            case (Nuimo.Area.RIGHT):
                node.emit("touch", "RIGHT", activeApp); break;
            case (Nuimo.Area.TOP):
                node.emit("touch", "TOP", activeApp); break;
            case (Nuimo.Area.BOTTOM):
                node.emit("touch", "BOTTOM", activeApp); break;
            case (Nuimo.Area.LONGLEFT):
                node.emit("touch", "LONGLEFT", activeApp); break;
            case (Nuimo.Area.LONGRIGHT):
                node.emit("touch", "LONGRIGHT", activeApp); break;
            case (Nuimo.Area.LONGTOP):
                node.emit("touch", "LONGTOP", activeApp); break;
            case (Nuimo.Area.LONGBOTTOM):
                node.emit("touch", "LONGBOTTOM", activeApp); break;
          }
        })
        device.on("swipe", (direction) => {
          switch (direction) {
            case (Nuimo.Swipe.LEFT):
                node.emit("swipe", "LEFT", activeApp); break;
            case (Nuimo.Swipe.RIGHT):
                node.emit("swipe", "RIGHT", activeApp); break;
            case (Nuimo.Swipe.UP):
                node.emit("swipe", "UP", activeApp); break;
            case (Nuimo.Swipe.DOWN):
                node.emit("swipe", "DOWN", activeApp); break;
          }
        })
        device.on("fly", (direction, speed) => {
          node.emit("fly", direction, activeApp);
        })
        device.on("distance", (distance) => {
          node.emit("distance", distance, activeApp);
        })

        device.on("rotate", (amount) => {
          node.emit("rotate", amount, activeApp, sensitivity[0]);
        });

        device.connect();

        node.on('close', function() {
          device.disconnect();
          device.removeAllListeners();
        });
      });

      nuimo.scan();

    node.on('close', function() {
      nuimo.stop();
      nuimo.removeAllListeners();
      delete nuimo;
    });
  }
  RED.nodes.registerType("nuimo-config", nuimoConfigNode);

  RED.httpAdmin.get('/nuimo/discover', RED.auth.needsPermission("nuimo-config.read"), function(req, res, next) {
    this.nuimo = new Nuimo();
    var devices = [];

    this.nuimo.scan()
    this.nuimo.on("discover", (device) => {
      if (!devices.includes(device._peripheral.uuid)) {
        devices.push(device._peripheral.uuid)
      }
    });
    Timeout.set(complete, 5000)
    function complete() {
      this.nuimo.stop()
      this.nuimo.removeAllListeners;
      delete this.nuimo;
      res.send(devices);
    }
  });
}
