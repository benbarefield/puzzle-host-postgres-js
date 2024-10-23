async function createPuzzleAnswer(pg, puzzle, value, answerIndex) {
  const client = await pg.connect();

  let newId = -1;
  try {
    await client.query("BEGIN");
    await client.query('UPDATE puzzle_answers SET answer_index = answer_index + 1 WHERE answer_index >= $1', [answerIndex]);
    const result = await client.query('INSERT INTO puzzle_answers (puzzle, value, answer_index) VALUES ($1, $2, $3) RETURNING id', [puzzle, value, answerIndex]);
    newId = result.rows[0].id
    await client.query("COMMIT");
  }
  catch(e) {
    await client.query("ROLLBACK");
    throw e;
  }
  finally {
    client.release();
  }

  return newId;
}

async function getPuzzleAnswerById(pg, id) {
  const result = await pg.query('SELECT value, puzzle, answer_index from puzzle_answers WHERE id = $1', [id]);

  if(!result.rows.length) { return null; }

  return {
    id,
    value: result.rows[0].value,
    puzzle: result.rows[0].puzzle,
    answerIndex: result.rows[0].answer_index,
  };
}

async function removePuzzleAnswer(pg, id) {
  const currentRecord = await getPuzzleAnswerById(pg, id);
  if(!currentRecord) {
    return false;
  }

  const client = await pg.connect();
  try {
    await client.query("BEGIN");
    await client.query('UPDATE puzzle_answers SET answer_index = answer_index - 1 WHERE answer_index > $1', [currentRecord.answerIndex]);
    await pg.query("DELETE from puzzle_answers WHERE id = $1", [id]);
    await client.query("COMMIT");
  }
  catch(e) {
    await client.query("ROLLBACK");
    throw e;
  }
  finally {
    client.release();
  }

  return true;
}

async function updatePuzzleAnswer(pg, id, value, answerIndex) {
  let updateString = "";
  let updates = [];
  if(value !== undefined) {
    updates.push(value);
    updateString += ` value = $${updates.length} `;
  }
  if(answerIndex !== undefined) {
    if(updates.length) updateString += ",";
    updates.push(answerIndex);
    updateString += ` answer_index = $${updates.length} `;
  }

  if(updates.length === 0) {
    return true;
  }

  updates.push(id);
  if(answerIndex === undefined) {
    const result  = await pg.query(`UPDATE puzzle_answers SET ${updateString} WHERE id = $${updates.length}`, updates);
    return result.rowCount > 0;
  }

  const current = await getPuzzleAnswerById(pg, id);
  if(!current) { return false; } // todo: test?
  if(current.answerIndex === answerIndex && updates.length === 2) {
    return true;
  }
  const client = await pg.connect();
  try {
    await client.query("BEGIN");

    if(answerIndex < current.answerIndex) {
      await client.query('UPDATE puzzle_answers SET answer_index = answer_index + 1 WHERE answer_index <= $1', [answerIndex]);
    } else {
      await client.query('UPDATE puzzle_answers SET answer_index = answer_index - 1 WHERE answer_index >= $1', [answerIndex]);
    }

    await client.query(`UPDATE puzzle_answers SET ${updateString} WHERE id = $${updates.length}`, updates);
    await client.query("COMMIT");
  }
  catch(e) {
    await client.query("ROLLBACK");
    throw e;
  }
  finally {
    client.release();
  }

  return true;
}

async function getAnswersForPuzzle(pg, puzzleId) {
  const result = await pg.query('SELECT id, value, answer_index from puzzle_answers WHERE puzzle=$1', [puzzleId]);

  return result.rows.map(r => ({
    id: r.id,
    value: r.value,
    answerIndex: r.answer_index,
    puzzle: puzzleId
  }));
}

exports.createPuzzleAnswer = createPuzzleAnswer;
exports.getPuzzleAnswerById = getPuzzleAnswerById;
exports.removePuzzleAnswer = removePuzzleAnswer;
exports.updatePuzzleAnswer = updatePuzzleAnswer;
exports.getAnswersForPuzzle = getAnswersForPuzzle;
