//Needs to access the 'writeMatrix' method of Nuimo object

module.exports = function(RED) {

  function nuimoSetMatrixNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;
//import the config node
    nuimo = RED.nodes.getNode(config.nuimoConfig);

    var appMatrixImage = config.appMatrixImage.replace(/\s/g,'').split(',');

    const numbers = [
      [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
      [[0,0,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
      [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
      [[1,1,1],[0,0,1],[0,1,1],[0,0,1],[1,1,1]],
      [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
      [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
      [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
      [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
      [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
      [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
      [0,0,0,0,0,0,0,0,0]
    ];

    function buildNumberArray(num) {
      if (num > -1 && num <= 99) {
        if (num < 10) {
          var first = numbers[0];
          var second = numbers[num];
        } else {
          var first = numbers[Number(num.toString().split('')[0])];
          var second = numbers[Number(num.toString().split('')[1])];
        }
        var output = Array(27).fill(0);
        for (var step = 0; step < 5; step++) {
          output = output.concat(0, first[step], 0, second[step], 0);
        }
        return output.concat(numbers[10]);
      }
      return [0,0,0,0,0,0,0,0,0,
              0,0,0,0,0,0,0,0,0,
              0,0,0,0,0,0,0,0,0,
              0,1,1,1,0,1,1,1,0,
              0,1,0,1,0,1,0,1,0,
              0,1,1,1,0,1,1,1,0,
              0,0,0,1,0,0,0,1,0,
              0,1,1,1,0,1,1,1,0,
              0,0,0,0,0,0,0,0,0];
    };

    function scale(scale) {
      var height = scale[0], width = scale[1];
      const line = (width) => ({
            1: [0,0,0,0,1,0,0,0,0],
            3: [0,0,0,1,1,1,0,0,0],
            5: [0,0,1,1,1,1,1,0,0],
            7: [0,1,1,1,1,1,1,1,0],
            9: [1,1,1,1,1,1,1,1,1],
            0: [0,0,0,0,0,0,0,0,0]
          })[width];
      var output = [];
      for (var step = 9; step > 0; step--) {
        output = (step > height) ? output.concat(line(0)) : output.concat(line(width));
      }
      return output;
    }

    this.on('input', function(msg) {
      if (msg.int || msg.payload.int) {
        appMatrixImage = buildNumberArray(msg.int);
      }
      if (msg.scale || msg.payload.scale) {
        var params = msg.scale || msg.payload.scale;
        appMatrixImage = scale(params);
      }
      var brightness = msg.brightness || msg.payload.brightness || config.brightness;
      var timeout = msg.timeout || msg.payload.timeout || config.timeout;
      var onionSkinning = msg.onionSkinning || msg.payload.onionSkinning || config.onionSkinning;
      msg.instructions = { matrix: appMatrixImage, brightness: brightness, timeout: timeout, options: {onionSkinning: onionSkinning}};
      node.send(msg);
      nuimo.writeMatrix(msg.instructions);
    });
  }
  RED.nodes.registerType("nuimo-set-matrix",nuimoSetMatrixNode);
}
