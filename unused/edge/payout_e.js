import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import minimist from "minimist";

import pkg from '@edgeware/node-types';
const { spec } = pkg;

const ApiOptions = {
  provider : new WsProvider('ws://localhost:9951'),
  ...spec,
};

const args = minimist(process.argv.slice(2))

const recv = args['address'];
const qty = args['qty'];

//sender json
const jsn = {"encoded":"1W/ZMitqumQuIq0/b9KFxXKXLdUHL2kegztQiwLcw90AgAAAAQAAAAgAAADcZvKX/RfanIMw/i699l/HVVJG0OnMYBUGeHnxMNm5d81Bv/f+0YzS1sA0b2tX+lDx9MqWGizUmZ2lM1wHaAf4+bge7qAFfVpfKnPi5NFrDby+Xb0HNLS6tnrP7/nOWkd14232c4MEg4CikBXLPwrhiFdK7RFyqmQltrd25FZQJ0wyBLUxb6JBYGTEqxcaYQmMcc+Q5hOA2O3AlvTT","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"hsm6TTScxLNa5fnEUdw3o9X9LWnLQYPKt7mwCDxBnPemNBE","meta":{"name":"W","tags":null,"whenCreated":1650626046171,"meta":{"genesisHash":"0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5b"}}};

async function main () {

  const api = await ApiPromise.create(ApiOptions);
  const keyring = new Keyring({ type: 'sr25519' });
  const sndr = await keyring.createFromJson(jsn);

  const b = await sndr.unlock('haha');
  const BI_qty = BigInt(Math.round(1000000000000000000*qty));

const unsub = await api.tx.balances
  .transfer(recv, BI_qty)
  .signAndSend(sndr, (result) => {
//    console.log(`Current status is ${result.status}`);

    if (result.status.isInBlock) {
//        console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
	console.log('Success');
	process.exit()
    } else if (result.status.isFinalized) {
//        console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
//        unsub();
//	process.exit();
    }
  });

  let { data: { free: previousFree }, nonce: previousNonce } = await api.query.system.account(recv);

//  console.log(`${recv} has a balance of ${previousFree}, nonce ${previousNonce}`);
  api.query.system.account(recv, ({ data: { free: currentFree }, nonce: currentNonce }) => {

  const change = currentFree.sub(previousFree);

    if (!change.isZero()) {
//      console.log(`New balance change of ${change}, nonce ${currentNonce}`);

      previousFree = currentFree;
      previousNonce = currentNonce;
    }
  });

}

main().catch(console.error);
