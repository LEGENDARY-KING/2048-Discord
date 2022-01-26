let dbobj = {}
const db = require("better-sqlite3")("./database.sqlite")

const guilds = db
    .prepare(
        "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'guilds';"
    )
    .get();
if (!guilds["count(*)"]) {
    db
        .prepare(
            "CREATE TABLE guilds (id TEXT PRIMARY KEY, voicechannels TEXT);"
        )
        .run();

    db.prepare("CREATE UNIQUE INDEX idx_guilds_id ON guilds (id);").run();
    db.pragma("synchronous = 1");
    db.pragma("journal_mode = wal");
}
dbobj.getGuild = db.prepare(
    "SELECT * FROM guilds WHERE id = ?"
);
dbobj.deleteGuild = db.prepare(
    "DELETE FROM guilds WHERE id = ?"
);
dbobj.setGuild = db.prepare(
    "INSERT OR REPLACE INTO guilds (id, voicechannels) VALUES (@id, @voicechannels);"
)
    //This is a very shitty Database, im too lazy ;_; and it works so yes

function getDB(id) {
    let data = dbobj.getGuild.get(id);
    if (!data) {
        data = {
            id: id,
            voicechannels: []
        }
    }
    else data.voicechannels = JSON.parse(data.voicechannels);
    return data

}
dbobj.getDB = getDB;


module.exports = dbobj
