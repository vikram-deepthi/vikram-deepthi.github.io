import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IDeliveryClient,
  createDeliveryClient,
  INetworkResponse,
  Responses,
  IGroupedNetworkResponse,
} from '@kentico/kontent-delivery';
import { Observable, from } from 'rxjs';
import { observableHelper } from '../helpers/observable.helper';
import { getFullDate } from '../helpers/http.helpers';
import { previewAPIKey, projectId } from '../helpers/constants';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html'
})
export class NewsComponent {
  preview:boolean = false;
  newsData: any = {};
  likes:any = 0;
  comments:any = 0;
  displayName: string;
  isManager: boolean = false;
  id: string = "";

  deliveryClient: IDeliveryClient;

  itemsResponse?: INetworkResponse<Responses.IListContentItemsResponse, any>;
  itemResponse?: INetworkResponse<Responses.IViewContentItemResponse, any>;
  taxonomiesResponse?: INetworkResponse<Responses.IListTaxonomiesResponse, any>;
  taxonomyResponse?: INetworkResponse<Responses.IViewTaxonomyResponse, any>;
  typesResponse?: INetworkResponse<Responses.IListContentTypesResponse, any>;
  typeResponse?: INetworkResponse<Responses.IViewContentTypeResponse, any>;
  languagesResponse?: INetworkResponse<Responses.IListLanguagesResponse, any>;
  elementResponse?: INetworkResponse<Responses.IViewContentTypeElementResponse, any>;
  itemsFeedResponse?: IGroupedNetworkResponse<Responses.IListItemsFeedAllResponse>;

  constructor(private router : Router, private cdr: ChangeDetectorRef) {
    if(this.router.url.includes("/preview")){ 
      this.preview = true;
      this.deliveryClient = createDeliveryClient({
        projectId: projectId,
        previewApiKey: previewAPIKey,
        defaultQueryConfig: {
          usePreviewMode: true, // Queries the Delivery Preview API.
        }
      });
    } else {
      this.deliveryClient = createDeliveryClient({
        projectId: projectId,
      });
    }
    this.displayName = "";
   }

  async ngOnInit() {    
     this.id = this.router.url.split("/")[this.router.url.split("/").length-1];
      this.getCollection();
  }


  private getCollection(): void {
    this.zipAndExecute([
      from(this.deliveryClient.items()
      .equalsFilter('system.codename', this.id.toLowerCase())
      .toPromise()).pipe(
        map((response) => {
          this.itemsResponse = response;
          console.log('this.itemsResponse = '+ JSON.stringify(this.itemsResponse));
          let element = response.data.items[0];
          this.newsData['title'] = element.elements.article_details__title.value;
          this.newsData['desc'] = element.elements.web_page_content__contact.value;
          this.newsData['image'] = element.elements.web_page_content__image.value[0].url;
          this.newsData['date'] = getFullDate(""+element.system.lastModified);
          this.cdr.markForCheck();
        })
      ),
      ]);
  }

  private zipAndExecute(observables: Observable<void>[]): void {
    observableHelper
      .zipObservables(observables)
      .pipe(
        map(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe();
  }

}
