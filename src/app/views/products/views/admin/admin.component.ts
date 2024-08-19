import { Component, OnInit } from '@angular/core';
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProductsService } from "../../../../core/products.service";
import { HttpClientModule } from "@angular/common/http";
import { catchError, map, of } from "rxjs";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [
    NgxDatatableModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  standalone: true,
  styleUrls: ['./admin.component.css'],
  providers: [ProductsService]
})
export class AdminComponent implements OnInit{

  columns = [
    { name: 'Logo' },
    { name: 'Nombre del producto' },
    { name: 'Descripción' },
    { name: 'Fecha de Liberación' },
    { name: 'Fecha de reestructuración' }
  ];

  rows: any[] = [];

  filteredRows = [...this.rows];

  searchTerm: string = '';

  productForm: FormGroup;


  constructor(
    private fb: FormBuilder,
   private productService: ProductsService
  ) {
    this.productForm = this.fb.group({
      logo: ['', Validators.required],
      productName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      releaseDate: ['', Validators.required],
      restructuringDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts()
  }

  idValidator(control: FormControl) {
    return this.productService.verifyProductExistence(control.value).pipe(
      map(exists => (exists ? { idExists: true } : null)),
      catchError(() => of(null))
    );
  }

  updateRow(row: any) {
    console.log('Actualizar:', row);
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      console.error('Formulario inválido');
      return;
    }

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

    this.productService.createProduct(this.productForm.value).subscribe({
      next: (response) => {
        console.log('Producto creado:', response);
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error al crear el producto:', error);
      }
    });
  }



  loadProducts(): void {
    this.productService.getAllProducts().subscribe(response => {
      this.rows = response.data;
      this.filteredRows = [...this.rows];
    });
  }



  deleteProduct(row: any): void {
    this.productService.deleteProduct(row.id).subscribe(() => {
      this.rows = this.rows.filter(product => product.id !== row.id);
      this.filteredRows = [...this.rows];
    });
  }


  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();

    // Filtrar los productos localmente en rows
    const filteredLocalRows = this.rows.filter(row =>
      row.productName.toLowerCase().includes(this.searchTerm) ||
      row.description.toLowerCase().includes(this.searchTerm)
    );

    // Reinicializar filteredRows para agregar los productos verificados
    this.filteredRows = [];

    // Verificar la existencia de cada producto filtrado
    filteredLocalRows.forEach((row) => {
      this.productService.verifyProductExistence(row.id).subscribe({
        next: (exists: boolean) => {
          if (exists) {
            // Si el producto existe, agregarlo a filteredRows
            this.filteredRows.push(row);
          }
        },
        error: (error) => {
          console.error(`Error al verificar la existencia del producto con id ${row.id}:`, error);
        }
      });
    });
  }





}
