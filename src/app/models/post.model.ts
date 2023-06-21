import { Member } from './member.model';

/**
 * 게시물 정보
 */
export interface Post {
  [key: string]: any;
  id: number;
  body: string;
  title: string;
  userId: Member['id'] | Member;
}
