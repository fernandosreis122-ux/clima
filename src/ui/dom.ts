export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)

  if (className) {
    element.className = className
  }

  if (text !== undefined) {
    element.textContent = text
  }

  return element
}

export function clearElement(element: Element): void {
  element.replaceChildren()
}

export function setText(element: Element, text: string): void {
  element.textContent = text
}
