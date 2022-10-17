export interface Chat {
  id?: string;
  dateCreated: string;
  messages: Array<ChatMessage>;
  uid: Array<string>;

  partner?: User; // 1:1의 경우
  partners?: Array<User>; // group채팅의 경우
  type?: string; // 1:1 | group
}

export interface ChatUser {
  startIndex: number;
  readIndex: number;
}

export interface ChatMessage {
  dateCreated: string;
  type: string;
  content: string;
  uid: string;
}

export interface ChatList {
  id: string;
  partner: string | User | Array<string | User>;
  lastChat: ChatMessage;
  messageLength: number;
  myInfo: ChatUser;
  type: string;
}

export interface User {
  id?: string;
  uid?: string;
  dateCreated: string;
  nickName: string;
  profile: string;
  exitSwitch: boolean;
  email: string;
}
