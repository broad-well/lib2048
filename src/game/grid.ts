// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Defines the side length of the matrix, or grid.
 * Following the 2048 game itself, the default value is 4.
 */
export const MATRIX_SIZE = 4;

export class Cell {
    /**
     * The numeric value of `log2` the display value of the cell.
     *
     * For example, this would be 5 if the displayed value is 2^5, or 32.
     *
     * @protected
     * @type {number}
     * @memberOf Cell
     */
    protected value: number;

    /**
     * Creates an instance of Cell with the given number as its {@see value}.
     * @param {number} num The numeric value to put into `this.value`
     *
     * @memberOf Cell
     */
    constructor(num: number) {
        this.value = num;
    }

    /**
     * Checks to see if this cell is currently empty.
     *
     * @returns {boolean} `true` if this is empty, otherwise `false`
     *
     * @memberOf Cell
     */
    public isEmpty(): boolean {
        return this.value === 0;
    }

    /**
     * Gets the {@see value} of this cell.
     *
     * @returns {number} The property `value` of this cell
     *
     * @memberOf Cell
     */
    public val(): number {
        return this.value;
    }

    /**
     * Compares this cell to another cell. Compares the cells' values to check if they are equal.
     *
     * @param {Cell} other The other cell to compare this cell to
     * @returns {boolean} `true` if this cell's value equals the other cell's value, otherwise `false`
     *
     * @memberOf Cell
     */
    public equals(other: Cell): boolean {
        return this.val() === other.val();
    }

    /**
     * Increments the value of this cell to double its display value.
     *
     * _Call this when another cell merges with this cell._
     *
     * @memberOf Cell
     */
    public increment(): void {
        this.value++;
    }

    /**
     * Clears the value of this cell, making it empty.
     *
     * @memberOf Cell
     */
    public clear(): void {
        this.value = 0;
    }

    /**
     * Creates another instance of Cell that has the same value as this cell.
     *
     * @returns {Cell} The cloned Cell
     *
     * @memberOf Cell
     */
    public clone(): Cell {
        return new Cell(this.value);
    }
}

export class MatrixArray extends Array<Cell> {
    /**
     * Rightward vector for when traversing through arrays.
     *
     * @static
     *
     * @memberOf MatrixArray
     */
    public static RIGHT = 1;

    /**
     * Leftward vector for when traversing through arrays.
     *
     * @static
     *
     * @memberOf MatrixArray
     */
    public static LEFT = -1;

    /**
     * Creates an instance of MatrixArray with an array of Cells.
     * @param {Cell[]} cells The array of Cells to create this MatrixArray with
     *
     * @memberOf MatrixArray
     */
    constructor(cells: Cell[]) {
        super(...cells);
    }

    /**
     * Converts an array of numbers to a MatrixArray by converting each number to a Cell.
     *
     * @static
     * @param {number[]} values The number array to create this MatrixArray with
     * @returns {MatrixArray} The created object
     *
     * @memberOf MatrixArray
     */
    public static from(values: number[]): MatrixArray {
        return new MatrixArray(values.map(num => new Cell(num)));
    }

    /**
     * Finds the last empty cell if it traverses from the given index along the given vector. If there are no empty cells in that direction, it returns the given index.
     *
     * _Example: in [3, 0, 0, 4], calling this with index as 1 and vec as 1 (right) will return 2 because it is the rightmost empty cell from index 1._
     *
     *
     * @protected
     * @param {number} index Location to start the traversal
     * @param {number} vec Vector to indicate the direction of the traversal; 1 for RIGHT, -1 for LEFT
     * @returns {number} The last empty cell in the direction given by the vector from the given starting point, or the given index if there is no empty cell in the given direction
     *
     * @memberOf MatrixArray
     */
    protected findFarthestIndex(index: number, vec: number): number {
        let farthest = index;
        while (this.isIndexInRange(farthest + vec) && this[farthest + vec].isEmpty()) {
            farthest += vec;
        }
        return farthest;
    }

    /**
     * Checks whether or not the given index is in range of this MatrixArray.
     *
     * @param {number} index Index to check bounds of
     * @returns {boolean} True if index is in range of this array, false otherwise
     *
     * @memberOf MatrixArray
     */
    public isIndexInRange(index: number): boolean {
        return index >= 0 && index < this.length;
    }

    /**
     * Generates the indexes which `rotate()` will use for its iteration.
     *
     * @param {number} vector The direction of rotation
     * @returns {number[]} An array of indexes to iterate through
     *
     * @memberOf MatrixArray
     */
    public buildTraversals(vector: number): number[] {
        if (vector === MatrixArray.RIGHT) {
            // this.length - 2 to 0
            return [...Array(this.length).keys()].reverse().slice(1);
        } else {
            // 1 to this.length - 1
            return [...Array(this.length).keys()].slice(1);
        }
    }

    /**
     * Rotates self to the given vector, merging cells if necessary
     *
     * _Expected behavior: `[0, 0, 2, 2].rotate(1)` becomes `[0, 0, 0, 3]`_
     *
     * @param {number} vector Direction to rotate
     *
     * @memberOf MatrixArray
     */
    public rotate(vector: number) {
        // In order to prevent newly merged cells from being merged again, a list of new cell indexes is implemented.
        let newCells: number[] = [];

        // Traverse through the elements from right to left, ignoring the rightmost because it cannot be moved further
        for (let i of this.buildTraversals(vector)) {
            const farIndex = this.findFarthestIndex(i, vector);
            const nextCell = farIndex + vector;

            // Check merge
            if (this.isIndexInRange(nextCell) && this[nextCell].equals(this[i]) && !newCells.includes(nextCell)) {
                // Mergeable
                this[nextCell].increment();
                this[i].clear();
                newCells.push(nextCell);
            } else if (farIndex !== i) {
                // Just move the cell
                this[farIndex] = this[i].clone();
                this[i].clear();
            }
        }
    }

    /**
     * Rotates this MatrixArray to the right (1) using `rotate()`.
     *
     * @memberOf MatrixArray
     */
    public rotateRight() {
        this.rotate(MatrixArray.RIGHT);
    }

    /**
     * Rotates this MatrixArray to the left (-1) using `rotate()`.
     *
     * @memberOf MatrixArray
     */
    public rotateLeft() {
        this.rotate(MatrixArray.LEFT);
    }

    /**
     * Converts this MatrixArray from an array of Cells to an array of numbers.
     *
     * @returns {number[]} The serialization of this array
     *
     * @memberOf MatrixArray
     */
    public serialize(): number[] {
        return Array.from(this).map(cell => cell.val());
    }
}