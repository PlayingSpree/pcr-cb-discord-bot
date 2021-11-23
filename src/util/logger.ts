function prefixDate(message: string) {
    return `[${new Date().toISOString()}] ${message}`;
}

export function loginfo(message: string, ...optionalParams: never[]) {
    message = prefixDate(message);
    console.log(message, ...optionalParams);
}

export function logerror(message: string | unknown, ...optionalParams: never[]) {
    message = prefixDate(message as string);
    console.error(message, ...optionalParams);
}