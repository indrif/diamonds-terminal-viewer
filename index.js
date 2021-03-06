var request = require('request');
var term = require( 'terminal-kit' ).terminal ;

const API_URL = "http://localhost:3000/api/boards/1";
// const BOT_AVATARS = ["🤖", "🦁", "🐙", "🦑", "🦀", "🐌", "🐥", "🦞", "🐭", "🐹", "🐰", "🐶", "🐺", "🦊", "🐵", "🐸", "🙊", "🐯", "🦁", "🐮", "🐷", "🐻", "🐼", "🐲", "🐨", "🦄"];
const BOT_AVATARS = ["1", "2", "3", "4", "5"];
const botAvatarForId = {};
const avatarsInUse = {};
const carryingDiamonds = {};
const points = {};
const timeLeft = {};
let maxLengthName = 0;

function clear() {
    // console.log('\033c');
    console.clear();
}

function getBot(board, x, y) {
    return board.gameObjects.find(b => (b.type == "BotGameObject" || b.type == "DummyBotGameObject") && b.position.x === x && b.position.y === y);
}

function getBase(board, x, y) {
    return board.gameObjects.find(b => b.type == "BaseGameObject" && b.position.x === x && b.position.y === y);
}

function getDiamond(board, x, y) {
    return board.gameObjects.find(d => d.type == "DiamondGameObject" && d.position.x === x && d.position.y === y);
}

function getDiamondButton(board, x, y) {
    return board.gameObjects.find(d => d.type === "DiamondButtonGameObject" && d.position.x === x && d.position.y === y);
}

function getTeleporter(board, x, y) {
    return board.gameObjects.find(d => d.type === "TeleporterGameObject" && d.position.x === x && d.position.y === y);
}

function getNextAvailableAvatar() {
    return BOT_AVATARS.find(a => !(a in avatarsInUse));
}

function getReservedAvatar(bot) {
    if (!(bot.id in botAvatarForId)) {
        const avatar = getNextAvailableAvatar();
        botAvatarForId[bot.id] = avatar;
        avatarsInUse[avatar] = `${bot.id}`;
    }
    return botAvatarForId[bot.id];
}

function render(board) {
    term.moveTo(1, 4);
    // term.tex
    const cellSize = 2;
    term("┏" + "".padEnd(board.width * cellSize, "━") + "┓\n");
    for(var y = 0; y < board.height; y++) {
      term("┃");
      for(var x = 0; x < board.width; x++) {
        let spacesLeft = cellSize;
        const bot = getBot(board, x, y);
        const base = getBase(board, x, y);
        const diamond = getDiamond(board, x, y);
        const teleporter = getTeleporter(board, x, y);
        const button = getDiamondButton(board, x, y);
        if (base) {
            term.bold("B");
            spacesLeft -= 1;
        }
        if (bot) {
            const c = getReservedAvatar(bot)
            term.bold(c);
            spacesLeft -= c.length;

            points[c] = bot.properties.score;
            carryingDiamonds[c] = bot.properties.diamonds;
            timeLeft[c] = bot.properties.millisecondsLeft;
            maxLengthName = Math.max(maxLengthName, bot.botName);
        }
        if (diamond) {
            const c = "*"; //diamond.points === 1 ? "*" : "🔶";
            if (diamond.points === 1) {
                term.brightBlue(c);
            } else {
                term.red(c);
            }
            spacesLeft -= c.length;
        }
        if (button) {
            const c = "#";
            term.green(c);
            spacesLeft -= c.length;
        }
        if (teleporter) {
            const c = "O";
            term.bold.yellow(c);
            spacesLeft -= c.length;
        }
        term("".padEnd(spacesLeft, " "));
      }
      term("┃\n");
    }
    term("┗" + "".padEnd(board.width * cellSize, "━") + "┛\n\n");
    for(var key in avatarsInUse) {
        term(key, " [",
            "".padEnd(carryingDiamonds[key], "*"),
            "".padEnd((5 - carryingDiamonds[key]), "-"),
            "] : ", avatarsInUse[key].padEnd(maxLengthName, " "), " ", `${points[key]}`.padStart(4, " "), " ", Math.round(timeLeft[key] / 1000), "s\n");
    }
    term("".padEnd(60) + "\n");
    term("".padEnd(60) + "\n");
    term("".padEnd(60) + "\n");
    term("".padEnd(60) + "\n");
    term("".padEnd(60) + "\n");
}

function rerender() {
    request(API_URL, (err, response, body) => {
        var result = JSON.parse(body);
        console.clear();
        term.moveTo(1, 1);
        term("Diamonds Terminal Viewer\n");
        term(`Api url: ${API_URL}\n\n`)
        render(result);
    })
}

setInterval(rerender, 250);

// const cellSize = 3;
//     //"┓┗┛┏┃━"
//     const ret = ["┏" + "".padEnd(this.width * cellSize, "━") + "┓"];
//     for(var y = 0; y < this.height; y++) {
//       const line = ["┃"];
//       for(var x = 0; x < this.width; x++) {
//         const gameObjects = this.gameObjects.filter(g => g.x === x && g.y === y);
//         var existing = gameObjects.map(g => g.toChar()).join("").padEnd(cellSize, " ");
//         line.push(existing);
//       }
//       line.push("┃");
//       ret.push(line.join(""));
//     }
//     ret.push("┗" + "".padEnd(this.width * cellSize, "━") + "┛")
//     return ret.join("\n");
