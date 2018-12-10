import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  setLocalStorage(key:string,data:any){
    data = JSON.stringify(data);
    localStorage.setItem(key,data);
  }

  getLocalStorage(key:string):any{
    let data = localStorage.getItem(key); 
    data = JSON.parse(data);
    return data;
  }
}
