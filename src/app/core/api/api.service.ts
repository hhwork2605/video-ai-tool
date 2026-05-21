import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GenerateScriptCandidatesRequest,
  Project,
  Scene,
} from '../models';

/**
 * Tập trung mọi gọi REST đến backend ở 1 chỗ. Component / page service chỉ
 * gọi qua ApiService — không tự construct URL.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  // --- Project ---

  createProject(name?: string): Observable<Project> {
    return this.http.post<Project>(`${this.base}/api/project`, { name });
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.base}/api/project/${id}`);
  }

  // --- Ideation -> Script candidates ---

  generateScripts(
    projectId: string,
    body: GenerateScriptCandidatesRequest
  ): Observable<Project> {
    return this.http.post<Project>(
      `${this.base}/api/ideas/${projectId}/scripts`,
      body
    );
  }

  // --- Script selection ---

  selectCandidate(projectId: string, candidateId: string): Observable<Project> {
    return this.http.post<Project>(
      `${this.base}/api/scripts/${projectId}/select/${candidateId}`,
      {}
    );
  }

  // --- Generation: prompts / image / video ---

  buildPrompts(projectId: string, force = false): Observable<Project> {
    return this.http.post<Project>(
      `${this.base}/api/generate/prompts/${projectId}?force=${force}`,
      {}
    );
  }

  genImage(projectId: string, sceneIndex: number): Observable<Scene> {
    return this.http.post<Scene>(
      `${this.base}/api/generate/image/${projectId}/${sceneIndex}`,
      {}
    );
  }

  genImagesAll(projectId: string, force = false): Observable<Project> {
    return this.http.post<Project>(
      `${this.base}/api/generate/image/${projectId}/all?force=${force}`,
      {}
    );
  }

  /** Fire-and-forget — backend trả 202 Accepted, kết quả update qua SignalR. */
  genVideo(projectId: string, sceneIndex: number): Observable<unknown> {
    return this.http.post(
      `${this.base}/api/generate/video/${projectId}/${sceneIndex}`,
      {}
    );
  }

  genVideosAll(projectId: string, force = false): Observable<unknown> {
    return this.http.post(
      `${this.base}/api/generate/video/${projectId}/all?force=${force}`,
      {}
    );
  }

  // --- Render ---

  renderProject(projectId: string): Observable<Project> {
    return this.http.post<Project>(`${this.base}/api/render/${projectId}`, {});
  }

  /** URL dedicated endpoint trả MP4 với Content-Disposition attachment. */
  downloadFinalUrl(projectId: string): string {
    return `${this.base}/api/download/${projectId}/final`;
  }

  // --- Publish ---

  generatePublishMetadata(
    projectId: string,
    hashtagCount = 10
  ): Observable<Project> {
    return this.http.post<Project>(
      `${this.base}/api/publish/${projectId}/metadata?hashtagCount=${hashtagCount}`,
      {}
    );
  }
}
