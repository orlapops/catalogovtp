import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ProductosService } from '../../providers/productos.service';
import { CarritoService } from '../../providers/carrito.service';
import { ParEmpreService } from "../../providers/par-empre.service";

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {

  item_imagen: any; //Obtener la Imagen segun el Item
  color: any;
  imagen: any;
  grabando_pedido = false;
  grabo_pedido = false;
  mostrandoresulado = false;
  direcdespa:any;
  menerror = '';
  notapedido = '';

  constructor(public _ps: ProductosService,
    public _cs: CarritoService,
    public router: Router,
    public toastCtrl: ToastController,
    public _parEmpreProv: ParEmpreService,
    public _DomSanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    console.log("this.items en Carrito Page:", this._cs, this._cs.items);
    console.log(this._cs.items.length);
    //Traer direcciones de despacho y datos del cliente
    console.log('this._parEmpreProv.datosEmpre',this._parEmpreProv.datosEmpre);
    

  }
  async hacerPedido() {
    console.log('hacerPedido direcdespa',this.direcdespa, this._parEmpreProv.datosEmpre.direcciones.length);
    this.menerror = '';
    if ((this.direcdespa ===undefined || this.direcdespa ==='') && this._parEmpreProv.datosEmpre.direcciones.length !== 0) {
        console.error('Debe ingresar dirección de despacho');
        this.menerror = 'Debe seleccionar un local o dirección de despacho';
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: 'Debe seleccionar un local o dirección de despacho',
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
        return;
    }
    console.log('a Realizar pedido',this._parEmpreProv.datosEmpre.direcciones, this.direcdespa);
    //buscar direccion y retornar el id
    const direcfound = this._parEmpreProv.datosEmpre.direcciones.find(element => element.direccion === this.direcdespa);   
    const now = new Date();
    const hora = now.getHours();
    const minutos = now.getMinutes();
    const horaped = hora.toString() + minutos.toString()
    const idpedido = 90000000000 + now.getTime();
    const objpedidogfb = {
      id_pedido: idpedido,
      cod_dpedid: '',
      num_dpedid: '',
      creado_netsolin: false,
      verificado: false,
      usuar_verifica: '',
      fecha: Date(),
      hora_ped: parseInt(horaped),
      items: this._cs.items,
      direccion: direcfound,
      notas: this.notapedido,
      nomusuar_crea: this._parEmpreProv.usuario.Nombre,
      email: this._parEmpreProv.usuario.Email,
      // id_empresa: this._parEmpreProv.usuario.id_empresa
      id_empresa: this._parEmpreProv.datosEmpre.nit
    };
    console.log('a guardar fb ',this._parEmpreProv.usuario.id_empresa, idpedido.toString(), objpedidogfb);
    this._ps.guardarpedidoFb(this._parEmpreProv.usuario.id_empresa, idpedido.toString(), objpedidogfb)
      .then(async res => {
        console.log('respuesta grabar ped fb',res);
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: 'Pedido registrado',
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
        this._cs.borrar_storage();
      })
      .catch(async (err) => {
        console.log('Error guardando pedido en Fb', err);
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: 'Error no se pudo guardar pedido',
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
      });

  }

  changedirec(e) {
    console.log("changedirec e: ", e);
  }

}
