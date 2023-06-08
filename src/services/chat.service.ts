import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { map, switchMap, take } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { NavController } from '@ionic/angular';

import * as firebase from 'firebase/compat/app';
import {
  Chat,
  ChatList,
  ChatMessage,
  ChatUser,
  User,
} from 'src/app/models/chat.model';
import { CommonService } from './common.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DbService } from './db.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public myUid: string;

  constructor(
    private afs: AngularFirestore,
    public navc: NavController,
    public db: DbService,
    private router: Router,
    public afAuth: AngularFireAuth,
    private common: CommonService
  ) {}

  subscribeSwitch: boolean = false;

  // 내 uid 불러오기
  async init(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.subscribeSwitch) {
        if (this.myUid) {
          resolve(this.myUid);
        } else {
          setTimeout(async () => {
            resolve(this.myUid);
          }, 50);
        }
        return;
      } else {
        console.log('subscribe 한번만');
        this.subscribeSwitch = true;
        this.afAuth.authState.subscribe((data) => {
          if (data) {
            this.myUid = data.uid;
          } else {
            this.myUid = null;
          }
          resolve(this.myUid);
        });
      }
    });
  }

  /**
   * 1:1 채팅방 생성
   *
   * @param userId 채팅방을 만들 상대의 id
   */
  async createChat(userId): Promise<void> {
    let myUid = await this.init();
    let myChat = await this.db
      .collection$('chats', (ref) =>
        ref.where('uid', 'array-contains', this.myUid)
      )
      .pipe(take(1))
      .toPromise();

    let chats = myChat.filter((chat) => chat.uid.indexOf(userId) > -1);

    console.log('chats', chats);

    if (chats.length > 0) {
      this.navc.navigateForward('/chat-detail', {
        queryParams: {
          id: chats[0].id,
        },
      });
      return;
    } else {
      const chat: Chat = {
        id: this.common.generateFilename(),
        messages: [],
        dateCreated: new Date().toISOString(),
        uid: [this.myUid, userId],
        [this.myUid]: { readIndex: 0, startIndex: 0 },
        [userId]: { readIndex: 0, startIndex: 0 },
      };

      await this.db.updateAt(`chats/${chat.id}`, chat);

      this.navc.navigateForward('/chat-detail', {
        queryParams: {
          id: chat.id,
        },
      });
      return;
    }
  }

  /**
   * 그룹채팅방 생성
   *
   * @param uids 그룹방을 생성할 user들의 id
   */
  async createGroupChat(uids: Array<string>): Promise<void> {
    let myUid = await this.init();

    let chat: Chat = {
      id: this.common.generateFilename(),
      messages: [],
      dateCreated: new Date().toISOString(),
      uid: [...uids, this.myUid],
      [this.myUid]: { readIndex: 0, startIndex: 0 },
    };

    const promise = uids.map((uid) => {
      return (chat[uid] = { readIndex: 0, startIndex: 0 });
    });

    await Promise.all(promise);

    await this.db.updateAt(`chats/${chat.id}`, chat);

    this.navc.navigateForward('/chat-detail', {
      queryParams: {
        id: chat.id,
      },
    });
  }

  /**
   *
   * @param chatId 유저를 초대하려는 chat의 id
   * @param uids 단체채팅방에 추가하려는 유저
   */
  async addUser(chatId: string, uids: Array<string>): Promise<void> {
    let myUid = await this.init();
    let chat: Chat = await this.db
      .doc$(`chats/${chatId}`)
      .pipe(take(1))
      .toPromise();
    if (chat.type && chat.type === 'group') {
      // 진짜 유저 추가!
      let updateChat = {};
      uids.forEach((uid) => {
        updateChat[uid] = { readIndex: chat.messages.length, startIndex: 0 };
        chat.uid.push(uid);
        // 채팅방에 '초대되었습니다'를 생성하는 코드는 없습니다.. 생성필요
      });
      this.db.updateAt(`chats/${chatId}`, { updateChat, uid: chat.uid });
    } else {
      // 여기는 단체채팅방 생성
      this.createGroupChat(uids);
    }
  }

  // 채팅리스트 가져오기
  async getChatList(): Promise<Observable<Array<ChatList>>> {
    let myUid = await this.init();
    console.log('myUid', myUid);
    return this.db.afs
      .collection<Chat>('chats', (ref) =>
        ref.where('uid', 'array-contains', this.myUid)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((chats: Array<Chat>) => {
          let chatLists: Array<ChatList> = chats.map((chat) => {
            // 그룹일경우
            if (chat.type && chat.type === 'group') {
              let partner = chat.uid.filter((e) => e !== this.myUid);
              let chatLength = chat.messages.length;
              let result: ChatList = {
                id: chat.id,
                partner,
                lastChat: chat.messages[chatLength - 1],
                messageLength: chatLength,
                myInfo: chat[this.myUid],
                type: 'group',
              };
              return result;
            } else {
              let partner =
                this.myUid == chat.uid[0] ? chat.uid[1] : chat.uid[0];
              let chatLength = chat.messages.length;
              let result: ChatList = {
                id: chat.id,
                partner,
                lastChat: chat.messages[chatLength - 1],
                messageLength: chatLength,
                myInfo: chat[this.myUid],
                type: '1:1',
              };
              return result;
            }
          });
          return chatLists;
        }),
        map((chats) => {
          return chats;
        }),
        switchMap((chatList) => {
          if (chatList.length > 0) {
            const users = chatList.map((ct) => {
              return { uid: ct.partner, chatId: ct.id };
            });
            return combineLatest(
              of(chatList),
              combineLatest(
                users.map((chat) => {
                  if (typeof chat.uid == 'string') {
                    return this.db.afs
                      .doc<User>(`users/${chat.uid}`)
                      .valueChanges({ idField: 'id' })
                      .pipe(
                        map((user) => {
                          return { chatId: chat.chatId, user };
                        })
                      );
                  } else {
                    return this.db.afs
                      .collection<User>('users', (ref) =>
                        ref.where('uid', 'in', chat.uid)
                      )
                      .valueChanges({ idField: 'id' })
                      .pipe(
                        map((user) => {
                          return { chatId: chat.chatId, user };
                        })
                      );
                  }
                })
              )
            );
          } else {
            return combineLatest(of(chatList), of([]));
          }
        }),
        map(([chatLists, users]) => {
          return chatLists.map((chatList: ChatList) => {
            let partner = users.find(
              (user) => user?.chatId === chatList.id
            ).user;
            if (partner) {
              return {
                ...chatList,
                partner,
              };
            } else {
              return chatList;
            }
          });
        })
      );
  }

  /**
   *
   * @param chatId 불러올 채팅의 id
   */
  async getChat(chatId): Promise<Observable<Chat>> {
    let myUid = await this.init();
    return this.db.afs
      .collection<Chat>(`chats`)
      .doc(chatId)
      .valueChanges({ idField: 'id' })
      .pipe(
        switchMap((chat) => {
          if (chat) {
            if (chat.type && chat.type === 'group') {
              const partners = chat.uid.filter((e) => e !== this.myUid);

              return this.db.afs
                .collection<User>('users', (ref) =>
                  ref.where('uid', 'in', partners)
                )
                .valueChanges({ idField: 'id' })
                .pipe(
                  map((partners) => {
                    return { ...chat, partners };
                  })
                );
            } else {
              const partner =
                this.myUid == chat.uid[0] ? chat.uid[1] : chat.uid[0];
              return this.db.afs
                .doc<User>(`users/${partner}`)
                .valueChanges({ idField: 'id' })
                .pipe(
                  map((partner) => {
                    return { ...chat, partner };
                  })
                );
            }
          } else {
            return of(chat);
          }
        })
      );
  }

  // 안읽은 채팅갯수(뱃지)
  async getBadge(): Promise<Observable<Number>> {
    let myUid = await this.init();
    if (!this.myUid) {
      this.getBadge();
      return;
    }
    return this.db.afs
      .collection<Chat>('chats', (ref) =>
        ref.where('uid', 'array-contains', this.myUid)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((chats: Array<Chat>) => {
          let unReads: number = 0;
          for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            if (chat.messages.length == chat[myUid].startIndex) {
              continue;
            }
            let unRead = chat.messages.length - chat[myUid].readIndex;
            unReads += unRead;
          }
          return unReads;
        })
      );
  }

  /**
   * 메세지 보내기
   *
   * @param chatId 채팅을 보내는 채팅방의 id
   * @param content 채팅 내용 (글 혹은 이미지 등)
   * @param type 보내는 채팅의 종류 (text | image)
   * @returns
   */
  async sendMessage(
    chatId: string,
    content: string,
    type: string
  ): Promise<void> {
    let myUid = await this.init();

    const data: ChatMessage = {
      uid: myUid,
      content,
      dateCreated: new Date().toISOString(),
      type: type,
    };

    if (myUid) {
      const ref = this.afs.collection('chats').doc(chatId);
      return ref.update({
        messages: firebase.default.firestore.FieldValue.arrayUnion(data),
      });
    }
  }

  /**
   * 채팅방 나가기
   *
   * @param chatId 채팅을 보내는 채팅방의 id
   * @param content 채팅 내용 (글 혹은 이미지 등)
   * @param type 보내는 채팅의 종류 (text | image)
   * @returns
   */
  async exitChat(chatId: string, messageLength: number): Promise<void> {
    let user: ChatUser = {
      readIndex: messageLength,
      startIndex: messageLength,
    };
    await this.db.updateAt(`chats/${chatId}`, { [this.myUid]: user });
    return;
  }
}
