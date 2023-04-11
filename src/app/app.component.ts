import { Component } from '@angular/core';
import KontentSmartLink, {KontentSmartLinkEvent } from "@kontent-ai/smart-link";
import { IRefreshMessageData, IRefreshMessageMetadata } from '@kontent-ai/smart-link/types/lib/IFrameCommunicatorTypes';
import { projectId } from './helpers/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  kontentSmartLink: any;

  constructor(){
    this.kontentSmartLink = KontentSmartLink.initialize({
      debug: true,
      defaultDataAttributes: {
        projectId: projectId,
        languageCodename: "default",
      },
      queryParam: "ksl-preview"
    });
  }

  ngOnDestroy(){
    this.kontentSmartLink.destroy();
  }



}
