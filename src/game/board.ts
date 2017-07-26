// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as grid from './grid';
import utils from '../util';
import { Direction } from './agent';

/**
 * A type to represent a serialized board for transportation.
 */
export type SerializedBoardGrid = {
    rows: number[][],
    score: number,
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

    /**
     * An iterator over a certain vertical or horizontal line drawn across the game grid. Useful for rotating the board.
     * Example: `board.getIterator(Direction.RIGHT, {x: 0, y: 0})`
     *
     * @param {Direction} dir The direction to go from the initial coordinate
     * @param {Coordinate} coord The initial position of the iteration, inclusive
     * @returns {Iterable<grid.Cell>} An iterator abiding by the given start position and direction
     * @memberof BoardGrid
     */
    public *getIterator(dir: Direction, coord: grid.Coordinate): Iterable<grid.Cell> {
        while (this.isCoordInRange(coord)) {
            yield this.uncheckedGetCellAt(coord);
            coord = BoardGrid.VecIt.get(dir)(coord);
        }
    }

    // Private parts begin

    private uncheckedGetCellAt(coord: grid.Coordinate): grid.Cell {
        return this.rows[coord.y][coord.x];
    }

}