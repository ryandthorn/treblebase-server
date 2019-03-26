'use strict';
const {router} = require('./router');
const {localStrategy, jwtStrategy} = require('./strategies.js');

module.exports = {router, localStrategy, jwtStrategy};