import { HttpService, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

@Injectable()
export class ProductsCacheService {
  private millisecondsToLive: number = 2 * 60 * 1000; // 2 minutes cache
  private fetchDate: Date;
  private productsListCache: Product[];

  constructor(private httpService: HttpService) {}

  public getData(): Observable<Product[]> {
    if (!this.productsListCache || this.isCacheExpired()) {
      console.log('ProductsCache expired - fetching new data');

      return this.getProductsFunction().pipe(
        tap((result: Product[]) => {
          this.productsListCache = result;
          this.fetchDate = new Date();
        }),
      );
    }

    console.log('Getting data from ProductsCache');
    return of(this.productsListCache);
  }

  private isCacheExpired(): boolean {
    return (
      this.fetchDate.getTime() + this.millisecondsToLive < new Date().getTime()
    );
  }

  private getProductsFunction(): Observable<Product[]> {
    const productsServiceUrl = process.env['products'];
    const url = productsServiceUrl + '/products';
    return this.httpService
      .get<Product[]>(url)
      .pipe(map((result) => result.data));
  }
}
