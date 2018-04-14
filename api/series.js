const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');

const issuesRouter = require('./issues');

seriesRouter.use('/:seriesId/issues', issuesRouter);

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (error) => {
    if (error) {
        console.log('Error Creating/Connecting to Series database', error);
    } else {
        console.log('Connected to the in-memory SQlite database in Series');
    }
})

seriesRouter.get('/', (req, res, next) => {
    const query = `SELECT * FROM Series`;
    db.all(query, (err, series) => {
        if (err) {
            next(err);
            return;
        } else {
            res.status(200).json({series: series});
        }
    })
});

seriesRouter.param('id', (req, res, next, seriesId) => {
    const query = `SELECT *
                        FROM Series
                            WHERE
                                id=$id;`;
    db.get(query, {$id: seriesId}, (err, series) => {
        if (err) {
            next(err);
        } else {
            if (!series) {
                res.status(404).send();
                return;
            }
            req.series = series;
            next();
        }
    });
});

seriesRouter.get('/:id', (req, res, next) => {
    res.status(200).json({series: req.series});
})

seriesRouter.post('/', (req, res, next) => {
    const {name, description} = req.body.series;

    if (!(name && description)) { // refactor DRY
        res.sendStatus(400);
        return;
    } else {
        const query = `INSERT INTO Series
                            (name, description)
                                VALUES
                                    ($name, $desc);`;

        db.run(query, {$name: name, $desc: description}, function(err) {
            if (err) {
                next(err);
                return;
            } else {
                db.get(`SELECT * FROM Series WHERE id=${this.lastID};`, (err, newSeries) => {
                    if (err) {
                        next(err);
                        return;
                    } else {
                        res.status(201).send({series: newSeries});
                    }
                });
            }
        });
    }
});

seriesRouter.put('/:id', (req, res, next) => {
    const seriesId = Number(req.params.id);
    const {name, description} = req.body.series;

    if (!(name && description)) { // refactor DRY
        res.sendStatus(400);
        return;
    }
    const query = `UPDATE Series
                        SET
                            name=$name,
                            description=$desc
                                WHERE id=$id;`;
    db.run(query,
            {
                $name: name,
                $desc: description,
                $id: seriesId
            }, (err) => {
                if (err) {
                    next(err);
                    return;
                } else {
                    db.get(`SELECT * FROM Series WHERE id=${seriesId};`, (err, updatedSeries) => {
                        if (err) {
                            next(err);
                            return;
                        } else {
                            res.status(200).send({series: updatedSeries});
                        }
                    });
                }
            });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    const seriesId = Number(req.params.seriesId);
    db.all(`SELECT * FROM Issue WHERE series_id=${seriesId};`,
        (err, issues) => {
            if (err) {
                next(err);
                return;
            }
            if (!issues) {
                next();
                return;
            }

            db.run(`DELETE FROM Series WHERE id=${seriesId};`,
                (err) => {
                    if (err) {
                        res.sendStatus(400);
                        return;
                    }
                    res.sendStatus(204);
                }
            );
        }
    );
});


module.exports = seriesRouter;