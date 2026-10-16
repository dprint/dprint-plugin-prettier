import { Schema } from '../schema.js';
import { comparePrimitive, mapFromArray } from '../utils.js';
export class ChoiceSchema extends Schema {
    constructor(parameters) {
        super(parameters);
        this._choices = mapFromArray(parameters.choices.map(choice => choice && typeof choice === 'object' ? choice : { value: choice }), 'value');
    }
    expected({ descriptor }) {
        const choiceDescriptions = Array.from(this._choices.keys())
            .map(value => this._choices.get(value))
            .filter(({ hidden }) => !hidden)
            .map(choiceInfo => choiceInfo.value)
            .sort(comparePrimitive)
            .map(descriptor.value);
        const head = choiceDescriptions.slice(0, -2);
        const tail = choiceDescriptions.slice(-2);
        const message = head.concat(tail.join(' or ')).join(', ');
        return {
            text: message,
            list: {
                title: 'one of the following values',
                values: choiceDescriptions,
            },
        };
    }
    validate(value) {
        return this._choices.has(value);
    }
    deprecated(value) {
        const choiceInfo = this._choices.get(value);
        return choiceInfo && choiceInfo.deprecated ? { value } : false;
    }
    forward(value) {
        const choiceInfo = this._choices.get(value);
        return choiceInfo ? choiceInfo.forward : undefined;
    }
    redirect(value) {
        const choiceInfo = this._choices.get(value);
        return choiceInfo ? choiceInfo.redirect : undefined;
    }
}
