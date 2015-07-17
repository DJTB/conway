'use strict';

function $(selector, container) {
    return (container || document).querySelector(selector);
}
function shallowClone(arr) {
    return arr.slice().map(function (row) {
        return row.slice();
    });
}

(function () {
    var _ = self.Life = function (seed) {
        this.seed = seed;
        this.height = seed.length;
        this.width = seed[0].length;

        this.prevBoard = [];
        this.board = shallowClone(seed);
    };

    _.prototype = {
        next: function next() {
            this.prevBoard = shallowClone(this.board);
            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var neighbours = this.aliveNeighbours(this.prevBoard, x, y);
                    var alive = !!this.board[y][x];

                    if (alive) {
                        if (neighbours < 2 || neighbours > 3) this.board[y][x] = 0;
                    } else {
                        if (neighbours == 3) this.board[y][x] = 1;
                    }
                }
            }
        },

        aliveNeighbours: function aliveNeighbours(arr, x, y) {
            var prevRow = arr[y - 1] || [];
            var nextRow = arr[y + 1] || [];

            return [prevRow[x - 1], prevRow[x], prevRow[x + 1], arr[y][x - 1], arr[y][x + 1], nextRow[x - 1], nextRow[x], nextRow[x + 1]
            // +!! will convert undefined to 0
            ].reduce(function (s, v) {
                return s + +!!v;
            }, 0);
        },

        toString: function toString() {
            return this.board.map(function (row) {
                return row.join(' ');
            }).join('\n');
        }
    };
})();

(function () {
    var _ = self.lifeView = function () {
        var size = arguments.length <= 0 || arguments[0] === undefined ? 12 : arguments[0];
        var speed = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];
        var table = arguments.length <= 2 || arguments[2] === undefined ? $('.grid') : arguments[2];

        this.init(size, speed, table);
    };

    _.prototype = Object.defineProperties({
        createGrid: function createGrid() {
            var _this = this;

            var fragment = document.createDocumentFragment();
            this.grid.innerHTML = '';
            this.checkboxes = [];

            for (var y = 0; y < this.size; y++) {
                var row = document.createElement('tr');
                this.checkboxes[y] = [];

                for (var x = 0; x < this.size; x++) {
                    var cell = document.createElement('td');
                    var checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    this.checkboxes[y][x] = checkbox;
                    checkbox.coords = [y, x];

                    cell.appendChild(checkbox);
                    row.appendChild(cell);
                }
                fragment.appendChild(row);
            }

            this.grid.addEventListener('change', function (e) {
                if (e.target.nodeName == 'INPUT') _this.started = false;
            });

            this.grid.addEventListener('keyup', function (e) {
                var checkbox = e.target;
                if (checkbox.nodeName == 'INPUT') {
                    var boxes = _this.checkboxes;
                    var y = checkbox.coords[0];
                    var x = checkbox.coords[1];

                    switch (e.keyCode) {
                        case 37:
                            if (x > 0) boxes[y][x - 1].focus();
                            break;
                        case 38:
                            if (y > 0) boxes[y - 1][x].focus();
                            break;
                        case 39:
                            if (x < _this.size - 1) boxes[y][x + 1].focus();
                            break;
                        case 40:
                            if (y < _this.size - 1) boxes[y + 1][x].focus();
                            break;
                    }
                }
            });

            this.grid.appendChild(fragment);
        },

        play: function play() {
            this.game = new Life(this.boardArray);
            this.started = true;
        },

        next: function next() {
            var _this2 = this;

            if (!this.started || this.game) this.play();

            this.game.next();

            var board = this.game.board;

            for (var y = 0; y < this.size; y++) {
                for (var x = 0; x < this.size; x++) {
                    this.checkboxes[y][x].checked = !!board[y][x];
                }
            }

            if (this.autoplay) {
                this.timer = setTimeout(function () {
                    return _this2.next();
                }, this.speed);
            }
        },

        init: function init() {
            var size = arguments.length <= 0 || arguments[0] === undefined ? 12 : arguments[0];
            var speed = arguments.length <= 1 || arguments[1] === undefined ? 50 : arguments[1];
            var table = arguments.length <= 2 || arguments[2] === undefined ? $('.grid') : arguments[2];

            this.size = size;
            this.speed = speed;
            this.grid = table;
            this.started = false;
            this.autoplay = false;

            this.createGrid();
        }

    }, {
        boardArray: {
            get: function get() {
                return this.checkboxes.map(function (row) {
                    return row.map(function (checkbox) {
                        return +checkbox.checked;
                    });
                });
            },
            configurable: true,
            enumerable: true
        }
    });
})();

var lifeView = new lifeView();

(function () {

    var buttons = {
        next: $('button.next'),
        autoplay: $('#autoplay'),
        newGame: $('button.newGame')
    };

    buttons.next.addEventListener('click', function () {
        lifeView.next();
    });

    buttons.autoplay.addEventListener('change', function () {
        buttons.next.disabled = this.checked;
        lifeView.autoplay = this.checked;
        this.checked ? lifeView.next() : clearTimeout(lifeView.timer);
    });

    buttons.newGame.addEventListener('click', function () {
        lifeView.init(+prompt('Grid size?') || 12);
    });
})();

//# sourceMappingURL=main.js.map