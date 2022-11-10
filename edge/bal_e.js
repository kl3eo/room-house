import { ApiPromise, WsProvider } from '@polkadot/api';
import minimist from "minimist";

import pkg from '@edgeware/node-types';
const { spec } = pkg;

const ApiOptions = {
  provider : new WsProvider('ws://localhost:9951'),
  ...spec,
};


//const Alice = 'hsm6TTScxLNa5fnEUdw3o9X9LWnLQYPKt7mwCDxBnPemNBE';

const args = minimist(process.argv.slice(2))
const Alice = args['address'];

async function main () {

  const api = await ApiPromise.create(ApiOptions);
  const unsub = await api.query.system.account.multi([Alice], (balances) => {
    const [{ data: balance0 }] = balances;

    console.log(`${balance0.free}`);
    unsub();
    process.exit(0);
  });

}

main().catch(console.error);
