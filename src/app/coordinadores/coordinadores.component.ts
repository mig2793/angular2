import {Component, OnInit, OnDestroy,Input} from '@angular/core';
import {Subscription} from "rxjs";
import {TimerObservable} from "rxjs/observable/TimerObservable";
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { trigger,state,style,animate,transition} from '@angular/animations';
import { CoordinadoresService } from '../coordinadores.service';
import { UtilsService } from '../utils.service';
import { FilterPipePipe} from '../filter-pipe.pipe'
import { SortPipe} from '../sort.pipe'
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Component({
  	selector: 'app-coordinadores',
  	templateUrl: './coordinadores.component.html',
	styleUrls: ['./coordinadores.component.css'],
	providers: [CoordinadoresService,UtilsService],
	//Animaciones de la pantalla de coordinadore
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
    	]),
  	]
})
export class CoordinadoresComponent implements OnInit {
	closeResult: string;
	@Input() slideStateOffices: string = "inactive";
	@Input() slideProperties: string = "inactive";
	stateFilter = "inactive";

	idOficina  = ""; coordinador = ""; usuario:string; mensajeRespuesta:String = "";
	messageErrorGeneral:string;
	oficinaOver:any = {}; oficinaDatos:any = {}; oficinasTemp:any = {}; propiedad:any = {};
	oficinaEstado:any = {}; oficinas:any = {}; menuPanel:Object = {}; panelInfo:Object = {};
	blocksJson:any = {}; coordinadores:any = {};
	event:any; IntervalEstadoOficina:any; propiedadesOficinas:any; estadoOficinas:any;
	IntervalgetOficinas:any; filterCoord:any; filter:any; filterPool:any;
	varRecursiveOffices:number = 0;	varRecursiveOfficesUpdate:number = 0; servicioOficinas:number;

	estrcuturaCoord:any={
		"coordinador": "",
    	"estado": "",
		"oficinas": [],
		"mensaje": "",
    	"respuesta": ""
	}

	//El atributo menu tiene el objeto Json que abre el menu con click izquierdo de las opciones por oficina.
	menu = 
	{
		"states":
		[
			{"id":"1","name":"Subir","class":"block-listen","action":"goup"},
			{"id":"2","name":"Arrancar","class":"block-active","action":"pull"},
			{"id":"3","name":"Detener","class":"block-stop","action":"stop"},
			{"id":"4","name":"Finalizar","class":"block-inactive","action":"finalize"},
			{"id":"5","name":"Reiniciar","class":"block-inactive-time","action":"pull"}
		],
		"options":
		[
			{
				"name":"Estado Oficina",
				"action":"stateOffices"
			},
			{
				"name":"Propiedades Oficina",
				"action":"propertiesOffices",
			}
		]
	};

	constructor(
		private modalService: NgbModal,
		private router:Router,
		private services:CoordinadoresService,
		private util:UtilsService){}

  	private tick: string;
	private subscription: Subscription;
	private subscriptionOffices: Subscription;  

  	ngOnInit() {
		//Valida si el usuario se encuentra logueado
		this.validarLoguin();
		this.getCoordinadores();
		//Se inicializan los atributos necesarios
		this.oficinasTemp["coordinadores"] = [];
		this.oficinas["coordinadores"] = [];
		this.blocksJson['officesStates'] = [];
		this.coordinadores["coordinadores"] = [];
		this.servicioOficinas = 0;
		this.reloadPage();
	}

	reloadPage(){
		setInterval(()=> {
			location.reload();
		},600000); 
	}

	validarLoguin(){
		this.usuario = sessionStorage.getItem("usuario");
		if(this.usuario == null)
			this.router.navigateByUrl('/loguin');
	}

	filterAnimate() {
		this.stateFilter = this.stateFilter === 'active' ? 'inactive' : 'active';
	}

	//Método que permite seleccionar multiples oficinas por coordinador
	active(event:any){

		let office = event.target.getAttribute('data-type');
		//Valida si el elemento 'coord' se encuentra en el objeto JSON.
		//Este elemento guardar el coordinador que actualmente se está manipulado
		if(!this.blocksJson.hasOwnProperty('coord')){
			this.blocksJson['coord'] = event.target.parentElement.parentElement.parentElement.id;
			this.blocksJson['officesStates'] = [];
		}	
		//Se guardan las oficinas seleccionadas en el atributo blockJson, validando si:
		//1. si la oficina ya se encuentra en estado seleccionada, quita la selección, si no, la selecciona
		//2. Valida que la oficina que se está seleccionando, se encuentre en el mismo estado que las anteriores seleccionadas (class="active")
		//3. Valida que la oficina que se está seleccionando, esté sea del mismo coordinador de las oficinas anteriores
		if(this.blocksJson["coord"] == event.target.parentElement.parentElement.parentElement.id){
			if(this.blocksJson["officesStates"].length <= 0 || 
			this.blocksJson["officesStates"][0].split("_")[0] == office.split("_")[0]){
				if(event.target.classList.contains("active")){
					var removeElement = this.blocksJson["officesStates"].indexOf(office);
					event.target.classList.remove('active')
					this.blocksJson['officesStates'].splice(removeElement,1);
					if(this.blocksJson["officesStates"].length <= 0)
						delete this.blocksJson["coord"];
				}else{
					event.target.classList.add('active')
					this.blocksJson['officesStates'].push(office);
				}
			}else{
				this.blocksJson["officesStates"] = [];
				this.removeClassActivepush();
				event.target.classList.add('active')
				this.blocksJson["officesStates"].push(office);
				console.log("No se puede seleccionar mas de una oficina con diferente estado");
			}
		}else{
			this.blocksJson['coord'] = event.target.parentElement.parentElement.parentElement.id;
			this.blocksJson["officesStates"] = [];
			this.removeClassActivepush();
			event.target.classList.add('active')
			this.blocksJson["officesStates"].push(office);
			console.log("No se puede seleccionar mas de una oficina de diferente coordinador");		
		}

		console.log(this.blocksJson);
	}

	//Abre el menú de las opciones por oficina con el click derecho.
	onRightClick(event:any){
		let coorX = event.clientX, coorY = event.clientY;
		this.menu.states = [];
		let state= [];
	
		this.idOficina = event.target.id;
		this.coordinador = event.target.parentElement.parentElement.parentElement.id.split("_")[1];
		let propiedadesOficina = event.target.getAttribute('data-attr').split("_");

		//Oficina en estado Inactiva
		if(propiedadesOficina[1] == "0"){
			state = 
			[
				{
					"id":"1",
					"name":"Subir",
					"class":"block-listen",
					"action":"goup"
				},
				{
					"id":"2",
					"name":"Arrancar",
					"class":"block-active",
					"action":"pull"
				}
			]
			this.menu.states = state;
		}
		//Oficina en estado Listen
		else if(propiedadesOficina[1] == "1"){
			state = 
			[
				{
					"id":"4",
					"name":"Finalizar",
					"class":"block-inactive",
					"action":"finalize"
				}
			]
			this.menu.states = state;
		}
		//Oficina en estado Conectada-detenida
		else if(propiedadesOficina[1] == "2"){
			state = 
			[
				{
					"id":"2",
					"name":"Arrancar",
					"class":"block-active",
					"action":"pull"
				},
				{
					"id":"4",
					"name":"Finalizar",
					"class":"block-inactive",
					"action":"finalize"
				}
			]
			this.menu.states = state;			
		}
		//Oficina en estado Activa
		else if(propiedadesOficina[1] == "3"){
			state = 
			[
				{
					"id":"3",
					"name":"Detener",
					"class":"block-stop",
					"action":"stop"
				},
				{
					"id":"4",
					"name":"Finalizar",
					"class":"block-inactive",
					"action":"finalize"
				}
			]
			this.menu.states = state;				
		}

		//Abre el menú
		if(event.clientX+180 > window.innerWidth)
			coorX = event.clientX - 180;
		
		if(event.clientY+100 > window.innerHeight)
			coorY = event.clientY - 100;

		this.menuPanel = 
		{
			'display': 'block',
			'left':coorX + 'px',
			'top':coorY + 'px'
		}

		return false;
	}

	//Ejecuta la acción del evento lanzado en las opciones del menú de las oficinas.
	panelOptions(item:string,event:any){
		let oficina = event == undefined ? this.idOficina : event.target.id;
		let oficinas = [];
		let coordinador = event == undefined ? this.coordinador : event.target.parentElement.parentElement.parentElement.id.split("_")[1];
		var datals = this.util.getLocalStorage("coordinadores");
		let idCoord = coordinador;
		let idCoordinador = Number(datals.coordinadores[coordinador].id);
		let usuario = this.usuario;

		//Valida si existe alguna oficina seleccionada en el atributo blocksJson

		if(this.blocksJson.officesStates.length>0){
			for(var i=0;i<this.blocksJson.officesStates.length;i++){
				//Inserta en la variable oficinas[], todas las oficinas que se encuentran seleccionadas
				oficinas.push(Number(this.blocksJson.officesStates[i].split("_")[1]));
			}
		}else
			//Inserta la única oficina seleccionada
			oficinas.push(Number(oficina));

		//IntervalEstadoOficina, limpia el evento interval que trae los estados de la oficina.
		//con el fin, que cada vez que se ejecute una acción para la(s) oficinas no quede ejecutandose
		//el evento indefinidamente.
		clearInterval(this.IntervalEstadoOficina);
		switch(item){
			//Trae el estado de la(s) oficina(s)
			case 'stateOffices':
				this.getEstadoXOficina(oficinas,coordinador,event);
				if(this.blocksJson.officesStates.length>1){
					var element = document.getElementById("modal-office-states");
					element.style.display = "block";
				}
				else{
					this.IntervalEstadoOficina = setInterval(() => { 
						this.getEstadoXOficina(oficinas,coordinador,event);
					}, 2000);
					this.silderStateActive();
				}
				break;
			//Trae las propiedades de la(s) oficina(s)
			case 'propertiesOffices' :
				this.getPropiedadesXOficina(oficinas,coordinador);
				if(this.blocksJson.officesStates.length>1){
					var element = document.getElementById("modal-office-properties");
					element.style.display = "block";
				}
				else
					this.silderPropertiesActive();

				break;
			//cambia el estado de la(s) oficina(s) a subirOficinas
			case 'goup':	
				this.cambiarEstado(idCoordinador,oficinas,usuario,idCoord,"subirOficinas");
				break;
			//cambia el estado de la(s) oficina(s) a arrancarOficinas
			case 'pull':
				this.cambiarEstado(idCoordinador,oficinas,usuario,idCoord,"arrancarOficinas");
				break;
			//cambia el estado de la(s) oficina(s) a finalizarOficinas
			case 'finalize':
				this.cambiarEstado(idCoordinador,oficinas,usuario,idCoord,"finalizarOficinas");
				break;
			//cambia el estado de la(s) oficina(s) a detenerOficinas
			case 'stop':
				this.cambiarEstado(idCoordinador,oficinas,usuario,idCoord,"detenerOficinas");
				break;
		}
		this.closePanel();
	}

	//cierra el menu de las opciones de las oficinas.
	closePanel(){
		this.menuPanel = 
		{
			'display': 'none'
		}
		return false;
	}

	//Permite eleminar las clases active de todos las oficinas que la tienen asignada.
	removeClassActivepush(){
		let elems = document.getElementsByClassName("block-office");
		[].forEach.call(elems, function(el) {
			el.classList.remove("active");
		});
	}

	OverPanelBlock(event: MouseEvent,state:boolean): void {
		this.event = event;
		let timer;
		let propiedadesOficina = this.event.target.getAttribute('data-attr').split("_");
		let coorX = event.clientX, coorY = event.clientY;

		this.oficinaOver["nombreActual"] = propiedadesOficina[0];

		if(propiedadesOficina[1] == 0)
			this.oficinaOver["estadoActual"] = "Inactiva";
		else if(propiedadesOficina[1] == 1)
			this.oficinaOver["estadoActual"] = "Listen";
		else if(propiedadesOficina[1] == 2)
			this.oficinaOver["estadoActual"] = "Conectada-Detenida";
		else if(propiedadesOficina[1] == 3)
			this.oficinaOver["estadoActual"] = "Activa";

		this.oficinaOver["inicioSituacionActual"] = propiedadesOficina[2];
		this.oficinaOver["inicioEstadoActual"] = propiedadesOficina[3];
		
		if(state == true){
					//Abre el menú
		if(event.clientX+120 > window.innerWidth)
			coorX = event.clientX - 120;
		
		if(event.clientY+50 > window.innerHeight)
			coorY = event.clientY - 50;

			timer = TimerObservable.create(2000);
			this.subscription = timer.subscribe(t => {
				this.panelInfo = 
				{
					'display': 'block',
					'left':coorX + 'px',
					'top':coorY + 'px'
				}
			});
		}else{
			this.subscription.unsubscribe();
			this.panelInfo = 
			{
				'display': 'none'
			}		
		}
	}
	
	//Obtiene todos los coordinadores
	getCoordinadores() {
		let url = "getCoordinadores";
		this.services.getServicesNotheader(url).then(response => {
			//Guarda los coordinadores en el localStorage para manipularlos en otros métodos
			//let data = this.util.getLocalStorage("coordinadores");
			//if(data == undefined)
			this.util.setLocalStorage("coordinadores",response);

			for(let i=0;i<Object.keys(response.coordinadores).length;i++){
				this.coordinadores["coordinadores"].push(response.coordinadores[Object.keys(response.coordinadores)[i]]);
			}
			this.servicioOficinas = response.servicio_oficinas;
			//Llama a los metodos para traer las oficinas y actualizar su estado
			this.getOffices();
		},
		err => {
			this.errorMessageshow("Ha ocurrido un error al traer los coordinadores. Error del servidor" + err.message);
		})
	}

	//Obtiene todas las oficinas por coordinador
	getOffices() {
		let data = this.util.getLocalStorage("coordinadores");
		if(data != undefined){
			let url = `getOficinas/${data.coordinadores[Object.keys(data.coordinadores)[this.varRecursiveOffices]].id}/${Object.keys(data.coordinadores)[this.varRecursiveOffices]}`;
			this.services.getServices(url).then(response => {
				response["coordinador"] = response.coordinador;
				//Ejecuta el metodo dependiendo los n coordinadores que existan en el servidor
				//La ejecución la realiza de manera organizada, hasta que no reciba respuesta del server 
				//no ejecuta o no devuelve la información del siguiente coordinador
				this.oficinas["coordinadores"].push(response)

				for(let i=0;i<this.oficinas.coordinadores.length;i++){
					this.oficinas.coordinadores[i]["message"] = "";
				}
				
				if(this.varRecursiveOffices < Object.keys(data.coordinadores).length-1){
					this.varRecursiveOffices++;
					this.getOffices();
				}else{
					this.varRecursiveOffices = 0;
					this.UpdateOfficesService();
				}
			},
			err => {
				this.oficinas["coordinadores"].push(this.estrcuturaCoord);
				this.oficinas.coordinadores[this.varRecursiveOffices].message = `Ha ocurrido un error al traer las oficinas del coordinador ${this.varRecursiveOffices+1}. Error del servidor: ${err.message}`;
				
				if(this.varRecursiveOffices < Object.keys(data.coordinadores).length-1){
					this.varRecursiveOffices++;
					this.getOffices();
				}else{
					this.varRecursiveOffices = 0;
					this.UpdateOfficesService();
				}
			})
		}
	}

	//Actualiza el estado y los atributos de las oficinas, además valida si existen oficinas nuevas.
	UpdateOfficesService() {
		let data = this.util.getLocalStorage("coordinadores");
		let url = `getOficinas/${data.coordinadores[Object.keys(data.coordinadores)[this.varRecursiveOfficesUpdate]].id}/${Object.keys(data.coordinadores)[this.varRecursiveOfficesUpdate]}`;
		this.services.getServices(url).then(response => {
			response["coordinador"] = response.coordinador;
			this.oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate] = response;
			this.UpdateOffices(this.oficinasTemp);
			this.oficinas.coordinadores[this.varRecursiveOfficesUpdate].message="";
			//Valida si ya se han traido todos las oficianas por coordinador.
			if(this.varRecursiveOfficesUpdate < Object.keys(data.coordinadores).length-1){
				this.varRecursiveOfficesUpdate++;
				this.UpdateOfficesService();
			}else{
				this.varRecursiveOfficesUpdate = 0;
				//Ejecuta este mismo método indefinidamente, actualizando el estado de las oficinas.
				//El tiempo de ejecución lo define la variable this.servicioOficinas, la cual viene del
				//Objeto Json de la configuración ya definido
				let timer = TimerObservable.create(this.servicioOficinas);
				this.subscriptionOffices = timer.subscribe(t => {
					this.UpdateOfficesService();
				});
			}
		},
		err => {
			this.oficinas.coordinadores[this.varRecursiveOfficesUpdate].message = `Ha ocurrido un error al traer las oficinas del coordinador ${this.varRecursiveOfficesUpdate+1}. Error del servidor: ${err.message}`;
			this.oficinas.coordinadores[this.varRecursiveOfficesUpdate].oficinas = [];
			if(this.varRecursiveOfficesUpdate < Object.keys(data.coordinadores).length-1){
				this.varRecursiveOfficesUpdate++;
				this.UpdateOfficesService();
			}else{
				this.varRecursiveOfficesUpdate = 0;
				let timer = TimerObservable.create(this.servicioOficinas);
				this.subscriptionOffices = timer.subscribe(t => {
					this.UpdateOfficesService();
				});
			}
		})
	}

	//Realiza un recorrido oficina por oficina, buscando alguna novedad para ser actualizada en pantalla
	UpdateOffices(oficinasTemp:any){
		let oficinaExiste:boolean = false;
		for(let i=0;i<oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas.length;i++){
			for(let j=0;j<this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas.length;j++){
				if(oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].idOficina == this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].idOficina){
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].operacion = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].operacion;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].categoria = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].categoria;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].estadoActual = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].estadoActual;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].numeroTransacciones = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].numeroTransacciones;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].ultimoTiempoOficina = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].ultimoTiempoOficina;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].ultimoTiempoCoordinador = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].ultimoTiempoCoordinador;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].ultimoTiempoCTGCICS = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].ultimoTiempoCTGCICS;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].idCoordinador = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].idCoordinador;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].traceOficina = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].traceOficina;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].inicioSituacionActual = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].inicioSituacionActual;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].inicioEstadoActual = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].inicioEstadoActual;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].nombreActual = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].nombreActual;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].idPool = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].idPool;
					this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[j].iModoConexion = oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i].iModoConexion;			
					oficinaExiste = true;
					break;
				}
			}
			if(oficinaExiste == false){
				this.oficinas["coordinadores"][this.varRecursiveOfficesUpdate].oficinas.push(oficinasTemp["coordinadores"][this.varRecursiveOfficesUpdate].oficinas[i]);
			}
			oficinaExiste = false;
		}
		/*Se reinicializa el atributo this.oficinasTemp, para que al realizar la busqueda de las oficinas
		no mantenga los valores que previamente fueron cargados en esta varible.*/
		this.oficinasTemp["coordinadores"] = {};
	}

	//Método que invoca el servicio de las propiedades por oficina
	getPropiedadesXOficina(oficinas, coordinador:any) {
		var datals = this.util.getLocalStorage("coordinadores");
		let idCoord = coordinador;
		let user = this.usuario;
		let oficina=oficinas[0];
		for(let i=1; i<oficinas.length; i++){
			oficina = oficina + ',' + oficinas[i];
		}
		let url = `getPropiedadesOficinas/${oficina}/${user}/${idCoord}`;
		this.errorMessagehide();
		this.services.getServices(url).then(response => {
			//Quita las oficinas seleccionadas una vez haya compeltado la búsqueda y mostrado los resultados
			this.blocksJson["officesStates"] = [];
			this.removeClassActivepush();
			this.propiedadesOficinas =  response.propiedades;
			for(let j=0; j<this.propiedadesOficinas.length;j++){
				this.propiedadesOficinas[j]["ipdesde"] = this.propiedadesOficinas[j].rangoDireccionesIp.split("-")[0];
				this.propiedadesOficinas[j]["iphasta"] = this.propiedadesOficinas[j].rangoDireccionesIp.split("-")[1];
			}
			this.propiedad = response.propiedades[0];
			this.propiedad["ipdesde"] = this.propiedad.rangoDireccionesIp.split("-")[0];
			this.propiedad["iphasta"] = this.propiedad.rangoDireccionesIp.split("-")[1];
		},
		err => {
			this.errorMessageshow("Ha ocurrido un error al traer las propiedades de la(s) oficina(s). Error del servidor: " + err.message);
		})
	}
	//Método que invoca el servicio del estado por oficina
	getEstadoXOficina(oficinas,coordinador:any,event:any) {
		var datals = this.util.getLocalStorage("coordinadores");
		let idCoord = coordinador;
		let user = this.usuario;
		let oficina=oficinas[0];
		for(var i=1; i<oficinas.length; i++){
			oficina = oficina + ',' + oficinas[i];
		}
		let url = `getEstadosOficinas/${oficina}/${user}/${idCoord}`;
		if(event != undefined){
			let propiedadesOficina = event.target.getAttribute('data-attr').split("_");
			this.oficinaDatos["nombreActual"] = propiedadesOficina[0];
		}
		this.errorMessagehide();
		this.services.getServices(url).then(response => {
			//Quita las oficinas seleccionadas una vez haya compeltado la búsqueda y mostrado los resultados
			this.blocksJson["officesStates"] = [];
			this.removeClassActivepush();
			this.estadoOficinas = response.estadoOficinas;
			for(let j=0; j<this.estadoOficinas.length;j++){
				this.estadoOficinas[j]["ipdesde"] = this.estadoOficinas[j].rangoDireccionesIp.split("-")[0];
				this.estadoOficinas[j]["iphasta"] = this.estadoOficinas[j].rangoDireccionesIp.split("-")[1];
			}
			this.oficinaEstado = response.estadoOficinas[0];
			this.oficinaEstado["ipdesde"] = this.oficinaEstado.rangoDireccionesIp.split("-")[0];
			this.oficinaEstado["iphasta"] = this.oficinaEstado.rangoDireccionesIp.split("-")[1];
		},
		err => {
			this.errorMessageshow("Ha ocurrido un error al traer el estado de la(s) oficina(s). Error del servidor: " + err.message)
		})
	}

	//Cambia el estado de la(s) oficina(s)
	
	cambiarEstado(idCoordinador:number,idOficinas,usuario:string,idCoord:string,url:string){
		let data={
			idCoordinador : idCoordinador,
			idOficinas : idOficinas,
			usuario : usuario,
			idCoord : idCoord
		}
		this.errorMessagehide();
		this.services.putServices(url,data).then(response =>{
			if(response.respuesta == "error"){
				this.mensajeRespuesta = response.errorMessage;
				var element = document.getElementById("modal-general");
				element.style.display = "block";
			}
		},
		err => {
			this.errorMessageshow("Ha ocurrido un error al cambiar el estado de la(s) oficina(s). Error del servidor: " + err.message);
		})
	}

	//Abre el slide de las propiedades de la oficina seleccionada
	sliderProperties() {
		this.slideProperties  = this.slideProperties === 'active' ? 'inactive' : 'active';
	}
	
	//Abre el slide de el estado y la información de la oficina seleccionada
	silderState() {
		//IntervalEstadoOficina, limpia el evento interval que trae los estados de la oficina.
		//con el fin, que cada vez que se ejecute una acción para la(s) oficinas no quede ejecutando
		//el evento indefinidamente.	
		clearInterval(this.IntervalEstadoOficina);
		this.slideStateOffices = this.slideStateOffices === 'active' ? 'inactive' : 'active';
	}

	silderStateActive(){
		this.slideStateOffices = "active";
		if(this.slideProperties == 'active')
			this.sliderProperties();
	}

	silderPropertiesActive(){
		this.slideProperties = "active";
		if(this.slideStateOffices == 'active')
			this.silderState();
	}

	//Abre los pop-up
	open(content) {
	    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
	    	this.closeResult = `Closed with: ${result}`;
	    }, (reason) => {
	    	this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
	  	});
	}

	//Oculta los pop-up
	ocultarPopUp(popup){
		let element = document.getElementById(popup);
		element.style.display = "none";
	}

	errorMessageshow(error:string){
		this.messageErrorGeneral = error;
		let element = document.getElementById("messageGeneralError");
		element.style.display = "block";
	}

	errorMessagehide(){
		let element = document.getElementById("messageGeneralError");
		element.style.display = "none";
	}

	//Eventos de los pop-up
    private getDismissReason(reason: any): string {
 		if (reason === ModalDismissReasons.BACKDROP_CLICK) {
	      return 'by clicking on a backdrop';
	    } else {
	      return  `with: ${reason}`;
	    }
	}
}
