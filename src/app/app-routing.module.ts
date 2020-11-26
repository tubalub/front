import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MusicplayerComponent } from './musicplayer/musicplayer.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: MusicplayerComponent },
  { path: '**', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
