// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import BoardGrid from '../game/board';
import * as assert from 'assert';

// Test: newEmpty board is indeed empty
{
    const empty = BoardGrid.newEmpty();
    assert(empty.isEmpty(), 'newEmpty is not empty');
}

// Test: Board equal after (de)serialization
{
    const bg = BoardGrid.deserialize({
        rows: [
            [1, 3, 2, 4],
            [1, 1, 2, 2],
            [0, 0, 1, 3],
            [4, 1, 0, 2]
        ],
        score: 100
    });
    assert(BoardGrid.deserialize(bg.serialize()).equals(bg), 'Board different after reserialization');
}

// Test: Board equality tests work
{
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

    assert(bg1.equals(bg2), 'BoardGrid.equals does not work');
}

// TODO: more tests coming