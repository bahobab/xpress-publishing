const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        console.log('Failed to create/connect to Issue');
    } else {
        console.log('Connected to the in-memory SQlite database in Issues')
    }
});

issuesRouter.get('/', (req, res, next) => {
    const seriesId = Number(req.params.seriesId);
    
    db.all(`SELECT * FROM Series WHERE id=${seriesId};`, (err, series) => {
        if (err) {
            next(err);
            return;
        } else {
            if (!series) {
                res.sendStatus(404);
                return;
            }
            // next();
            db.all(`SELECT *
                        FROM Issue
                            WHERE series_id = ${seriesId};`, 
            (error, issues) => {
                if (error) {
                    next(err);
                } else {
                    return res.status(200).send({issues: issues});
                }
            });
        }
    });
});

issuesRouter.post('/', (req, res, next) => {
    const seriesId = Number(req.params.seriesId);
    const {name, issueNumber, publicationDate, artistId} = req.body.issue;
    
    if (!(name && issueNumber && artistId)) {
        res.sendStatus(400);
        return;
    } else {
        db.get(`SELECT * FROM Artist WHERE id=${artistId};`,
            (err, artist) => {
                if (err) {
                    res.sendStatus(400);
                    return;
                }
            }
        );
        const values = {
            $name: name,
            $in: Number(issueNumber),
            $aid: Number(artistId),
            $sid: Number(seriesId),
            $pd: publicationDate
        };
        const query = `INSERT INTO Issue
                            (
                                name,
                                issue_number,
                                publication_date,
                                artist_id,
                                series_id
                            )
                                VALUES (
                                    $name,
                                    $in,
                                    $pd,
                                    $aid,
                                    $sid
                                );`;
        db.run(query, values, function(err) {
            if (err) {
                next(err);
                return;
            } else {
                db.get(`SELECT * FROM Issue WHERE id=${this.lastID}`,
                    (err, issue) => {
                        if (err) {
                            next(err);
                            return;
                        } else {
                            res.status(201).send({issue: issue});
                        }
                });
            }
        })
    }
});

issuesRouter.param('/issueId', (req, res, next) => {
    const query = `SELECT *
                        FROM Issue
                            WHERE id=${Number(re.params.issueId)};`;

    db.get(query, (err, issue) => {
        if (err) {
           next();
        } else {
            if (!issue) {
                res.sendStatus(404);
                return;
            }
            req.issue = issue;
            next();
        }
    });
});

issuesRouter.put('/:id', (req, res, next) => {
    const issueId = Number(req.params.id)
    const seriesId = Number(req.params.seriesId);
    const {name, issueNumber, publicationDate, artistId} = req.body.issue;

    if (!(name && issueNumber && artistId)) {
        res.sendStatus(400);
        return;
    } else {
        db.get(`SELECT * FROM Artist WHERE id=${artistId};`,
                (err, artist) => {
                    if (err) {
                        res.sendStatus(400);
                        return;
                    }
                }
        );

        const query = `UPDATE Issue
                            SET
                                name=$name,
                                issue_number=$in,
                                publication_date=$pd,
                                artist_id=$aid,
                                series_id=$sid;`;
        const values = {
            $name: name,
            $in: issueNumber,
            $pd: publicationDate,
            $aid: artistId,
            $sid: seriesId
        };

        db.run(query, values, (err) => {
            if (err) {
                next(err);
                return;
            } else {
                db.get(`SELECT * FROM Issue WHERE id=${issueId};`,
                    (err, updatedIssue) => {
                        if (err) {
                            next(err);
                            return;
                        }
                        res.status(200).send({issue: updatedIssue});
                });
            }
        });
    }    
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE id=${req.params.issueId};`, (err) => {
        if (err) {
            next(err)
        } else {
            res.sendStatus(204);
        }
    });

});

module.exports = issuesRouter;