// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Alpha-Beta Pruning AI implementation

import BoardGrid from '../game/board';
import { SerializedBoardGrid } from '../game/board';
import { GameState, Direction, GameAgent } from '../game/agent';
import { nextState, isTerminalState, getCurrentState, getNextActions, nextRandomAdditions, serializedToString, evaluateState } from './common';
import GameUser from '../user';
import { MATRIX_SIZE } from '../game/grid';

// Setting: depth limit in alphabeta search
let depthLimit = 5;

// Memory: Avoid re-evaluating by storing scores in maps
let treeMemory: {[boardRepr: number]: number} = {};

// Adopted from Wikipedia article on AB pruning
function alphaBeta(
    state: SerializedBoardGrid,
    depth: number,
    alpha: number,
    beta: number,
    isPlayerTurn: boolean
): number {
    if (depth <= 0 || isTerminalState(state)) {
        const repr = serializedToString(state);
        const memorized = treeMemory[repr];
        if (memorized) {
            return memorized;
        }

        // This is a new state, push into memory
        const evaluation = evaluateState(state);
        treeMemory[repr] = evaluation;
        return evaluation;
    }

    if (isPlayerTurn) {
        let v = Number.MIN_VALUE;
        for (let direction of getNextActions(state)) {
            v = Math.max(v, alphaBeta(nextState(state, direction), depth - 1, alpha, beta, false));
            alpha = Math.max(alpha, v);
            if (beta <= alpha) {
                break;
            }
        }
        return v;
    } else {
        let v = Number.MAX_VALUE;
        for (let nextState of nextRandomAdditions(state)) {
            v = Math.min(v, alphaBeta(nextState, depth - 1, alpha, beta, true));
            beta = Math.min(beta, v);
            if (beta <= alpha) {
                break;
            }
        }
        return v;
    }
}

function choose(grid: SerializedBoardGrid): Direction {
    const choices = getNextActions(grid);
    const scores = choices.map(action => alphaBeta(nextState(grid, action),
        depthLimit, Number.MIN_VALUE, Number.MAX_VALUE, true));

    return choices[scores.indexOf(Math.max(...scores))];
}

// End of static, no side-effect functions

export default class AlphaBeta implements GameUser {
    private agent: GameAgent;
    private executor: number | NodeJS.Timer;
    public interval: number = 300;

    bind(agent: GameAgent) {
        this.agent = agent;
    }

    start() {
        this.executor = setInterval(() => {
            const moveChoice = choose(getCurrentState(this.agent));

            // Do not lag the browser window if we're controlling that
            if (window) {
                window.requestAnimationFrame(() => this.agent.move(moveChoice));
            } else {
                this.agent.move(moveChoice);
            }

            // Done?
            if (this.agent.getGameState() !== GameState.ONGOING) {
                this.stop();
            }
        }, this.interval);
    }

    stop() {
        if (typeof this.executor === 'number') {
            clearInterval(this.executor as number);
        }
        else if (this.executor === null) {
            return;
        }
        else {
            clearInterval(this.executor as NodeJS.Timer);
        }
    }

    reset() {
        this.agent.reset();
    }
}