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
    protected value: number;

    constructor(num: number) {
        this.value = num;
    }

    public isEmpty(): boolean {
        return this.value === 0;
    }

    public val(): number {
        return this.value;
    }

    public equals(other: Cell): boolean {
        return this.val() === other.val();
    }

    public increment(): void {
        this.value++;
    }

    public clear(): void {
        this.value = 0;
    }

    public clone(): Cell {
        return new Cell(this.value);
    }
}

export class MatrixArray extends Array<Cell> {
    public static RIGHT = 1;
    public static LEFT = -1;

    constructor(cells: Cell[]) {
        super(...cells);
    }

    public static from(values: number[]): MatrixArray {
        return new MatrixArray(values.map(num => new Cell(num)));
    }

    protected findFarthestIndex(index: number, vec: number): number {
        let farthest = index;
        while (this.isIndexInRange(farthest + vec) && this[farthest + vec].isEmpty()) {
            farthest += vec;
        }
        return farthest;
    }

    public isIndexInRange(index: number): boolean {
        return index >= 0 && index < this.length;
    }

    public buildTraversals(vector: number): number[] {
        if (vector === MatrixArray.RIGHT) {
            // this.length - 2 to 0
            return [...Array(this.length).keys()].reverse().slice(1);
        } else {
            // 1 to this.length - 1
            return [...Array(this.length).keys()].slice(1);
        }
    }

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
            } else {
                // Just move the cell
                this[farIndex] = this[i].clone();
                this[i].clear();
            }
        }
    }

    public rotateRight() {
        this.rotate(MatrixArray.RIGHT);
    }
    
    public rotateLeft() {
        this.rotate(MatrixArray.LEFT);
    }

    public serialize(): number[] {
        return Array.from(this).map(cell => cell.val());
    }
}