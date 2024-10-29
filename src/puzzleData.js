async function getPuzzleById(pg, id) {
  if(isNaN(+id)) { return null; }
  const result = await pg.query("SELECT name, owner, last_guess_date, last_guess_result FROM puzzles WHERE id = $1 AND deleted != true", [+id]);

  if(!result.rows.length) { return null; }

  return {
    id,
    name: result.rows[0].name,
    owner: result.rows[0].owner,
    lastGuessDate: result.rows[0].last_guess_date ? new Date(result.rows[0].last_guess_date) : undefined,
    lastGuessResult: result.rows[0].last_guess_result || undefined,
  };
}

async function createPuzzle(pg, name, ownerId) {
  const result = await pg.query("INSERT INTO puzzles (name, owner) VALUES ($1, $2) RETURNING id", [name, ownerId]);

  return result.rows[0].id.toString();
}

// todo: pagination
async function getPuzzlesForUser(pg, userId) {
  const result = await pg.query("SELECT id, name, last_guess_date, last_guess_result FROM puzzles WHERE owner=$1", [userId]);

  return result.rows.map(r => ({
    id: r.id.toString(),
    name: r.name,
    owner: userId,
    lastGuessDate: r.last_guess_date ? new Date(r.last_guess_date) : undefined,
    lastGuessResult: r.last_guess_result || undefined,
  }));
}

async function verifyPuzzleOwnership(pg, puzzleId, userId) {
  if(isNaN(+puzzleId)) { return null; }
  const puzzle = await getPuzzleById(pg, puzzleId);

  if(!puzzle) { return null; }

  return puzzle.owner === userId;
}

async function markPuzzleAsDeleted(pg, puzzleId) {
  if(isNaN(+puzzleId)) { return false; }
  const result = await pg.query("UPDATE puzzles SET deleted = true WHERE id = $1", [+puzzleId]);

  return result.rowCount > 0;
}

async function updatePuzzle(pg, puzzleId, name) {
  if(isNaN(+puzzleId)) { return false; }
  const result = await pg.query(`UPDATE puzzles SET name = $1 where id = $2`, [name, +puzzleId]);

  return result.rowCount > 0;
}

async function checkPuzzleGuess(pg, puzzleId, guess) {
  if(isNaN(+puzzleId)) { return null; }

  const puzzle = await getPuzzleById(pg, +puzzleId);
  if(!puzzle) { return null; }

  const result = await pg.query("SELECT $1 = (SELECT ARRAY(SELECT value FROM puzzle_answers WHERE puzzle = $2 ORDER BY answer_index ASC)) as answer", [guess, +puzzleId]);
  const answerCorrect = result.rows[0].answer;

  await pg.query("UPDATE puzzles SET last_guess_date = $1, last_guess_result = $2 WHERE id = $3", [Date.now(), answerCorrect, +puzzleId]);

  return answerCorrect;
}

exports.getPuzzleById = getPuzzleById;
exports.createPuzzle = createPuzzle;
exports.getPuzzlesForUser = getPuzzlesForUser;
exports.verifyPuzzleOwnership = verifyPuzzleOwnership;
exports.markPuzzleAsDeleted = markPuzzleAsDeleted;
exports.updatePuzzle = updatePuzzle;
exports.checkPuzzleGuess = checkPuzzleGuess;
