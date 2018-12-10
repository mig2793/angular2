import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders,HttpParams} from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

@Injectable({
  providedIn: 'root'
})

export class CoordinadoresService {

    private BASEURL:string = window.location.host + "/coordinador/";
    //private BASEURL:string = "http://172.22.4.200/coordinador/";
    token:string = "";

    constructor(private http:HttpClient) { }

    getServices(url:string): Promise<any> {
        return this.http.get(this.BASEURL + url)
            .toPromise()
            .then(response => {
                return response;
            })
            .catch(err => {
                throw err;
            });
    }

    getServicesNotheader(url:string): Promise<any> {
        return this.http.get(this.BASEURL + url)
            .toPromise()
            .then(response => {
                return response;
            })
            .catch(err => {
                throw err;
            });
    }

    postServices(url:string,data:any): Promise<any> {
        return this.http.post(this.BASEURL + url,data)
            .toPromise()
            .then(response => {
                return response;
            })
            .catch(err => {
                throw err;
            });
    }

    putServices(url:string,data:any): Promise<any> {
        return this.http.put(this.BASEURL + url,data)
            .toPromise()
            .then(response => {
                return response;
            })
            .catch(err => {
                throw err;
            });
    }

    deleteServices(url:string): Promise<any> {
        return this.http.delete(this.BASEURL + url)
            .toPromise()
            .then(response => {
                return response;
            })
            .catch(err => {
                throw err;
            });
    }
}
