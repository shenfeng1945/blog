var multiplyModule = require('./multiply.js');

var square = function(num){
  return multiplyModule.multiply(num, num)
}

module.exports.square = square;