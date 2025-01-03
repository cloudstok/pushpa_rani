const sleep = ms => new Promise(r => setTimeout(r, ms));
const { settleBet, settleCallBacks, setCurrentLobby } = require('../bets/bets-message');
const { getPlayerCount } = require('../players/player-message');
const { insertLobbies } = require('./plane-db');
const createLogger = require('../../utilities/logger');
const logger = createLogger('Plane', 'jsonl');
const {read} = require('../../utilities/db-connection');

const initPlane = async (io) => {
    logger.info("lobby started");
    initLobby(io);
}

let odds = {};

const initLobby = async (io) => {
    await getMaxMultOdds(io);
    const lobbyId = Date.now();
    let recurLobbyData = { lobbyId, status: 0, isWebhook: 0}
    setCurrentLobby(recurLobbyData);
    odds.lobby_id = lobbyId;
    odds.start_time = Date.now();
    const start_delay = 7;
    let inc = 1
    const end_delay = 6;
    odds.total_players = await getPlayerCount();
    const max_mult = generateOdds().mult;
    // const max_mult = 100;
    for (let x = 0; x < start_delay; x++) {
        io.emit("plane", `${lobbyId}:${inc}:0`);
        inc++
        await sleep(1000);
    }

    recurLobbyData['max_mult'] = max_mult;
    recurLobbyData['isWebhookData'] = 1;
    setCurrentLobby(recurLobbyData);

    await settleCallBacks(io);

    await sleep(3000);

    let init_val = 1;
    recurLobbyData['status'] = 1;
    setCurrentLobby(recurLobbyData);
    do {
        io.emit("plane", `${lobbyId}:${init_val.toFixed(2)}:1`);
        init_val += 0.01;
        if (init_val < 2) {
            init_val = init_val + 0.01;
        } else if (init_val < 10) {
            init_val = init_val * 1.003;
        } else if (init_val < 50) {
            init_val = init_val * 1.004;
        }
        else {
            init_val = init_val * 1.005;
        }
        recurLobbyData['ongoingMaxMult'] = init_val.toFixed(2);
        setCurrentLobby(recurLobbyData);
        await sleep(100)
    } while (init_val < max_mult);
    odds.max_mult = max_mult

    recurLobbyData['status'] = 2;
    setCurrentLobby(recurLobbyData);
    for (let y = 0; y < end_delay; y++) {
        if(y == 3){
            await settleBet(io, odds)
        }
        io.emit("plane", `${lobbyId}:${max_mult.toFixed(2)}:2`);
        await sleep(1000);
    }
    odds = {}
    const history = { time: new Date(), lobbyId, start_delay, end_delay, max_mult };
    io.emit("history", JSON.stringify(history));
    setCurrentLobby({});
    logger.info(JSON.stringify(history));
    await insertLobbies(history);
    return initLobby(io);
}


const getMaxMultOdds = async (io) => {
    try {
        let odds = await read('SELECT lobby_id, max_mult, created_at from lobbies order by created_at desc limit 30');
        return io.emit('maxOdds', odds);
    } catch (err) {
        console.error(err)
    }
}







//---------------------------
// const fs = require('fs');

const RTP = 9400;// Return to player 97.00%


function generateOdds() {
    const win_per = (Math.random() * 99.00);
    //   const win_per = 99.01;
    let mult = (RTP) / (win_per * 100)
    if (mult < 1.01) {
        mult = 1.00
    }
    return ({ win_per, mult });
}

module.exports = { initPlane, getMaxMultOdds }
