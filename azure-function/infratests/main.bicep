targetScope = 'subscription'

extension microsoftGraphV1

// az deployment sub create --location francecentral --template-file main.bicep
// https://learn.microsoft.com/en-us/graph/templates/quickstart-create-bicep-interactive-mode?tabs=CLI

param appRegistrationName string = 'yvandtestappreg'

var identifierUri = 'api://${appRegistrationName}.azurewebsites.net'
var redirectUri = 'https://${appRegistrationName}.azurewebsites.net/.auth/login/aad/callback'

// https://learn.microsoft.com/en-us/graph/templates/reference/applications?view=graph-bicep-1.0
resource appRegistration 'Microsoft.Graph/applications@v1.0' = {
  displayName: appRegistrationName
  uniqueName: appRegistrationName

  identifierUris: [identifierUri]

  // Enable user authentication
  signInAudience: 'AzureADMyOrg'
  web: {
    redirectUris: [redirectUri]
    implicitGrantSettings: { enableIdTokenIssuance: true }
  }

  // Expose user_impersonation
  api: {
    oauth2PermissionScopes: [
      {
        adminConsentDescription: 'Allows the app to access ${appRegistrationName} on behalf of the signed-in user.'
        adminConsentDisplayName: 'Access the API on your behalf'
        id: 'c15bfc6e-9c52-4e6f-97ff-f595ff93b4a5'
        isEnabled: true
        type: 'User'
        userConsentDescription: 'Allow the application to access ${appRegistrationName} on your behalf.'
        userConsentDisplayName: 'Access ${appRegistrationName}'
        value: 'user_impersonation'
      }
    ]
  }

  // Requires permission to read user profile
  requiredResourceAccess: [
    {
      resourceAppId: '00000003-0000-0000-c000-000000000000'
      resourceAccess: [
        // https://graph.microsoft.com/User.Read
        {
          id: 'e1fe6dd8-ba31-4d61-89e7-88639da4683d'
          type: 'Scope'
        }
      ]
    }
  ]

  // Create client secret
  passwordCredentials: [
    {
      displayName: 'generated during Bicep template deployment'
    }
  ]
}

// Create tyhe service principal
resource clientSp 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: appRegistration.appId
}

output appRegistrationObjectId string = appRegistration.id
output appRegistrationClientId string = appRegistration.appId
output appRegistrationSecret string = appRegistration.passwordCredentials[0].secretText
