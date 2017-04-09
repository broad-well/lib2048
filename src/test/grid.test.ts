// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MatrixArray } from '../game/grid';

function arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; ++i) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

function expectEqual(vector: number, start: number[], end: number[]) {
    const tempMatrixArray = MatrixArray.from(start);
    tempMatrixArray.rotate(vector);
    const result = tempMatrixArray.serialize();
    if (!arraysEqual(result, end)) {
        console.error(`Assertion failure: expected ${end}, actual ${result}`);
        console.trace();
    }
}

expectEqual(MatrixArray.RIGHT, [2, 2, 2, 2], [0, 0, 3, 3]);
expectEqual(MatrixArray.RIGHT, [0, 0, 1, 1], [0, 0, 0, 2]);
expectEqual(MatrixArray.RIGHT, [0, 2, 2, 1], [0, 0, 3, 1]);
expectEqual(MatrixArray.RIGHT, [0, 3, 3, 3], [0, 0, 3, 4]);
expectEqual(MatrixArray.LEFT, [0, 0, 2, 2], [3, 0, 0, 0]);
expectEqual(MatrixArray.LEFT, [0, 2, 2, 2], [3, 2, 0, 0]);
expectEqual(MatrixArray.LEFT, [0, 4, 4, 2], [5, 2, 0, 0]);