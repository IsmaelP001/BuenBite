import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RecipeAuthorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const currentUserId = request.userId;

    console.log('recipe interceptor',currentUserId)
    return next.handle().pipe(
      map((data) => {
        if (!currentUserId || !data) {
          return data;
        }
        return this.addAuthorFlag(data, currentUserId);
      }),
    );
  }

  private addAuthorFlag(data: any, currentUserId: string): any {
    const addAuthorToRecipe = (recipe: any) => ({
      ...recipe,
      isAuthor: recipe.userId === currentUserId,
    });
       
    if (data.userId) {
      return addAuthorToRecipe(data);
    }

    if (Array.isArray(data)) {
      return data.map(addAuthorToRecipe);
    }

    return data;
  }
}
