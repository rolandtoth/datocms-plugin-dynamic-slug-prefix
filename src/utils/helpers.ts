export function setLastCharacter(str: string, char: string): string {
    if (str.substring(str.length - 1) === char) {
        str = str.substring(0, str.length - 1);
    }

    return str + char;
}
