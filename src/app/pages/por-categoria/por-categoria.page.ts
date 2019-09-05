import { Component, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import { ProductosService } from '../../providers/productos.service';
import { DomSanitizer } from '@angular/platform-browser';
import { IonInfiniteScroll } from "@ionic/angular";


@Component({
  selector: 'app-por-categoria',
  templateUrl: './por-categoria.page.html',
  styleUrls: ['./por-categoria.page.scss'],
})
export class PorCategoriaPage implements OnInit {
  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  categoria = null;
  param_subcat: any;
  subcategoria: any;
  pagina = 0;
  constructor( public _ps: ProductosService,
               public router: Router,
               public _DomSanitizer: DomSanitizer,
               public activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    this.pagina=1;
    this.categoria=this.activatedRoute.snapshot.paramMap.get('id');
    this._ps.get_catalogo(this.categoria).subscribe((datos: any) => {
        this._ps.catalogo_act = datos.nombre;
    });
    console.log("Parametros que vienen de categoria");
    console.log("cod_catalogo:",this.categoria)
    this.param_subcat=this._ps.pedir_subcategoria(this.categoria);
  }

  loadData(event)
  {
      this.pagina += 1;
      console.log('crecioPagina');
      event.target.complete();
  }
}
