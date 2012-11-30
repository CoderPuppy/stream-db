var DB = require('../');

var args = parseArgs();

var db1  = new DB('people'); // .on('_update', console.log.bind(console, 'db1'));
var s1   = db1.createStream(); // .on('data', console.log.bind(console, 's1'));
var row1 = db1.add({
	firstName: 'Drew',
	lastName:  'Young'
}); // .on('_update', console.log.bind(console, 'row1'));

var db2  = new DB('people') // .on('_update', console.log.bind(console, 'db2'));
var s2   = db2.createStream(); // .on('data', console.log.bind(console, 's2'));
var row2 = db2.row(0, true); // .on('_update', console.log.bind(console, 'row2'));

s1.pipe(s2).pipe(s1);

exports.db1  = db1;
exports.row1 = row1;
exports.s1   = s1;

exports.db2  = db2;
exports.row2 = row2;
exports.s2   = s2;

// runArgs(args);

function parseArgs() {
	var port = parseInt(process.argv[2]);
	var ports = process.argv.slice(3).map(parseInt).filter(Boolean);

	if(!port) {
		console.warn('No port specified. (test [listenPort] [replicatePorts+])' +
		             ' This is only usefull for stability tests (debugging errors) and running in an interactive shell.');

		return false;
	}

	return { port: port, ports: ports };
}