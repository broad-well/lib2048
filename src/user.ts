// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { GameAgent } from './game/agent';

export default interface GameUser {
    bind(agent: GameAgent): void;
    start(): void;
    stop(): void;
    reset(): void;
}