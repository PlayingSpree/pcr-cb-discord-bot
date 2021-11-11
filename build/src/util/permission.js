"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
function checkPermission(interaction, permission, checkAdmin = false) {
    if (!interaction.memberPermissions?.has(permission, checkAdmin)) {
        void interaction.reply('ท่านไม่มี Permission ในการใช้คำสั่งนี้');
        return false;
    }
    return true;
}
exports.checkPermission = checkPermission;
//# sourceMappingURL=permission.js.map