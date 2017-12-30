// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { table, TableUserConfig } from 'table';


export function printGrid(
    grid: number[][],
    cellDisplay: (x: number) => string = x => (2**x).toString(),
    theme?: TableUserConfig): void {

    console.log(table(grid.map(val => val.map(cellDisplay)), theme));
}
