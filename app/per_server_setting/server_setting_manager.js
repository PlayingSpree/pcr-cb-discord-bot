const Enmap = require('enmap');

const settings = new Enmap({
    name: 'settings',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep',
    autoEnsure: {
        prefix: '%',
        approvalRole: 'Approval',
        bossname: ['Boss1', 'Boss2', 'Boss3', 'Boss4', 'Boss 5']
    }
});

module.exports = settings;