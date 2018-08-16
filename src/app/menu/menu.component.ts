import { Component, OnInit,Input} from '@angular/core';
import { trigger,state,style,animate,transition} from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  	selector: 'app-menu',
  	templateUrl: './menu.component.html',
  	styleUrls: ['./menu.component.css'],
  	animations: [
    	trigger('animatefilter', [
      	state('inactive', style({
        	transform: 'translatex(100%)',
        	display : 'none'
     	 })),
      	state('active',   style({
      		transform: 'translatex(0)',
        	display : 'block'
      	})),
      	transition('inactive => active', animate('1000ms ease-in')),
     	transition('active => inactive', animate('1000ms ease-out'))
    ])
  ]
})
export class MenuComponent implements OnInit {
	@Input() state: string = "inactive";
 	constructor(private router:Router) { }

	ngOnInit() {

	}

	filterAnimate() {
		this.state = this.state === 'active' ? 'inactive' : 'active';
	}

	closeSession() {
		this.router.navigateByUrl('/login');
	}

}
