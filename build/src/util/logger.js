"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginfo = void 0;
function loginfo(message, ...optionalParams) {
    if (message !== undefined)
        message = `[${new Date().toISOString()}] ` + message;
    console.log(message, ...optionalParams);
}
exports.loginfo = loginfo;
//# sourceMappingURL=logger.js.map