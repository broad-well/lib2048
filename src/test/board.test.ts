// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import BoardGrid from '../game/board';
import { MATRIX_SIZE } from '../game/grid';
import * as assert from 'assert';
import * as unit from 'nodeunit';

// Test: newEmpty board is indeed empty
export function newEmptyIsEmpty(test: unit.Test) {
    test.expect(1);

    const empty = BoardGrid.newEmpty();
    test.ok(empty.isEmpty(), 'newEmpty is not empty');
    test.done();
}

// Test: Board equal after (de)serialization
export function deserializedBoardIsEqual(test: unit.Test) {
    test.expect(1);

    const bg = BoardGrid.deserialize({
        rows: [
            [1, 3, 2, 4],
            [1, 1, 2, 2],
            [0, 0, 1, 3],
            [4, 1, 0, 2]
        ],
        score: 100
    });
    test.ok(BoardGrid.deserialize(bg.serialize()).equals(bg), 'Board different after reserialization');
    test.done();
}

// Test: Board equality tests work
export function boardEqualTestsWork(test: unit.Test) {
    test.expect(1);

    const sbg = {
        rows: [
            [2, 3, 1, 0],
            [1, 3, 2, 4],
            [0, 2, 1, 3],
            [0, 1, 1, 0]
        ],
        score: 382
    };

    const bg1 = BoardGrid.deserialize(sbg);
    const bg2 = BoardGrid.deserialize(sbg);

    test.ok(bg1.equals(bg2), 'BoardGrid.equals does not work');
    test.done();
}

// Test: Clones are equal
export function clonesAreEqual(test: unit.Test) {
    test.expect(1);

    const sbg = {
        rows: [
            [0, 0, 0, 1],
            [0, 2, 0, 1],
            [0, 3, 3, 1],
            [0, 0, 0, 0]
        ],
        score: 591
    };

    const bg1 = BoardGrid.deserialize(sbg);
    test.ok(bg1.clone().equals(bg1), 'BoardGrid.clone results aren\'t equal');
    test.done();
}

// Test: Input in range?
export function isCoordInRangeWorks(test: unit.Test) {
    test.expect(2);

    const board = BoardGrid.newEmpty();
    test.ok(board.isCoordInRange({x: MATRIX_SIZE - 2, y: MATRIX_SIZE - 1}), 'Matrix size less than two?');
    test.ok(!board.isCoordInRange({x: -1, y: MATRIX_SIZE - 1}), 'Negative numbers are in range?');
    test.ok(!board.isCoordInRange({x: MATRIX_SIZE, y: 0}), `Matrix size (${MATRIX_SIZE}) is in range?`);
    test.ok(!board.isCoordInRange({y: MATRIX_SIZE, x: 0}), `Matrix size (${MATRIX_SIZE}) is in range?`);
    test.done();
}
// TODO: more tests coming
