export const n: "\n";
export const rn: "\r\n";
/**
 * Determine the EOL used by this JavaScript engine in Error stack traces. It turns out this is not always `os.EOL`.
 * The default is '\n' (Unix).
 */
export const stack: "\n" | "\r\n";
export const os: string;
