import { ApiPromise, WsProvider } from '@polkadot/api';

import pkg from '@edgeware/node-types';
const { spec } = pkg;

const ApiOptions = {
  provider : new WsProvider('ws://localhost:9951'),
  ...spec,
};

const api = new ApiPromise(ApiOptions);
