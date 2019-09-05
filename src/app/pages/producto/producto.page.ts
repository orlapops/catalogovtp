import { Component, OnInit } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import { ProductosService } from '../../providers/productos.service';
import { CarritoService } from '../../providers/carrito.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ParEmpreService } from "../../providers/par-empre.service";


@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {
  producto:any;

  constructor( public _ps: ProductosService,
               public _cs: CarritoService,    
               private activatedRoute: ActivatedRoute,
               public _DomSanitizer: DomSanitizer,
               public _parEmpreProv: ParEmpreService,
               private router: Router
                         ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(data => {
      this.producto = data;
      console.log("Parametros que vienen de por-subcategoria",data);
      this._ps.pedir_talla(this.producto.linea,this.producto.color);
    })
  }

}
