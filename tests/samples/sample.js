// @flow strict-ish sample of JavaScript that most of prettier's options change something in
import React, {useState,
  useEffect} from 'react'
import {aVeryLongImportedBindingName, anotherVeryLongImportedBindingName, yetAnotherLongName} from "../some/module.js";

/**
* adds  two numbers together and gives back what they come to, which is a long description that goes past the width
* @param {number} a the first number
* @param {number} [b=1] the second number
 * @returns {number} the sum
* @example
*   add(1,2)
*/
export function add(a, b = 1) { return a+b }

const object = {a: 1, 'b-c': 2, "d": 3, 4: 'four', method() {}, get value() { return this.a }, ...rest}
const short = { a,
  b }
const fn = async x => { await x }
const curried = a => b => c => d => a + b + c + d
const longCondition = someCondition && anotherCondition || yetAnotherCondition && theLastConditionInTheChain || fallback
const message = isError ? 'An error occurred while doing the thing' : isWarning ? "A warning that isn't fatal" : isInfo ? 'info' : null
const animal = isBird ? bird : isCat ? cat : isDog ? { kind: 'dog', sound: 'woof', legs: 4, tail: true, name: dogName } : unknown
const sum = firstOperandWithALongName + secondOperandWithALongName * thirdOperandWithALongName - fourthOperandWithALongName
const html = /* HTML */ `<div><span>${ message }</span></div>`
const query = gql`
  query { user(id: 5) { firstName
    lastName } }
`
const style = css`
  display:flex;color:red;
`
const doc = markdown`
  # Title
  * item
`

class Shape extends Base {
  static #count = 0
  name = 'shape';
  @observable accessor area = 0
  constructor(name) { super(); this.name = name; Shape.#count++ }
  ;[Symbol.iterator]() {}
  static { init() }
}

function Component({items, onSelect, selected, className, children, ...props}) {
  const [state, setState] = useState(null)
  useEffect(() => { setState(items.filter(item => item.visible).map(item => item.value).reduce((a, b) => a + b, 0)) }, [items])
  return <div className="container" data-selected={selected} onClick={event => onSelect(event.target.value)} {...props}>
    {items.length > 0 ? items.map(item => <Item key={item.id} label='it "is"' title="it's" {...item} />) : <Empty message="Nothing here" />}
    <p>
      Some text that is long enough to be wrapped onto another line when the print width is small enough for it.
    </p>
    {children}
  </div>
}

label: for (const [key, value] of Object.entries(object)) {
  if (!value) continue label
  switch (key) {
    case 'a': case "b":
      doSomething(key, value, function callback(error, result) { if (error) throw error; return result })
      break
    default: {
      promise.then(result => console.log(result)).catch(error => { handle(error) }).finally(() => done())
    }
  }
}

;[1, 2, 3].forEach(n => console.log(n))
;(function iife() {})()
export default Component
export * as everything from './everything.js'
