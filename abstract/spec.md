# Lib2048 Specification

## Interfaces and Interactions

| Interface                            | Function                                                                   | Interface Exported                                                      | Interface Consumed                                                      |
| ------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Game Agent<br>_(Game, Web Injector)_ | Executes board moves<br>Reports win/loss<br>Watches score<br>Watches board | Move in direction<br>Get cell at<br>Get current score<br>Get game state | Abort game                                                              |
| Player                               | Interprets board<br>Handles user/AI interaction<br>Reflects player moves   | Abort game                                                              | Get current score<br>Get game state<br>Get cell at<br>Move in direction |

## Module Structures

- `GameEmu` _(Self-sustained 2048 implementation)_
    - `BoardGrid` _(Smart grid containing all cells)_
        - `MatrixArray` _(Smart row of cells capable of performing 2048 folds)_

- `WebInjector` _(Interface to the web (i.e. original) version of 2048, including some of its derivatives such as Doge2048)_
    - **Interface**: `SiteAdapter` _(Defines the interface of all independent adapters of variation websites)_
    - `VanillaAdapter` _(Adapts to the gabrielecirulli.github.io version of 2048)_
    - `DogeAdapter` _(Adapts to the Doge2048 website, which seems to use an outdated version for the core 2048 game logic)_

- `CLI` _(provides an interface to `GameEmu` for human players)_
    - `InputManager` _(Deals with the Node.js Console input API)_
    - `GameWrapper` _(Manages everything other than board depiction)_
    - `BoardPrinter` _(Formats the board grid into human-readable cells in the console)_

- `AI` _(Implements several Artificial Intelligence algorithms that apply to 2048)_
    - `Expectimax` _(An algorithm)_
    - `ABPruning` _(Alpha-Beta Pruning, based on Minimax)_
    - `ML` _(Machine Learning)_
        - `NeuralNet` _(A ML model)_

Note that more AI submodules are to be added in the future.

