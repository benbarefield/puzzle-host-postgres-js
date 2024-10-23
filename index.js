const sessionStarter = require('./src/sessionStarter');
const puzzleData = require("./src/puzzleData");
const puzzleAnswerData = require('./src/puzzleAnswerData');
const testHarness = require('./src/testHarness');

module.exports = {
  ...sessionStarter,
  ...puzzleData,
  ...puzzleAnswerData,
  ...testHarness,
};
