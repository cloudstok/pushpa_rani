const { createPool, format } = require('mysql2/promise');
require('dotenv').config();
const createLogger = require('./logger');
const logger = createLogger('Database');
const { appConfig } = require('./app-config');
const { host, port, database, password, user, retries, interval } = appConfig.dbConfig;
const dbConfig = {
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0
};

const maxRetries = +retries;
const retryInterval = +interval;

let pool;

const createDatabasePool = async (config) => {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            pool = createPool(config);
            logger.info("DATABASE POOLS CREATED AND EXPORTED");
            return;
        } catch (err) {
            attempts += 1;
            logger.error(`DATABASE CONNECTION FAILED. Retry ${attempts}/${maxRetries}. Error: ${err.message}`);
            if (attempts >= maxRetries) {
                logger.error("Maximum retries reached. Could not connect to the database.");
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, retryInterval));
        }
    }
};

const read = async (query, params = []) => {
    if (!pool) throw new Error('Database pool is not initialized');
    const connection = await pool.getConnection();
    let attempts = 0;
    try {
        const [results] = await connection.execute(query, params);
        return results;
    } catch (err) {
        connection.destroy();
        attempts += 1;
        logger.warn(`Read Query failed. Retry ${attempts}/${maxRetries}. Error: ${err.message}`);
        if (attempts >= maxRetries) throw err;
        await new Promise(res => setTimeout(res, 100)); // Small delay before retry
    }
    finally {
        connection.release(); // Release the connection back to the pool
    }
};

const write = async (query, params = []) => {
    if (!pool) throw new Error('Database pool is not initialized');
    const connection = await pool.getConnection();
    let attempts = 0;
    do{
    try {
        const undefinedIndex = params.findIndex(e=>e===undefined);
        if(undefinedIndex !==-1)
            logger.error(JSON.stringify({err:"Undefined params in sql",query,params}));
        const finalQuery = format(query,params)
        const [results] = await connection.execute(finalQuery);
        return results;
    } catch (err) {
        console.error(err);
        connection.destroy();
        attempts += 1;
        logger.warn(`Write Query failed. Retry ${attempts}/${maxRetries}. Error: ${err.message}`);
        await new Promise(res => setTimeout(res, 200)); // Small delay before retry;
    }
    finally {
        connection.release(); // Release the connection back to the pool
    }
    }while(attempts < 5)
};

const checkDatabaseConnection = async () => {
    if (!pool) {
        await createDatabasePool(dbConfig);
    }
    logger.info("DATABASE CONNECTION CHECK PASSED");
};

module.exports = {
    read,
    write,
    checkDatabaseConnection,
};
