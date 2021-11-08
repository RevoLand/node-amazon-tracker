export const trimNewLines = (text: string): string => text.replace(/\n/g, '');

export const wait = (timeout: number) => new Promise(resolve => { setTimeout(resolve, timeout) });
