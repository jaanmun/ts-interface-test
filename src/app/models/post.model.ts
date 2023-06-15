import { Member } from './member.model';

export interface Post {
  id: number;
  body: string;
  title: string;
  userId: Member['id'] | Member;
}
