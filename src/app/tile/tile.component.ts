import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IDeliveryClient,
  createDeliveryClient,
  INetworkResponse,
  Responses,
} from '@kentico/kontent-delivery';
import { Observable, from } from 'rxjs';
import { observableHelper } from '../helpers/observable.helper';
import { getRequest, 
  getKontentProjectRequest, 
  getKontentSubscriptionRequest,
  projectId, previewAPIKey,
  getDate,getCookie
} from '../helpers/http.helpers';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html'
})
export class TileComponent {
  preview:boolean = false;
  selectedGroup: string = '';
  roles: any = [];
  title = '';
  carouselData: any = [];
  displayName: string = "";
  isManager: boolean = false;
  showUserName: boolean = false;
  showUserPicker: boolean = false;
  userID: string = "";
  userEmail: string = "";
  collectionsIdList: any = [];
  deliveryClient: IDeliveryClient;
  itemsResponse?: INetworkResponse<Responses.IListContentItemsResponse, any>;
  itemResponse?: INetworkResponse<Responses.IViewContentItemResponse, any>;

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
    if(this.preview){
      this.getUserRoles();
    } else {
      this.getUser(null);
    }
   }

   getUserRoles(){
    this.zipAndExecute([
      // taxonomy
      from(this.deliveryClient.taxonomy('personalization_groups').toPromise()).pipe(
        map((response: any) => {
          console.log(response);
          response.data.taxonomy.terms.forEach((element: any) => {
            let folder:any = {};
            folder["codename"] = element.codename;
            folder["name"] = element.name;
            this.roles.push(folder);
          });
          console.log("roles = "+JSON.stringify(this.roles));
          this.cdr.markForCheck();
          this.showUserPicker = true;
          this.userID = getCookie('userid');
          this.selectedGroup = this.roles[0].codename;
          this.getUser(null);
        })
      ),
    ]);
  }

  changeRole(e:any){
    this.userID = getCookie('userid');
    this.selectedGroup = e.target.value;
    this.getUser(null);
  }
  
  //  bindUserID(e: any) {
  //   this.userID = e.target.value;
  //  }

  async getUser(e: any){
    // let userData: any = await getRequest("/pulseprofile/api/users/", this.userID);
    // console.log(JSON.stringify(userData));
    // if(userData.EMAIL == 'Deepthi.Vikram@elevancehealth.com'){
    //   this.userEmail = 'vikramdeepthi90@gmail.com';
    // } else {
    //   this.userEmail = 'deepthivikram90@gmail.com';
    // }
    console.log(document.cookie);
    if(this.userID == ''){
      this.userID = getCookie('userid');
    }
    // if(this.userID == ''){
      this.userID = 'tstworknet1';
    // }
    this.userEmail = this.userID+"@mailinator.com";
    //let userGroups: any = await getRequest("/pulsecontent/api/contents/pznfields/"+ this.userID +"?honorPzn=ADDRESS_COUNTRY", null);
    // console.log(JSON.stringify(userGroups));


    // get collections
    let collectionsList:any = await getKontentProjectRequest("/collections");

    // get Kontent user data
    let userKData: any = await getKontentSubscriptionRequest("/users/email/"+this.userEmail);
    // console.log(userKData);
    userKData.projects.forEach((project: any) => {
      project.environments.forEach((environment: any) => {
        if(environment.id == projectId){
          environment.collection_groups.forEach((collection_group: any) => {
            collection_group.collections.forEach((collection: any) => {
              this.collectionsIdList.push(collection.id);
            });
          });
        }
      });
    });
    // console.log(this.collectionsIdList);
    let collectionNames: any = [];
    this.displayName = userKData.first_name + " " + userKData.last_name;
    collectionsList.collections.forEach((element: any) => {
      if(this.collectionsIdList.includes(element.id)){
        collectionNames.push(element.codename);
      }
    });
    // console.log(collectionNames);
    let gps = [];
    if('' != this.selectedGroup){
      gps.push(this.selectedGroup);
    } else {
      // for(let key in userGroups) {
      //   gps.push(userGroups[key].toLowerCase());
      // }
    }
    this.getNewsContent(collectionNames, gps);
    // console.log(gps);
    this.showUserName = true;
    // this.isManager = userData.MANAGER? true : false;
    // this.displayName = userData.DISPLAY_NAME;
    // this.showUserName = true;
    // this.getCollection();
  }

  async getUserID(id: any){
    return getRequest("/pulseprofile/api/v1/users/"+id, null);
  }

  private getNewsContent(collectionNames: any, userGroups: any): void {
    console.log(userGroups);
    if(userGroups.length == 0){
      if(this.userID == 'tstworknet2'){
        userGroups = ['all_users,usa_associates,usa_manager_associates'];
      } else if(this.userID == 'tstworknet1' || this.userID == 'tstworknet3'){
        userGroups = ['all_users,usa_associates'];
      } else if(this.userID == 'tstlegato5'){
        userGroups = ['all_users,ind_associates,ind_manager_associates'];
      } else if(this.userID == 'tstlegato3' || this.userID == 'tstlegato4'){
        userGroups = ['all_users,ind_associates'];
      }
    }
    this.zipAndExecute([
      from(this.deliveryClient.items()
      .inFilter('system.collection', collectionNames)
      .anyFilter('elements.personalized_fields__audience', userGroups)
      .anyFilter('elements.article_details__article_type', ["new"])
      .containsFilter('elements.article_details__featured_', ['yes'])
      .orderParameter('elements.article_details__sort_order', 'asc')
      .toPromise()).pipe(
        map((response: any) => {
          this.itemsResponse = response;
          this.carouselData = [];
          // console.log('this.itemsResponse = '+ JSON.stringify(this.itemsResponse));
          response.data.items.forEach(async (element: any) => {
            // let newsCarouselItem:any = await this.getLikesAndComments(element.system.name);
            let newsCarouselItem:any = {};
            newsCarouselItem['title'] = element.elements.article_details__title.value;
            newsCarouselItem['desc'] = element.elements.article_details__description.value;
            newsCarouselItem['image'] = element.elements.web_page_content__image.value[0].url;
            newsCarouselItem['link'] = '/news/'+element.system.codename.toUpperCase();
            newsCarouselItem['date'] = getDate(element.system.lastModified);
            this.carouselData.push(newsCarouselItem);
          });
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
