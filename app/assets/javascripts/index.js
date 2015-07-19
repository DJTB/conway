function $(selector, container) {
  return (container || document).querySelector(selector);
}

function shallowClone(arr) {
  return arr.slice().map(row => row.slice());
}

class Game {
  constructor(seed) {
    this.height = seed.length;
    this.width = seed[0].length;
    this.prevBoard = [];
    this.board = shallowClone(seed);
  }

  next() {
    this.prevBoard = shallowClone(this.board);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let neighbours = Game.aliveNeighbours(this.prevBoard, x, y);
        let alive = !!this.board[y][x];

        if (alive) {
          if (neighbours < 2 || neighbours > 3) this.board[y][x] = 0;
        } else {
          if (neighbours == 3) this.board[y][x] = 1;
        }
      }
    }
  }

  static aliveNeighbours(arr, x, y) {
    let prevRow = arr[y - 1] || [];
    let nextRow = arr[y + 1] || [];

    return [
      prevRow[x - 1], prevRow[x], prevRow[x + 1],
      arr[y][x - 1], arr[y][x + 1],
      nextRow[x - 1], nextRow[x], nextRow[x + 1]

      // +!! will convert undefined to 0
    ].reduce((s, v) => {return s + +!!v}, 0);
  }

  toString() {
    return this.board.map((row) => row.join(' ')).join('\n')
  }
}

class GameView {
  constructor(size = 12, speed = 750, table = $('.grid')) {
    this.size = size;
    this.speed = speed;
    this.grid = table;
    this.init();
  }

  init() {
    this.timer = null;
    this.started = false;
    this.autoplay = false;
    this.checkboxes = [];
    this.createGrid();
  }

  reset(size) {
    this.size = size;
    this.init();
  }

  play() {
    this.game = new Game(this.boardArray);
    this.started = true;

    // still want this to occur AFTER first move, otherwise entire board flashes on initial change;
    $('.grid').classList.add('is-playing');
  }

  stop() {
    clearTimeout(this.timer);
    $('.grid').classList.remove('is-playing');
  }

  createGrid() {
    let fragment = document.createDocumentFragment();
    this.grid.innerHTML = '';

    for (let y = 0, ys = this.size; y < ys; y++) {
      let row = document.createElement('tr');
      this.checkboxes[y] = [];

      for (let x = 0, xs = this.size; x < xs; x++) {
        let cell = document.createElement('td');
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        this.checkboxes[y][x] = checkbox;
        checkbox.coords = [y, x];

        cell.appendChild(checkbox);
        row.appendChild(cell);
      }

      fragment.appendChild(row);
    }

    this.grid.addEventListener('change', (e) => {
      if (e.target.nodeName == 'INPUT') this.started = false;
    });

    this.grid.addEventListener('keyup', (e) => {
      let checkbox = e.target;
      if (checkbox.nodeName == 'INPUT') {
        let [boxes, y, x] = [this.checkboxes, checkbox.coords[0], checkbox.coords[1]];
        switch (e.keyCode) {
          case 37:
            if (x > 0) boxes[y][x - 1].focus();
            break;
          case 38:
            if (y > 0) boxes[y - 1][x].focus();
            break;
          case 39:
            if (x < this.size - 1) boxes[y][x + 1].focus();
            break;
          case 40:
            if (y < this.size - 1) boxes[y + 1][x].focus();
            break;
        }
      }
    });

    this.grid.appendChild(fragment);
  }

  get boardArray() {
    return this.checkboxes.map(row => row.map(checkbox => +checkbox.checked));
  }

  next() {
    if (!this.started || this.game) this.play();

    this.game.next();

    let board = this.game.board;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.checkboxes[y][x].checked = !!board[y][x];
      }
    }

    if (this.autoplay) {
      this.timer = setTimeout(() => this.next(), this.speed)
    }
  }
}

class GameController {

  constructor(gameView) {
    this.gameView = gameView;
  }

  listen() {
    let buttons = {
      next: $('button.next'),
      autoplay: $('#autoplay'),
      newGame: $('button.newGame')
    };

    buttons.next.addEventListener('click', () => {
      this.gameView.next();
    });

    buttons.autoplay.addEventListener('change', () => {
      let ap = buttons.autoplay;
      buttons.next.disabled = ap.checked;
      this.gameView.autoplay = ap.checked;

      ap.checked ? this.gameView.next() : this.gameView.stop();
    });

    buttons.newGame.addEventListener('click', () => {
      this.gameView.reset(+prompt('Grid size?') || 12);
    });
  }
}

let gameView = new GameView();
gameView.init();
let gameController = new GameController(gameView);
gameController.listen();