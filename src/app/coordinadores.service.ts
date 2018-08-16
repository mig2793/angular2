import { Injectable } from '@angular/core';
import {Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable({
  providedIn: 'root'
})
export class CoordinadoresService {

  constructor(private http:Http) { }


  /*getCoordinates():Promise<>{

  }*/
}
