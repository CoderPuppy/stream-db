var repl = require('repl');

var test = require('./');

var r = repl.start({});

r.context.db1  = test.db1;
r.context.row1 = test.row1;
r.context.s1   = test.s1;

r.context.db2  = test.db2;
r.context.row2 = test.row2;
r.context.s2   = test.s2;

exports = module.exports = r;