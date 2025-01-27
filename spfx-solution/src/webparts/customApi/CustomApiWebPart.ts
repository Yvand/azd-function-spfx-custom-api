import { Version } from '@microsoft/sp-core-library';
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { formatError } from '../../common';
import styles from './CustomApiWebPart.module.scss';

export interface ICustomApiWebPartProps {
  clientAppId: string;
  functionAppDomain: string;
  functionAppCode: string;
}

export default class CustomApiWebPart extends BaseClientSideWebPart<ICustomApiWebPartProps> {
  public async render(): Promise<void> {
    this.domElement.innerHTML = `<div class="${styles.customApi}">Webpart is loaded`;
    const clientAppId = this.properties.clientAppId;
    const functionAppDomain = this.properties.functionAppDomain;
    const functionAppCode = this.properties.functionAppCode;

    if (!clientAppId || !functionAppDomain || !functionAppCode) {
      this.domElement.innerHTML += `<br>Configuration is missing, edit the webpart to provide the missing values</div>`;
      return;
    }

    try {
      this.domElement.innerHTML += `<br>Getting an access token for the resource '${clientAppId}'`;
      const client: AadHttpClient = await this.context.aadHttpClientFactory.getClient(clientAppId);
      const functionUrl = `https://${functionAppDomain}/api/getData?code=${functionAppCode}`;
      this.domElement.innerHTML += `<br>Access token received.<br>Connecting to the function app '${functionUrl}'`;
      const response: HttpClientResponse = await client.get(functionUrl, AadHttpClient.configurations.v1);
      if (response.status === 200) {
        this.domElement.innerHTML += `<br>Data received:<br>`;
        const data = await response.json();
        this.domElement.innerHTML += JSON.stringify(data);
      } else {
        this.domElement.innerHTML += `<br>Could not get the data from the function app, received HTTP status ${response.status}`;
      }
    }
    catch (error: unknown) {
      const errorMessage = formatError(error);
      this.domElement.innerHTML += `<br>Unexpected error: ${errorMessage}`;
      return;
    }
    finally {
      this.domElement.innerHTML += `<br>Finished.</div>`;
    }

    try {
      this.domElement.innerHTML += `<br>Getting an access token for the resource '${"https://graph.microsoft.com"}'`;
      const client: AadHttpClient = await this.context.aadHttpClientFactory.getClient("https://graph.microsoft.com");
      const functionUrl = `https://graph.microsoft.com/v1.0/groups/413f757a-1fd9-4e72-83b6-0d4deb137982/members`;
      this.domElement.innerHTML += `<br>Access token received.<br>Connecting to the function app '${functionUrl}'`;
      const response: HttpClientResponse = await client.get(functionUrl, AadHttpClient.configurations.v1);
      if (response.status === 200) {
        this.domElement.innerHTML += `<br>Data received:<br>`;
        const data = await response.json();
        this.domElement.innerHTML += JSON.stringify(data.value);
      } else {
        this.domElement.innerHTML += `<br>Could not get the data from the function app, received HTTP status ${response.status}`;
      }
    }
    catch (error: unknown) {
      const errorMessage = formatError(error);
      this.domElement.innerHTML += `<br>Unexpected error: ${errorMessage}`;
      return;
    }
    finally {
      this.domElement.innerHTML += `<br>Finished.</div>`;
    }
  }

  protected onInit(): Promise<void> {
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
      return {
        pages: [
          {
            header: {
              description: "Configure the webpart"
            },
            groups: [
              {
                groupName: "Settings",
                groupFields: [
                  PropertyPaneTextField("clientAppId", {
                    label: "Client App ID",
                    description: "The client ID of the app registration created for the function app",
                    value: this.properties.clientAppId,
                  }),
                  PropertyPaneTextField("functionAppDomain", {
                    label: "Azure function app domain",
                    description: "The domain name of your Azure function app",
                    placeholder: "YOUR_APP_NAME.azurewebsites.net",
                    value: this.properties.functionAppDomain,
                  }),
                  PropertyPaneTextField("functionAppCode", {
                    label: "Azure function app key",
                    description: "The value of an app key of your Azure function app",
                    value: this.properties.functionAppCode,
                  }),
                ]
              }
            ]
          }
        ],
      };
    }
  
    protected get disableReactivePropertyChanges(): boolean {
      return false;
    }
  }
  