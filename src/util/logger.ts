function prefixDate(message: string) {
    if (message !== undefined)
        return `[${new Date().toISOString()}] ` + message
}

export function loginfo(message?: any, ...optionalParams: any[]) {
    message = prefixDate(message)
    console.log(message, ...optionalParams);
}

export function logerror(message?: any, ...optionalParams: any[]) {
    message = prefixDate(message)
    console.error(message, ...optionalParams);
}