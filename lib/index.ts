import axios from 'axios'
import {clientInfo, environmentInfo} from './environment'
import PercyAgent from '@percy/agent'

declare const Cypress: any
declare const cy: any

Cypress.Commands.add('percySnapshot', (name: string, options: any = {}) => {
  const percyAgentClient = new PercyAgent({
    clientInfo: clientInfo(),
    environmentInfo: environmentInfo(),
    postSnapshotDirectly: false
  })

  name = name || cy.state('runnable').fullTitle()

  const domSnapshot = cy.document().then((doc: Document) => {
    options.document = doc
    const domSnapshot = percyAgentClient.snapshot(name, options)

    return axios.post(`http://localhost:${percyAgentClient.port}/percy/snapshot`, {
      name,
      url: doc.URL,
      enableJavaScript: options.enableJavaScript,
      widths: options.widths,
      clientInfo,
      environmentInfo,
      domSnapshot,
    })
    .then((response: any) => {
      cy.log(`[percy] Snapshot ${name} successfully created.`)
    })
    .catch((error: any) => {
      cy.log('[percy] Something went wrong creating a snapshot.')
    })
  })
})
