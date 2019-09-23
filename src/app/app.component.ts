import { Component, OnInit, ɵConsole } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { TranslateProvider } from './providers/translate/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';

import { Pages } from './interfaces/pages';
import { ParEmpreService } from './providers/par-empre.service';
import { AuthService } from './providers/auth.service';
import { expressionType } from '@angular/compiler/src/output/output_ast';
import { ProductosService } from './providers/productos.service';
// import * as jstest from '../assets/js/netsolin.js'

// declare var ePosDev = new epson.ePOSDevice();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit  {
  public appPages: Array<Pages>;
  cargo_lineas: boolean;
  categoria: any[]=[];
  exiteusuario = false;

  // public listing;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateProvider,
    private translateService: TranslateService,
    public _parEmpreProv: ParEmpreService,
    public _ps: ProductosService,
    private auth: AuthService ,
    public navCtrl: NavController
  ) {
    // console.log(jsext_prueba('retornado por js'));
    this.appPages = [
      {
        title: 'Inicio',
        url: '/home',
        direct: 'root',
        icon: 'home'
      },
      {
        title: 'Acerca de',
        url: '/about',
        direct: 'forward',
        icon: 'information-circle-outline'
      },
      {
        title: 'Soporte',
        url: '/support',
        direct: 'forward',
        icon: 'help-buoy'
      }
    ];
    console.log('En constructor app.componet');
    this.initializeApp();
  }
  ngOnInit() {
    console.log('En ngOnInit app.componet');


  }
  initializeApp() {
    console.log('En initializeApp app.componet 1');
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.translateService.setDefaultLang(environment.language);
      this.translateService.use(environment.language);
      this.translateService.getTranslation(environment.language).subscribe(translations => {
        this.translate.setTranslations(translations);
      });
      // this._parEmpreProv.URL_SERVICIOS = "http://190.165.176.69/VIATROPICAL/";
      this._parEmpreProv.cargarUsuarioStorage().then( existe => {  
        if ( existe ) {
          console.log('En initializeApp app.componet 2 cargo usuario');
          //Debe suscribirse al usuario en firebase
          console.log('Cargo usuario existe',this._parEmpreProv.usuario);
           this._parEmpreProv.getUsuarFB(this._parEmpreProv.usuario.Email)
              .subscribe((datos: any) => {
                console.log("datos getUsuarFB ", datos);
                if (datos) {
                    this._parEmpreProv.usuario_valido = true;
                    this._parEmpreProv.usuario = datos;
                    this._parEmpreProv.permite_pedido = datos.Pedido;
                    this._parEmpreProv.guardarUsuarioStorage(datos);
                    this._ps.cargar_lineas().then( cargo => {
                      this.categoria=this._ps.categoria;   
                      if(cargo) {
                        this.cargo_lineas = true;
                      } else {
                        this.cargo_lineas = false;
                      }
                    });
                    console.log('Usuario: ',this._parEmpreProv.usuario);
                     //Verificar si ya esta autorizado por Via tropical Vista true
                     if (this._parEmpreProv.usuario.vista)
                       {
                          this.navCtrl.navigateRoot('/home');
                       } else {
                          //Esperando autorización
                           this.navCtrl.navigateRoot('/wait');
                       }
                }
            });
        }else {
          this._parEmpreProv.usuario_valido = false;
          this._parEmpreProv.permite_pedido = false;
          console.log('No existe usuario alogin');
          this.navCtrl.navigateRoot('/login');
        }  
      });      
   });
  }

  logout() {
    this._parEmpreProv.usuario_valido = false;
    this._parEmpreProv.permite_pedido = false;
    this._parEmpreProv.borrarUsuarioStorage();
    this.navCtrl.navigateRoot('login');
  }
  ir_historialped() {
    this.navCtrl.navigateRoot('historial');
  }
  
  actualizar_bdfirebase(){
    // this._ps.subir_catalogosafb();
    this._ps.subir_subtiposafb();
    // this._ps.subir_lineasafb();
    // this._ps.subir_coloresafb();
    // this._ps.subir_curvasLineaafb();
    //this._ps.subir_curvasafb();
    //  this._ps.subir_referenciasafb();

  }
  actualizar_imagenlineasfirebase(){
    this._ps.actualizar_linkimagenfb_lineas();
    // this._ps.actualizar_linkimagenfb_lineacolor();
  }
}
