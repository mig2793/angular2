import { Component, OnInit,Input} from '@angular/core';
import { trigger,state,style,animate,transition} from '@angular/animations';

@Component({
  	selector: 'app-menu',
  	templateUrl: './menu.component.html',
  	styleUrls: ['./menu.component.css'],
  	animations: [
    	trigger('animatefilter', [
      	state('inactive', style({
        	transform: 'scale(0)',
        	display : 'none'
     	 })),
      	state('active',   style({
        	transform: 'scale(1)',
        	display : 'block'
      	})),
      	transition('inactive => active', animate('500ms ease-in')),
     	transition('active => inactive', animate('500ms ease-out'))
    ])
  ]
})
export class MenuComponent implements OnInit {
	@Input() state: string;
 	constructor() { }

	ngOnInit() {

	}

	filterAnimate() {
		this.state = this.state === 'active' ? 'inactive' : 'active';
	}

}
