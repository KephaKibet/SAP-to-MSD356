import { Observable, Subject } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionTypes } from '../../interfaces/app/database.interface';
import { UserInterface } from '../../interfaces/user/user.interface';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { authConfig } from '../firebase/firebase.config';
import { selectAuth } from '../../STATE/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // Existing code...
  user: UserInterface | null = null;
  organizationId: string | null = null;
  firebaseAuth = authConfig;
  constructor(
    // private httpService: HttpService,
    // private authService: AuthService,
    private firebaseService: FirebaseService,
    private store: Store
  ) {
    // this.authService.user$.pipe(take(1)).subscribe({
    //   next: (data) => {
    //     this.user = data;
    //   },
    //   error: () => { },
    // });
  }

  /**
   * Sends a get request to the server
   *
   * @param {string} url
   * @return {*}
   * @memberof HttpService
   */
  get(collection: FirebaseCollectionTypes) {
    return new Observable<any>((subscriber) => {
      this.firebaseService
        .getAllRecords(collection)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            subscriber.next(data);
          },
          error: () => { },
        });
    });
  }

  /**
   * Gets an item by its id from the database
   *
   * @param {string} id
   * @param {FirebaseCollectionTypes} collection
   * @return {*}
   * @memberof HttpService
   */
  getById(id: string, collection: FirebaseCollectionTypes) {
    return this.firebaseService.getRecordById(collection, id);
  }

  /**
   * Gets an item from the database based on the specified key
   *
   * @param {string} key
   * @param {string} value
   * @param {FirebaseCollectionTypes} collection
   * @return {*}  {Observable<any[]>}
   * @memberof HttpService
   */
  getByKey(
    key: string,
    value: any,
    collection: FirebaseCollectionTypes
  ): Observable<any[]> {
    return this.firebaseService.getRecordsByKey(key, value, collection);
  }

  /**
   * Sends a "post" request, or posts data to the database
   *
   * @param {string} id
   * @param {FirebaseCollectionTypes} collection
   * @param {Object} data
   * @return {*}  {Observable<boolean>}
   * @memberof HttpService
   */
  post(
    id: string,
    collection: FirebaseCollectionTypes,
    data: Object
  ): Observable<boolean> {
    return this.getCurrentUser().pipe(
      switchMap((user) => {
        console.log(user);

        if (!user) {
          throw new Error("User not authenticated");
          // return of(false);
        }
        return this.firebaseService.addRecord(id, collection, data);
      }),
      catchError(() => {
        throw new Error("Error adding record");
      })
    );
  }

  /**
   *
   * Makes an update to a record in the DB
   * @param {string} id
   * @param {FirebaseCollectionTypes} collection
   * @param {Object} data
   * @return {*}  {Observable<boolean>}
   * @memberof HttpService
   */
  put(
    id: string,
    collection: FirebaseCollectionTypes,
    data: Object
  ): Observable<boolean> {
    console.log(data);

    return this.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error("User not authenticated");
        }
        console.log('USER', user);

        return this.firebaseService.updateRecord(id, collection, data);
      }),
      catchError((err) => {
        throw new Error("Error updating record", err);
      })
    );
  }

  /**
   * Deletes or restores an item in the DB by its id
   *
   * @param {string} id
   * @param {("delete" | "restore")} option
   * @param {FirebaseCollectionTypes} collection
   * @param {"permanentDelete"} [permanentDelete]
   * @param {"skipConfirm"} [skipConfirm]
   * @return {*}  {Observable<boolean>}
   * @memberof HttpService
   */
  deleteOrRestore(
    id: string,
    option: "delete" | "restore",
    collection: FirebaseCollectionTypes,
    permanentDelete?: "permanentDelete",
    skipConfirm?: "skipConfirm"
  ): Observable<boolean> {
    return this.getCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error("User not authenticated");
        }

        const deleted = option === "restore" ? false : true;

        const data: any = {
          id,
          deleted,
          deletedBy: option !== "restore" ? user.email : null,
          restoredBy: option === "restore" ? user.email : null,
        };

        if (option !== "restore" && !skipConfirm) {
          const makeSure = confirm("Do you want to delete?");
          if (!makeSure) {
            throw new Error("Operation cancelled");
          }
        }

        return this.firebaseService.deleteRecord(
          id,
          collection,
          permanentDelete
        );
      }),
      catchError(() => {
        throw new Error("Error deleting/restoring record");
      })
    );
  }

  // Existing code...

  private getCurrentUser(): Observable<UserInterface | null> {
    // return of(null);
    return this.store.select(selectAuth);
    // return this.authService.user$.pipe(take(1));
    // return this.
  }

  destroy$ = new Subject();

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}