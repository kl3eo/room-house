// Copyright 2017-2020 @polkadot/ui-settings authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CRYPTOS } from './crypto';
import { ENDPOINTS, ENDPOINT_DEFAULT } from './endpoints';
import { LEDGER_CONN, LEDGER_CONN_DEFAULT } from './ledger';
import { PREFIXES, PREFIX_DEFAULT } from './ss58';
import { ICON_DEFAULT, ICON_DEFAULT_HOST, ICONS, UIMODE_DEFAULT, UIMODES, UITHEME_DEFAULT, UITHEMES } from './ui';
import chains from './chains';
const CAMERA_DEFAULT = 'off';
const CAMERA = [
    {
        info: 'on',
        text: 'Allow camera access',
        value: 'on'
    },
    {
        info: 'off',
        text: 'Do not allow camera access',
        value: 'off'
    }
];
const LANGUAGE_DEFAULT = 'default';
const LOCKING_DEFAULT = 'session';
const LOCKING = [
    {
        info: 'session',
        text: 'Once per session',
        value: 'session'
    },
    {
        info: 'tx',
        text: 'On each transaction',
        value: 'tx'
    }
];
export { CAMERA_DEFAULT, CAMERA, CRYPTOS, ENDPOINT_DEFAULT, ENDPOINTS, ICON_DEFAULT, ICON_DEFAULT_HOST, ICONS, LANGUAGE_DEFAULT, LEDGER_CONN_DEFAULT, LEDGER_CONN, LOCKING_DEFAULT, LOCKING, PREFIX_DEFAULT, PREFIXES, UIMODE_DEFAULT, UIMODES, UITHEME_DEFAULT, UITHEMES, chains };
