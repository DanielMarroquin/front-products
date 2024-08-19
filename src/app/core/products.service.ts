import { Injectable } from '@angular/core';
import { apiEnvironment } from '../config/api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private http: HttpClient

  ) { }

  getAllProducts(): Observable<any> {
    return this.http.get(`${apiEnvironment.url}/bp/products`);
  }

  createProduct(product: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${apiEnvironment.url}/bp/products`, product, { headers });
  }

  updateProduct(id: string, product: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${apiEnvironment.url}/bp/products/${id}`, product, { headers });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${apiEnvironment.url}/bp/products/${id}`);
  }

  verifyProductExistence(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${apiEnvironment.url}/bp/products/verification/${id}`);
  }

}
