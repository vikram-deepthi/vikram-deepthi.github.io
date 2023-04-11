const handleErrorResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.indexOf('application/json') !== -1) {
        const errorMessage = await readJSON(response);
        throw new Error(JSON.stringify(errorMessage));
    } else {
        const errorMessage = await readText(response);
        throw new Error(errorMessage);
    }
}

const readJSON = (response: Response) => {
    return response.json();
}

const readText = (response: Response) => {
    return response.text();
}

const handleResponse = (response: Response) => {
    if (!response.ok) {
        return handleErrorResponse(response);
}

const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
        return readJSON(response);
    } else {
        return readText(response);
    }
}

export const getDate = (dateString: string) => {
    let ms = new Date(Date.parse(dateString));
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[ms.getMonth()].substring(0,3) + " " + ms.getDate();
}

export const getFullDate = (dateString: string) => {
    let ms = new Date(Date.parse(dateString));
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[ms.getMonth()] + " " + ms.getDate()+", " + ms.getFullYear();
}

export const getRequest = <T>(url: string, user: any): Promise<T> => {
    if(null != user){
        let headers = new Headers();
        headers.append("SMUSER", user);
        var requestOptions = {
            method: 'GET',
            headers: headers
        };
        return fetch(url, requestOptions).then(handleResponse);
    } else {
        return fetch(url).then(handleResponse);
    }
}

const  APIKey = "ew0KICAiYWxnIjogIkhTMjU2IiwNCiAgInR5cCI6ICJKV1QiDQp9.ew0KICAianRpIjogImEzZTVlMTU3Yjg1ZjRkYWVhZDhmZDUzYjQxNDdhZjkwIiwNCiAgImlhdCI6ICIxNjgwMTI2MjE2IiwNCiAgImV4cCI6ICIxNjk2MDIzNzgwIiwNCiAgInZlciI6ICIzLjAuMCIsDQogICJ1aWQiOiAiNjNmZmQwNjEyYjdhZDA1ZjMzOTk5OGM2IiwNCiAgInN1YnNjcmlwdGlvbl9pZCI6ICIzOTdmMzdlY2EyYjk0Njc1OWQ2YTVkNWU0NGUwM2JiYiIsDQogICJhdWQiOiAibWFuYWdlLmtlbnRpY29jbG91ZC5jb20iDQp9.9eZcEQ_0GELqTKF-ijwikfkprEC3mQNXcQHP9NrYRtA";
export const previewAPIKey = 'ew0KICAiYWxnIjogIkhTMjU2IiwNCiAgInR5cCI6ICJKV1QiDQp9.ew0KICAianRpIjogIjY5ODFjZTc3MDgwYzQ1MzJhNWM5ZGRjZmYxMDBjY2E5IiwNCiAgImlhdCI6ICIxNjgwOTA1MjI4IiwNCiAgImV4cCI6ICIxNzEyNTI3NjIwIiwNCiAgInZlciI6ICIyLjAuMCIsDQogICJzY29wZV9pZCI6ICI3MWM1NzYzZmJmOTM0ZjRjOTRkNTJhOWRlYzZiMjI0YyIsDQogICJwcm9qZWN0X2NvbnRhaW5lcl9pZCI6ICJiNGYyMmNkMDlmZTMwMDkyY2QyNTZjYzM4N2MxZTY2NSIsDQogICJhdWQiOiAiZGVsaXZlci5rb250ZW50LmFpIg0KfQ.cm2KN2p51ML8ocD4FCRC_F52DE9izQR-1f8qCKq8tpM';
const subscriptionId = '397f37ec-a2b9-4675-9d6a-5d5e44e03bbb';
export const projectId = '27fea92e-2633-0035-9c21-b601899437c5';
let domain = 'https://manage.kontent.ai/v2/';

export const getKontentSubscriptionRequest = <T>(url: string): Promise<T> => {
    return getKontentRequest(domain + "subscriptions/"+ subscriptionId + url);
}

export const getKontentProjectRequest = <T>(url: string): Promise<T> => {
    return getKontentRequest(domain + "projects/"+ projectId + url);
}

export const getKontentRequest = <T>(url: string): Promise<T> => {
    let myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", "Bearer "+APIKey);

    let requestOptions = {
      method: 'GET',
      headers: myHeaders
    };
    return fetch(url, requestOptions).then(handleResponse);
}

export const getCookie= (name: string) => {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '');
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return '';
}