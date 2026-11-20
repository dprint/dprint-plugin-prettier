import * as React from 'react'

interface Props<T> { items: readonly T[], render: (item: T) => React.ReactNode; title?: string }

export function List<T,>({items, render, title = 'List'}: Props<T>): JSX.Element {
  const ref = React.useRef<HTMLUListElement>(null)
  return <section aria-label={title} className='list "quoted"' data-count={items.length} onKeyDown={event => event.key === 'Enter' && ref.current?.focus()}>
    <h1>{title}</h1>
    <ul ref={ref}>{items.map((item, index) => <li key={index} className={index % 2 === 0 ? 'even' : "odd"}>{render(item)}</li>)}</ul>
    {items.length === 0 ? <p>Nothing to show here, which is a sentence that is long enough to be wrapped.</p> : null}
    <>
      <input type="text" disabled value={title} onChange={() => {}} />
    </>
  </section>
}
