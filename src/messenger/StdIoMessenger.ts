import { StdIoReaderWriter } from "./StdIoReaderWriter";
import { MessagePart, NumberMessagePart, VariableMessagePart } from "./MessagePart";

export class StdIoMessenger {
    constructor(private readonly readerWriter = new StdIoReaderWriter()) {
    }

    readCode() {
        return this.readerWriter.readInt();
    }

    async readMultiPartMessage(count: number) {
        const parts = Array<MessagePart>(count);
        for (let i = 0; i < count; i++) {
            parts[i] = new VariableMessagePart(await this.readerWriter.readVariableData());
        }
        await this.readerWriter.readSuccessBytes();
        return parts;
    }

    async readSinglePartMessage() {
        return (await this.readMultiPartMessage(1))[0];
    }

    readZeroPartMessage() {
        return this.readerWriter.readSuccessBytes();
    }

    async sendMessage(code: number, ...parts: MessagePart[]) {
        try {
            await this.readerWriter.sendInt(code);
            for (const part of parts) {
                if (part instanceof VariableMessagePart) {
                    await this.readerWriter.sendVariableData(part.getBuffer());
                } else if (part instanceof NumberMessagePart) {
                    await this.readerWriter.sendInt(part.getValue());
                } else {
                    throw new Error(`Not implemented: ${part}`);
                }
            }
            await this.readerWriter.sendSuccessBytes();
        } catch (err) {
            try {
                console.error(`Catastrophic error sending response. At point of no recovery: ${err}\n${err.stack}`);
            } finally {
                process.exit(1); // exit the process... can't send back invalid data at this point
            }
        }
    }
}
