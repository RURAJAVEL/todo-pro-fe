import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './account/login.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { AuthGuard } from './_helpers';


const routes: Routes = [
  { path: 'tasks', component: TodoListComponent, 
  // canActivate: [AuthGuard] 
},
  { path: '', component: LoginComponent},
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
