// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import BoardGrid from '../game/board';
import { MATRIX_SIZE } from '../game/grid';
import { Direction } from '../game/agent';
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
    test.expect(4);

    const board = BoardGrid.newEmpty();
    test.ok(board.isCoordInRange({x: MATRIX_SIZE - 2, y: MATRIX_SIZE - 1}), 'Matrix size less than two?');
    test.ok(!board.isCoordInRange({x: -1, y: MATRIX_SIZE - 1}), 'Negative numbers are in range?');
    test.ok(!board.isCoordInRange({x: MATRIX_SIZE, y: 0}), `Matrix size (${MATRIX_SIZE}) is in range?`);
    test.ok(!board.isCoordInRange({y: MATRIX_SIZE, x: 0}), `Matrix size (${MATRIX_SIZE}) is in range?`);
    test.done();
}

export function getCellAtWorks(test: unit.Test) {
    test.expect(4);

    const sbg = {
        rows: [
            [0, 0, 0, 1],
            [0, 2, 0, 1],
            [0, 3, 3, 1],
            [0, 0, 0, 0]
        ],
        score: 591
    };

    const board = BoardGrid.deserialize(sbg);
    test.equal(board.getCellAt({x: 0, y: 0}).val(), 0, 'getCellAt x=0 y=0 is not 0');
    test.equal(board.getCellAt({x: 2, y: 3}).val(), 0, 'getCellAt x=2 y=3 is not 0');
    test.equal(board.getCellAt({x: 3, y: 2}).val(), 1, 'getCellAt x=3 y=2 is not 1');
    test.equal(board.getCellAt({x: -1, y: 2}), null, 'getCellAt with negative coordinate not null');

    test.done();
}

export function getEmptyCellsWorks(test: unit.Test) {
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
    const board = BoardGrid.deserialize(sbg);

    test.deepEqual(board.getEmptyCells(), [
        {x: 0, y: 2},
        {x: 0, y: 3},
        {x: 3, y: 0},
        {x: 3, y: 3}
    ]);
    test.done();
}

export function rotateWorks(test: unit.Test) {
    test.expect(2);

    const original = {
        rows: [
            [1, 3, 0, 1],
            [0, 0, 2, 1],
            [0, 2, 0, 0],
            [0, 0, 3, 1]
        ],
        score: 0
    };
    const oBoard = BoardGrid.deserialize(original);

    oBoard.rotateClockwise();
    test.deepEqual(oBoard.serialize().rows, [
        [0, 0, 0, 1],
        [0, 2, 0, 3],
        [3, 0, 2, 0],
        [1, 0, 1, 1]
    ], 'Clockwise rotation does not work');

    oBoard.rotateUnclockwise();
    test.deepEqual(oBoard.serialize().rows, original.rows, 'Counter-clockwise rotation does not work');

    test.done();
}

export function movesAreCorrect(test: unit.Test) {
    test.expect(5);

    const origin = {
        rows: [
            [1, 2, 0, 1],
            [0, 0, 1, 2],
            [1, 0, 1, 1],
            [0, 2, 2, 0]
        ],
        score: 100
    };

    const oBoard = BoardGrid.deserialize(origin);
    oBoard.move(Direction.DOWN, false); // Do not add random cell

    test.deepEqual(oBoard.serialize().rows, [
        [0, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 2, 2],
        [2, 3, 2, 1]
    ], 'Results moving down unexpected');

    oBoard.move(Direction.RIGHT, false);

    test.deepEqual(oBoard.serialize().rows, [
        [0, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 0, 3],
        [2, 3, 2, 1]
    ], 'Results moving right unexpected');

    oBoard.move(Direction.UP, false);

    test.deepEqual(oBoard.serialize().rows, [
        [2, 3, 2, 1],
        [0, 0, 0, 3],
        [0, 0, 0, 1],
        [0, 0, 0, 0]
    ], 'Results moving up unexpected');

    oBoard.move(Direction.LEFT, false);

    test.deepEqual(oBoard.serialize().rows, [
        [2, 3, 2, 1],
        [3, 0, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0]
    ], 'Results moving left unexpected');

    const fullBoard = {
        rows: [
            [2, 3, 2, 3],
            [3, 2, 3, 2],
            [2, 3, 2, 3],
            [3, 2, 3, 2]
        ],
        score: 0
    };

    const dFullBoard = BoardGrid.deserialize(fullBoard);
    dFullBoard.move(Direction.RIGHT);

    test.deepEqual(dFullBoard.serialize().rows, fullBoard.rows);

    test.done();
}

// TODO: more tests coming
