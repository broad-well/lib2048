// Copyright (c) 2017 Michael P
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Defines the side length of the matrix, or grid.
 * Following the 2048 game itself, the default value is 4.
 */
exports.MATRIX_SIZE = 4;
class Cell {
    constructor(num) {
        this.value = num;
    }
    isEmpty() {
        return this.value === 0;
    }
    val() {
        return this.value;
    }
    equals(other) {
        return this.val() === other.val();
    }
    increment() {
        this.value++;
    }
    clear() {
        this.value = 0;
    }
    clone() {
        return new Cell(this.value);
    }
}
exports.Cell = Cell;
class MatrixArray extends Array {
    constructor(cells) {
        super(...cells);
    }
    static from(values) {
        return new MatrixArray(values.map(num => new Cell(num)));
    }
    findFarthestIndex(index, vec) {
        let farthest = index;
        while (this[farthest + vec].isEmpty()) {
            farthest += vec;
        }
        return farthest;
    }
    isIndexInRange(index) {
        return index >= 0 && index < this.length;
    }
    rotateRight() {
        // In order to prevent newly merged cells from being merged again, a list of new cell indexes is implemented.
        let newCells = [];
        // Traverse through the elements from right to left, ignoring the rightmost because it cannot be moved further
        for (let i = exports.MATRIX_SIZE - 2; i >= 0; i--) {
            const farIndex = this.findFarthestIndex(i, MatrixArray.RIGHT);
            const nextCell = farIndex + MatrixArray.RIGHT;
            // Check merge
            if (this.isIndexInRange(nextCell) && this[nextCell].equals(this[i]) && !newCells.includes(nextCell)) {
                // Mergeable
                this[nextCell].increment();
                this[i].clear();
                newCells.push(nextCell);
            }
            else {
                // Just move the cell
                this[farIndex] = this[i].clone();
                this[i].clear();
            }
        }
    }
}
MatrixArray.RIGHT = 1;
MatrixArray.LEFT = -1;

let test = MatrixArray.from([3,3,3,3]);
test.rotateRight();
console.log(test);