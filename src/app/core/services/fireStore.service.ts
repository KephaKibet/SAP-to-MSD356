import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FirebaseCollectionTypes } from '../../interfaces/database.interface';

/**
 * A service for crud operations for the real-time database
 * the term 'collection' is used here to refer to nodes or paths in the real-time database
 *
 * @export
 * @class FirestoreService
 */
@Injectable({
  providedIn: 'root'
})


export class FirestoreService {
  database = environment.firebase;
  constructor(
   
  ) { }

  
  /**
   * Gets all records from a 'collection' in realtime DB
   *
   * @param {FirebaseCollectionTypes} collection
   * @return {*}  {Observable<any>}
   * @memberof FirestoreService
   */
  getAllRecords(collection: FirebaseCollectionTypes, includeDeleted?: 'includeDeletedRecords'): Observable<any[]> {
    return new Observable<any[]>((subscriber) => {
      this.database.ref(collection).on('value', (snapshot) => {
        let records: any[] = [];
        if (includeDeleted) {
          snapshot.forEach((childSnapshot) => {
            const record = childSnapshot.val();

            records.push(record);
          });
        } else {
          snapshot.forEach((childSnapshot: { val: () => any; }) => {
            const record = childSnapshot.val();
            if (record.deleted === false) {
              records.push(record);
            }
          });
        }
        subscriber.next(records)
      });
    })
  }
}


  