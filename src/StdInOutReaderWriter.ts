import * as fs from "fs";

const BUFFER_SIZE = 1024;
const isWindows = process.platform === "win32";
const textDecoder = new TextDecoder();

export class StdInOutReaderWriter {
    readInt() {
        return withStdin(stdin => this.readIntFromStdIn(stdin));
    }

    sendInt(value: number) {
        withStdout(stdout => this.writeIntToStdOut(stdout, value));
    }

    sendVariableWidth(buffer: Buffer) {
        return withStdin(stdin =>
            withStdout(stdout => {
                this.writeIntToStdOut(stdout, buffer.length);
                fs.writeSync(stdout, buffer, 0, Math.min(buffer.length, BUFFER_SIZE));

                let index = BUFFER_SIZE;
                while (index < buffer.length) {
                    // wait for "ready" from the server
                    this.readIntFromStdIn(stdin);

                    fs.writeSync(stdout, buffer, index, Math.min(buffer.length - index, BUFFER_SIZE));
                    index += BUFFER_SIZE;
                }
            })
        );
    }

    readMessagePartAsString() {
        return textDecoder.decode(this.readMessagePart());
    }

    readMessagePart() {
        return withStdin(stdin =>
            withStdout(stdout => {
                const size = this.readIntFromStdIn(stdin);
                const buffer = Buffer.alloc(size);
                if (size > 0) {
                    // read the first part of the message part
                    fs.readSync(stdin, buffer, 0, Math.min(size, BUFFER_SIZE), null);

                    let index = BUFFER_SIZE;
                    while (index < size) {
                        // send "ready" to the client
                        this.writeIntToStdOut(stdout, 0);

                        // read from buffer
                        fs.readSync(stdin, buffer, index, Math.min(size - index, BUFFER_SIZE), null);
                        index += BUFFER_SIZE;
                    }
                }

                return buffer;
            })
        );
    }

    private readIntFromStdIn(stdin: number) {
        const buf = Buffer.alloc(4);
        fs.readSync(stdin, buf, 0, 4, null);
        return buf.readUInt32BE();
    }

    private writeIntToStdOut(stdout: number, value: number) {
        const buf = Buffer.alloc(4);
        buf.writeUInt32BE(value);
        this.writeBuf(stdout, buf);
    }

    private writeBuf(stdout: number, buffer: Buffer) {
        fs.writeSync(stdout, buffer, 0, buffer.length);
    }
}

function withStdin<T = void>(action: (stdin: number) => T) {
    if (isWindows) {
        return action(process.stdin.fd);
    } else {
        // This is necessary on linux because it errors with process.stdin.fd
        // and on windows it can't find /dev/stdin
        return withDescriptor("/dev/stdin", "rs", action);
    }
}

function withStdout<T = void>(action: (stdout: number) => T) {
    if (isWindows) {
        return action(process.stdout.fd);
    } else {
        return withDescriptor("/dev/stdout", "w", action);
    }
}

function withDescriptor<T = void>(name: string, flags: string, action: (fd: number) => T) {
    const fd = fs.openSync(name, flags);
    try {
        return action(fd);
    } finally {
        fs.closeSync(fd);
    }
}
