// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// GameAgent abstract class
import { Coordinate, Cell } from './grid';

/**
 * Represents a Move performed by the 2048 player.
 *
 * @export
 * @enum {number}
 */
export enum Direction {
        UP,
    LEFT, RIGHT,
       DOWN
}

/**
 * Represents the state of the game--If it's in progress, won, or lost.
 *
 * @export
 * @enum {number}
 */
export enum GameState {
    WIN, ONGOING, LOSS
}

/**
 * An interface as described in _Lib2048 Specification_ to represent an agent to a 2048 game logic provider.
 * This interface is implemented by `BoardGrid` and `WebInjector`.
 *
 * @export
 * @interface GameAgent
 */
export interface GameAgent {
    move(direction: Direction): void;
    getGameState(): GameState;
    getScore(): number;
    getCellAt(coord: Coordinate): number | null;
    getCells(): number[][];
    reset(): void;
}

export default GameAgent;