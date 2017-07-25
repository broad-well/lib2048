// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as grid from './grid';
import utils from '../util';

/**
 * A type to represent a serialized board for transportation.
 */
export type SerializedBoard = {
    rows: number[][],
    score: number,
};

export default class Board {

    public static newEmpty(): Board {
        return new Board(utils.arrayEmplace(grid.MatrixArray.newEmpty, grid.MATRIX_SIZE));
    }

    public static deserialize(ser: SerializedBoard): Board {
        return new Board(ser.rows.map(grid.MatrixArray.from), ser.score);
    }

    // STATIC ENDS

    protected rows: grid.MatrixArray[];
    protected score: number;

    protected constructor(rows: grid.MatrixArray[], score: number = 0) {
        this.rows = rows;
        this.score = score;
    }

    public serialize(): SerializedBoard {
        return {
            rows: this.rows.map(matrixArray => matrixArray.serialize()),
            score: this.score
        };
    }

    public getCellAt(coord: grid.Coordinate): grid.Cell {
        return this.rows[coord.y][coord.x];
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

}