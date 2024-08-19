import { Component, OnInit } from '@angular/core';
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProductsService } from "../../../../core/products.service";
import { HttpClientModule } from "@angular/common/http";
import { catchError, map, of } from "rxjs";
// @ts-ignore
import * as uuid from 'uuid';
import Swal from 'sweetalert2';
import { NgClass } from "@angular/common";


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [
    NgxDatatableModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgClass
  ],
  standalone: true,
  styleUrls: ['./admin.component.css'],
  providers: [ProductsService]
})
export class AdminComponent implements OnInit {
  columns = [
    {name: 'Logo'},
    {name: 'Nombre del producto'},
    {name: 'Descripción'},
    {name: 'Fecha de Liberación'},
    {name: 'Fecha de reestructuración'}
  ];
  rows: any[] = [];
  filteredRows = [...this.rows];
  productForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private productService: ProductsService
  ) {
    this.productForm = this.fb.group({
      logo: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      date_release: ['', Validators.required],
      date_revision: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  idValidator(control: FormControl) {
    return this.productService.verifyProductExistence(control.value).pipe(
      map(exists => (exists ? {idExists: true} : null)),
      catchError(() => of(null))
    );
  }

  updateProduct(row: any) {
    console.log('Actualizar', row);
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      console.error('Formulario inválido');
      return;
    }

    console.log(this.productForm.value, 'valid');

    const { releaseDate, restructuringDate } = this.productForm.value;
    const today = new Date();
    const release = new Date(releaseDate);
    const restructuring = new Date(restructuringDate);

    if (release < today) {
      console.error('La Fecha de Liberación debe ser igual o mayor a la fecha actual.');
      return;
    }

    const expectedRestructuring = new Date(release);
    expectedRestructuring.setFullYear(release.getFullYear() + 1);

    if (restructuring.toDateString() !== expectedRestructuring.toDateString()) {
      console.error('La Fecha de Revisión debe ser exactamente un año posterior a la Fecha de Liberación.');
      return;
    }

    const productId = uuid.v4();
    const newProduct = {
      id: productId,
      ...this.productForm.value
    };

    this.productService.createProduct(newProduct).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Producto Creado',
          text: 'El producto ha sido creado exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          const modalElement = document.getElementById('exampleModal');
          if (modalElement) {
            const modalBackdrop = document.querySelector('.modal-backdrop');
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            modalBackdrop?.parentNode?.removeChild(modalBackdrop);
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
          }

          this.loadProducts();
        });
      },
      error: (error) => {
        console.error('Error al crear el producto:', error);
        Swal.fire('Error', 'Hubo un problema al crear el producto. Por favor, intenta de nuevo.', 'error');
      }
    });
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe(response => {
      this.rows = response.data;
      this.filteredRows = [...this.rows];
    });
  }


  deleteProduct(row: any): void {
    Swal.fire({
      title: `¿Estás seguro de eliminar ${row.name}?`,
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No, gracias'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(row.id).subscribe({
          next: () => {
            this.rows = this.rows.filter(product => product.id !== row.id);
            this.filteredRows = [...this.rows];
            Swal.fire('Eliminado', `${row.name} ha sido eliminado.`, 'success');
          },
          error: (err) => {
            console.error('Error al eliminar el producto:', err);
            Swal.fire('Error', 'Hubo un problema al eliminar el producto. Por favor, intenta de nuevo.', 'error');
          }
        });
      }
    });
  }



  onSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredRows = this.rows.filter(row =>
      row.name && row.name.toLowerCase().includes(searchTerm)
    );
  }







}
