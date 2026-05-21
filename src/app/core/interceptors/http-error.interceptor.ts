import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { toErrorMessage } from '../helpers';

/**
 * Functional interceptor — bắt mọi lỗi HTTP global, hiển thị toast Material.
 * Page service vẫn nhận error qua subscribe để tự handle UI specific (vd
 * fallback navigate); interceptor chỉ làm "safety net".
 *
 * Pattern tham khảo mhql-hotel-v2 `http-error-handler` interceptor.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Bỏ qua 202 Accepted (fire-and-forget gen video) — không phải lỗi.
      if (err.status === 0) {
        snack.open('Không kết nối được server. Kiểm tra backend.', 'Đóng', {
          duration: 4000,
        });
      } else if (err.status >= 500) {
        const msg = toErrorMessage(err, 'Server lỗi (500). Thử lại sau.');
        snack.open(msg, 'Đóng', { duration: 5000 });
      }
      // 4xx: để page service tự handle (validation, not found, ...) — không
      // double toast.
      return throwError(() => err);
    })
  );
};
