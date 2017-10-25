// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import SiteAdapter from '../adapter';
import { Direction, GameState } from '../../game/agent';
import { Coordinate, Cell } from '../../game/grid';
import Utils from '../../util';

interface Tile {
    x: number;
    y: number;
    value: number;

    new (position: Coordinate, value: number): Tile;
    savePosition(): void;
    updatePosition(newPosition: Coordinate): void;
    serialize(): {position: Coordinate, value: number};
}

interface Grid {
    size: number;
    empty(): (number | null)[];
    availableCells(): Coordinate[];
    cellContent(cell: Coordinate): Tile | null;
    withinBounds(cell: Coordinate): boolean;
    serialize(): {size: number, cells: (any | null)[][]};
}

interface GameManager {
    score: number;
    over: boolean;
    won: boolean;
    grid: Grid;

    restart(): void;
    keepPlaying(): void;
    isGameTerminated(): boolean;
    setup(): void;
    addStartTiles(): void;
    addRandomTile(): void;
    actuate(): void;
    prepareTiles(): void;
    moveTile(tile: Tile, cell: Coordinate): void;
    move(direction: number): void;
    movesAvailable(): boolean;
    positionsEqual(first: Coordinate, second: Coordinate): boolean;
}

/**
 * A mapping from the magic number used in 2048 (the indexes in this array) to the Direction enum.
 */
const Directions: Direction[] = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];

export default class Vanilla2048 implements SiteAdapter {
    private static sideLen = 4;

    private game: GameManager = null;
    private window: Window;

    constructor(win: Window) {
        this.setWindow(win);
    }

    public setWindow(win: Window): void {
        this.window = win;
        this.inject();
    }

    public move(direction: Direction): void {
        this.game.move(Directions.indexOf(direction));
    }

    public getGameState(): GameState {
        return this.game.over ? GameState.LOSS : (this.game.won ? GameState.WIN : GameState.ONGOING);
    }

    public getScore(): number {
        return this.game.score;
    }

    public getCellAt(coord: Coordinate): number | null {
        const content = this.game.grid.cellContent(coord);
        return content === null ? null : Math.log2(content.value);
    }

    public getCells(): number[][] {
        const vanillaGrid = this.game.grid.serialize().cells;
        const output = Utils.arrayEmplace(() => Utils.arrayEmplace(() => 0, Vanilla2048.sideLen), Vanilla2048.sideLen);

        // Swap coords
        for (let x = 0; x < Vanilla2048.sideLen; ++x) {
            for (let y = 0; y < Vanilla2048.sideLen; ++y) {
                const vanillaValue = vanillaGrid[x][y];
                output[y][x] = vanillaValue === null ? 0 : Math.log2(vanillaValue.value);
            }
        }
        return output;
    }

    public reset(): void {
        this.game.restart();
    }

    private inject(): void {
        (document as any).adapter = this;

        // A majority of the following function is from the vanilla 2048 repository itself
        (this.window as any).GameManager.prototype.addRandomTile = function () {
            if (this.grid.cellsAvailable()) {
                var value = Math.random() < 0.9 ? 2 : 4;
                var tile = new ((window as any).Tile)(this.grid.randomAvailableCell(), value);
                this.grid.insertTile(tile);
            }
            if ((document as any).adapter.game === null) {
                (document as any).adapter.game = this;
                console.info(`Binded adapter successfully of type ${typeof this}`);
            }
        };
    }
}