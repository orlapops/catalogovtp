import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators';
import {MenuController } from '@ionic/angular';
import { NetsolinApp } from '../shared/global';
import 'rxjs/add/operator/toPromise';

//Firebase Oct 4 18
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs/Subject';
// import { Observable } from 'rxjs/Rx';
import { Observable } from 'rxjs';

//Import Storage JM 15/11/2018
import * as firebase from 'firebase';
import { ParEmpreService } from './par-empre.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { IfStmt } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  pagina:number=0;
  productos_todos: any[]=[];
  productos_todos_fb: any[]=[];

  categoria:any[]=[];
  subtipos:any[]=[];
  subcategoria:any[]=[];
  producto:any[]=[];

  curva:any[]=[];
  tabla_curva:any[]=[];

  talla:any[]=[];
  cargo_productos = false;
  id_categoria:any[]=[];
  resultados:any[] = [];

  
  //ITEM FIREBASE
  items: Observable<any[]>;
  getDoc:any;
  seleccion_fb=true;
  imagen: any;
  start: any;
  imageSource;
  
  catalogo_act = '';
  linea_act = '';
  lineacolor_act = '';
 
  //public paramtipoprod: any = {categoria:0}
  constructor(public http: Http,
    public _parEmpreProv: ParEmpreService,
    private afStorage: AngularFireStorage,
    public _DomSanitizer: DomSanitizer,
    private fbDb: AngularFirestore, private menuCtrl: MenuController,) 
  {
    this.cargar_todos(); //Caragar todos los productos
    this.cargar_lineas();//Cargar las categorias
    this.obtenerImagenFB();  
  }



//SERVICIOS CON CONEXION A NETSOLIN Y FIREBASE JM 10/10/2018--------------------------------

  //Cargar todos los catalogos de Viatropical   
  cargar_lineas() 
   {
    return new Promise( (resolve, reject) => {
      
    
    if (this.seleccion_fb===true ){ //CARGAR LINEAS DE FIREBASE JM 12/10/2018
       
      console.log ("ESTA EN FIREBASE: cargar_lineas() ")
      // this.fbDb.collection('catalogos').valueChanges()
      this.fbDb.collection('catalogos', cod => 
        cod.where('vigente','==', true)).valueChanges()
        .subscribe((data_categoria) => 
      {        
        console.log("DATA CATEGORIA FIREBASE", data_categoria)
        this.categoria=data_categoria;
        console.log("Catalogos en Fb",this.categoria)
        resolve(true);
      },

      (err)=>{ console.log("Error en el data de Fb", err) 
          resolve(false);}
    
      );

    }

    else { //CARGAR LINEAS DE NETSOLIN JM 12/10/2018
    
      console.log ("ESTA EN NETSOLIN: cargar_lineas() ")
     this.pagina = 0;
     let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=JAVARXCATGR&TIPO="+ this.pagina;
     // let url = this._parEmpreProv.URL_SERVICIOS + "/productos/por_tipo/"+ categoria +"/" +this.pagina;
    //  console.log('url servicio CATEGORIA:'+url);
     this.http.get(url)
              .map (resp=>resp.json())
              .subscribe ( data=>{

                if (data.error){
                  console.log("ERROR CARGAR CATEGORIA")
                }
                else
                {
                  this.categoria=data.tien_categor; //Obtener categorias
                  //console.log("Vector de Categoria")
                  //console.log(this.categoria)

                }

                
            
              });
       }

      }); 
  }

// Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
guardarpedidoFb(cod_tercer, id, objpedido) {
        // console.log('en grabar guardarpedidoFb coleccion: ',`/personal/${this._parempre.usuario.cod_usuar}
        // /rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}
        // /visitas/${this._visitas.visita_activa_copvdet.id_visita}/pedidos`);
    return this.fbDb.collection(`/pedidos/`).doc(id).set(objpedido);
        // return this.fbDb
        // tslint:disable-next-line:max-line-length
        // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/pedidos`)
        // .doc(id).set(objpedido);
        // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/pedidos`)
        // .doc(id).set(objpedido);
}
  
  //Cargar todos los productos de Viatropical
  cargar_todos ()
  {
    if (this.seleccion_fb===true){  //CARGAR PRODUCTOS DE FIREBASE JM 12/10/2018
      console.log ("ESTA EN FIREBASE:  cargar_todos () ")
      // this.fbDb.collection('catalogos').valueChanges()
      
      let promesa=new Promise((resolve,reject)=>{
        this.fbDb.collection('catalogos', cod => 
            cod.where('vigente','==', true))                        
            .valueChanges()        
          .subscribe((data_producto) => 
          {
            
            console.log("DATA PRODUCTO FIREBASE carga todos", data_producto)
            let nuevaData = this.agrupar(data_producto, 2 );
            // console.log("NUEVA DATA", nuevaData)

            this.productos_todos.push( ...nuevaData );
            // console.log("Productos_todos_push",this.productos_todos)
            this.pagina +=1;
  
            resolve();
          },
  
          (err)=>{ console.log("Error en el data de Fb", err) }
        
          );
      
        });
        return promesa;
    }
    else {//CARGAR LINEAS DE NETSOLIN JM 12/10/2018
      console.log ("ESTA EN NETSOLIN: cargar_todos ()")

      let promesa=new Promise((resolve,reject)=>{
      let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=JAVARXPROD&PAGINA="+ this.pagina;
      // console.log('url servicio PRODUCTOS:'+url);
    
        this.http.get( url )
        .map( resp => resp.json() )
        .subscribe( data =>{

          if( data.error ){
            // Aqui hay un problema
          }else{

            let nuevaData = this.agrupar(data.tien_product, 2 );

            this.productos_todos.push( ...nuevaData );
            this.pagina +=1;
          }

          resolve();

        })

      });

      return promesa;

    }
  
  }

//Traer un catalogo de fb 
  public get_catalogo(id){
      return this.fbDb
      .collection(`/catalogos`)
      .doc(id).valueChanges();
  }
  public get_subtipo(id){
    return this.fbDb
    .collection(`/subtipos`)
    .doc(id).valueChanges();
}

    //Cargar subtipos de un catalogo solo fb
    cargar_subtipos(categoria:string){
    
        console.log ("ESTA EN FIREBASE: cargar subtipo()")
        console.log ("Cod_catalogo Recibido:",categoria)
        this.fbDb.collection(
          'subtipos', cod => 
                          cod.where('cod_catalogo','==', categoria)).valueChanges()
                          .subscribe((data_subtipos) => 
                          {
                            console.log('llega de cargasr subtipos data_subtipos:',data_subtipos);
                            //console.log("DATA CATEGORIA FIREBASE", data)
                            this.subtipos=data_subtipos;
                            console.log("Linea en Firebase subtipos",this.subtipos);
                          },
                  
                          (err)=>{ console.log("Error en el data de Fb", err) }
                          );
    }
  
  //Cargar Lineas de Viatropical
  pedir_subcategoria(categoria:string,subtipo:string){
    
    if (this.seleccion_fb===true) //PEDIR SUBCATEGORIA EN FIREBASE JM 11/10/2018
    {
      console.log ("ESTA EN FIREBASE: pedir_subcategoria()");
      console.log ("Cod_catalogo Recibido:",categoria,this._parEmpreProv);
      this.fbDb.collection('armacatl', cod => 
          cod.where('cod_catalogo','==', categoria).where('sub_tipo','==',subtipo))                        
          .valueChanges()
            .subscribe((data_subcategoria) => 
            {                          
              console.log("DATA CATEGORIA FIREBASE", data_subcategoria)
              // this.subcategoria=data_subcategoria;
              this.subcategoria=[];
              data_subcategoria.forEach((registro: any) => {
                //EVALUAR DE ACUERDO A CONDICIONES TIPO                
                if((this._parEmpreProv.usuario.ver_basicas && registro.tipo == 'BAS') ||
                (this._parEmpreProv.usuario.ver_stock && registro.tipo == 'STOC')){
                  // console.log('Asignar registro',registro);
                  this.subcategoria.push(registro);
                }                
              });
              console.log("Linea en Firebase",this.subcategoria);
            },                
          (err)=>{ console.log("Error en el data de Fb", err) }
        );
      }
      else //PEDIR SUBCATEGORIA EN NETSOLIN JM 11/10/2018
      {
        console.log ("ESTA EN NETSOLIN:pedir_subcategoria()")
        NetsolinApp.objenvrest.filtro = categoria;
        // console.log(" NetsolinApp.objenvrest.filtro");
        // console.log(categoria);
        let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=JAVARXSUBCAT&TIPO=0"
        // console.log('Entro a pedir subcategoria');
        // console.log(url);
        // console.log('Entro a pedir subcategoria 1');
        // console.log(NetsolinApp.objenvrest);
        // console.log('Entro a pedir subcategoria 2');
        this.http.post( url, NetsolinApp.objenvrest )
              .map (resp=> resp.json())
              .subscribe(data=>
                {
                  
                // console.log('Datos traer subcategoria');
                // console.log(data);
                this.subcategoria=data.tien_subcateg;
                console.log(this.subcategoria);
                
                if (data.error){
                //  console.log('data.error');
                //  console.log(data.error);
                }else{
        }
        })


      }
      

  }


 //Cargar linea-color según linea de Viatropical
  pedir_producto(cod_catalogo:string, linea:string,tipo:string,sub_tipo:string){

    if (this.seleccion_fb===true){ //PEDIR PRODUCTOS EN FIREBASE JM 11/10/2018
      console.log ("ESTA EN FIREBASE: Pedir_Producto ()")
      console.log ("Parametros recibidos",cod_catalogo,linea,tipo,sub_tipo)
      this.fbDb.collection(
        'armacatlcol', cod => 
                       cod.where('cod_catalogo', '==', cod_catalogo)
                          .where('linea', '==', linea)
                          .where('tipo', '==', tipo)
                          .where('sub_tipo', '==', sub_tipo))
                          .valueChanges()
                          .subscribe((data_producto) => 
                            {
                              //console.log("DATA CATEGORIA FIREBASE", data)
                              this.producto=data_producto;
                              console.log("Linea-color en Firebase:",this.producto);
                            },
                    
                            (err)=>{ console.log("Error en el data de Fb", err) }
                            );

    }
    else{  //PEDIR PRODUCTOS EN NETSOLIN JM 11/10/2018
       console.log ("ESTA EN NETSOLIN")
        NetsolinApp.objenvrest.filtro = cod_catalogo;
        // console.log(" NetsolinApp.objenvrest.filtro");
        // console.log(subcategoria);
        this.cargo_productos = false;
        let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=JAVARPRODSUB&TIPO="
        //console.log('Entro a pedir subcategoria');
        this.http.post( url, NetsolinApp.objenvrest )
              .map (resp=> resp.json())
              .subscribe(data=>
                {             
                //   console.log('Datos traer productos por subcategoria');
                // console.log(data);
                this.producto=data.tien_product;
                // console.log(this.subcategoria);
                
                if (data.error){
                //  console.log('data.error');
                //  console.log(data.error);
                }else{
                  this.cargo_productos = true;
                }
        })
        
  }
  }

  //Trae catalogos de tabla en NEtsolin y los pasa a firebase
  subir_catalogosafb(){
    let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETCATALOGS"
    console.log('Entro a subir_catalogosafb url:',this._parEmpreProv.URL_SERVICIOS,url);
    this.http.post( url, NetsolinApp.objenvrest )
    .map (resp=> resp.json())
    .subscribe(data=>
    {             
      console.log('Datos traer subir_catalogosafb data:', data);
      if (data.error){
        console.log('data.error', data.error);
      }else{
        //reccorrer y grabar en fb
        data.catalogos.forEach((itemcat) => {
          let larchivo = '/imagenes/' + itemcat.ima_boton.trim();
          const ref = this.afStorage.ref(larchivo);
          console.log('subir_catalogos: ', itemcat.cod_catalogo);
          ref.getDownloadURL().subscribe((url: any) =>  {
            itemcat.link_img = url;
            this.fbDb.collection('catalogos').doc(itemcat.cod_catalogo).set(itemcat);                
          },
          err => {
            this.fbDb.collection('catalogos').doc(itemcat.cod_catalogo).set(itemcat);                
          });
        });
  
      }
    });    
  }
  //Trae catalogos de tabla en NEtsolin y los pasa a firebase
  subir_subtiposafb(){
    let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETSUBTIPO"
    console.log('Entro a subir_subtiposafb url:', url);
    this.http.post( url, NetsolinApp.objenvrest )
    .map (resp=> resp.json())
    .subscribe(data=>
    {             
      console.log('Datos traer subir_subtiposafb data:', data);
      if (data.error){
        console.log('data.error', data.error);
      }else{
        //reccorrer y grabar en fb
        data.catalogos.forEach((itemcat) => {
          let larchivo = '/imagenes/' + itemcat.ima_boton.trim();
          const ref = this.afStorage.ref(larchivo);
          console.log('subir_subtiposafb: itemcat;',itemcat, itemcat.cod_catalogo);
          ref.getDownloadURL().subscribe((url: any) =>  {
            itemcat.link_img = url;
            this.fbDb.collection('subtipos').doc(itemcat.cod_catalogo+itemcat.cod_subtipo).set(itemcat);                
          },
          err => {
            this.fbDb.collection('subtipos').doc(itemcat.cod_catalogo+itemcat.cod_subtipo).set(itemcat);                
          });
        });
  
      }
    });    
  }

  subir_lineasafb(){
    let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARMACATL"
    console.log('Entro a subir_lineasafb url:', url);
    this.http.post( url, NetsolinApp.objenvrest )
    .map (resp=> resp.json())
    .subscribe(data=>
    {             
      console.log('Datos traer subir_lineasafb data:', data);
      if (data.error){
        console.log('data.error lineas', data.error);
      }else{
        //reccorrer y grabar en fb
        data.datos.forEach(itemcat => {
          let larchivo = '/imagenes/' + itemcat.linea.trim()+'.jpg';
          const ref = this.afStorage.ref(larchivo);
          console.log('subir_linea: ', itemcat.linea);
          ref.getDownloadURL().subscribe((url: any) =>  {
            itemcat.link_img = url;
            this.fbDb.collection('armacatl').doc(itemcat.linea).set(itemcat);                
            },
            err =>{
              this.fbDb.collection('armacatl').doc(itemcat.linea).set(itemcat);                
            });
        });
  
      }
    });    
  }

  actualizar_linkimagenfb_lineas(){       
          this.fbDb.collection('armacatl').valueChanges()
            .subscribe((data) => 
            {             
              console.log("DATA lineas a recoorer para act link imagen", data);
            //reccorrer y grabar en fb
            data.forEach((itemcat: any) => {
              //solo las que no tienen imagen por velocidad
              if (itemcat.link_img ===''){
              let larchivo = '/imagenes/' + itemcat.linea.trim() + '.jpg';
              const ref = this.afStorage.ref(larchivo);
              ref.getDownloadURL().subscribe((url: any) =>  {
                itemcat.link_img = url;
                console.log('Se actualiza imagen para linea: ' + itemcat.linea, itemcat.link_img);
                this.fbDb.collection('armacatl').doc(itemcat.linea).set(itemcat);                
                },
                err =>{
                  console.log('No hay imagen para linea: ' + itemcat.linea);
                  // this.fbDb.collection('armacatl').doc(itemcat.linea).set(itemcat);                
                });
            }});  
            },   
            (err)=>{ console.log("Error en el data de Fb", err) }          
            );        
  }
  
  actualizar_linkimagenfb_lineacolor(){       
    this.fbDb.collection('armacatlcol').valueChanges()
      .subscribe((data) => 
      {             
        console.log("DATA linea color a recoorer para act link imagen", data);
      //reccorrer y grabar en fb
      data.forEach((itemcat: any) => {
        let larchivo = '/imagenes/' + itemcat.linea.trim()+' '+itemcat.color.trim() + '.jpg';
        const ref = this.afStorage.ref(larchivo);
        ref.getDownloadURL().subscribe((url: any) =>  {
          itemcat.link_img = url;
          console.log('Se actualiza imagen para color: ' + itemcat.color, itemcat.link_img);
          this.fbDb.collection('armacatlcol').doc(itemcat.color).set(itemcat);                
          },
          err =>{
            console.log('No hay imagen para color: ' + itemcat.color);
            // this.fbDb.collection('armacatl').doc(itemcat.linea).set(itemcat);                
          });
      });  
      },   
      (err)=>{ console.log("Error en el data de Fb", err) }          
      );        
}

  subir_coloresafb(){
    let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARMACATLC"
    console.log('Entro a subir_coloresafb url:', url);
    this.http.post( url, NetsolinApp.objenvrest )
    .map (resp=> resp.json())
    .subscribe(data=>
    {             
      console.log('Datos traer subir_coloresafb data:', data);
      if (data.error){
        console.log('data.error colores', data.error);
      }else{
        //reccorrer y grabar en fb
        data.datos.forEach(itemcat => {
          let larchivo = '/imagenes/' + itemcat.linea.trim()+' '+itemcat.color.trim()+'.jpg';
          const ref = this.afStorage.ref(larchivo);
          console.log('subir_colores: ', itemcat.color);
          ref.getDownloadURL().subscribe((url: any) =>  {
            itemcat.link_img = url;
            this.fbDb.collection('armacatlcol').doc(itemcat.color).set(itemcat);                
            },
            err =>{
              this.fbDb.collection('armacatlcol').doc(itemcat.color).set(itemcat);                
            });
        });  
      }
    });    
  }

  subir_curvasLineaafb(){
    let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETCURVAS"
    console.log('Entro a subir_curvasLineaafb url:', url);
    this.http.post( url, NetsolinApp.objenvrest )
    .map (resp=> resp.json())
    .subscribe(data=>
    {             
      console.log('Datos traer subir_curvasLineaafb data:', data);
      if (data.error){
        console.log('data.error curvasLinea', data.error);
      }else{
        //reccorrer y grabar en fb
        data.datos.forEach(itemcat => {         
          this.fbDb.collection('armacatlcur').doc(itemcat.linea+'-'+itemcat.curva).set(itemcat);                
        });
  
      }
    });    
  }

  subir_curvasafb(){
    let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETARCATLCUR"
    console.log('Entro a subir_curvasafb url:', url);
    this.http.post( url, NetsolinApp.objenvrest )
    .map (resp=> resp.json())
    .subscribe(data=>
    {             
      console.log('Datos traer subir_curvasafb data:', data);
      if (data.error || data.isCallbackError){
        console.log('data.error curvas', data);
      }else{
        //reccorrer y grabar en fb
        data.datos.forEach((itemcat,i) => {
          console.log(i,'  subir_curvas: ', itemcat);
          if(itemcat.cod_curva.indexOf("/")==-1)
            this.fbDb.collection('curvas').doc(itemcat.cod_curva).set(itemcat);                
        });
  
      }
    });    
  }

  subir_referenciasafb(){
    let url= this._parEmpreProv.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVASCATRETREFXLINCO"
    console.log('Entro a subir_referenciasafb url:', url);
    this.http.post( url, NetsolinApp.objenvrest )
    .map (resp=> resp.json())
    .subscribe(data=>
    {             
      console.log('Datos traer subir_referenciasafb data:', data);
      if (data.error){
        console.log('data.error referencia', data.error);
      }else{
        //reccorrer y grabar en fb
        let num = 0;
        data.datos.forEach((itemcat,i) => {    
          if ( itemcat.cod_refinv=="") {
            itemcat.cod_refinv = itemcat.codlincolo+""+itemcat.talla;
          }
          itemcat.cod_refinv = itemcat.cod_refinv.replace("/","_");
          console.log(i, "   ", itemcat.cod_refinv)     
          this.fbDb.collection('refxlincol').doc(itemcat.cod_refinv).set(itemcat).then(() =>{
            num++;
            console.log("ha subido ",num);
          });                
        });  
      }
    });    
  }
  
  traerlinkimgagenfb(codigo) {
    const ref = this.afStorage.ref(`/imagenes/`+ codigo.trim());
    console.log('traerlinkimgagenfb ref a traer: ', 'imagenes/' + codigo.trim());
    // const urlimg = ref.getDownloadURL();
    // console.log('urlimg: ', urlimg);
    // return ref.getDownloadURL();

    ref.getDownloadURL().subscribe((url: any) =>  {
      console.log('traerlinkimgagenfb suscribe de ref a traer: ', 'imagenes/' + codigo.trim(), url);
      console.log('traerlinkimgagenfb urlretorna: ', url);
      return url;
    });
  }

  //Cargar Curva según linea de Viatropical
  pedir_curva(cod_catalogo:string, linea:string,tipo:string,sub_tipo:string){

    if (this.seleccion_fb===true){ //PEDIR CURVAS EN FIREBASE JM 17/10/2018
      console.log ("ESTA EN FIREBASE: Pedir_Curva ()")
      console.log ("Parametros recibidos",cod_catalogo,linea,tipo,sub_tipo)
      this.fbDb.collection(
        'armacatlcur', cod => 
                       cod.where('cod_catalogo', '==', cod_catalogo)
                          .where('linea', '==', linea)
                          .where('tipo', '==', tipo)
                          .where('sub_tipo', '==', sub_tipo))
                          .valueChanges()
                          .subscribe((data_curva) => 
                            {
                              //console.log("DATA CATEGORIA FIREBASE", data)
                              this.curva=data_curva;
                              console.log("Curvas en Firebase:",this.curva);
                            },
                    
                            (err)=>{ console.log("Error en el data de Fb", err) }
                            );
    

    }
    else{  //PEDIR PRODUCTOS EN NETSOLIN JM 11/10/2018
        
  }

  }

  //Cargar Talla según linea de Viatropical
  pedir_talla(linea:string,color:string){

    if (this.seleccion_fb===true){ //PEDIR TALLAS EN FIREBASE JM 17/10/2018
      console.log ("ESTA EN FIREBASE: Pedir_talla ()")
      console.log ("Parametros recibidos",linea+color)
      this.fbDb.collection(
        'refxlincol', cod => 
                       cod.where('codlincolo', '==', linea+color))
                          .valueChanges()
                          .subscribe((data_talla) => 
                            {
                              //console.log("DATA CATEGORIA FIREBASE", data)
                              this.talla=data_talla;
                              console.log("talla en Firebase:",this.talla);
                            },
                    
                            (err)=>{ console.log("Error en el data de Fb", err) }
                            );
    

    }
    else{  //PEDIR PRODUCTOS EN NETSOLIN JM 11/10/2018
        
  }

  }

  pedir_imagen(color:string){

    if (this.seleccion_fb===true){ //PEDIR TALLAS EN FIREBASE JM 17/10/2018
      console.log ("ESTA EN FIREBASE: Pedir_imagen ()")
      console.log ("Parametros recibidos",color)
      this.fbDb.collection(
        'armacatlcol', cod => 
                       cod.where('color', '==', color))
                          .valueChanges()
                          .subscribe((data_imagen) => 
                            {
                              //console.log("DATA CATEGORIA FIREBASE", data)
                              this.imagen=data_imagen;
                              console.log("Imagen en Firebase:",this.imagen);
                            },
                            (err)=>{ console.log("Error en el data de Fb", err) }
                            );
    

    }
    else{  //PEDIR PRODUCTOS EN NETSOLIN JM 11/10/2018
        
  }

  }

  //Traer Tabla segun Curva
  ver_tabla_curva(){
    this.curva.forEach(curva => {
      if (this.seleccion_fb===true){ //PEDIR TABLA CURVAS EN FIREBASE JM 17/10/2018
        console.log ("ESTA EN FIREBASE: ver_tabla_curva ()")
        console.log ("Parametros recibidos",curva)
        this.fbDb.collection(
          'curvas', cod => 
                          cod.where('cod_curva', '==', curva.curva))
                            .valueChanges()
                            .subscribe((data_tbcurva) => 
                              {
                                //console.log("DATA CATEGORIA FIREBASE", data)
                                this.tabla_curva=this.tabla_curva.concat(data_tbcurva);
                                console.log("Tabla de curvas en Firebase:",data_tbcurva,this.tabla_curva);
                              },                    
                              (err)=>{ console.log("Error en el data de Fb", err) }
                              );
      }
      else{  //PEDIR PRODUCTOS EN NETSOLIN JM 11/10/2018
          
      }
    });
  }

  //Agrupar en vectores de 2 [],[]
 private agrupar(arr:any , tamano:number)
  {
    let nuevoArreglo=[];
    for (let i=0; i<arr.length; i+=tamano)
    {
      nuevoArreglo.push(arr.slice(i,i+tamano));
    }
    //  console.log(nuevoArreglo);
     return nuevoArreglo;
     
  }

  // Mostrar Menu globalmente JM 13/11/2018
  mostrarMenu()
  {
    console.log("Entro en mostrar Menu")
    this.menuCtrl.toggle();
  }  

  obtenerImagenFB()
  {
    console.log("ESTA EN FB obtenerImagenFB()");

    firebase.storage().ref().child('imagenes/10594 21278.jpg').getDownloadURL()
    .then((url)=>{
      
      let image_prueba=url;
      console.log ("image_prueba",image_prueba);

    });
  }

}



