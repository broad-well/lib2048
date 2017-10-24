// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// The SiteAdapter interface as described in the *Lib2048 Specification*

import GameAgent from '../game/agent';

interface SiteAdapter extends GameAgent {
    constructor(htmlRoot: Document): SiteAdapter;

    setHtmlDocument(doc: Document): void;
    getHtmlDocument(): Document;
}