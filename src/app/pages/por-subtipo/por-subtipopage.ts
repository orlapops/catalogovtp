import { Component, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import { ProductosService } from '../../providers/productos.service';
import { DomSanitizer } from '@angular/platform-browser';
import { IonInfiniteScroll } from "@ionic/angular";


@Component({
  selector: 'app-por-subtipo',
  templateUrl: './por-subtipo.page.html',
  styleUrls: ['./por-subtipo.page.scss'],
})
export class PorSubtipoPage implements OnInit {
  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  subtipo = null;
  param_subcat: any;
  subsubtipo: any;
  pagina = 0;
  constructor( public _ps: ProductosService,
               public router: Router,
               public _DomSanitizer: DomSanitizer,
               public activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    this.pagina=1;
    this.subtipo=this.activatedRoute.snapshot.paramMap.get('id');
    this._ps.get_catalogo(this.subtipo).subscribe((datos: any) => {
        this._ps.catalogo_act = datos.nombre;
    });
    console.log("Parametros que vienen de subtipo");
    console.log("cod_catalogo:",this.subtipo)
    this.param_subcat=this._ps.cargar_subtipos(this.subtipo);
  }

  loadData(event)
  {
      this.pagina += 1;
      console.log('crecioPagina');
      event.target.complete();
  }
}
