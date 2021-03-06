// Copyright 2017-2020 @polkadot/ui-settings authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const LEDGER_CONN_DEFAULT = 'none';
export const LEDGER_CONN = [
    {
        info: 'none',
        text: 'Do not attach Ledger devices',
        value: 'none'
    },
    {
        info: 'u2f',
        text: 'Attach Ledger via U2F',
        value: 'u2f'
    },
    {
        info: 'webusb',
        text: 'Attach Ledger via WebUSB',
        value: 'webusb'
    }
];
