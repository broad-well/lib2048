// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as grid from './grid';
import utils from '../util';
import { Direction, GameAgent } from './agent';

/**
 * A type to represent a serialized board for transportation.
 */
export type SerializedBoardGrid = {
    rows: number[][],
    score: number
};

export type Manipulator<T> = (i: T) => T;

export default class BoardGrid {

    // For use with `getIterator`.
    // FIXME: TypeScript not supporting my idea of `{x, y} => {x + 1, y}` this time... Had to get verbose
    public static VecIt: Map<Direction, Manipulator<grid.Coordinate>> = new Map([
        [Direction.UP, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x: x, y: y - 1};
        }],
        [Direction.DOWN, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x: x, y: y + 1};
        }],
        [Direction.LEFT, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x: x - 1, y: y};
        }],
        [Direction.RIGHT, function({x, y}: grid.Coordinate): grid.Coordinate {
            return {x: x + 1, y: y};
        }],
    ]);

    public static newEmpty(): BoardGrid {
        return new BoardGrid(utils.arrayEmplace(grid.MatrixArray.newEmpty, grid.MATRIX_SIZE));
    }

    public static deserialize(ser: SerializedBoardGrid): BoardGrid {
        return new BoardGrid(ser.rows.map(grid.MatrixArray.from), ser.score);
    }

    // STATIC ENDS

    protected rows: grid.MatrixArray[];
    protected score: number;

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
    }

    // Private parts begin

    private uncheckedGetCellAt(coord: grid.Coordinate): grid.Cell {
        return this.rows[coord.y][coord.x];
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

}