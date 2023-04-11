import { Component, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  IDeliveryClient,
  createDeliveryClient
} from '@kentico/kontent-delivery';
import { Observable, from } from 'rxjs';
import { observableHelper } from '../helpers/observable.helper';
import { getRequest, 
  getKontentProjectRequest, 
  getKontentSubscriptionRequest,
  getFullDate, getCookie
} from '../helpers/http.helpers';
import { previewAPIKey, projectId } from '../helpers/constants';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-myhr',
  templateUrl: './myhr.component.html'
})
export class MyHrComponent {
  showContent:boolean = false;
  preview:boolean = false;
  showUserPicker: boolean = false;
  selectedGroup: string = '';
  folderData: any = {};
  folderList: any = [];
  roles: any = [];
  collectionsIdList: any = [];
  userID = '';
  hrLinks:any = [
    {"link" : "/", "text": "Home"},
    {"link" : "/myHR", "text": "My HR"}
  ];
  breadcrumbLinks: any = [];
  content:any = {};
  groups:any = [];
  deliveryClient: IDeliveryClient;

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
    this.breadcrumbLinks = JSON.parse(JSON.stringify(this.hrLinks));
    if(this.preview){
      this.getUserRoles();
    } else {
      this.getUserData(null);
    }
  }

  changeRole(e:any){
    this.userID = getCookie('userid');
    alert(this.userID);
    this.selectedGroup = e.target.value;
    this.getUserData(null);
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
          this.getUserData(null);
        })
      ),
    ]);
  }

  bindUserID(e: any) {
    this.userID = e.target.value;
  }

  getUserData(e: any){
    this.getFolders();
    this.showContent = true;
  }

  getFolders(): void {
    this.zipAndExecute([
      // taxonomy
      from(this.deliveryClient.taxonomy('hr_folders').toPromise()).pipe(
        map((response: any) => {
          //console.log(response);
          response.data.taxonomy.terms.forEach((element: any) => {
            // if(element.codename != 'myhr'){
              let folder:any = {};
              folder['codename'] = element.codename;
              folder['name'] = element.name.split("/")[element.name.split("/").length-1];
              this.folderData[element.codename] = folder;
            // }
            this.folderList.push(element.codename);
          });
          //console.log("folderList = "+this.folderList);
          this.getMainFile(this.folderList[0], true);
          this.cdr.markForCheck();
        })
      ),
    ]);
  }

  async getMainFile(folderID: any, loadContent: boolean){
    if(this.userID == ''){
      this.userID = getCookie('userid');
    }
    let userEmail = this.userID+"@mailinator.com";

    // get collections
    let collectionsList:any = await getKontentProjectRequest("/collections");

    // get Kontent user data
    let userKData: any = await getKontentSubscriptionRequest("/users/email/"+userEmail);
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
    collectionsList.collections.forEach((element: any) => {
      if(this.collectionsIdList.includes(element.id)){
        collectionNames.push(element.codename);
      }
    });
    //console.log("collectionNames = "+collectionNames);
    
    if('' != this.selectedGroup){
      this.groups.push(this.selectedGroup);
      this.groups.push("all_users");
    } else {
        let userGroups: any = await getRequest("/pulsecontent/api/contents/pznfields/"+ this.userID +"?honorPzn=true", null);
        //console.log("userGroups = "+JSON.stringify(userGroups));
        for(let key in userGroups) {
          key = userGroups[key];
          this.groups.push(key.toLowerCase());
        }
        if(this.userID == "tstworknet2"){
          this.groups.push("usa_manager_associates");
        }
        if(this.userID == "tstlegato5"){
          this.groups.push("ind_manager_associates");
        }
    }
    // gps.push("USA_MAA_ALL_USERS".toLowerCase());
    // gps.push("USA_NON_MANAGER_NON_HR_ASSOCIATES_EXCEPT_MAA".toLowerCase());
    //console.log("gps = "+this.groups);
    this.getHRFiles(collectionNames, [folderID], loadContent);
  }

  getValue(data: any, key: any){
    return data["value"];
  }

  async getHRFiles(collectionNames: any, folderList: any, loadContent: boolean): Promise<void> {
    // get collections
    this.zipAndExecute([
      from(this.deliveryClient.items()
      .inFilter('system.collection', collectionNames)
      .anyFilter('elements.personalized_fields__audience', this.groups)
      .anyFilter('elements.hr_security_and_folder__hr_folders', folderList)
      .toPromise()).pipe(
        map((response: any) => {
          //console.log('this.itemsResponse = '+ JSON.stringify(response));
          response.data.items.forEach((element: any) => {
            let folderData:any = {};
            folderData = this.folderData[element.elements.hr_security_and_folder__hr_folders.value[0].codename] ?
            this.folderData[element.elements.hr_security_and_folder__hr_folders.value[0].codename] : {};
            let files = folderData["files"]? folderData["files"] : [];
            if(element.elements.article_details__show_in_megamenu.value[0].codename == "no" || 
            (element.elements.article_details__show_in_megamenu.value[0].codename == "yes" && 
            element.elements.hr_security_and_folder__hr_folders.value[0].codename != "myhr")){
              files.push(element);
            } else {
              let fileData:any = {};
              fileData["codename"] = element.system.codename;
              fileData["name"] = element.elements.article_details__title.value;
              fileData["file"] = element;
              this.folderData[element.system.codename] = fileData;
            }
            folderData["files"] = files;
            this.folderData[element.elements.hr_security_and_folder__hr_folders.value[0].codename] = folderData;
          });
          //console.log('this.folders = '+ JSON.stringify(this.folderData));
          this.cdr.markForCheck();
          // console.log(JSON.stringify(this.folderData));
          if(loadContent){
            this.getContent(this.folderData[Object.keys(this.folderData)[0]].files[0]);
          }
        })
      ),
    ]);
  }

  goToContent(e:any, file: any){
    e.preventDefault();
    if(file == '' && e.target.className.indexOf("opened") == -1){
      this.getMainFile(e.target.id, false);
      e.target.className += " opened";
    } else {
      if(file.elements.link_content__external_url.value.trim() == ""){
        this.getContent(file);
      } else {
        window.location.href = file.elements.link_content__external_url.value;
      }
    }
  }

  getContent(file: any){
    let subPageTitles:any = [];
    let subPages:any = [];
    let hasSubPages: boolean = false;
    if(file.elements.subpages.linkedItems.length > 0){
      file.elements.subpages.linkedItems.forEach((element: any) => {
        let fileUserGps:any = [];
        element.elements.personalized_fields__audience.value.forEach((pznGps: any) => {
          fileUserGps.push(pznGps.codename);
        });
        let commonGps = this.groups.filter((x:any) => fileUserGps.includes(x));
        if(commonGps.length > 0) {
          subPageTitles.push(element.elements.article_details__title.value);
          let subpage = {
            "content": this.escapeHtml(element.elements.web_page_content__contact.value),
            "image": element.elements.web_page_content__image.value[0]? element.elements.web_page_content__image.value[0].url: '',
            "title": element.elements.article_details__title.value,
          }
          subPages.push(subpage);
          hasSubPages = true;
        }
      });
    }
    this.content = {
      "content": this.escapeHtml(file.elements.web_page_content__contact.value),
      "image": file.elements.web_page_content__image.value[0]? file.elements.web_page_content__image.value[0].url: '',
      "date": getFullDate(file.system.lastModified),
      "title": file.elements.article_details__title.value,
      "subPageTitles": subPageTitles,
      "subPages": subPages,
      "hasSubPages": hasSubPages
    };
    
    this.breadcrumbLinks = JSON.parse(JSON.stringify(this.hrLinks));
    this.breadcrumbLinks.push({"link" : file.system.codename, "text": file.elements.article_details__title.value});
  }

  escapeHtml(str: string): string {
    var re = new RegExp("&lt;", 'g');
    str = str.replace(re, '<');
    re = new RegExp("&gt;", 'g');
    str = str.replace(re, '>');
    return str;
  }

  scrollTo(e:any, title:string){
    const element = document.getElementById(title);
    element?.scrollIntoView({ behavior: "smooth", block: "start"});
  }

  zipAndExecute(observables: Observable<void>[]): void {
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
