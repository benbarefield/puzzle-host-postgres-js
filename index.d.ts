import {type Pool} from 'pg';

export declare function sessionStarter(connectionString?: string): Promise<any>

export interface Puzzle {
  id: number
  name: string
  owner: string
}

export declare function getPuzzleById(pg : Pool, id: number) : Promise<Puzzle>
export declare function createPuzzle(pg: Pool, name: string, ownerId: string): Promise<number>
export declare function getPuzzlesForUser(pg: Pool, userId: string): Promise<Puzzle[]>
export declare function verifyPuzzleOwnership(pg: Pool, puzzleId: number, userId: string): Promise<boolean>
export declare function markPuzzleAsDeleted(pg: Pool, puzzleId: number): Promise<boolean>
export declare function updatePuzzle(pg: Pool, puzzleId: number, name: string): Promise<boolean>

export interface PuzzleAnswer {
  id: number
  value: string
  puzzle: number
  answerIndex: number
}

export declare function createPuzzleAnswer(pg: Pool, puzzle: number, value: string, answerIndex: number): Promise<number>
export declare function getPuzzleAnswerById(pg: Pool, id: number) : Promise<PuzzleAnswer>
export declare function removePuzzleAnswer(pg: Pool, id: number): Promise<boolean>
export declare function updatePuzzleAnswer(pg: Pool, id: number, value: string | undefined, answerIndex: number | undefined) : Promise<boolean>
export declare function getAnswersForPuzzle(pg: Pool, puzzleId: number) : Promise<PuzzleAnswer[]>

export interface TestingHarness {
  dataAccess: Pool,
  teardown: () => Promise<void>
}

export declare function testingStart(): TestingHarness
