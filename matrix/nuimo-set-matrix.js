//Needs to access the 'writeMatrix' method of Nuimo object

module.exports = function(RED) {

  function nuimoSetMatrixNode(config) {
    RED.nodes.createNode(this,config);
//import the config node
    nuimo = RED.nodes.getNode(config.nuimoConfig);

    var appMatrixImage = config.appMatrixImage.replace(/\s/g,'').split(',');

    var numbers = [
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
      if (num > 0 && num <= 99) {
        if (num < 10) {
          var first = numbers[0];
          var second = numbers[num];
        } else {
          var first = numbers[Number(num.toString().split('')[0])]
          var second = numbers[Number(num.toString().split('')[1])]
        }
        var output = [];
        output.push(numbers[10], numbers[10], numbers[10]);
        var step;
        for (step = 0; step < 5; step++) {
          // Runs 5 times, with values of step 0 through 4.
          output.push(0);
          output.push(first[step]);
          output.push(0);
          output.push(second[step]);
          output.push(0);
        }
        output.push(numbers[10]);
        var merged = output.join().split(',')
        return merged;
      } else if (num == 0) {
        return [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0];
      } else {
        return [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,0,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,1,1,0,0,0,0,1,0,0,0,1,0,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0];
      }
    };

    var node = this;
    this.on('input', function(msg) {
      if (msg.int) {
        appMatrixImage = buildNumberArray(msg.int);
      }
      msg.instructions = { matrix: appMatrixImage, brightness: config.brightness, timeout: config.timeout, options: {onionSkinning: config.onionSkinning}};
      nuimo.writeMatrix(msg.instructions);
      node.send(msg);
    });
  }
  RED.nodes.registerType("nuimo-set-matrix",nuimoSetMatrixNode);
}
