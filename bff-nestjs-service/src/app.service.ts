import { HttpService, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Method } from 'axios';

import { ProductsCacheService } from './products-cache.service';
const cachedRequests = new Set(['GET:/products']);

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    private productsCacheService: ProductsCacheService,
  ) {}

  public makeRequest(
    originalUrl: string,
    recipientUrl: string,
    method: Method,
    body: any,
  ): Observable<any> {
    if (cachedRequests.has(`${method}:${originalUrl}`)) {
      console.log('Geting data from cache service');
      return this.productsCacheService.getData();
    }

    const axiosConfig = {
      method,
      url: recipientUrl + originalUrl,
      ...(Object.keys(body || {}).length > 0 && { data: body }),
    };

    console.log({ axiosConfig });
    return this.httpService.request(axiosConfig).pipe(map(({ data }) => data));
  }
}
