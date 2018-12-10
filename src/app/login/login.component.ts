import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '../utils.service';
import { CoordinadoresService } from '../coordinadores.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(
		private router: Router,
		private services:CoordinadoresService,
		private util:UtilsService) { }
	data = {
		coordinador : "-1",
		usuario : "",
		contrasena : ""
	};
	mensajeRespuesta:String = "";
	coordinadores:any = {};

  	ngOnInit() {
		this.coordinadores["coordinadores"] = [];
		this.getCoordinadores();
	}

  	login = function (data) {
		let url = "login";
		this.services.postServices(url,data).then(response => {
			if(response.login){
				this.router.navigateByUrl('/menu');
				sessionStorage.setItem("usuario", data.usuario.toUpperCase());
				sessionStorage.setItem("token", response.token);
			}else{
				this.mensajeRespuesta = "No se pudo iniciar sesión. Usuario o contraseña incorrecto.";
				var element = document.getElementById("modal-general");
				element.style.display = "block";
			}
		},
		err => err)
	}

	//Obtiene todos los coordinadores
	getCoordinadores() {
		let url = "getCoordinadores";
		this.services.getServicesNotheader(url).then(response => {

			this.util.setLocalStorage("coordinadores",response);

			for(let i=0;i<Object.keys(response.coordinadores).length;i++){
				this.coordinadores["coordinadores"].push(response.coordinadores[Object.keys(response.coordinadores)[i]]);
			}
		},
		err => err)
	}

	//Oculta los pop-up
	ocultarPopUp(popup){
		let element = document.getElementById(popup);
		element.style.display = "none";
	}
}
