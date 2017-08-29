// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as grid from './grid';
import utils from '../util';
import { Direction, GameAgent, GameState } from './agent';

/**
 * A type to represent a serialized board for transportation.
 */
export type SerializedBoardGrid = {
    rows: number[][],
    score: number
};

/**
 * A type to represent a function that manipulates a variable of a given type and returns the changed value.
 */
export type Manipulator<T> = (i: T) => T;

/**
 * The BoardGrid module described in the Specification. Packs `MatrixArray`s and has the ability to rotate and move (up down left right) the board.
 *
 * @implements GameAgent
 * @export
 * @class BoardGrid
 */
export default class BoardGrid implements GameAgent {

    // For use with `getIterator`.
    // FIXME: TypeScript not supporting my idea of `{x, y} => {x + 1, y}` this time... Had to get verbose
    public static VecIt: Map<Direction, Manipulator<grid.Coordinate>> = new Map([
        [Direction.UP, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x, y: y - 1};
        }],
        [Direction.DOWN, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x, y: y + 1};
        }],
        [Direction.LEFT, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x: x - 1, y};
        }],
        [Direction.RIGHT, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x: x + 1, y};
        }],
    ]);

    /**
     * Create a new empty BoardGrid.
     *
     * @static
     * @returns {BoardGrid} The new BoardGrid
     * @memberof BoardGrid
     */
    public static newEmpty(): BoardGrid {
        return new BoardGrid(utils.arrayEmplace(grid.MatrixArray.newEmpty, grid.MATRIX_SIZE));
    }

    /**
     * Create a BoardGrid from a SerializedBoardGrid.
     *
     * @static
     * @param {SerializedBoardGrid} ser The serialized BoardGrid to create this BoardGrid from
     * @returns {BoardGrid} The deserialized BoardGrid
     * @memberof BoardGrid
     */
    public static deserialize(ser: SerializedBoardGrid): BoardGrid {
        return new BoardGrid(ser.rows.map(grid.MatrixArray.from), ser.score);
    }

    // STATIC ENDS

    /**
     * An array of MatrixArrays, each representing a row (horizontal) in the grid.
     *
     * @protected
     * @type {grid.MatrixArray[]}
     * @memberof BoardGrid
     */
    protected rows: grid.MatrixArray[];

    /**
     * The current score of this game. Must be a positive integer or 0.
     *
     * @protected
     * @type {number}
     * @memberof BoardGrid
     */
    protected score: number;

    /**
     * The current state of the game.
     *
     * @protected
     * @type {GameState}
     * @memberof BoardGrid
     */
    protected gameState: GameState = GameState.ONGOING;

    public winValue: number = 11; // 2^11 = 2048

    protected constructor(rows: grid.MatrixArray[], score: number = 0) {
        this.rows = rows;
        this.score = score;
    }

    public serialize(): SerializedBoardGrid {
        return {
            rows: this.rows.map(matrixArray => matrixArray.serialize()),
            score: this.score
        };
    }

    public clone(): BoardGrid {
        return BoardGrid.deserialize(this.serialize());
    }

    public equals(other: BoardGrid): boolean {
        return this.getXCount() === other.getXCount() &&
            this.getYCount() === other.getYCount() &&
            this.rows.every((row, index) => row.equals(other.rows[index])) &&
            this.score === other.score;
    }

    public isCoordInRange(coord: grid.Coordinate): boolean {
        return coord.y < this.rows.length && coord.y >= 0 && this.rows[coord.y].isIndexInRange(coord.x);
    }

    public getCellAt?(coord: grid.Coordinate): grid.Cell {
        return this.isCoordInRange(coord) ? this.uncheckedGetCellAt(coord) : null;
    }

    public getEmptyCells(): grid.Coordinate[] {
        let output: grid.Coordinate[] = [];

        for (let x = 0; x < this.rows[0].length; ++x) {
            for (let y = 0; y < this.rows.length; ++y) {
                if (this.rows[y][x].isEmpty()) {
                    output.push({x, y});
                }
            }
        }

        return output;
    }

    public getYCount(): number {
        return this.rows.length;
    }

    public getXCount(): number {
        return this.rows[0].length;
    }

    /**
     * An iterator over a certain vertical or horizontal line drawn across the game grid. Useful for rotating the board.
     * Example: `board.getIterator(Direction.RIGHT, {x: 0, y: 0})`
     *
     * @param {Direction} dir The direction to go from the initial coordinate
     * @param {Coordinate} coord The initial position of the iteration, inclusive
     * @returns {Iterator<grid.Cell>} An iterator abiding by the given start position and direction
     * @memberof BoardGrid
     */
    public *getIterator(dir: Direction, coord: grid.Coordinate): Iterator<grid.Cell> {
        while (this.isCoordInRange(coord)) {
            yield this.uncheckedGetCellAt(coord);
            coord = BoardGrid.VecIt.get(dir)(coord);
        }
    }

    public getRotatedClockwise(): SerializedBoardGrid {
        // Clockwise: Bottom to Top, Left to Right
        return this.rotated(
            (rows: number[][], x: number) => rows[x] = utils.collect(this.getIterator(Direction.UP, {x, y: this.getYCount() - 1})).map(cell => cell.val()));
    }

    public getRotatedUnclockwise(): SerializedBoardGrid {
        // Unclockwise (Counter-Clockwise): Top to Bottom, Right to Left
        return this.rotated(
            (rows: number[][], x: number) => rows[x] = utils.collect(this.getIterator(Direction.DOWN, {x: this.getXCount() - 1 - x, y: 0})).map(cell => cell.val()));
    }

    // WARNING: Makes changes to board dimensions if it's not a square
    public rotateClockwise(): void {
        let rotated = this.getRotatedClockwise();
        this.rows = rotated.rows.map(grid.MatrixArray.from);
    }

    public rotateUnclockwise(): void {
        let rotated = this.getRotatedUnclockwise();
        this.rows = rotated.rows.map(grid.MatrixArray.from);
    }

    public move(direction: Direction): void {
        const beforeMove = this;
        switch (direction) {
            case Direction.UP:
                // For moving up, rotate clockwise once, move right, then rotate unclockwise once
                this.rotateClockwise();
                this.move(Direction.RIGHT);
                this.rotateUnclockwise();
                break;
            case Direction.DOWN:
                // For moving down, rotate unclockwise once, move right, then rotate clockwise once
                this.rotateUnclockwise();
                this.move(Direction.RIGHT);
                this.rotateClockwise();
                break;
            case Direction.RIGHT:
                for (let row of this.rows) {
                    this.score += row.rotateRight();
                }
                break;
            case Direction.LEFT:
                for (let row of this.rows) {
                    this.score += row.rotateLeft();
                }
                break;
        }

        // If changes took place, then add new random
        if (!this.equals(beforeMove)) {
            this.addRandom();
        }

        this.updateGameState();
    }

    public getScore(): number {
        return this.score;
    }

    public getGameState(): GameState {
        return this.gameState;
    }

    public getCells(): grid.Cell[][] {
        return this.rows;
    }

    public isEmpty(): boolean {
        return this.isEveryCell(cell => cell.isEmpty());
    }
    // Private parts begin

    private uncheckedGetCellAt(coord: grid.Coordinate): grid.Cell {
        return this.rows[coord.y][coord.x];
    }

    private *allCellIterator(): Iterable<[grid.Cell, grid.Coordinate]> {
        for (let y = 0; y < this.getYCount(); ++y) {
            for (let x = 0; x < this.getXCount(); ++x) {
                let coord = {x, y};
                yield [this.uncheckedGetCellAt(coord), coord];
            }
        }
    }

    /**
     * Checks if every cell in this grid satisfies the given check.
     *
     * @private
     * @param {(cell: grid.Cell, coord: grid.Coordinate) => boolean} todo The check to run every cell against.
     * @returns True if all checks return true; otherwise false.
     * @memberof BoardGrid
     */
    private isEveryCell(todo: (cell: grid.Cell, coord: grid.Coordinate) => boolean) {
        for (let [cell, coord] of this.allCellIterator()) {
            if (!todo(cell, coord)) {
                return false;
            }
        }
        return true;
    }

    private rotated(rowManip: (rows: number[][], x: number) => void): SerializedBoardGrid {
        let output: SerializedBoardGrid = {
            // Get a fresh and empty board matching the dimensions of `this`, except X and Y swapped
            rows: utils.arrayEmplace(() => new Array(this.getXCount()).fill(0), this.getYCount()),
            score: this.score
        };
        for (let x = 0; x < this.getXCount(); ++x) {
            // output.rows[x] = utils.collect(this.getIterator(Direction.UP, {x, y: this.getYCount() - 1})).map(cell => cell.val());
            rowManip(output.rows, x);
        }
        return output;
    }

    private isWon(): boolean {
        for (let [cell, _] of this.allCellIterator()) {
            if (cell.val() >= this.winValue) {
                return true;
            }
        }
        return false;
    }

    private isLost(): boolean {
        // If there are empty spots
        if (!this.isEveryCell(cell => !cell.isEmpty())) {
            return false;
        }

        // Utility function
        function sameAfterMove(dir: Direction): boolean {
            let copy = this.clone();
            copy.move(dir);
            return this.equals(copy);
        }

        // Move right and up, compare
        return sameAfterMove(Direction.RIGHT) && sameAfterMove(Direction.UP);
    }

    private updateGameState() {
        if (this.isWon()) {
            this.gameState = GameState.WIN;
        } else if (this.isLost()) {
            this.gameState = GameState.LOSS;
        } else {
            this.gameState = GameState.ONGOING;
        }
    }

    private addRandom(): boolean {
        if (this.isEveryCell(cell => !cell.isEmpty())) {
            return false;
        }

        // Populate all empty cells
        const emptyCells: grid.Coordinate[] = [];
        for (let [cell, coord] of this.allCellIterator()) {
            if (cell.isEmpty()) {
                emptyCells.push(coord);
            }
        }
        const cellToPopulate = this.uncheckedGetCellAt(utils.randomPick(emptyCells));

        // Simple way to simulate 80% chance 2, 20% chance 4
        cellToPopulate.increment();
        if (Math.random() > 0.8) {
            cellToPopulate.increment();
        }
        return true;
    }
}