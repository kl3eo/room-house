import * as edgewareDefinitions from 'edgeware-node-types/interfaces/definitions';
const edgewareTypes = Object.values(edgewareDefinitions).reduce((res, { types }) => (Object.assign(Object.assign({}, res), types)), {});
const options = {
    edgeware: {
        types: Object.assign(Object.assign({}, edgewareTypes), { 'voting::VoteType': 'VoteType', 'voting::TallyType': 'TallyType', 'voting::Tally': 'VotingTally', 
            // chain-specific overrides
            Address: 'GenericAddress', Keys: 'SessionKeys4', StakingLedger: 'StakingLedgerTo223', Votes: 'VotesTo230', ReferendumInfo: 'ReferendumInfoTo239', Weight: 'u32' }),
        typesAlias: {
            voting: { Tally: "VotingTally" }
        }
    },
    skypirl: {
        types: {
            Address: 'AccountId',
            LookupSource: 'AccountId',
            Account: {
                nonce: 'U256',
                balance: 'U256'
            },
            Transaction: {
                nonce: 'U256',
                action: 'String',
                gas_price: 'u64',
                gas_limit: 'u64',
                value: 'U256',
                input: 'Vec',
                signature: 'Signature'
            },
            Signature: {
                v: 'u64',
                r: 'H256',
                s: 'H256'
            },
            Keys: 'SessionKeys5'
    }
  }
};
const regexes = {
    edgeware: /edgewa/,
    skypirl: /room-house/
};
export const getApiOptions = (apiUrl) => {
    if (apiUrl.match(regexes.edgeware)) {
        return Object.assign({}, options.edgeware);
    }
    if (apiUrl.match(regexes.skypirl)) {
console.log('skypirl node');
        return Object.assign({}, options.skypirl);
    }
    return {};
};
