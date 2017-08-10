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

    export function collect<T>(iter: Iterator<T>): T[] {
        let out: T[] = [];
        while (true) {
            let item = iter.next();
            if (item.done) {
                break;
            }

            out.push(item.value);
        }
        return out;
    }

    export function randomPick<T>(array: T[]): T {
        if (array.length === 0) {
            return null;
        }
        return array[Math.floor(Math.random() * array.length)];
    }
}

export default utils;