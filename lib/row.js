var Scuttlebutt = require('scuttlebutt');
var util        = require('util');

var Cell = require('./cell');
var id   = require('./id');

var Row = (function() {
	function Row(db, index) {
		this.index = index;

		this.db = db;

		// column name => cell
		this.cells = {};

		Scuttlebutt.call(this, id);
	}
	util.inherits(Row, Scuttlebutt);

	return (function() {
		(function() {
			this.add = function add(cell) {
				return this.cells[cell.name] = cell;
			};

			this.column = function column(name) {
				var self = this;

				var cell = this.cells[name];

				if(!cell) {
					cell = new Cell(this.db, this, this.db.column(name));

					cell.on('_update', function(update) {
						self._update(update);
					});
				}

				return cell;
			};

			this.set = function set(key, val) {
				var self = this;

				if(arguments.length == 1) {
					var set = key;
					Object.keys(set).forEach(function(key) {
						self.set(key, set[key]);
					});
				} else {
					this.column(key).set(val);
				}

				return this;
			};

			this.get = function get(key) {
				var self = this;

				if(arguments.length == 0) {
					var state = {};

					Object.keys(this.cells).forEach(function(key) {
						state[key] = self.get(key);
					});

					return state;
				} else {
					return this.column(key).get();
				}
			};

			this.applyUpdate = function applyUpdate(update) {
				if(typeof(update[0]) != 'object' || update[0] == null)
					return false;

				if(typeof(update[0].column) != 'string')
					return false;

				if(typeof(update[0].row) == 'number' && update[0].row != this.index)
					return false;

				this.column(update[0].column)._update(update);

				this.emit('update', update[0].column, update[0].value);

				return true;
			};

			this.history = function history(sources) {
				var self = this;

				return Object.keys(this.sources).map(function(id) {
					return self.sources[id];
				}).filter(function(update) {
					return Scuttlebutt.filter(update, sources);
				});
			};
		}).call(this.prototype);

		return this;
	}).call(Row);
})();

exports = module.exports = Row;