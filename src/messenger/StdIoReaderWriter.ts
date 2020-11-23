import * as fs from "fs";

const BUFFER_SIZE = 1024;
const isWindows = process.platform === "win32";

export class StdIoReaderWriter {
    private _isReading = false;
    private _isWriting = false;

    readInt() {
        return withStdin(stdin => this.readIntFromStdIn(stdin));
    }

    readSuccessBytes() {
        return withStdin(async stdin => {
            const buf = Buffer.alloc(4);
            await this.readBuf(stdin, buf, 0, 4);
            for (let i = 0; i < buf.length; i++) {
                if (buf[i] !== 255) {
                    console.error(`Catastrophic error. Expected success bytes, but found: [${buf.join(", ")}]`);
                    process.exit(1);
                }
            }
        });
    }

    readVariableData() {
        return withStdin(stdin =>
            withStdout(async stdout => {
                const size = await this.readIntFromStdIn(stdin);
                const buffer = Buffer.alloc(size);
                if (size > 0) {
                    // read the first part of the message part
                    await this.readBuf(stdin, buffer, 0, Math.min(size, BUFFER_SIZE));

                    let index = BUFFER_SIZE;
                    while (index < size) {
                        // send "ready" to the client
                        await this.writeIntToStdOut(stdout, 0);

                        // read from buffer
                        await this.readBuf(stdin, buffer, index, Math.min(size - index, BUFFER_SIZE));
                        index += BUFFER_SIZE;
                    }
                }

                return buffer;
            })
        );
    }

    sendInt(value: number) {
        return withStdout(stdout => this.writeIntToStdOut(stdout, value));
    }

    sendVariableData(buffer: Buffer) {
        return withStdin(stdin =>
            withStdout(async stdout => {
                await this.writeIntToStdOut(stdout, buffer.length);
                await this.writeBuf(stdout, buffer, 0, Math.min(buffer.length, BUFFER_SIZE));

                let index = BUFFER_SIZE;
                while (index < buffer.length) {
                    // wait for "ready" from the server
                    await this.readIntFromStdIn(stdin);

                    await this.writeBuf(stdout, buffer, index, Math.min(buffer.length - index, BUFFER_SIZE));
                    index += BUFFER_SIZE;
                }
            })
        );
    }

    sendSuccessBytes() {
        return withStdout(stdout => {
            const buf = Buffer.alloc(4, 255); // fill 4 bytes with value 255
            return this.writeBuf(stdout, buf, 0, 4);
        });
    }

    private async readIntFromStdIn(stdin: number) {
        const buf = Buffer.alloc(4);
        await this.readBuf(stdin, buf, 0, 4);
        return buf.readUInt32BE();
    }

    private writeIntToStdOut(stdout: number, value: number) {
        const buf = Buffer.alloc(4);
        buf.writeUInt32BE(value);
        return this.writeBuf(stdout, buf, 0, buf.length);
    }

    private async readBuf(stdin: number, buffer: Buffer, offset: number, length: number) {
        const task = new Promise<void>((resolve, reject) => {
            try {
                fs.read(stdin, buffer, offset, length, null, (err, bytesRead) => {
                    if (err) {
                        reject(err);
                    } else if (bytesRead !== length) {
                        // be strict here because this indicates an error
                        reject(new Error(`The number of bytes read was ${bytesRead}, but expected ${length}`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });

        this.verifyNotReadingOrWriting();
        try {
            this._isReading = true;
            return await task;
        } finally {
            this._isReading = false;
        }
    }

    private async writeBuf(stdout: number, buffer: Buffer, offset: number, length: number) {
        const task = new Promise<void>((resolve, reject) => {
            try {
                fs.write(stdout, buffer, offset, length, (err, bytesWritten) => {
                    if (err) {
                        reject(err);
                    } else if (bytesWritten !== length) {
                        // be strict here because this indicates an error
                        reject(new Error(`The number of bytes written was ${bytesWritten}, but expected ${length}`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });

        this.verifyNotReadingOrWriting();
        try {
            this._isWriting = true;
            return await task;
        } finally {
            this._isWriting = false;
        }
    }

    private verifyNotReadingOrWriting() {
        if (this._isWriting || this._isReading) {
            console.error(
                "Catastrophic error. The process attempted to read or write from stdin/out while already doing so.",
            );
            process.exit(1);
        }
    }
}

function withStdin<T = void>(action: (stdin: number) => Promise<T>) {
    if (isWindows) {
        return action(process.stdin.fd);
    } else {
        // This is necessary on linux because it errors with process.stdin.fd
        // and on windows it can't find /dev/stdin
        return withDescriptor("/dev/stdin", "rs", action);
    }
}

function withStdout<T = void>(action: (stdout: number) => Promise<T>) {
    if (isWindows) {
        return action(process.stdout.fd);
    } else {
        return withDescriptor("/dev/stdout", "w", action);
    }
}

function withDescriptor<T = void>(name: string, flags: string, action: (fd: number) => Promise<T>) {
    const fd = fs.openSync(name, flags); // todo: async
    try {
        return action(fd);
    } finally {
        fs.closeSync(fd);
    }
}
