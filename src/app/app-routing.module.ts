import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from "./views/products/views/admin/admin.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'products/admin',
    pathMatch: 'full'
  },
  {
    path: 'products',
    component: AdminComponent,
    loadChildren: () => import('./views/products/products.module').then(
      (m) => m.ProductsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
