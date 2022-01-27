let dbobj = {}
const db = require("better-sqlite3")("./database.sqlite")

const users = db
    .prepare(
        "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'users';"
    )
    .get();
if (!users["count(*)"]) {
    db
        .prepare(
            "CREATE TABLE users (id TEXT PRIMARY KEY, autosaved TEXT,saved TEXT, bestGameScore TEXT, bestGameMax TEXT);"
        )
        .run();

    db.prepare("CREATE UNIQUE INDEX idx_users_id ON users (id);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
}


dbobj.getUser = db.prepare(
    "SELECT * FROM users WHERE id = ?"
);
dbobj.deleteUser = db.prepare(
    "DELETE FROM users WHERE id = ?"
);
dbobj.setUser = db.prepare(
    "INSERT OR REPLACE INTO users (id, autosaved,saved,bestGameScore,bestGameMax) VALUES (@id, @autosaved,@saved,@bestGameScore,@bestGameMax);"
)
    //This is a very shitty Database, im too lazy ;_; and it works so yes

function getDB(id) {
    let data = dbobj.getUser.get(id);
    if (!data) {
        data = {
            id: id,
            autosaved: {},
            saved: new Array(10),
            bestGameScore: {},
            bestGameMax: {}
        }
    }
    else {
        data.autosaved = JSON.parse(data.autosaved);
        data.saved = JSON.parse(data.saved);
    }
    if (!data.bestGameMax) data.bestGameMax = "{}";
    if (!data.bestGameScore) data.bestGameScore = "{}";
    if (typeof data.saved == "object") {
        let oldData = Object.values(data.saved)
        data.saved = new Array(10);
        for (let i = 0; i < 10;i++) {
            if(oldData[i])data.saved[i]=oldData[i]
        }
        
    }
    return data;

}
dbobj.getDB = getDB;


module.exports = {dbobj, db}
