import * as fs from "fs";

const stdin = process.stdin;
const stdout = process.stdout;
const BUFFER_SIZE = 1024;
const textDecoder = new TextDecoder();

export class StdInOutReaderWriter {
    readMessageKind() {
        return this.readInt();
    }

    private readInt() {
        const buf = new Buffer(4);
        fs.readSync(stdin.fd, buf, 0, 4, null);
        return buf.readUInt32BE();
    }

    sendMessageKind(messageKind: number) {
        this.writeInt(messageKind);
    }

    sendMessagePart(buffer: Buffer) {
        this.writeInt(buffer.length);
        fs.writeSync(stdout.fd, buffer, 0, Math.min(buffer.length, BUFFER_SIZE));

        let index = BUFFER_SIZE;
        while (index < buffer.length) {
            // wait for "ready" from the server
            this.readInt();

            fs.writeSync(stdout.fd, buffer, index, Math.min(buffer.length - index, BUFFER_SIZE));
            index += BUFFER_SIZE;
        }
    }

    readMessagePartAsString() {
        return textDecoder.decode(this.readMessagePart());
    }

    readMessagePart() {
        const size = this.readInt();
        const buffer = new Buffer(size);
        if (size > 0) {
            // read the first part of the message part
            fs.readSync(stdin.fd, buffer, 0, Math.min(size, BUFFER_SIZE), null);

            let index = BUFFER_SIZE;
            while (index < size) {
                // send "ready" to the client
                this.writeInt(0);

                // read from buffer
                fs.readSync(stdin.fd, buffer, index, Math.min(size - index, BUFFER_SIZE), null);
                index += BUFFER_SIZE;
            }
        }

        return buffer;
    }

    private writeInt(value: number) {
        const buf = new Buffer(4);
        buf.writeUInt32BE(value);
        this.writeBuf(buf);
    }

    private writeBuf(buffer: Buffer) {
        stdout.write(buffer);
    }
}
