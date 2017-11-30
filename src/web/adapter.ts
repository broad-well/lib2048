// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// The SiteAdapter interface as described in the *Lib2048 Specification*
// Also serves as the source of the injection code.

import GameAgent from '../game/agent';

export default interface SiteAdapter extends GameAgent {
    setWindow(win: Window): void;
}

// ---

import VanillaAdapter from './adapters/vanilla';
import AlphaBeta from '../ai/alphabeta';
import * as commonAI from '../ai/common';

const adapter = new VanillaAdapter(window);
(window as any).adapter = adapter;
const ai = new AlphaBeta();
ai.bind(adapter);
(window as any).lib2048 = {
    ai: ai,
    commonAI: commonAI
};