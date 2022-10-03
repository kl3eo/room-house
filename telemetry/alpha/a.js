import WebSocket from 'ws';
import randomInteger from 'random-int';
//import * as db from './queries.js'
import pg from 'pg';
const pool = new pg.Pool({
     user: "postgres",
     host: "localhost",
     database: "people",
     password: "password",
     port: 5432,
});

const getSocketMessages = () => {
   return new Promise((resolve) => {
      pool.query(
"select distinct apos_temp.name as session, apos_temp.ip as ip, date_trunc('second',(current_timestamp-apos_temp.date_and_time)::interval)::text as ago, apos_temp.date_and_time, nodes.av_type, nodes.name, nodes.city, nodes.country, apos_temp.nump, apos_temp.anno, apos_temp.curip from apos_temp, nodes where apos_temp.status='t' and current_timestamp-apos_temp.date_and_time < '2 min' and apos_temp.ip=nodes.ip and date_and_time=(select max(date_and_time) from apos_temp where apos_temp.ip = nodes.ip and nump < 2 group by ip) order by nump, date_and_time desc limit 100",
	(error, results) => {
            if (error) {
               throw error;
            }
            resolve(results.rows);
          }
      );
   });
};

const wss = new WebSocket.Server({ port: 8401 });

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

wss.on('connection', async (ws) => {
    ws.on('message', async (message) => {
        console.log(`${message}`);
    })

    const emitMostRecentMessges = () => {
      getSocketMessages()
      .then((result) => ws.send(JSON.stringify(result)))
      .catch(console.log);
    };

    while (true) {
	await sleep(1500);
	//console.log('ha!');
	emitMostRecentMessges();
    }
});
