import { Component, OnInit } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  	selector: 'app-coordinadores',
  	templateUrl: './coordinadores.component.html',
  	styleUrls: ['./coordinadores.component.css']
})
export class CoordinadoresComponent implements OnInit {
	closeResult: string;
  	constructor(private modalService: NgbModal) { }

  	ngOnInit() {
  	
  	}

	open(content) {
	    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
	      this.closeResult = `Closed with: ${result}`;
	    }, (reason) => {
	    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
	  	});
	}
    private getDismissReason(reason: any): string {
 if (reason === ModalDismissReasons.BACKDROP_CLICK) {
	      return 'by clicking on a backdrop';
	    } else {
	      return  `with: ${reason}`;
	    }
  	}

}
