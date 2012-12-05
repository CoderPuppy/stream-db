var Scuttlebutt = require('scuttlebutt');
var util        = require('util');

var Cell = require('./cell');
var id   = require('./id');

var Row = (function() {
	function Row(db, index) {
		var self = this;

		this.index = index;

		this.db = db;

		this.cells = [];
		
		this.updates = {};

		Object.keys(db.columns).forEach(self.column.bind(this));
		db.on('column', function(column) {
			self.column(column.name);
		});

		Scuttlebutt.call(this, id);
	}
	util.inherits(Row, Scuttlebutt);

	return (function() {
		(function() {
			this.add = function add(cell) {
				var self = this;

				cell.on('_update', function(update) {
					self._update(update);
				});

				return this.cells[cell.column.index] = cell;
			};

			this.column = function column(name) {
				var column = this.db.column(name);
				var cell   = this.cells[column.index];

				if(!cell)
					cell = new Cell(this.db, this, column);

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
					return this.cells.reduce(function(state, cell) {
						state[cell.column.name] = cell.get();

						return cell;
					}, {});
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

				this.updates[update[2]] = update;

				this.column(update[0].column)._update(update);

				this.emit('update', update[0].column, update[0].value);

				return true;
			};

			this.history = function history(sources) {
				var self = this;

				return Object.keys(this.updates).map(function(id) {
					return self.updates[id];
				}).filter(function(update) {
					return Scuttlebutt.filter(update, sources);
				});
			};
		}).call(this.prototype);

		return this;
	}).call(Row);
})();

exports = module.exports = Row;