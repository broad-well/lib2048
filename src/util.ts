// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Useful utilities for the language

namespace utils {
    export function arrayEmplace<T>(construct: (index?: number) => T, length: number): T[] {
        let output: T[] = [];
        for (let index = 0; index < length; ++index) {
            output.push(construct(index));
        }
        return output;
    }
}

export default utils;