import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { toErrorMessage } from '../helpers';

/**
 * Functional interceptor — bắt mọi lỗi HTTP global, hiển thị p-toast.
 * Page service vẫn nhận error qua subscribe để tự handle UI specific (vd
 * fallback navigate); interceptor chỉ làm "safety net" cho 5xx + connection.
 *
 * Pattern tham khảo mhql-hotel-v2 `http-error-handler` interceptor.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const msg = inject(MessageService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        msg.add({
          severity: 'error',
          summary: 'Mất kết nối',
          detail: 'Không kết nối được server. Kiểm tra backend.',
          life: 4000,
        });
      } else if (err.status >= 500) {
        msg.add({
          severity: 'error',
          summary: 'Server lỗi',
          detail: toErrorMessage(err, 'Server lỗi (500). Thử lại sau.'),
          life: 5000,
        });
      }
      // 4xx: để page service tự handle (validation, not found, ...).
      return throwError(() => err);
    })
  );
};
