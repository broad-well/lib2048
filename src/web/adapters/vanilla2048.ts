// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import SiteAdapter from '../adapter';
import { Direction, GameState } from '../../game/agent';
import { Coordinate, Cell } from '../../game/grid';

interface Tile {
    x: number;
    y: number;
    value: number;

    savePosition(): void;
    updatePosition(newPosition: Coordinate): void;
    serialize(): {position: Coordinate, value: number};
}

interface Grid {
    size: number;
    empty(): (number | null)[];
    availableCells(): Coordinate[];
    cellContent(cell: Coordinate): number | null;
    withinBounds(cell: Coordinate): boolean;
    serialize(): {size: number, cells: (number | null)[][]};
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

class Vanilla2048 implements SiteAdapter {
    private game: GameManager;

    constructor(htmlRoot: Document) {
        this.setHtmlDocument(htmlRoot);
    }

    public setHtmlDocument(htmlRoot: Document): void {
        let self = this;
        const html = htmlRoot as any;

        // A majority of the following function is from the vanilla 2048 repository itself
        html.GameManager.prototype.restart = function() {
            this.storageManager.clearGameState();
            this.actuator.continueGame(); // Clear the game won/lost message
            this.setup();
            if (self.game !== this) {
                self.game = this;
                console.log('Bind with lib2048 adapter complete, this.game now of type ' + typeof self.game);
            }
        }
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
        return this.game.grid.cellContent(coord);
    }

    public getCells(): number[][] {
        return this.game.grid.serialize().cells.map(row => row.map(item => item || 0));
    }

}