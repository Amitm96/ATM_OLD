import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
// New Imports
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

const graphqlUrl = process.env.PROD ? 'ta-new.fre8wise.com/v1/graphql' : 'localhost:8080/v1/graphql'
const isDev = !/fre8wise\.com/i.test(graphqlUrl)

console.log('dev', isDev)

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: `http://${graphqlUrl}`,
  headers: {
    'x-hasura-admin-secret': isDev ? 'Nc5%8L@d-gCsGSd3$G%Sd3' : 'Nc5%8L@d-gCsGSd3$G%Sd3'
  }
})

// Create the subscription websocket link
const wsLink = new WebSocketLink({
  uri: `ws://${graphqlUrl}`,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        'x-hasura-admin-secret': isDev ? 'Nc5%8L@d-gCsGSd3$G%Sd3' : 'Nc5%8L@d-gCsGSd3$G%Sd3'
      }
    }
  }
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Create the apollo client
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  errorHandler ({ graphQLErrors, networkError }) {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      )
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`)
    }
  },
  watchLoading (isLoading) {
    console.log('loading graphql', isLoading)
  }
})

export default ({ app, Vue }) => {
  Vue.use(VueApollo)
  app.apolloProvider = apolloProvider
}
