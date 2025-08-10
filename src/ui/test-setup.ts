import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>')
// @ts-ignore
globalThis.window = dom.window
// @ts-ignore
globalThis.document = dom.window.document
// @ts-ignore
globalThis.navigator = dom.window.navigator

