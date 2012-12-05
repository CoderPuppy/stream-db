var Scuttlebutt = require('scuttlebutt');
var util        = require('util');

var Cell = require('./cell');
var id   = require('./id');

var Column = (function() {
	function Column(db, name, index) {
		var self = this;

		this.name  = name;
		this.index = index;

		this.db = db;

		this.cells = [];
		
		this.updates = {};

		function makeRow(row) {
			self.row(row.index);
		}

		Object.keys(db.rows).forEach(makeRow);
		db.on('row', makeRow);

		Scuttlebutt.call(this, id);
	}
	util.inherits(Column, Scuttlebutt);

	return (function() {
		(function() {
			this.add = function add(cell) {
				var self = this;

				cell.on('_update', function(update) {
					self._update(update);
				});

				return this.cells[cell.index] = cell;
			};

			this.row = function row(index, create) {
				var cell = this.cells[index];

				if(!cell && create !== false)
					cell = new Cell(this.db, this.db.row(index), this);

				return cell;
			};

			this.set = function set(index, val) {
				var self = this;

				if(arguments.length == 1) {
					var set = index;
					set.forEach(function(value, index) {
						self.set(index, value);
					});
				} else {
					this.row(index).set(val);
				}

				return this;
			};

			this.get = function get(index) {
				var self = this;

				if(arguments.length == 0) {
					return this.cells.map(function(cell) {
						return cell.get();
					});
				} else {
					return this.row(index).get();
				}
			};

			this.applyUpdate = function applyUpdate(update) {
				if(typeof(update[0]) != 'object' || update[0] == null)
					return false;

				if(typeof(update[0].row) != 'number')
					return false;

				if(typeof(update[0].column) == 'string' && update[0].column != this.name)
					return false;

				this.updates[update[2]] = update;

				this.row(update[0].row, true)._update(update);

				this.emit('update', update[0].row, update[0].value);

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
	}).call(Column);
})();

exports = module.exports = Column;