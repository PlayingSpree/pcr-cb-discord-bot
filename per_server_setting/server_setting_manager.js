const Enmap = require('enmap');

const settings = new Enmap({
    name: 'settings',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep',
    autoEnsure: {
        prefix: '%',
        approvalRole: 'Approval',
    }
});

module.exports = settings;