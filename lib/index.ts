import {clientInfo, environmentInfo} from './environment'
import PercyAgent from '@percy/agent'

declare const Cypress: any
declare const cy: any

Cypress.Commands.add('percySnapshot', (name: string, options: any = {}) => {
  const percyAgentClient = new PercyAgent({
    clientInfo: clientInfo(),
    environmentInfo: environmentInfo(),
    handleAgentCommunication: false
  })

  // Use cy.exec(...) to check if percy agent is running. Ideally this would be
  // done using something like cy.request(...), see:
  // https://github.com/cypress-io/cypress/issues/3161
  const healthcheck = `curl localhost:${percyAgentClient.port}/percy/healthcheck`
  cy.exec(healthcheck, {failOnNonZeroExit: false}).then((result: any) => {
    if (result.code == 127) {
      // 'Command not found'
      cy.log('[percy] Could not check if percy agent is running. Will continue as if it is.')
    } else if (result.code != 0) {
      // Percy server not available.
      cy.log('[percy] Percy agent is not running. Skipping snapshots')
      return
    }

    name = name || cy.state('runnable').fullTitle()

    cy.document().then((doc: Document) => {
      options.document = doc
      const domSnapshot = percyAgentClient.snapshot(name, options)
      return cy.request({
        method: 'POST',
        url: `http://localhost:${percyAgentClient.port}/percy/snapshot`,
        body: {
          name,
          url: doc.URL,
          enableJavaScript: options.enableJavaScript,
          widths: options.widths,
          clientInfo,
          environmentInfo,
          domSnapshot
        }
      })
    })
  })
})
