import {
  Global,
  Injectable,
  Module,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { finalize } from 'rxjs';
import {
  FileStorageService,
  type UploadedFile,
} from './file-storage.service.js';

/**
 * Put it after FilesInterceptor on any route that takes files: whatever
 * happens (saved, refused, wrong form), files left in the temporary folder
 * are deleted when the request ends. Kept files were moved, so they stay.
 */
@Injectable()
export class CleanUploadsInterceptor implements NestInterceptor {
  constructor(private readonly storage: FileStorageService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<{
      files?: UploadedFile[] | Record<string, UploadedFile[]>;
    }>();
    return next.handle().pipe(
      finalize(() => {
        const files = Array.isArray(request.files)
          ? request.files
          : Object.values(request.files ?? {}).flat();
        void this.storage.discard(files);
      }),
    );
  }
}

@Global()
@Module({
  providers: [FileStorageService, CleanUploadsInterceptor],
  exports: [FileStorageService, CleanUploadsInterceptor],
})
export class UploadsModule {}
