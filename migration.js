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