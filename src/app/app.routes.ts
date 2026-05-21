import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'idea', pathMatch: 'full' },
      {
        path: 'idea',
        loadComponent: () =>
          import('./features/ideation/ideation.page').then((m) => m.IdeationPage),
      },
      {
        path: 'scripts/:id',
        loadComponent: () =>
          import('./features/script-picker/script-picker.page').then(
            (m) => m.ScriptPickerPage
          ),
      },
      {
        path: 'scenes/:id',
        loadComponent: () =>
          import('./features/scenes-editor/scenes-editor.page').then(
            (m) => m.ScenesEditorPage
          ),
      },
      {
        path: 'publish/:id',
        loadComponent: () =>
          import('./features/publish/publish.page').then((m) => m.PublishPage),
      },
      { path: '**', redirectTo: 'idea' },
    ],
  },
];
