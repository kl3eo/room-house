// Copyright 2017-2020 @polkadot/ui-settings authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { isPolkadot } from './type';
const LANGUAGE_DEFAULT = 'default';
const UIMODE_DEFAULT = !isPolkadot && typeof window !== 'undefined' && window.location.host.includes('ui-light')
    ? 'light'
    : 'full';
const UIMODES = [
    {
        info: 'full',
        text: 'Fully featured',
        value: 'full'
    },
    {
        info: 'light',
        text: 'Basic features only',
        value: 'light'
    }
];
const UITHEME_DEFAULT = isPolkadot
    ? 'polkadot'
    : 'substrate';
const UITHEMES = [
    {
        info: 'polkadot',
        text: 'Polkadot',
        value: 'polkadot'
    },
    {
        info: 'substrate',
        text: 'Substrate',
        value: 'substrate'
    }
];
const ICON_DEFAULT = 'default';
const ICON_DEFAULT_HOST = isPolkadot
    ? 'polkadot'
    : 'substrate';
const ICONS = [
    {
        info: 'default',
        text: 'Default for the connected node',
        value: 'default'
    },
    {
        info: 'polkadot',
        text: 'Polkadot',
        value: 'polkadot'
    },
    {
        info: 'substrate',
        text: 'Substrate',
        value: 'substrate'
    },
    {
        info: 'beachball',
        text: 'Beachball',
        value: 'beachball'
    }
];
export { ICON_DEFAULT, ICON_DEFAULT_HOST, ICONS, LANGUAGE_DEFAULT, UIMODE_DEFAULT, UIMODES, UITHEME_DEFAULT, UITHEMES };
