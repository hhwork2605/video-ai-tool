import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SceneStatus } from '../models';
import { ProjectStateService } from '../state/project-state.service';

/**
 * Payload server push qua SignalR khi 1 scene đổi trạng thái.
 */
export interface SceneProgress {
  projectId: string;
  sceneIndex: number;
  status: SceneStatus;
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Connect SignalR hub `/hubs/progress`, lắng sự kiện `SceneStatusChanged` và
 * tự cập nhật `ProjectStateService.current()` để các trang re-render qua signal.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private hub?: signalR.HubConnection;
  private joinedProject?: string;
  private _events = new Subject<SceneProgress>();
  readonly events$ = this._events.asObservable();

  private state = inject(ProjectStateService);

  async connect(projectId: string): Promise<void> {
    if (this.hub && this.joinedProject === projectId) return;
    await this.disconnect();

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBase}/hubs/progress`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hub.on('SceneStatusChanged', (msg: SceneProgress) => {
      this._events.next(msg);
      this.patchSceneInState(msg);
    });

    await this.hub.start();
    await this.hub.invoke('JoinProject', projectId);
    this.joinedProject = projectId;
  }

  async disconnect(): Promise<void> {
    if (!this.hub) return;
    try {
      await this.hub.stop();
    } catch {
      // ignore
    }
    this.hub = undefined;
    this.joinedProject = undefined;
  }

  /** Update Project in state với thông tin scene mới. */
  private patchSceneInState(msg: SceneProgress): void {
    const project = this.state.current();
    if (!project || project.id !== msg.projectId) return;

    const scenes = project.scenes.map((s) => {
      if (s.index !== msg.sceneIndex) return s;
      return {
        ...s,
        status: msg.status,
        imageUrl: msg.imageUrl ?? s.imageUrl,
        videoUrl: msg.videoUrl ?? s.videoUrl,
      };
    });

    this.state.set({ ...project, scenes });
  }
}
