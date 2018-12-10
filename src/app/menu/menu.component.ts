import { Component, OnInit,Input,Output} from '@angular/core';
import { trigger,state,style,animate,transition} from '@angular/animations';
import { UtilsService } from '../utils.service';
import { Router } from '@angular/router';

@Component({
  	selector: 'app-menu',
  	templateUrl: './menu.component.html',
  	styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
	@Input() state: string = "inactive";
	usuario:string;
	ambiente:String;
 	constructor(private router:Router,private util:UtilsService) { }

	ngOnInit() {
		this.usuario = sessionStorage.getItem("usuario");
		let getInfoLocalStorage = this.util.getLocalStorage("coordinadores");
		this.ambiente = getInfoLocalStorage.ambiente;
	}

	closeSession() {
		sessionStorage.removeItem("usuario");
		this.router.navigateByUrl('/login');
	}

}
