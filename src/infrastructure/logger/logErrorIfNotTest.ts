export function logErrorIfNotTest(...args: any[]) {
    if (process.env.NODE_ENV !== 'test') {
        console.error(...args);
    }
}
