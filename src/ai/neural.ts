// Copyright (c) 2017 Michael P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Deep learning based on neural networks

import User from '../user';
import GameAgent from '../game/agent';
import { Direction, GameState } from '../game/agent';
import Utils from '../util';

// Powered by Synaptic
import { Architect, Layer, Neuron, Trainer as SyTrainer } from 'synaptic';

export default class NeuralAI implements User {
    private agent: GameAgent;
    private network: Architect.Perceptron;
    private trainer: Trainer;

    public constructor(boardSize: number = 4) {
        this.network = new Architect.Perceptron(boardSize**2, boardSize**2*2, boardSize**2*2, 4);
        this.trainer = new Trainer(boardSize);
    }

    public bind(agent: GameAgent): void {
        this.agent = agent;
    }

    public train(gameCount: number, trainTrainer: boolean = true): void {
        if (trainTrainer) {
            this.trainer.trainSelf(this.agent);
        }
        if (gameCount <= 0) {
            return;
        }

        const trainingData: TrainingData[] = [];

        let epoch = 1;
        const interval = setInterval(() => {
            this.agent.reset();
            while (this.agent.getGameState() === GameState.ONGOING) {
                const state = this.agent.getCells();

                // For all directions, determine the reward. Result maps index (direction) to value (reward) from the current state.
                // Then reduces to Direction of max value.
                const bestDirection = [0, 1, 2, 3].map(direction => this.trainer.runQnet(state, direction))
                    .reduce((iMax, curr, index, arr) => curr > arr[iMax] ? index : iMax, 0);

                // Add this best direction info to training data
                trainingData.push({
                    input: normalizeGrid(state),
                    output: normalizeMove(bestDirection)
                });

                this.agent.move(bestDirection);
            }
            if (epoch >= gameCount) {
                clearInterval(interval);
            } else {
                ++epoch;
            }
        }, 200);
    }

    public start(): void {

    }

    public stop(): void {

    }

    public reset(): void {

    }

    private getNetworkDecision(state: number[][]): Direction {
        return parseMove(this.network.activate(normalizeGrid(state)));
    }
}

type Experience = {
    state: number[],
    action: Direction,
    reward: number,
    nextState: number[]
};

function normalizeMove(move: Direction) {
    const inputs = [0, 0, 0, 0];
    inputs[move] = 1;
    return inputs;
}

function parseMove(output: number[]): Direction {
    const ints = output.map(num => Math.round(num));
    return ints.some(val => val === 1) ? ints.indexOf(1) : 0;
}

function normalizeGrid(grid: number[][]): number[] {
    const flattened: number[] = [].concat.apply([], grid);
    const max = Math.max(...flattened);
    return flattened.map(num => num / max);
}

type TrainingData = {
    input: number[],
    output: number[]
};

class Trainer {
    private qnet: Architect.Perceptron;
    private qnetData: Experience[] = [];

    public constructor(boardSize: number = 4) {
        this.qnet = new Architect.Perceptron(boardSize**2 + 4, boardSize**2, boardSize**2, 1);
        this.qnet.layers.hidden.forEach(layer => layer.set({
            squash: Neuron.squash.TANH,
            bias: 0
        }));
    }

    public trainSelf(agent: GameAgent, gameCount: number = 30, propagateCount: number = 50): void {

        let epoch = 0;
        const trainLoop = setInterval(() => {
            epoch += 1;
            agent.reset();
            while (agent.getGameState() === GameState.ONGOING) {
                this.qnetData.push(Trainer.getExperience(agent, Math.floor(Math.random() * 4)));
            }
            if (epoch >= gameCount) {
                clearInterval(trainLoop);
                setTimeout(() => this.propagate(propagateCount));
            }
        }, 150);

    }

    public runQnet(state: number[][], move: Direction): number {
        return this.qnet.activate(normalizeGrid(state).concat(normalizeMove(move)))[0] * 500;
    }

    public static getExperience(agent: GameAgent, move: Direction): Experience {
        // Used to store state before getReward, which executes the move
        const state = agent.getCells();
        return {
            state: normalizeGrid(state),
            action: move,
            reward: Trainer.getReward(agent, move),
            nextState: normalizeGrid(agent.getCells())
        };
    }

    public static getReward(agent: GameAgent, move: Direction): number {
        const originalScore = agent.getScore();
        const originalState = agent.getCells().toString();
        const originalVacancy = agent.getEmptyCells().length;
        agent.move(move);
        return originalState === agent.getCells().toString() ?
                -10000 : (agent.getScore() - originalScore) + agent.getEmptyCells().length * 2;
    }

    public static getTrainingData(exp: Experience): TrainingData {
        return {
            input: exp.state.concat(normalizeMove(exp.action)),
            output: [exp.reward / 500]
        };
    }

    private propagate(count: number): void {
        const trainer = new SyTrainer(this.qnet);
        trainer.train(this.qnetData.map(exp => Trainer.getTrainingData(exp)), {
            iterations: count,
        });
        console.log('Done training');
    }
}