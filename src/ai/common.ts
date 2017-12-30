// Copyright (c) 2017 Michael P
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Common functions for multiple AI implementations, such as state evaluation

import BoardGrid, { SerializedBoardGrid } from '../game/board';
import { MATRIX_SIZE } from '../game/grid';
import { GameState, Direction, GameAgent } from '../game/agent';
import util from '../util';

type EvaluationFactor = {
    weight: number,
    evaluate: (grid: SerializedBoardGrid) => number
};

const evaluationFactors: {[name: string]: EvaluationFactor} = {
    'Empty cells': {
        weight: 6,
        evaluate: grid => util.sum(...grid.rows.map(row => row.filter(value => value === 0).length))
    },
    'Game state': {
        weight: 1,
        evaluate: grid => {
            switch (BoardGrid.deserialize(grid).getGameState()) {
                case GameState.LOSS:
                    return -(10 ** 5);
                case GameState.ONGOING:
                    return 0;
                case GameState.WIN:
                    return 10 ** 5;
            }
        }
    },
    'Low-value cells': {
        weight: -4,
        evaluate: grid => util.sum(...grid.rows.map(row => row.filter(cell => cell < 3 && cell !== 0).length))
    }
};

export function evaluateState(state: SerializedBoardGrid): number {
    let result = 0;

    for (let factorName in evaluationFactors) {
        const factor = evaluationFactors[factorName];
        result += factor.weight * factor.evaluate(state);
    }

    return result;
}

export function nextState(state: SerializedBoardGrid, action: Direction): SerializedBoardGrid {
    const board = BoardGrid.deserialize(state);
    board.move(action);
    return board.serialize();
}

export function isTerminalState(state: SerializedBoardGrid): boolean {
    return BoardGrid.deserialize(state).getGameState() !== GameState.ONGOING;
}

export function getCurrentState(agent: GameAgent): SerializedBoardGrid {
    return {
        rows: agent.getCells(),
        score: agent.getScore()
    };
}

export function areGridsEqual(grid1: number[][], grid2: number[][]): boolean {
    for (let x = 0; x < MATRIX_SIZE; ++x) {
        for (let y = 0; y < MATRIX_SIZE; ++y) {
            if (grid1[y][x] !== grid2[y][x])
                return false;
        }
    }
    return true;
}

export function getNextActions(state: SerializedBoardGrid): Direction[] {
    return [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP].filter(
        direction => !areGridsEqual(nextState(state, direction).rows, state.rows)
    );
}

export function *nextRandomAdditions(state: SerializedBoardGrid): Iterable<SerializedBoardGrid> {
    const board = BoardGrid.deserialize(state);
    const emptyCoords = board.getEmptyCells();
    
    for (let addition of [1, 2]) {
        for (let coord of emptyCoords) {
            const clone = board.serialize();
            clone.rows[coord.y][coord.x] = addition;
            yield clone;
        }
    }
}

export function serializedToString(grid: SerializedBoardGrid): number {
    return parseInt(grid.rows.reduce((a, b) => a.concat(b), []).map(cell => cell.toString(16)).reduce((a, b) => a + b), 16);
}