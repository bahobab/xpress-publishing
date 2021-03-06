const express = require('express');
const artistRouter = express.Router();

const sqlite3 = require('sqlite3');

// const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database in artists');
  });

artistRouter.get('/', (req, res, next) => {
    const query = `SELECT * FROM Artist WHERE is_currently_employed = 1;`;
    
    db.all(query, (err, artists) => {
        if (err) next(err);
        // console.log('GET /api/artists >>>', artists, err);
        res.status(200).json({artists});
    })
});

artistRouter.param('id', (req,res, next, id) => {
    const query = `SELECT *
                        FROM Artist
                            WHERE id = ${Number(id)};`
    db.get(query, (err, artist) => {
        if (err) {
            next(err);
        } else {
            if (!artist) {
                res.status(404).send(); // or res.sendStatus(404)
                return;
            }
            req.artist = artist;
            next();
        }
    });
});

artistRouter.get('/:id', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

artistRouter.post('/', (req, res, next) => {
    const newArtist = req.body.artist;
    if (!(newArtist.name && newArtist.dateOfBirth && newArtist.biography)) {
        res.sendStatus(400);
    } else {
        if (newArtist.isCurrentlyEmployed === undefined) newArtist.isCurrentlyEmployed = 1;
        const {name, dateOfBirth, biography, isCurrentlyEmployed} = newArtist;
        const values = {
            $name: name,
            $dob: dateOfBirth,
            $bio: biography,
            $ice: isCurrentlyEmployed
        };

        const query = `INSERT INTO Artist
                           (name, date_of_birth, biography, is_currently_employed)
                               VALUES ($name, $dob, $bio, $ice);`;
        
        db.run(query, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT *
                            FROM Artist
                                WHERE Artist.id=?;`, this.lastID, (error, artist) => { //  WHERE Artist.id=${this.lastID}
                    if (error) {
                        next(error);
                        return;
                    }
                    res.status(201).json({artist: artist}); // artist:artists[artists.length-1]
                })
            }
        });
    };
});

artistRouter.put('/:id', (req, res, next) => {
    const artistUpdate = req.body.artist;
    const artistId = Number(req.params.id);

    if (!(artistUpdate.name && artistUpdate.dateOfBirth && artistUpdate.biography)) {
        res.sendStatus(400);
    } else {
        const {name, dateOfBirth, biography, isCurrentlyEmployed} = artistUpdate;
        const values = {
            $id: artistId,
            $name: name,
            $dob: dateOfBirth,
            $bio: biography,
            $ice: isCurrentlyEmployed
        };
        const query = `UPDATE Artist
                            SET 
                                name=$name,
                                date_of_birth=$dob,
                                biography=$bio,
                                is_currently_employed=$ice
                                    WHERE Artist.id=$id;`;
        db.run(query, values, function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Artist WHERE id=${artistId};`, (err, updatedArtist) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).send({artist:updatedArtist});
                    }
                });
            }
        })
    }
});

artistRouter.delete('/:id', (req, res, next) => {
    const artistId = Number(req.params.id);
    // console.log('id>>>>', artistId);
    const query = `UPDATE Artist
                        SET
                            is_currently_employed=$ice
                                WHERE
                                    Artist.id=$val;`;
    db.run(query, {$ice: 0, $val: artistId}, function(error) {
        if (error) {
            next(error);
            return;
        } else {
            db.get(`SELECT * FROM Artist WHERE id=${artistId};`, (err, deletedArtist) => {
                if (err) {
            // console.log('GET ERR >>>>', err);
                    
                    next(err);
                    return;
                } else {
            // console.log('SUCCESS >>>>', deletedArtist);
                    
                    res.status(200).send({artist: deletedArtist});
                }
            });
        }
    });
})
module.exports = artistRouter;
