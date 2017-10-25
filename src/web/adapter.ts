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
const adapter = new VanillaAdapter(window);
(window as any).adapter = adapter;