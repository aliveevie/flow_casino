import * as fcl from '@onflow/fcl';

// Configure Flow client
fcl
  .config()
  .put('flow.network', 'testnet')
  .put('accessNode.api', 'https://rest-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn')
  .put('discovery.wallet.method', 'POP/RPC')
  .put('walletconnect.projectId', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID_HERE')
  .put('app.detail.title', 'React Craft Flow App')
  .put('app.detail.icon', 'https://placekitten.com/g/200/200')
  .put('app.detail.description', 'A React application built with Flow blockchain integration')
  .put('app.detail.url', 'http://localhost:8080/');

export default fcl; 