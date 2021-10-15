export function loginfo(message?: any, ...optionalParams: any[]) {
    if (message !== undefined)
        message = `[${new Date().toISOString()}] ` + message
    console.log(message, ...optionalParams);
}