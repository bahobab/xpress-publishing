const sqlite3 = require('sqlite3');

// const db = new sqlite3.Database('./database.sqlite');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS Artist
            (
                id integer NOT NULL,
                name text NOT NULL,
                date_of_birth text NOT NULL,
                biography text NOT NULL,
                is_currently_employed integer DEFAULT 1,
                PRIMARY KEY('id')
            );`
);

db.run(`CREATE TABLE IF NOT EXISTS Series
            (
                id INTEGER NOT NULL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL
            );`
    );

// db.run(`DROP TABLE IF EXISTS Issue;`);
// https://stackoverflow.com/questions/8002756/sqlite-composite-key-2-foreign-keys-link-table

db.run(`CREATE TABLE Issue
            (
                id INTEGER NOT NULL PRIMARY KEY,
                name TEXT NOT NULL,
                issue_number INTEGER NOT NULL,
                publication_date TEXT NOT NULL,
                artist_id INTEGER NOT NULL,                
                series_id INTEGER NOT NULL,
                FOREIGN KEY(artist_id) REFERENCES Artist(id),
                FOREIGN KEY(series_id) REFERENCES Series(id)
            );`
    );
