import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { put, take, select } from 'redux-saga/effects';

import './index.css';

const initialGameState = {
  // meta
  game_on: false,
  screen_h: 480,
  screen_w: 640,

  // player 1 stuffs
  p1_x: 0,
  p1_y: 190, // (screen_h / 2) - (p1_h / 2)
  p1_h: 100,
  p1_w: 30,
  p1_c: 'blue',
  p1_input_up: false,
  p1_input_down: false,
  p1_score: 0,

  // player 2 stuffs
  // Optimize: use player1 stats
  p2_x: 610, // screen_w - p2_w
  p2_y: 190, // (screen_h / 2) - (p2_h / 2)
  p2_h: 100,
  p2_w: 30,
  p2_c: 'red',
  p2_input_up: false,
  p2_input_down: false,
  p2_score: 0,

  // pong
  pong_y: 232, // (screen_h / 2) - (pong_h / 2)
  pong_x: 312, // (screen_w / 2) - (pong_w / 2)
  pong_h: 15,
  pong_w: 15,
  pong_default_h: 15,
  pong_default_w: 15,
  pong_vx: 5,
  pong_vy: 5,
  pong_c: 'black',
};

// Optimize: remove reducer concept and set properties on object
function game(state = initialGameState, action) {
  switch (action.type) {
    case 'PLAYER_1_INPUT_UP': {
      return {
        ...state,
        p1_input_up: action.isPressed,
      };
    }

    case 'PLAYER_1_INPUT_DOWN': {
      return {
        ...state,
        p1_input_down: action.isPressed,
      };
    }

    case 'PLAYER_1_MOVE': {
      return {
        ...state,
        p1_y: action.y,
      };
    }

    case 'PLAYER_1_SCORE': {
      return {
        ...state,
        p1_score: action.score,
      };
    }

    case 'PLAYER_2_INPUT_UP': {
      return {
        ...state,
        p2_input_up: action.isPressed,
      };
    }

    case 'PLAYER_2_INPUT_DOWN': {
      return {
        ...state,
        p2_input_down: action.isPressed,
      };
    }

    case 'PLAYER_2_MOVE': {
      return {
        ...state,
        p2_y: action.y,
      };
    }

    case 'PLAYER_2_SCORE': {
      return {
        ...state,
        p2_score: action.score,
      };
    }

    case 'PONG_UPDATE': {
      return {
        ...state,
        pong_x: action.x,
        pong_y: action.y,
        pong_vx: action.vx,
        pong_vy: action.vy,
      };
    }

    case 'PONG_SHRINK': {
      return {
        ...state,
        pong_h: action.h,
        pong_w: action.w,
      };
    }

    case 'STOP': {
      return {
        ...state,
        game_on: false,
      };
    }

    case 'RESTART': {
      return {
        ...state,
        game_on: true,
        p1_score: 0,
        p2_score: 0,
        pong_x: state.screen_w / 2 - (state.pong_w / 2),
        pong_y: state.screen_h / 2 - (state.pong_h / 2),
      };
    }

    default:
      return state;
  }
}

// create closure to keep reusable objects for dispatch.
// don't have to keep making new objects.
const actions = (() => {
  // p1
  const p1_move_action = { type: 'PLAYER_1_MOVE', y: 0 };
  const p1_input_up = { type: 'PLAYER_1_INPUT_UP', isPressed: false };
  const p1_input_down = { type: 'PLAYER_1_INPUT_DOWN', isPressed: false };
  const p1_score = { type: 'PLAYER_1_SCORE', score: 0 };

  // p2
  const p2_move_action = { type: 'PLAYER_2_MOVE', y: 0 };
  const p2_input_up = { type: 'PLAYER_2_INPUT_UP', isPressed: false };
  const p2_input_down = { type: 'PLAYER_2_INPUT_DOWN', isPressed: false };
  const p2_score = { type: 'PLAYER_2_SCORE', score: 0 };

  // pong
  const pong_update_action = { type: 'PONG_UPDATE', x: 0, y: 0, vx: 0, vy: 0 };
  const pong_shrink_action = { type: 'PONG_SHRINK', h: 0, w: 0 };

  // meta actions to get into saga land...
  const tick_action = { type: 'TICK' };
  const stop_action = { type: 'STOP' };
  const restart_action = { type: 'RESTART' };

  return {
    // player 1 actions
    movePlayer1: y => {
      p1_move_action.y = y;
      return p1_move_action;
    },

    p1InputUp: isPressed => {
      p1_input_up.isPressed = isPressed;
      return p1_input_up;
    },

    p1InputDown: isPressed => {
      p1_input_down.isPressed = isPressed;
      return p1_input_down;
    },

    p1Score: score => {
      p1_score.score = score;
      return p1_score;
    },

    p2InputUp: isPressed => {
      p2_input_up.isPressed = isPressed;
      return p2_input_up;
    },

    p2InputDown: isPressed => {
      p2_input_down.isPressed = isPressed;
      return p2_input_down;
    },

    // player 2 actions
    movePlayer2: y => {
      p2_move_action.y = y;
      return p2_move_action;
    },

    p2Score: score => {
      p2_score.score = score;
      return p2_score;
    },

    // pong actions
    pongUpdate: (x, y, vx, vy) => {
      pong_update_action.x = x;
      pong_update_action.y = y;
      pong_update_action.vx = vx;
      pong_update_action.vy = vy;
      return pong_update_action;
    },

    pongShrink: (h, w) => {
      pong_shrink_action.h = h;
      pong_shrink_action.w = w;
      return pong_shrink_action;
    },

    // meta actions
    tick: () => tick_action,
    stop: () => stop_action,
    restart: () => restart_action,
  };
})();

const selectors = ({
  state: state => state,
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(game, applyMiddleware(sagaMiddleware));
const cvs = document.querySelector('#cvs');
const ctx = cvs.getContext('2d');

function* gameSaga() {
  console.log('game physics boot up');
  while (true) {

    // wait for the tick action
    yield take('TICK');

    const {
      screen_w, screen_h,

      p1_input_up, p1_input_down,
      p1_x, p1_y,
      p1_w, p1_h,
      p1_score,

      p2_input_up, p2_input_down,
      p2_x, p2_y,
      p2_h,
      p2_score,

      pong_x, pong_y, pong_vx, pong_vy,
      pong_w, pong_h,
      pong_default_w, pong_default_h,
    } = yield select(selectors.state);

    // Optimize: put input updates in separate saga
    if (p1_input_up) {
      const new_y = p1_y - 10 < 0 ? 0 : p1_y - 10;
      yield put(actions.movePlayer1(new_y));
    } else if (p1_input_down) {
      const new_y = (p1_y + 10 + p1_h) < screen_h ? p1_y + 10 : screen_h - p1_h;
      yield put(actions.movePlayer1(new_y));
    }

    if (p2_input_up) {
      const new_y = p2_y - 10 < 0 ? 0 : p2_y - 10;
      yield put(actions.movePlayer2(new_y));
    } else if (p2_input_down) {
      const new_y = (p2_y + 10 + p2_h) < screen_h ? p2_y + 10 : screen_h - p2_h;
      yield put(actions.movePlayer2(new_y));
    }

    // Optimize: put collision logic into separate saga
    // calculate temp new positions before bounds checking
    let new_x = pong_x + pong_vx;
    let new_y = pong_y + pong_vy;
    let new_vx = pong_vx;
    let new_vy = pong_vy;

    // bounds checking moving right/left
    if (pong_vx >= 0) {
      // check for collision with p2
      const pong_right = pong_x + pong_w;
      const p2_bottom = p2_y + p2_h;
      const isCollidingP2 = (pong_right > p2_x && pong_y >= p2_y && pong_y + pong_h <= p2_bottom);

      // bounce away
      if (isCollidingP2) {
        new_x = p2_x - pong_w - 1; // -1 so it isn't always colliding
        new_vx = new_vx * -1;
        yield put(actions.pongShrink(pong_w - 1, pong_h - 1));
      } else {
        const isCollidingScreen = (pong_right >= screen_w);
        if (isCollidingScreen) {
          // score p1
          yield put(actions.p1Score(p1_score + 1));
          yield put(actions.pongShrink(pong_default_h, pong_default_w));

          // reset pong
          new_x = (screen_w / 2) - (pong_default_w / 2);
          new_y = (screen_h / 2) - (pong_default_h / 2);
        }
      }
    } else {
      // check for collision with p1
      const p1_right = p1_x + p1_w
      const p1_bottom = p1_y + p1_h;
      const isCollidingP1 = (pong_x < p1_right && pong_y >= p1_y && pong_y + pong_h <= p1_bottom);

      // bounce away
      if (isCollidingP1) {
        new_x = p1_right + 1;
        new_vx = new_vx * -1;
        yield put(actions.pongShrink(pong_w - 1, pong_h - 1));
      } else {
        const isCollidingScreen = (pong_x <= 0);
        if (isCollidingScreen) {
          // score p2
          yield put(actions.p2Score(p2_score + 1));
          yield put(actions.pongShrink(pong_default_h, pong_default_w));

          // reset pong
          new_x = (screen_w / 2) - (pong_default_w / 2);
          new_y = (screen_h / 2) - (pong_default_h / 2);
        }
      }
    }

    // bounds checking moving down/up
    if (pong_vy >= 0) {
      // check for collision with bottom
      const isCollidingBottom = pong_y + pong_h > screen_h;
      if (isCollidingBottom) {
        new_y = screen_h - pong_h;
        new_vy = new_vy * -1;
      }
    } else {
      // check for collision with top
      const isCollidingTop = pong_y < 0;
      if (isCollidingTop) {
        new_y = 0;
        new_vy = new_vy * -1;
      }
    }

    // update pong position
    yield put(actions.pongUpdate(new_x, new_y, new_vx, new_vy));
  }
  // unreachable...
}

let prafId = null;
function update() {
  prafId = window.requestAnimationFrame(update);
  if (store.getState().game_on) {
    store.dispatch(actions.tick());
  }
}

let rafId = null;
function render() {
  rafId = window.requestAnimationFrame(render);
  const {
    screen_w, screen_h,

    p1_x, p1_y,
    p1_w, p1_h,
    p1_score, p1_c,

    p2_x, p2_y,
    p2_w, p2_h,
    p2_score, p2_c,

    pong_x, pong_y,
    pong_w, pong_h,
    pong_c,
  } = store.getState();

  ctx.clearRect(0, 0, screen_w, screen_h);

  // draw p1
  ctx.fillStyle = p1_c;
  ctx.fillRect(p1_x, p1_y, p1_w, p1_h);

  // draw p2
  ctx.fillStyle = p2_c;
  ctx.fillRect(p2_x, p2_y, p2_w, p2_h);

  // draw pong
  ctx.fillStyle = pong_c;
  ctx.fillRect(pong_x, pong_y, pong_w, pong_h);

  // draw p1 score
  ctx.fillStyle = 'black';
  ctx.fillText(p1_score, screen_w / 2 - 50, 10);

  // draw p2 score
  ctx.fillStyle = 'black';
  ctx.fillText(p2_score, screen_w / 2 + 50, 10);
}

// player inputs
window.addEventListener('keydown', ev => {
  const { p1_input_up, p1_input_down, p2_input_up, p2_input_down } = store.getState();
  switch (ev.keyCode) {
    // player 1 up/down
    // f/v for p1 up/down
    case 70:
      return !p1_input_up && store.dispatch(actions.p1InputUp(true));
    case 86:
      return !p1_input_down && store.dispatch(actions.p1InputDown(true));

    // player 2 up/down
    // j/n for p2 up/down
    case 74:
      return !p2_input_up && store.dispatch(actions.p2InputUp(true));
    case 78:
      return !p2_input_down && store.dispatch(actions.p2InputDown(true));

    // debug -- kill
    case 27: {
      console.log('HALT IN THE NAME OF SCIENCE!');

      // cancel the physics saga and tick
      store.dispatch(actions.stop());
      store.dispatch(actions.tick());
      window.cancelAnimationFrame(prafId);

      // cancel the rendering loop
      window.cancelAnimationFrame(rafId);
      return;
    }

    default:
      return;
  }
});

// release inputs
window.addEventListener('keyup', ev => {
  const { p1_input_up, p1_input_down, p2_input_up, p2_input_down } = store.getState();
  switch (ev.keyCode) {
    // f/v for p1 up/down
    case 70:
      return p1_input_up && store.dispatch(actions.p1InputUp(false));
    case 86:
      return p1_input_down && store.dispatch(actions.p1InputDown(false));

    // j/n for p2 up/down
    case 74:
      return p2_input_up && store.dispatch(actions.p2InputUp(false));
    case 78:
      return p2_input_down && store.dispatch(actions.p2InputDown(false));

    default:
      return;
  }
});

// my super awesome UI Framework: innerHTML!
const instructions = document.createElement('div');
instructions.innerHTML = `
<h4>Classic Pong with a twist: The ball shrinks as it is bounced back!</h4>
<p>Player 1: F / V to move UP / DOWN</p>
<p>Player 2: J / N to move UP / DOWN</p>
<div>
  <button>Start</button>
  <button>Stop</button>
</div>
<p>ESC key to kill the game/rendering loop</p>
`;

document.body.appendChild(instructions);

const [startBtn, stopBtn] = document.querySelectorAll('button');

startBtn.addEventListener('click', () => {
  store.dispatch(actions.restart());
});

stopBtn.addEventListener('click', () => {
  store.dispatch(actions.stop());
});

// run the loops n stuff
sagaMiddleware.run(gameSaga);
update();
render();
