// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MatrixArray, Cell } from '../game/grid';
import * as assert from 'assert';

function expectEqual(vector: number, start: number[], end: number[], score?: number) {
    const tempMatrixArray = MatrixArray.from(start);
    const addScore = tempMatrixArray.rotate(vector);
    const result = tempMatrixArray.serialize();
    assert.deepEqual(result, end, 'MatrixArray rotation result unexpected');
    if (score !== undefined) {
        assert.equal(addScore, score, 'MatrixArray rotation additional score unexpected');
    }
}

expectEqual(MatrixArray.RIGHT, [2, 2, 2, 2], [0, 0, 3, 3], 16);
expectEqual(MatrixArray.RIGHT, [0, 0, 1, 1], [0, 0, 0, 2], 4);
expectEqual(MatrixArray.RIGHT, [0, 2, 2, 1], [0, 0, 3, 1], 8);
expectEqual(MatrixArray.RIGHT, [0, 3, 3, 3], [0, 0, 3, 4], 16);
expectEqual(MatrixArray.LEFT, [0, 0, 2, 2], [3, 0, 0, 0], 8);
expectEqual(MatrixArray.LEFT, [0, 2, 2, 2], [3, 2, 0, 0], 8);
expectEqual(MatrixArray.LEFT, [0, 4, 4, 2], [5, 2, 0, 0], 32);

assert.deepEqual(MatrixArray.newEmpty(), MatrixArray.from([0, 0, 0, 0]));

// Test: distinct Cell objects in MatrixArray from newEmpty
{
    let empty = MatrixArray.newEmpty();
    empty[0] = new Cell(2);
    assert.deepEqual(empty, MatrixArray.from([2, 0, 0, 0]));
}

// Test: Cell.clone() creates new distinct copy
{
    const cell1 = new Cell(1);
    const cell2 = cell1.clone();
    cell2.increment();
    assert.notDeepEqual(cell2, cell1, 'Cell.clone() does not create distinct copy');
}