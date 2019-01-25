import {clientInfo, environmentInfo} from './environment'
import PercyAgent from '@percy/agent'
import {SnapshotOptions} from '@percy/agent/dist/percy-agent-client/snapshot-options'

declare const Cypress: any
declare const cy: any

export declare namespace Cypress {
  interface Chainable {
    /**
     * Take a snapshot in Percy
     * @see https://github.com/percy/percy-cypress
     * @example
     * ```
     * cy.percySnapshot(name: 'home page')
     * cy.percySnapshot(name: 'home page', {widths: [1280, 1960]})
     * ```
     */
    percySnapshot(name: string, options: SnapshotOptions): Chainable
  }
}

Cypress.Commands.add('percySnapshot', (name: string, options: SnapshotOptions = {}) => {
  const percyAgentClient = new PercyAgent({
    clientInfo: clientInfo(),
    environmentInfo: environmentInfo()
  })

  name = name || cy.state('runnable').fullTitle()

  cy.document().then((doc: Document) => {
    options.document = doc
    percyAgentClient.snapshot(name, options)
  })
})
