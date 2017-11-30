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

    export function repeatInterval(times: number, doThis: (epoch: number) => any): number {
        let count = 0;
        const interval = setInterval(() => {
            ++count;
            doThis(count);
            if (count >= times) {
                clearInterval(interval);
            }
        });
        return interval;
    }

    export function sum(...nums: number[]): number {
        return nums.reduce((a, b) => a + b, 0);
    }
}

export default utils;