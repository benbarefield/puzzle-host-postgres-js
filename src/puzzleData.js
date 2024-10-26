async function getPuzzleById(pg, id) {
  if(isNaN(+id)) { return null; }
  const result = await pg.query("SELECT name, owner FROM puzzles WHERE id = $1 AND deleted != true", [+id]);

  if(!result.rows.length) { return null; }

  return {
    id,
    name: result.rows[0].name,
    owner: result.rows[0].owner,
  };
}

async function createPuzzle(pg, name, ownerId) {
  const result = await pg.query("INSERT INTO puzzles (name, owner) VALUES ($1, $2) RETURNING id", [name, ownerId]);

  return result.rows[0].id.toString();
}

// todo: pagination
async function getPuzzlesForUser(pg, userId) {
  const result = await pg.query("SELECT id, name FROM puzzles WHERE owner=$1", [userId]);

  return result.rows.map(r => ({
    id: r.id.toString(),
    name: r.name,
    owner: userId,
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

exports.getPuzzleById = getPuzzleById;
exports.createPuzzle = createPuzzle;
exports.getPuzzlesForUser = getPuzzlesForUser;
exports.verifyPuzzleOwnership = verifyPuzzleOwnership;
exports.markPuzzleAsDeleted = markPuzzleAsDeleted;
exports.updatePuzzle = updatePuzzle;
