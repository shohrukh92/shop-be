import {
  Controller,
  All,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Request } from 'express';
import { Method } from 'axios';

import { AppService } from './app.service';

@Controller({ path: '/*' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All()
  genericRequest(@Req() req: Request): Observable<any> {
    const { originalUrl, method, body } = req;
    console.log({ originalUrl, method, body });

    // original URL starts with '/' => we have to get second item after split
    const recipientService = originalUrl.split('/')[1];
    console.log({ recipientService });

    const recipientUrl = process.env[recipientService];
    console.log({ recipientUrl });

    if (!recipientUrl) {
      throw new HttpException(
        { error: 'Cannot process request' },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return this.appService
      .makeRequest(originalUrl, recipientUrl, method as Method, body)
      .pipe(
        map((response) => {
          console.log('Response from recipient', Object.keys(response));
          return response;
        }),
        catchError((error) => {
          console.log('Error', JSON.stringify(error));

          if (error.response) {
            const { status, data } = error.response;
            throw new HttpException(data, status);
          } else {
            throw new HttpException(
              { error: error.message },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }),
      );
  }
}
