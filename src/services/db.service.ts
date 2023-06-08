import { Injectable } from '@angular/core';
import { combineLatest, defer, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  setDoc,
  runTransaction,
} from '@angular/fire/firestore';
import { arrayRemove, arrayUnion } from 'firebase/firestore';

/**
 *  post 안에 userId만 존재할 경우 user 정보를 엮는 경우
 * @param firestore
 * @param field
 * @param collection
 */

export const leftJoinDocument = (firestore: Firestore, field, collection) => {
  return (source) =>
    defer(() => {
      // Operator state
      let collectionData;
      const cache = new Map();

      return source.pipe(
        switchMap((data) => {
          cache.clear();
          collectionData = data as any[]; // array

          const reads$ = [];
          let i = 0;
          for (const dData of collectionData) {
            if (!dData[field] || cache.get(dData[field])) {
              continue;
            }

            reads$.push(
              docData(doc(firestore, `${collection}/${dData[field]}`), {
                idField: 'id',
              })
            );
            cache.set(dData[field], i);
            i++;
          }

          return reads$.length ? combineLatest(reads$) : of([]);
        }),
        map((joins) => {
          return collectionData.map((v) => {
            const joinIdx = cache.get(v[field]); // 고유ID
            return { ...v, [field]: joins[joinIdx] || null };
          });
        })
      );
    });
};

/**
 *  product안에 category 아이디를 가지고 있고 이를 엮는 경우
 *  field가 document id값이 되어야합니다.
 * @param firestore
 * @param field
 * @param collection
 */

export const docJoin = (
  firestore: Firestore,
  field: string,
  collection: string
) => {
  return (source) =>
    defer(() => {
      let dData;
      return source.pipe(
        switchMap((data) => {
          dData = data; // object
          const id = data[field];
          return docData(doc(firestore, `${collection}/${id}`), {
            idField: 'id',
          });
        }),
        map((fieldData) => {
          return fieldData ? { ...dData, [field]: fieldData } : dData;
        })
      );
    });
};

/**
 * post 안에 comment id를 Array로 가지고 있고 이를 엮는 경우
 * @param firestore
 * @param field
 */

export const ArrayJoin = (
  firestore: Firestore,
  field: string,
  collection: string
) => {
  return (source) =>
    defer(() => {
      let dData;
      return source.pipe(
        switchMap((data) => {
          if (data) {
            dData = data; // object

            const arr = data[field]; // array
            let reads$: any = [];
            if (arr && arr.length > 0) {
              // array 가 존재할 경우
              for (const id of arr) {
                const docs$ = docData(doc(firestore, `${collection}/${id}`), {
                  idField: 'id',
                });
                reads$.push(docs$);
              }
            }

            return combineLatest(reads$);
          } else {
            return of([]);
          }
        }),
        map((arr) => {
          return { ...dData, [field]: arr };
        })
      );
    });
};

/**
 * posts를 가져와서 각 post안에 있는 array 엮는 경우
 * @param firestore
 * @param field
 * @param collectionName
 * @returns
 */
export const ArrayleftJoinDocument = (
  firestore: Firestore,
  field,
  collectionName
) => {
  return (source) =>
    defer(() => {
      // Operator state
      let colData;
      const cache = new Map();
      return source.pipe(
        switchMap((data) => {
          // Clear mapping on each emitted val ;
          cache.clear();

          // Save the parent data state
          colData = data as any[];
          const reads$ = [];
          let i = 0;
          for (const dData of colData) {
            // Skip if doc field does not exist or is already in cache
            if (!dData[field]) {
              continue;
            }
            for (const item of dData[field]) {
              if (cache.get(item)) {
                continue;
              }
              // Push doc read to Array
              reads$.push(
                docData(doc(firestore, `${collectionName}/${item}`), {
                  idField: 'id',
                })
              );
              cache.set(item, i);
              i++;
            }
          }

          return reads$.length ? combineLatest(reads$) : of([]);
        }),
        map((joins) => {
          return colData.map((v) => {
            const array = [];
            for (const item2 of v[field]) {
              const joinIdx = cache.get(item2);
              array.push({ ...joins[joinIdx], id: item2 });
            }
            if (field) {
              return {
                ...v,
                [field]: array || [],
              };
            } else {
              return v;
            }
          });
        })
      );
    });
};

@Injectable({
  providedIn: 'root',
})

// ** 기본적인 DB처리 **//

// c r u d
export class DbService {
  constructor(public firestore: Firestore) {}

  collection$(path, queryFn?) {
    if (queryFn) {
      const queryData = this.parseQuery(queryFn);
      return collectionData(
        query(collection(this.firestore, path), ...queryData),
        {
          idField: 'id',
        }
      );
    } else {
      return collectionData(collection(this.firestore, path), {
        idField: 'id',
      });
    }
  }

  parseQuery(queryFn: Function): any[] {
    const queryArray: any[] = [];

    const queryRef = {
      where: (field: string, query, value: any) => {
        queryArray.push(where(field, query, value));
        return queryRef;
      },
      orderBy: (field: string, query) => {
        queryArray.push(orderBy(field, query));
        return queryRef;
      },
      limit: (value: number) => {
        queryArray.push(limit(value));
        return queryRef;
      },
    };

    queryFn(queryRef);
    return queryArray;
  }

  doc$(path) {
    return docData(doc(this.firestore, path), { idField: 'id' });
  }

  // async toCollection$(collectionName) {
  //   return (await (getDocs(this.firestore, collectionName))).data();
  // }

  async toDoc$(collectionName, docId) {
    return (await getDoc(doc(this.firestore, collectionName, docId))).data();
  }

  updateAt(path: string, data: Object): Promise<any> {
    let pathArr = path.split('/');
    // c, u
    if (pathArr.length === 1) {
      return addDoc(collection(this.firestore, pathArr[0]), data);
    } else {
      return setDoc(doc(this.firestore, pathArr[0], pathArr[1]), data, {
        merge: true,
      });
    }
  }

  delete(path) {
    let pathArr = path.split('/');
    // d
    return deleteDoc(doc(this.firestore, pathArr[0], pathArr[1]));
  }

  /** 가져와서 혼자서만< 방해없이< 바로 업데이트 합니다.
   * transaction이 진행되는 동안에는 다른 update의 방해를 받지 않습니다.
   * 번호표 뽑기의 경우 동시에 '번호표 받기'버튼을 눌러서 동시에 업데이트를 하는 경우
   * 둘이 같은 번호를 받을 수도 있습니다.
   * 이 경우 먼저 들어온 trasaction이 순차적으로 진행됩니다.
   */
  likeAddTransaction(path, field, id) {
    try {
      runTransaction(this.firestore, async (transaction) => {
        console.log('transaction :', transaction);
        const sfDocRef = doc(this.firestore, path);
        const sfDoc = await transaction.get(sfDocRef);
        if (!sfDoc.exists()) {
          throw 'Document does not exist!';
        }

        const check = sfDoc.data()[field].includes(id);
        transaction.update(sfDocRef, {
          [field]: check ? arrayRemove(id) : arrayUnion(id),
        });
      });
    } catch (e) {
      console.log('Transaction failed: ', e);
    }
  }
}
